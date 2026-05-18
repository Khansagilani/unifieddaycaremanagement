#!/usr/bin/env python3
"""
NestCare Integration Test - Payment Flow & Staff Pages
Tests the complete payment flow and staff page functionality
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

# Test credentials (from seed data)
TEST_USERS = {
    "admin": {"email": "admin@nestcare.com", "password": "password123"},
    "staff": {"email": "staff@nestcare.com", "password": "password123"},
    "parent": {"email": "parent@nestcare.com", "password": "password123"}
}


class NestCareTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user = None
        self.tests_passed = 0
        self.tests_failed = 0

    def test(self, name, condition, details=""):
        """Simple test assertion"""
        if condition:
            print(f"✓ {name}")
            self.tests_passed += 1
        else:
            print(f"✗ {name} {details}")
            self.tests_failed += 1

    def print_header(self, title):
        """Print section header"""
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")

    def login(self, role="admin"):
        """Login and get access token"""
        print(f"\n→ Logging in as {role}...")
        creds = TEST_USERS[role]
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json=creds
        )
        self.test(
            f"Login successful (HTTP {response.status_code})", response.status_code == 200)

        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get("data", {}).get("access_token")
            self.session.headers.update(
                {"Authorization": f"Bearer {self.access_token}"})

            # Get user info
            me_response = self.session.get(f"{BASE_URL}/api/auth/me")
            if me_response.status_code == 200:
                self.user = me_response.json().get("data", {})
                print(
                    f"  Current user: {self.user.get('email')} ({self.user.get('role')})")
            return True
        return False

    def test_payment_flow(self):
        """Test complete payment flow"""
        self.print_header("PAYMENT FLOW TEST")

        # 1. Login as admin
        self.login("admin")

        # 2. Get list of invoices
        print(f"\n→ Fetching invoices...")
        response = self.session.get(f"{BASE_URL}/api/billing/invoices")
        self.test(
            f"Get invoices (HTTP {response.status_code})", response.status_code == 200)

        invoices = response.json().get("data", [])
        self.test(f"Invoices found", len(invoices) > 0,
                  f"- Found {len(invoices)} invoices")

        if invoices:
            invoice = invoices[0]
            invoice_id = invoice.get("id")
            print(
                f"  Invoice #{invoice.get('invoice_number')}: ${invoice.get('amount_cents')/100:.2f}")

            # 3. Create payment intent
            print(f"\n→ Creating Stripe payment intent...")
            response = self.session.post(
                f"{BASE_URL}/api/billing/stripe/create-payment-intent",
                params={"invoice_id": invoice_id}
            )
            self.test(
                f"Create payment intent (HTTP {response.status_code})", response.status_code == 200)

            if response.status_code == 200:
                data = response.json().get("data", {})
                client_secret = data.get("client_secret")
                self.test(f"Client secret received", bool(client_secret))
                print(f"  Client secret: {client_secret[:20]}...")

    def test_staff_pages_data(self):
        """Test that staff pages can fetch required data"""
        self.print_header("STAFF PAGES DATA TEST")

        # Login as staff
        self.login("staff")

        # 1. Get children list (for dashboard)
        print(f"\n→ Fetching children list...")
        response = self.session.get(f"{BASE_URL}/api/children")
        self.test(
            f"Get children (HTTP {response.status_code})", response.status_code == 200)
        children = response.json().get("data", [])
        self.test(f"Children found", len(children) > 0,
                  f"- Found {len(children)} children")

        # 2. Get daily logs (for dashboard)
        print(f"\n→ Fetching daily logs...")
        response = self.session.get(f"{BASE_URL}/api/health-daily/daily-logs")
        self.test(
            f"Get daily logs (HTTP {response.status_code})", response.status_code == 200)
        logs = response.json().get("data", [])
        print(f"  Daily logs: {len(logs)}")

        # 3. Get attendance data
        print(f"\n→ Fetching attendance data...")
        response = self.session.get(f"{BASE_URL}/api/health-daily/attendance")
        self.test(
            f"Get attendance (HTTP {response.status_code})", response.status_code in [200, 404])

        # 4. Test attendance check-in
        if children:
            print(f"\n→ Testing attendance check-in...")
            child_id = children[0]["id"]
            response = self.session.post(
                f"{BASE_URL}/api/health-daily/attendance/checkin",
                json={"child_id": child_id}
            )
            self.test(f"Check-in endpoint (HTTP {response.status_code})",
                      response.status_code in [200, 201, 400, 409])

        # 5. Test daily log creation
        if children:
            print(f"\n→ Testing daily log creation...")
            child_id = children[0]["id"]
            today = datetime.now().strftime("%Y-%m-%d")
            response = self.session.post(
                f"{BASE_URL}/api/health-daily/daily-logs",
                json={
                    "child_id": child_id,
                    "date": today,
                    "notes": "Test daily log entry"
                }
            )
            self.test(f"Create daily log (HTTP {response.status_code})", response.status_code in [
                      200, 201, 400])

        # 6. Get conversations
        print(f"\n→ Fetching conversations...")
        response = self.session.get(f"{BASE_URL}/api/media/conversations")
        self.test(
            f"Get conversations (HTTP {response.status_code})", response.status_code == 200)
        convs = response.json().get("data", [])
        print(f"  Conversations: {len(convs)}")

    def test_frontend_endpoints(self):
        """Test that frontend can access all pages"""
        self.print_header("FRONTEND PAGES TEST")

        pages = [
            "/login",
            "/staff",
            "/staff/attendance",
            "/staff/daily-log",
            "/staff/messages",
            "/invoices",
        ]

        for page in pages:
            response = requests.get(f"{FRONTEND_URL}{page}", timeout=5)
            # Frontend returns HTML, so we just check it doesn't 404
            self.test(f"Frontend page: {page}", response.status_code != 404)

    def test_auth_and_refresh(self):
        """Test authentication and token refresh"""
        self.print_header("AUTH & TOKEN TEST")

        # 1. Login
        self.login("parent")

        # 2. Test /me endpoint
        print(f"\n→ Testing /me endpoint...")
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        self.test(f"Get /me (HTTP {response.status_code})",
                  response.status_code == 200)
        user = response.json().get("data", {})
        self.test(f"User role returned", bool(user.get("role")))

        # 3. Test with invalid token
        print(f"\n→ Testing invalid token...")
        bad_session = requests.Session()
        bad_session.headers.update(
            {"Authorization": "Bearer invalid_token_123"})
        response = bad_session.get(f"{BASE_URL}/api/auth/me")
        self.test(f"Invalid token rejected", response.status_code == 401)

    def run_all_tests(self):
        """Run all test suites"""
        print("\n")
        print("╔" + "="*58 + "╗")
        print("║" + " "*58 + "║")
        print("║  NestCare Integration Test Suite - Phase 7 & Payment  ║")
        print("║" + " "*58 + "║")
        print("╚" + "="*58 + "╝")

        try:
            self.test_auth_and_refresh()
            self.test_payment_flow()
            self.test_staff_pages_data()

            # Frontend test (optional - only if frontend is running)
            try:
                self.test_frontend_endpoints()
            except requests.exceptions.ConnectionError:
                print(
                    "\n⚠ Frontend not running on localhost:5173 - skipping frontend tests")

        except Exception as e:
            print(f"\n✗ Test suite error: {e}")
            import traceback
            traceback.print_exc()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        total = self.tests_passed + self.tests_failed
        percentage = (self.tests_passed / total * 100) if total > 0 else 0

        self.print_header("TEST SUMMARY")
        print(f"\nTotal Tests:   {total}")
        print(f"✓ Passed:      {self.tests_passed}")
        print(f"✗ Failed:      {self.tests_failed}")
        print(f"Success Rate:  {percentage:.1f}%")

        if self.tests_failed == 0:
            print("\n🎉 All tests passed!")
        else:
            print(f"\n⚠ {self.tests_failed} test(s) failed")
        print("\n")


if __name__ == "__main__":
    print("Starting NestCare Integration Tests...")
    print(f"Backend URL: {BASE_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print("\nMake sure both backend and frontend are running!")

    suite = NestCareTestSuite()
    suite.run_all_tests()
