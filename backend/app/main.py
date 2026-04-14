"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root() -> dict[str, str]:
    """
    Root endpoint.

    Returns
    -------
    dict[str, str]
        Welcome message.

    """
    return {"message": "E-commerce API", "environment": settings.ENVIRONMENT}


@app.get("/health")
async def health() -> dict[str, str]:
    """
    Health check endpoint.

    Returns
    -------
    dict[str, str]
        Health status.

    """
    return {"status": "healthy"}
