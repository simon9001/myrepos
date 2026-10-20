# Crop Progress Tracking System

A simple web application to help track crop progress across multiple fields during a growing season. Built as an assessment to demonstrate system design, core business logic implementation, and interface usability.

## Overview

This application supports two main roles:
- **Admin (Coordinator)**: Can create fields, view all fields, monitor updates across all agents, and assign fields to agents.
- **Field Agent**: Can view their assigned fields, update field stages, and log notes/observations.

### Core Features
- Role-based authentication (Mocked for demo purposes).
- Field Management (Creation and assignment).
- Real-time updates via Mock API using RTK Query and LocalStorage.
- Computed field statuses (`Active`, `At Risk`, `Completed`).

---

## Setup Instructions

This project is built using React, Vite, TailwindCSS, and Redux Toolkit.

### Prerequisites
- Node.js (v18+)
- pnpm

### Installation

1. Clone the repository and navigate into it:
   ```bash
   cd smartsession-field-monitoring-assessment-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. The application will be available at `http://localhost:5173`.

---

## Demo Credentials

Since the backend API is mocked using local storage for this submission, use the following credentials to test the application:

**Admin (Coordinator)**
- **Email:** `admin@crop.com`
- **Password:** `password123`

**Field Agent**
- **Email:** `agent@crop.com`
- **Password:** `password123`

---

## Design Decisions

- **Mock API Layer**: I implemented a robust mock API layer within RTK Query's `queryFn` that persists data to `localStorage`. This allows the application to be fully functional and testable without requiring you to spin up a separate backend server. The RTK Query structure ensures that if a real API is introduced, only the `queryFn` implementations need to change to standard `query` or `mutation` configurations.
- **Redux Persist**: Used to maintain the user's authentication session across page reloads.
- **UI Framework**: TailwindCSS and raw CSS classes (with DaisyUI elements from the previous codebase iteration) were used to rapidly build a clean, responsive, and intuitive interface. Lucide React was used for consistent iconography.
- **Role-Based Routing**: Implemented strict routing guards (`AdminRoute` and `UserRoute`/AgentRoute) to ensure users can only access their specific dashboards.

---

## Field Status Logic

Each field has a computed status based on its data. The logic is implemented as follows:

1. **Completed**: If the field's stage is `Harvested`.
2. **At Risk**: If the field's stage is either `Planted` or `Growing`, **AND** there have been no updates to the field in the last 7 days. This helps coordinators quickly identify fields that might be neglected or facing unrecorded issues.
3. **Active**: Any field that does not meet the above criteria.

---

## Assumptions Made

- **Local Storage Persistence**: Assumed that persisting data to `localStorage` is sufficient for demonstrating "working functionality" without a real backend.
- **Simplified Lifecycle**: The field stages strictly follow the required `Planted -> Growing -> Ready -> Harvested` lifecycle.
- **Agent Assignment**: A field can only be assigned to one Field Agent at a time.
- **No Deletion/Editing**: For simplicity and to stick to core requirements, fields can only be created, assigned, and updated (stage/notes), but not deleted or entirely renamed after creation.
