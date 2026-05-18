from typing import Any, Optional, List

def success_response(data: Any, message: str = "", pagination: dict = None):
    """Standard success response format"""
    response = {"success": True, "data": data}
    if message:
        response["message"] = message
    if pagination:
        response["pagination"] = pagination
    return response

def error_response(message: str, code: str = "ERROR", details: List = None):
    """Standard error response format"""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or []
        }
    }
