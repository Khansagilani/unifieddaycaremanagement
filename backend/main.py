from app.routers import ws
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth
from app.routers import children
from app.routers import health_and_daily
from app.routers import media_messaging_billing
import startup
from app.routers.parent_routes import router as parent_router
from app.routers.staff_attendance import router as staff_attendance_router


# Create FastAPI app
app = FastAPI(
    title="NestCare API",
    description="A unified Daycare Management & Parent Communication Platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        settings.FRONTEND_URL
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(children.router)
app.include_router(health_and_daily.router)
app.include_router(media_messaging_billing.router)
app.include_router(media_messaging_billing.msg_router)
app.include_router(media_messaging_billing.billing_router)
app.include_router(ws.router)
app.include_router(parent_router)
app.include_router(staff_attendance_router)

# Health check endpoint


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "NestCare API"}

# Root endpoint


@app.get("/")
def root():
    return {"message": "NestCare API v1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
