"""
=============================================================================
ML MICROSERVICE — MAIN APPLICATION
=============================================================================
FastAPI entry point for the Alzheimer Disease Detection ML service.
Handles model lifecycle, health checks, and prediction routing.
=============================================================================
"""

import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.ml_service import MLService
from schemas.prediction import PredictionResponse, HealthResponse

# =========================================================================
# LOGGING
# =========================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("ml_service")

# =========================================================================
# GLOBAL ML SERVICE INSTANCE
# =========================================================================
ml = MLService()

# =========================================================================
# LIFESPAN — load models at startup, cleanup on shutdown
# =========================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load and warm-up ML models before the first request."""
    logger.info("Starting ML service — loading models …")
    ml.load_models()
    ml.warm_up()
    logger.info("ML service ready ✔")
    yield
    logger.info("ML service shutting down …")

# =========================================================================
# APP FACTORY
# =========================================================================
app = FastAPI(
    title="Alzheimer Detection — ML Service",
    description="Multimodal prediction microservice (MRI + Cognitive)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Node.js backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# ROUTES
# =========================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check whether ML models are loaded and ready."""
    return HealthResponse(
        status="healthy" if ml.is_ready else "unavailable",
        models_loaded=ml.is_ready,
        model_version="1.0.0",
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    mri_file: UploadFile = File(..., description="Brain MRI image (JPG/PNG)"),
    cognitive_answers: str = Form(
        ...,
        description="JSON array of 30 binary (0/1) cognitive answers",
    ),
):
    """
    Run multimodal Alzheimer prediction.

    Accepts:
    - **mri_file**: Brain MRI image (128×128 grayscale internally)
    - **cognitive_answers**: JSON string of 30 binary values, e.g. `"[0,1,0,…]"`

    Returns predicted class, confidence, per-class probabilities,
    and processing time in milliseconds.
    """
    import json

    # ------------------------------------------------------------------
    # 1. Validate models are loaded
    # ------------------------------------------------------------------
    if not ml.is_ready:
        raise HTTPException(
            status_code=503,
            detail="ML models are not loaded. Service is unavailable.",
        )

    # ------------------------------------------------------------------
    # 2. Parse & validate cognitive answers
    # ------------------------------------------------------------------
    try:
        answers = json.loads(cognitive_answers)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="cognitive_answers must be a valid JSON array of 30 binary values.",
        )

    if not isinstance(answers, list) or len(answers) != 30:
        raise HTTPException(
            status_code=400,
            detail=f"cognitive_answers must contain exactly 30 values. Received {len(answers) if isinstance(answers, list) else 'non-array'}.",
        )

    if not all(v in (0, 1) for v in answers):
        raise HTTPException(
            status_code=400,
            detail="All cognitive_answers values must be 0 or 1.",
        )

    # ------------------------------------------------------------------
    # 3. Read MRI image bytes
    # ------------------------------------------------------------------
    try:
        image_bytes = await mri_file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded MRI file is empty.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read MRI file: {e}")

    # ------------------------------------------------------------------
    # 4. Run prediction
    # ------------------------------------------------------------------
    start = time.perf_counter()
    try:
        result = ml.predict(image_bytes, answers)
    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

    return PredictionResponse(
        prediction=result["prediction"],
        confidence=result["confidence"],
        class_probabilities=result["class_probabilities"],
        processing_time_ms=elapsed_ms,
    )
