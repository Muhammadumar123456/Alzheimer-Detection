"""
=============================================================================
PREDICTION SCHEMAS
=============================================================================
Pydantic models for the /predict and /health endpoints.
Defines request validation and response serialization contracts.
=============================================================================
"""

from pydantic import BaseModel, Field
from typing import Dict


class HealthResponse(BaseModel):
    """Response schema for GET /health."""

    status: str = Field(
        ...,
        description="Service status: 'healthy' or 'unavailable'",
        examples=["healthy"],
    )
    models_loaded: bool = Field(
        ...,
        description="Whether ML models are loaded and ready for inference",
    )
    model_version: str = Field(
        ...,
        description="Semantic version of the deployed model",
        examples=["1.0.0"],
    )


class PredictionResponse(BaseModel):
    """Response schema for POST /predict."""

    prediction: str = Field(
        ...,
        description="Predicted class label",
        examples=["CN"],
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score of the predicted class (0–1)",
        examples=[0.87],
    )
    class_probabilities: Dict[str, float] = Field(
        ...,
        description="Per-class probability distribution",
        examples=[{"AD": 0.05, "CN": 0.87, "EMCI": 0.04, "LMCI": 0.04}],
    )
    processing_time_ms: float = Field(
        ...,
        ge=0.0,
        description="Total inference time in milliseconds",
        examples=[342.5],
    )
