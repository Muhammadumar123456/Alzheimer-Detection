# Early Alzheimer Disease Detection System - Developer Documentation

This document provides a comprehensive overview of the system architecture, design decisions, and production deployment guidelines for the Alzheimer Disease Detection System. It is intended for technical review, viva defense, and future maintainers.

## 1. System Architecture Overview

The system is built on a robust, decoupled, microservices-inspired architecture:

*   **Frontend (React/Vite):** A Single Page Application (SPA) providing a professional, medical-grade UI with dynamic routing, contextual state management, and real-time polling for prediction results.
*   **Backend API (Node.js/Express):** A RESTful API serving as the central orchestrator. It handles authentication (JWT/OAuth), role-based access control (RBAC), data validation, file uploads, and business logic routing.
*   **ML Microservice (Python/FastAPI):** An isolated microservice dedicated to running the complex InceptionV3 + MobileNet multimodal fusion model.
*   **Database (MongoDB):** A NoSQL database providing flexible document schemas with strict Mongoose validation, virtuals, and compound indexing for performance.
*   **Message Broker (Redis/BullMQ) - Optional:** Used for the asynchronous processing pipeline.

This separation of concerns ensures that the heavy computational load of ML inference does not block the main Node.js event loop, guaranteeing high availability for the user-facing API.

## 2. Sync vs Async Processing Architecture

The system features a **Dual-Path Architecture** controlled by the `USE_ASYNC` environment variable. This allows the system to run on constrained environments (like a single laptop for a demo) or scale horizontally in a cloud production environment.

### Synchronous Mode (`USE_ASYNC=false`)
*   **Flow:** The Express API receives the MRI/Cognitive data and makes a direct HTTP POST request to the FastAPI ML service. The client waits for the response.
*   **Pros:** Easy to run locally, fewer dependencies (no Redis needed).
*   **Cons:** The Node.js thread is blocked waiting for the Python service. Vulnerable to timeouts if the ML service is under load.

### Asynchronous Mode (`USE_ASYNC=true`)
*   **Flow:** The Express API receives the data, creates a Job, and pushes it to a Redis Queue (via BullMQ). It immediately returns a `pending` status to the frontend. A separate Node.js Worker process (`workers/prediction.worker.js`) consumes the queue, calls the ML service, and updates the database. The frontend polls for the result.
*   **Pros:** Non-blocking, highly scalable. Workers can be deployed on different servers. Built-in retry logic (exponential backoff) via BullMQ.
*   **Cons:** Requires a running Redis instance and a separate worker process.

**Safe Mode (`SAFE_MODE=true`):** If `USE_ASYNC=true` but Redis fails to connect, the system automatically falls back to synchronous processing to ensure the application remains functional.

## 3. Database Design & Optimization

The MongoDB schema is designed using Domain-Driven Design principles:

*   **User:** Stores identity and RBAC roles (`patient`, `clinician`, `admin`).
*   **MRI:** Stores metadata about uploaded scans, separated from the physical file.
*   **CognitiveTest:** Stores the strict 30-answer array required by the ML model.
*   **Result:** The aggregate root linking User, MRI, CognitiveTest, and the ML prediction.

### Scalability & Performance
*   **Compound Indexing:** The `Result` model utilizes a compound index `{ user: 1, status: 1, createdAt: -1 }` to ensure $O(\log N)$ query performance for the dashboard, which frequently filters by user and status, sorted by date.
*   **Data Integrity:** Mongoose pre-save hooks are used for password hashing, and strict enums are enforced for storage types and prediction classes.

## 4. MRI Storage Strategy (Cloud Readiness)

Currently, MRI files are stored on the local disk (`/uploads/mri`). However, the system is architecturally prepared for horizontal scaling and cloud storage integration (AWS S3, Cloudinary).

### Cloud Readiness Implementation
1.  **Storage Type Enum:** The `MRI` schema includes `storageType: ['local', 'cloudinary', 's3']`.
2.  **Portable Paths:** `upload.service.js` stores *relative paths* (e.g., `uploads/mri/file.jpg`) rather than absolute server paths when `storageType` is `local`.
3.  **Virtual URLs:** The `mri.fileUrl` virtual dynamically constructs the full URL for the frontend. If switching to S3, this virtual would simply return the full S3 URL stored in the database.
4.  **Absolute Deletion Resolution:** Physical file deletion dynamically resolves the absolute path based on the project root, ensuring safe cleanup regardless of the execution environment.

**To migrate to S3:** Simply update `upload.service.js` to upload the buffer to S3, set `storageType: 's3'`, and store the S3 URL in `filePath`. No changes to the database schema or frontend are required.

## 5. How to Enable Async Mode (Production)

To switch from Sync to Async mode for a production deployment:

1.  **Provision Redis:** Ensure a Redis server is running (e.g., `redis-server` locally, or AWS ElastiCache).
2.  **Update Environment:** In the backend `.env` file, set:
    ```env
    USE_ASYNC=true
    REDIS_URL=redis://localhost:6379
    ```
3.  **Start the Worker:** In addition to starting the main API server, start the worker process in a separate terminal or PM2 instance:
    ```bash
    npm run worker
    ```
4.  **Verify:** Check the health endpoint at `GET /api/health/redis`. It should report `status: healthy` and `mode: async`.

## 6. Production Deployment Steps

A checklist for deploying the system to a production environment:

1.  **Environment Variables:** Create a production `.env` based on `.env.example`. Generate a strong, cryptographically secure `JWT_SECRET` (≥ 64 chars).
2.  **Database:** Provision a MongoDB Atlas cluster and set `MONGODB_URI`.
3.  **ML Service:** Deploy the FastAPI service (e.g., using Gunicorn/Uvicorn on a GPU-enabled instance) and update `ML_SERVICE_URL`.
4.  **Frontend Build:** Run `npm run build` in the frontend directory. Serve the `dist` folder using Nginx or deploy to Vercel/Netlify. Update `VITE_API_URL`.
5.  **Reverse Proxy (Nginx):** Configure Nginx to proxy requests to the Node.js API (port 5000) and serve static files from the `uploads` directory. Enable SSL/TLS (Let's Encrypt).
6.  **Process Management:** Use PM2 to run `server.js` and `workers/prediction.worker.js` to ensure they restart automatically on failure.
7.  **Observability:** Monitor `logs/error.log` generated by the Winston logger.
