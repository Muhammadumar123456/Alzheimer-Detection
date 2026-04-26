# Early Alzheimer's Disease Detection System

A multimodal medical diagnostic platform that combines Deep Learning (Computer Vision) and Cognitive Assessment to detect Alzheimer's Disease in its early stages.

---

## 🚀 Project Overview

This project is a full-stack medical application designed to assist clinicians and patients in early Alzheimer's detection. It leverages a multimodal approach:
1.  **Image Analysis:** Analyzing Brain MRI scans using a custom Deep Learning model.
2.  **Cognitive Assessment:** Evaluating patient cognitive health through a standardized 30-question binary test.

The system is architected as a microservices-based platform, ensuring scalability, performance, and clear separation of concerns between medical logic and machine learning inference.

---

## 🛠 Tech Stack

### Frontend (User Interface)
- **Framework:** React 19 (Vite)
- **Styling:** TailwindCSS & Framer Motion (for smooth medical-grade UI/UX)
- **Icons:** Lucide React
- **Data Visualization:** Recharts (for confidence levels and probability charts)
- **State Management:** Context API
- **Routing:** React Router Dom v7

### Backend (Orchestration API)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) & Google OAuth 2.0 (Passport.js)
- **Storage:** Local Disk (with Cloudinary/S3 readiness)
- **Security:** Helmet, HPP, XSS-Clean, Express Mongo Sanitize, Rate Limiting
- **Queue System:** BullMQ & Redis (for asynchronous ML processing)

### ML Service (Inference Engine)
- **Framework:** FastAPI (Python 3.9+)
- **Deep Learning:** TensorFlow/Keras
- **Models:** Multimodal Fusion (InceptionV3 + MobileNet + Custom MLP)
- **Preprocessing:** OpenCV & NumPy

---

## 🏗 System Architecture

The project follows a **Decoupled Microservices Architecture**:

1.  **Client (React):** Communicates with the Node.js Backend.
2.  **API Gateway (Express):** Handles user management, history, and job scheduling.
3.  **Inference Service (FastAPI):** An isolated service that only knows how to run the ML model.
4.  **Worker Process (Node.js):** A background process that picks up heavy ML tasks from Redis, preventing the main API from freezing during high-load periods.

### Processing Modes
- **Synchronous Mode:** API calls ML service directly. Best for development.
- **Asynchronous Mode:** API queues the request; a worker processes it. Best for production scalability.

---

## 💾 Data Storage & Database

The system relies on a combination of a NoSQL database and a file storage system for managing user data, medical images, and ML predictions.

### 1. Database Connection
- **Primary Database:** MongoDB Atlas (Cloud NoSQL database).
- **Connection Logic:** The backend establishes a connection using Mongoose ODM (`backend/src/config/database.js`).
- **Configuration:** The connection URI is defined in the `.env` file via the `MONGODB_URI` variable (currently connected to a MongoDB Atlas Cluster `cluster0.yjozkbx.mongodb.net`).

### 2. MRI Scan Storage
- **File Storage:** By default, uploaded MRI scans are saved to the local disk in the `backend/uploads` directory. The system also supports cloud storage (Cloudinary or AWS S3) depending on the `STORAGE_TYPE` set in `.env`.
- **Metadata Storage:** A record of each uploaded MRI is stored in the MongoDB `MRI` collection (defined in `backend/src/modules/upload/mri.model.js`). This record contains the file name, storage path, file size, MIME type, and links the scan to the specific User who uploaded it.

### 3. Prediction Results Storage
- **Inference Storage:** Once an ML prediction is completed (either synchronously or via the worker queue), the result is stored in the MongoDB `Result` collection (defined in `backend/src/modules/results/results.model.js`).
- **Linked Data:** Each prediction result is highly relational. It links together:
  - The `User` who requested the prediction.
  - The uploaded `MRI` scan.
  - The associated `CognitiveTest` assessment.
- **Model Output:** The `Result` document saves the model's output, including the predicted class (`AD`, `CN`, `EMCI`, `LMCI`), the overall confidence score, individual class probabilities, and the processing status (`pending`, `completed`, or `failed`).

---

## 📂 Project Structure

```text
ALZHEIMER-DETECTION/
├── backend/            # Node.js Express API
│   ├── src/            # Core logic (Controllers, Routes, Services)
│   ├── workers/        # Background workers for Redis/BullMQ
│   └── uploads/        # Local storage for MRI scans
├── frontend/           # React SPA (Vite)
│   ├── src/            # Components, Pages, Contexts
│   └── public/         # Static assets
├── ml_service/         # Python FastAPI Service
│   ├── models/         # Pre-trained .h5/.keras models
│   ├── services/       # Image processing & prediction logic
│   └── main.py         # Service entry point
└── DOCUMENTATION.md    # Detailed technical developer notes
```

---

## ✨ Key Features

- **Multimodal Prediction:** Higher accuracy by combining MRI visuals with cognitive test data.
- **Dual Authentication:** Secure login/signup and Google Social Auth.
- **Dashboard & Analytics:** Users can track their previous results over time.
- **Real-time Processing:** Visual progress indicators and confidence meters.
- **Admin Panel:** Comprehensive management of users, reports, and system health.
- **Medical Reports:** Generation of detailed diagnosis summaries.
- **Responsive Design:** Fully optimized for desktops, tablets, and mobile devices.

---

## 🧪 Machine Learning Model

The system uses a **Feature Fusion** approach:
- **MRI Branch:** Uses **InceptionV3** and **MobileNet** to extract spatial features from grayscale brain scans.
- **Cognitive Branch:** A Multi-Layer Perceptron (MLP) processes the 30-item cognitive test.
- **Fusion Layer:** Concatenates features from both branches to make a final prediction across 4 classes:
  - Non-Demented
  - Very Mild Demented
  - Mild Demented
  - Moderate Demented

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Local or Atlas)
- Redis (Optional, for Async mode)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env (see .env.example)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. ML Service Setup
```bash
cd ml_service
pip install -r requirements.txt
python main.py
```

---

## 📄 License

This project is developed for educational and medical research purposes.
