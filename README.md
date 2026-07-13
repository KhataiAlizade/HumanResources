# Full-Stack Human Resources Management System (HRMS)

This repository contains a comprehensive, role-based Human Resources Management System designed to streamline employee administration. Building a robust, relationally sound HRMS serves as a complete demonstration of modern full-stack development and database engineering principles. From handling strict PostgreSQL data integrity constraints to implementing secure JWT authentication in a Java Spring Boot backend, this monolithic architecture proves the capability to deliver a production-ready application.

## 🚀 Tech Stack

**Backend**
* Java 17
* Spring Boot 3
* Spring Security (JWT Authentication)
* Spring Data JPA / Hibernate

**Frontend**
* React (TypeScript)
* Vite
* Tailwind CSS v4
* Axios

**Database**
* PostgreSQL

## ✨ Key Features

* **Role-Based Access Control (RBAC):** Distinct routing, dashboards, and API permissions for Admin and Employee roles, secured by JWTs.
* **Skill-Based Project Assignment:** Admins can filter employees dynamically by specific technical skills (e.g., Java, React, SQL) to assign the right talent to incoming projects.
* **Leave Management Workflow:** Employees can submit structured time-off requests, which dynamically route to the Admin command center for approval or rejection.
* **Payroll & Salary Tracking:** Secure backend calculation, assignment, and history logging for employee compensation.
* **Data Integrity & Error Handling:** Robust PostgreSQL constraints to prevent duplicate records (like emails) and clean API exception handling to surface meaningful errors to the client.

## 🛠️ Local Setup Instructions

This project is structured as a monorepo containing both the frontend and backend applications.

### Prerequisites
* Java Development Kit (JDK) 17 or higher
* Node.js and npm
* PostgreSQL server running locally

### 1. Database Configuration
Create a new PostgreSQL database:
```sql
CREATE DATABASE hrms_db;
