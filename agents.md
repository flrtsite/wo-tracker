# AI Agent Instructions

This `agents.md` file contains instructions and context for AI coding assistants working in this project.

## 🧑‍💻 Project Overview
This project (`workout-tracker`) is a full-stack application (with `frontend` and `backend` directories) containerized via Docker.

## 📜 Coding Standards
- **Language**: JavaScript/TypeScript (for frontend and backend).
- **Separation of Concerns**: Maintain clear separation between `frontend` and `backend` logic.
- **Style**: Follow standard formatting for JS/TS (e.g., Prettier/ESLint if available).

## 🛠️ Tooling & Environment
- **Containerization**: The project runs on Docker/Docker Compose (`docker-compose.yml`, `nginx.conf`). 
- **Start command**: Typically orchestrated via `docker-compose up`.
- Always check the respective `package.json` in the subdirectories before adding dependencies.

## ⚠️ Boundaries & Rules
- Do NOT modify `.env` files without explicit permission.
- Do NOT mix frontend code into the backend directory and vice versa.
- When fixing issues, verify if the bug originates in the backend API or the frontend UI before writing code.
- Avoid deleting the `.md` history logs unless requested by the user.
