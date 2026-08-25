# AI Agent Instructions

This `agents.md` file contains instructions and context for AI coding assistants working in this project.

## 🧑‍💻 Project Overview
This project (`workout-tracker`) is a full-stack application (with `frontend` and `backend` directories) containerized via Docker. It also includes various Python scratch scripts for maintenance or backend tasks.

## 📜 Coding Standards
- **Language**: JavaScript/TypeScript (for frontend/backend) and Python (for scripts).
- **Separation of Concerns**: Maintain clear separation between `frontend` and `backend` logic.
- **Style**: Follow standard formatting for JS/TS (e.g., Prettier/ESLint if available) and PEP 8 for Python.

## 🛠️ Tooling & Environment
- **Containerization**: The project runs on Docker/Docker Compose (`docker-compose.yml`, `nginx.conf`). 
- **Start command**: Typically orchestrated via `docker-compose up`.
- Always check the respective `package.json` or `requirements.txt` in the subdirectories before adding dependencies.

## ⚠️ Boundaries & Rules
- Do NOT modify `.env` files without explicit permission.
- Do NOT mix frontend code into the backend directory and vice versa.
- When fixing issues, verify if the bug originates in the backend API or the frontend UI before writing code.
- Avoid deleting the `.md` history logs or scratch scripts unless requested by the user.
