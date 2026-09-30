Full-Stack Human Resources Management System (HRMS)

**Live Demo:** https://human-resources-pye8.vercel.app/

### 🔐 Test Credentials
To explore the live application, please use the following test accounts:
* **Admin Access:** `admin@hrms.com` | Password: `admin123`
---
A full-stack Human Resources Management System designed to manage employees, projects, leave requests, salaries, and role-based access.

The project demonstrates practical full-stack development using Java/Spring Boot on the backend, React/TypeScript on the frontend, and PostgreSQL for data persistence. It also includes JWT authentication, role-based authorization, and automated backend unit testing.

## 🚀 Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- REST APIs
- Maven

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS v4
- Axios

### Database
- PostgreSQL

### Testing
- JUnit 5
- Mockito
- H2 (test database)

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Separate permissions, routing, and dashboards for Admin and Employee users secured with JWT authentication.
- **Employee Management:** Manage employee information, skills, salaries, and related HR data.
- **Skill-Based Project Assignment:** Admins can filter employees by technical skills such as Java, React, and SQL when assigning projects.
- **Leave Management:** Employees can submit leave requests while Admins can review, approve, or reject them.
- **Payroll & Salary Tracking:** Manage employee salaries and maintain salary-related records.
- **Secure Authentication:** JWT-based authentication with Spring Security.
- **Data Integrity & Error Handling:** PostgreSQL constraints and backend exception handling help prevent invalid or duplicate data.

## 🧪 Testing

The backend contains **50 unit tests** written with JUnit 5 and Mockito.

The tests cover core business logic in:

- Employee management
- Project management
- Administration
- Authentication
- JWT functionality

The project also includes a Spring Boot application context-load test using an H2 test database in PostgreSQL compatibility mode.

Run the backend tests with:

```bash
mvnw.cmd test
