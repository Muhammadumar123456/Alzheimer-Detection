# ==========================================================
# 1. IMPORTS
# ==========================================================
import os
import numpy as np
import tensorflow as tf
import tkinter as tk
from tkinter import filedialog, messagebox
from tensorflow.keras import layers, Model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# ==========================================================
# 2. BASE PATHS (SAME FOLDER AS THIS SCRIPT)
# ==========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ATTENTION_MODEL_PATH = os.path.join(
    BASE_DIR, "incv3_mobnet_attention_model.keras"
)

FUSION_MODEL_PATH = os.path.join(
    BASE_DIR, "incv3_mobnet_cog30_fusion_model.h5"
)

CLASSES = ["AD", "CN", "EMCI", "LMCI"]

# ==========================================================
# 3. VERIFY PATHS
# ==========================================================
print("MRI model path:", ATTENTION_MODEL_PATH)
print("Fusion model path:", FUSION_MODEL_PATH)

assert os.path.exists(ATTENTION_MODEL_PATH), "MRI attention model not found"
assert os.path.exists(FUSION_MODEL_PATH), "Fusion model not found"

print("✔ Model paths verified")

# ==========================================================
# 4. CUSTOM ATTENTION LAYER (REQUIRED)
# ==========================================================
@tf.keras.utils.register_keras_serializable()
class AttentionPooling(layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def build(self, input_shape):
        self.attention_dense = layers.Dense(1)

    def call(self, inputs):
        scores = self.attention_dense(inputs)
        weights = tf.nn.softmax(scores, axis=1)
        return tf.reduce_sum(inputs * weights, axis=[1, 2])

# ==========================================================
# 5. LOAD MRI ATTENTION MODEL + FEATURE EXTRACTOR
# ==========================================================
attention_model = tf.keras.models.load_model(
    ATTENTION_MODEL_PATH,
    compile=False,
    custom_objects={"AttentionPooling": AttentionPooling}
)

# ⚠ MUST MATCH TRAINING FEATURE VECTOR
feature_layer = attention_model.get_layer(index=-4).output
feature_extractor = Model(attention_model.input, feature_layer)

print("✔ MRI attention model loaded")

# ==========================================================
# 6. LOAD FUSION MODEL
# ==========================================================
fusion_model = tf.keras.models.load_model(
    FUSION_MODEL_PATH,
    compile=False
)

print("✔ Fusion model loaded")

# ==========================================================
# 7. MRI FEATURE EXTRACTION
# ==========================================================
def extract_mri_features(image_path):
    img = load_img(
        image_path,
        target_size=(128, 128),
        color_mode="grayscale"
    )
    img = img_to_array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    return feature_extractor.predict(img, verbose=0)

# ==========================================================
# 8. GUI
# ==========================================================
root = tk.Tk()
root.title("Alzheimer Multimodal Diagnosis System")
root.geometry("900x950")

selected_image = tk.StringVar()

# ---------------- MRI Upload ----------------
tk.Label(root, text="MRI Image Upload",
         font=("Arial", 16, "bold")).pack(pady=8)

def browse_image():
    path = filedialog.askopenfilename(
        filetypes=[("MRI Images", "*.png *.jpg *.jpeg")]
    )
    selected_image.set(path)

tk.Button(root, text="Select MRI Image",
          font=("Arial", 12),
          command=browse_image).pack()

# ---------------- Scrollable Questionnaire ----------------
canvas = tk.Canvas(root, height=620)
scrollbar = tk.Scrollbar(root, orient="vertical", command=canvas.yview)
scroll_frame = tk.Frame(canvas)

scroll_frame.bind(
    "<Configure>",
    lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
)

canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
canvas.configure(yscrollcommand=scrollbar.set)

canvas.pack(side="left", fill="both", expand=True, padx=10)
scrollbar.pack(side="right", fill="y")

tk.Label(scroll_frame, text="Cognitive Assessment Questionnaire",
         font=("Arial", 16, "bold")).pack(pady=10)

tk.Label(scroll_frame, text="Answer each question with Yes or No",
         font=("Arial", 11, "italic")).pack(pady=5)

question_vars = []

def add_section(title, questions):
    tk.Label(scroll_frame, text=title,
             font=("Arial", 14, "bold"),
             fg="navy").pack(anchor="w", pady=(15, 5))

    for q in questions:
        frame = tk.Frame(scroll_frame)
        frame.pack(anchor="w", fill="x", pady=3)

        tk.Label(frame, text=q, wraplength=550,
                 justify="left").pack(side="left")

        var = tk.IntVar(value=0)
        question_vars.append(var)

        tk.Radiobutton(frame, text="Yes", variable=var, value=1).pack(side="right")
        tk.Radiobutton(frame, text="No", variable=var, value=0).pack(side="right")

# ---------------- QUESTIONS (TRAINING ORDER) ----------------
add_section("Memory (MOCA / ADAS-Cog)", [
    "Difficulty remembering recent events?",
    "Repeats the same questions?",
    "Forgets appointments?",
    "Misplaces objects frequently?",
    "Difficulty recalling names?",
    "Needs reminders for daily tasks?",
    "Confused about recent conversations?",
    "Difficulty learning new information?"
])

add_section("Attention & Processing Speed (MOCA)", [
    "Difficulty focusing on tasks?",
    "Easily distracted?",
    "Trouble following conversations?",
    "Mental fatigue during thinking?",
    "Slow thinking speed?",
    "Difficulty multitasking?"
])

add_section("Executive Function (ADAS-Cog)", [
    "Difficulty planning activities?",
    "Trouble problem-solving?",
    "Poor decision-making?",
    "Difficulty managing finances?",
    "Struggles with complex tasks?",
    "Reduced mental flexibility?"
])

add_section("Language (ADAS-Cog)", [
    "Word-finding difficulty?",
    "Trouble naming familiar objects?",
    "Reduced speech fluency?",
    "Difficulty understanding language?"
])

add_section("Orientation (MOCA)", [
    "Confused about time or date?",
    "Disoriented in familiar places?",
    "Difficulty recognizing surroundings?"
])

add_section("Daily Functioning (CDRSB / ADL)", [
    "Needs help with daily activities?",
    "Reduced independence?",
    "Difficulty with self-care?"
])

# ---------------- Prediction ----------------
def predict():
    if not selected_image.get():
        messagebox.showerror("Error", "Please select an MRI image first.")
        return

    mri_feat = extract_mri_features(selected_image.get())

    cog_feat = np.array(
        [v.get() for v in question_vars],
        dtype=np.float32
    ).reshape(1, -1)

    preds = fusion_model.predict([mri_feat, cog_feat], verbose=0)
    idx = np.argmax(preds)

    # Show only the predicted class, no confidence
    result_label.config(
        text=f"Prediction: {CLASSES[idx]}"
    )

tk.Button(root, text="Predict Disease",
          font=("Arial", 15, "bold"),
          bg="#2c7be5",
          fg="white",
          command=predict).pack(pady=20)

result_label = tk.Label(root, text="", font=("Arial", 16, "bold"))
result_label.pack(pady=10)

root.mainloop()
