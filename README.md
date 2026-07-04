# T.A.S Corporate Website & CMS

T.A.S Corporate Website & CMS is a custom production web application built for a commercial client. It combines a premium public company website with a secure administrative content management system.

This project was designed and developed by TFN Technologies as a tailored business platform for presenting company services, projects, partners, and customer inquiries.

## Business Overview

The application supports a complete corporate web presence for a service-based company. It provides a modern public website for brand presentation, service discovery, project portfolio browsing, and customer contact.

The administrative CMS allows authorized staff to maintain core website content, manage project and service records, review contact messages, and process quotation requests from one private interface.

## Key Features

- Responsive modern user interface
- Hebrew and English content support
- RTL and LTR layout support
- Services showcase
- Project portfolio management
- Partner management
- Testimonials management
- Company statistics management
- Contact message management
- Quote request management
- Image upload support
- Secure authentication
- Role-based administration
- Audit logging for administrative activity

## Technology Stack

### Frontend

- React 19
- TypeScript 5
- Vite 6
- Tailwind CSS 4
- React Router 7
- Motion for React
- Lucide React icons
- Vitest

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy
- Alembic
- MySQL 8+

### Infrastructure

- REST API
- JWT authentication
- Local file uploads
- Nginx
- Linux VPS deployment

## Project Architecture

The project is organized as a frontend and backend application.

The frontend is a React single-page application that serves the public website and administrative CMS. It communicates with the backend through a REST API.

The backend is a FastAPI application responsible for authentication, business data, uploads, validation, and administrative operations.

The database stores structured website and CMS data. Uploaded media files are stored on the server filesystem and served through the backend.

## Application Modules

### Public Website

- Homepage
- About page
- Services listing
- Projects portfolio
- Contact form
- Quote request form

### Administrative CMS

- Dashboard
- Projects
- Services
- Partners
- Testimonials
- Contact messages
- Quote requests
- Company statistics
- Admin accounts
- Audit logs

## Security

The application includes JWT-based authentication, role-based authorization, request validation, secure password storage, file upload validation, and audit logging for sensitive administrative actions.

Sensitive configuration is managed through environment variables and must not be committed to the repository.

## Repository Structure

```text
project-root/
  frontend/   React frontend application
  backend/    FastAPI backend application
```

## Development

Use the provided `.env.example` files as templates for local configuration. Do not commit real environment files, credentials, keys, or production values.

### Requirements

- Node.js 20 or newer
- Python 3.11 or newer
- MySQL 8 or newer

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful frontend commands:

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

### Backend

```bash
cd backend
python -m venv .venv
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Useful backend commands:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
python -m app.utils.seed_admin
```

The seed command is optional and reads its values from environment variables. There is no public registration endpoint.

## Data & Uploads

Database schema changes are managed with Alembic migrations. Uploaded images are stored under the backend upload directory and must be preserved across deployments.

Administrative access is role-based. Standard administrators can manage website content, while super administrators can also manage admin accounts and audit logs.

## Deployment

The application is intended for deployment on a Linux VPS behind Nginx. The frontend is built as static assets, and the backend runs as a FastAPI service connected to a MySQL database.

Production deployment must use secure environment variables, HTTPS, restricted server access, database backups, and a persistent upload directory.

## License

This software is proprietary.

Copyright © TFN Technologies.

All rights reserved.

This repository contains software developed for a commercial client and may not be copied, redistributed, or reused without written permission from TFN Technologies.
