"""
=============================================================================
ML SERVICE — MODEL LOADING & PREDICTION
=============================================================================
Encapsulates all TensorFlow/Keras logic:
  - Custom AttentionPooling layer registration
  - MRI attention model loading & feature extraction
  - Cognitive fusion model loading
  - Multimodal prediction pipeline

Architecture (mirrors training):
  1. MRI image  → InceptionV3+MobileNet attention model → feature vector
  2. Feature vector + 30-dim cognitive vector → fusion model → 4-class softmax
  3. Classes: AD, CN, EMCI, LMCI
=============================================================================
"""

import os
import io
import logging

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from PIL import Image

logger = logging.getLogger("ml_service")

# =========================================================================
# CONSTANTS
# =========================================================================

CLASSES = ["AD", "CN", "EMCI", "LMCI"]
IMAGE_SIZE = (128, 128)
COGNITIVE_DIM = 30

# Model paths — relative to this file's grandparent (FYP/ml_service/models)
_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODELS_DIR = os.path.join(_SERVICE_DIR, "models")

ATTENTION_MODEL_PATH = os.path.join(_MODELS_DIR, "incv3_mobnet_attention_model.keras")
FUSION_MODEL_PATH = os.path.join(_MODELS_DIR, "incv3_mobnet_cog30_fusion_model.h5")

# Feature extraction layer index (must match training configuration)
FEATURE_LAYER_INDEX = -4


# =========================================================================
# CUSTOM LAYER — AttentionPooling (required to deserialize the .keras model)
# =========================================================================
@tf.keras.utils.register_keras_serializable()
class AttentionPooling(layers.Layer):
    """
    Attention-weighted spatial pooling.
    Learns a 1-unit dense layer to score each spatial position,
    then applies softmax weighting and sums.
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def build(self, input_shape):
        self.attention_dense = layers.Dense(1)

    def call(self, inputs):
        scores = self.attention_dense(inputs)
        weights = tf.nn.softmax(scores, axis=1)
        return tf.reduce_sum(inputs * weights, axis=[1, 2])


# =========================================================================
# ML SERVICE CLASS
# =========================================================================
class MLService:
    """Singleton-like service that owns the loaded models and prediction logic."""

    def __init__(self):
        self._attention_model = None
        self._feature_extractor = None
        self._fusion_model = None
        self.is_ready = False

    # ------------------------------------------------------------------
    # MODEL LOADING
    # ------------------------------------------------------------------
    def load_models(self):
        """
        Load both ML models from disk.
        Called once during application startup (lifespan).
        """
        # Validate paths exist
        if not os.path.exists(ATTENTION_MODEL_PATH):
            raise FileNotFoundError(
                f"MRI attention model not found at: {ATTENTION_MODEL_PATH}"
            )
        if not os.path.exists(FUSION_MODEL_PATH):
            raise FileNotFoundError(
                f"Fusion model not found at: {FUSION_MODEL_PATH}"
            )

        # 1. Load the MRI attention model
        logger.info(f"Loading MRI attention model from: {ATTENTION_MODEL_PATH}")
        self._attention_model = tf.keras.models.load_model(
            ATTENTION_MODEL_PATH,
            compile=False,
            custom_objects={"AttentionPooling": AttentionPooling},
        )
        logger.info("MRI attention model loaded ✔")

        # 2. Build a feature extractor from layer -4 (must match training)
        feature_layer = self._attention_model.get_layer(index=FEATURE_LAYER_INDEX).output
        self._feature_extractor = Model(
            self._attention_model.input, feature_layer
        )
        logger.info("Feature extractor built ✔")

        # 3. Load the fusion model
        logger.info(f"Loading fusion model from: {FUSION_MODEL_PATH}")
        self._fusion_model = tf.keras.models.load_model(
            FUSION_MODEL_PATH,
            compile=False,
        )
        logger.info("Fusion model loaded ✔")

        self.is_ready = True

    # ------------------------------------------------------------------
    # WARM-UP — run dummy inference to force graph compilation
    # ------------------------------------------------------------------
    def warm_up(self):
        """
        Run a single dummy prediction so that the first real request
        doesn't pay the graph-compilation cost.
        """
        if not self.is_ready:
            logger.warning("Cannot warm up — models not loaded.")
            return

        logger.info("Warming up models with dummy inference …")
        dummy_image = np.zeros((1, *IMAGE_SIZE, 1), dtype=np.float32)
        dummy_cog = np.zeros((1, COGNITIVE_DIM), dtype=np.float32)

        self._feature_extractor.predict(dummy_image, verbose=0)
        features = self._feature_extractor.predict(dummy_image, verbose=0)
        self._fusion_model.predict([features, dummy_cog], verbose=0)
        logger.info("Model warm-up complete ✔")

    # ------------------------------------------------------------------
    # IMAGE PREPROCESSING
    # ------------------------------------------------------------------
    @staticmethod
    def _preprocess_image(image_bytes: bytes) -> np.ndarray:
        """
        Convert raw image bytes to the model's expected input format:
        128×128 grayscale, normalized to [0, 1], batch dimension added.
        """
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("L")                     # Force grayscale
        image = image.resize(IMAGE_SIZE, Image.LANCZOS) # Resize to 128×128
        arr = np.array(image, dtype=np.float32) / 255.0  # Normalize
        arr = np.expand_dims(arr, axis=-1)               # (128, 128, 1)
        arr = np.expand_dims(arr, axis=0)                # (1, 128, 128, 1)
        return arr

    # ------------------------------------------------------------------
    # PREDICTION
    # ------------------------------------------------------------------
    def predict(self, image_bytes: bytes, cognitive_answers: list) -> dict:
        """
        Run the full multimodal prediction pipeline.

        Args:
            image_bytes: Raw bytes of the MRI image.
            cognitive_answers: List of 30 binary (0/1) values.

        Returns:
            dict with keys: prediction, confidence, class_probabilities
        """
        if not self.is_ready:
            raise RuntimeError("Models are not loaded.")

        # 1. Preprocess MRI image
        img_tensor = self._preprocess_image(image_bytes)

        # 2. Extract MRI features
        mri_features = self._feature_extractor.predict(img_tensor, verbose=0)

        # 3. Build cognitive feature vector
        cog_vector = np.array(cognitive_answers, dtype=np.float32).reshape(1, -1)

        # 4. Fusion model prediction
        preds = self._fusion_model.predict([mri_features, cog_vector], verbose=0)
        probs = preds[0]  # shape: (4,)

        # 5. Interpret results
        predicted_idx = int(np.argmax(probs))
        predicted_class = CLASSES[predicted_idx]
        confidence = float(probs[predicted_idx])

        class_probabilities = {
            cls: round(float(probs[i]), 6)
            for i, cls in enumerate(CLASSES)
        }

        logger.info(
            f"Prediction: {predicted_class} | "
            f"Confidence: {confidence:.4f} | "
            f"Probabilities: {class_probabilities}"
        )

        return {
            "prediction": predicted_class,
            "confidence": round(confidence, 6),
            "class_probabilities": class_probabilities,
        }
