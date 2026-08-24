# ACME Salary Management - Frontend Foundation

Enterprise HR Salary Management Application for ACME Corporation, designed for managing compensation data across ~10,000 employees worldwide.

---

## 📌 Project Overview

This repository contains the standalone Angular frontend foundation for **ACME Salary Management**. 
The application provides HR Managers with an enterprise-scale interface for monitoring payroll insights, searching global employee compensation, and managing salary data across various countries and departments.

---

## 🛠️ Tech Stack

- **Framework**: Angular 20 (Standalone Components architecture)
- **Language**: TypeScript (Strict type checking enabled)
- **UI & Components**: Angular Material 20 & CDK
- **Routing**: Angular Router with lazy loading & view transitions
- **Forms**: Reactive Forms (`@angular/forms`)
- **Styling**: SCSS with custom Angular Material M3 theme tokens & CSS variables
- **Build Tool**: Angular CLI (`@angular/build:application`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher (v22.x recommended)
- **npm**: v9.x or higher

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally (Development Server)

```bash
npm start
```
or
```bash
npx ng serve
```

Once the dev server starts, navigate to `http://localhost:4200/` in your browser. The app will automatically reload if you change any of the source files.

### 3. Production Build

To build the project for production deployment:

```bash
npm run build
```

The build artifacts will be compiled into the `dist/` directory.

---

## 🧭 Routes & Architecture

### Configured Routes

| Route | View Component | Description |
|---|---|---|
| `/` | Redirects to `/dashboard` | Default entry point |
| `/dashboard` | `DashboardComponent` | Organizational salary insights & overview |
| `/employees` | `EmployeesComponent` | Global employee directory & compensation details |
| `/**` | Redirects to `/dashboard` | Wildcard fallback route |

### Production Folder Structure

```
src/
  app/
    core/               # Application singletons & domain models
      models/           # Strongly-typed TypeScript interfaces (Employee, SalaryInsight, etc.)
      services/         # Core API services (reserved for REST client integration)
    shared/             # Reusable UI modules across features
      components/       # Reusable components (e.g. PageHeaderComponent)
      ui/               # Reusable UI directives, pipes, theme helpers
    features/           # Feature pages (lazy-loaded routes)
      dashboard/        # Dashboard feature page component
      employees/        # Employee directory feature page component
    layout/             # Core application shell & responsive navigation
      main-layout/      # Master shell layout with sidenav container
      header/           # Top navigation toolbar with brand, links & profile
      sidenav/          # Mobile/tablet drawer navigation menu
    app.routes.ts       # Application routing definition
    app.config.ts       # Standalone app providers & animation config
    app.ts              # Root component
  environments/         # Environment configuration (dev / prod)
    environment.ts
    environment.development.ts
```

---

## 🔒 Current Implemented Functionality (Foundation Step)

- **Standalone Architecture**: Modular, lightweight, non-overengineered standalone components without NgModules or external state libraries.
- **Responsive Layout**: Application shell with desktop toolbar navigation, mobile drawer toggle, and adaptive breakpoints (desktop, tablet, mobile).
- **Angular Material Styling**: Integrated Material theme with curated dark/light contrast tokens and custom typography (`Inter`).
- **Domain Modeling**: Strongly-typed `Employee`, `EmployeeFilter`, and `SalaryInsight` interfaces matching future backend entities.
- **Accessibility (a11y)**: Semantic HTML tags (`<header>`, `<nav>`, `<aside>`, `<main>`), keyboard navigation, skip-to-content accessibility link, ARIA attributes.
- **Environment Configuration**: Placeholder API base URL structure in `src/environments/`.

---

## 🔮 Future Backend Integration

The application is structured to seamlessly integrate with a **Spring Boot REST API** in subsequent development phases.

### Planned Backend Capabilities:
1. **REST Services**: Integrating `EmployeeService` in `src/app/core/services/` with `HttpClient`.
2. **Employee Search & Filtering**: Paginated querying for ~10,000 employees with query parameters (`search`, `department`, `country`, `minSalary`, `maxSalary`).
3. **Salary Management**: View individual compensation cards and perform salary update operations.
4. **Analytics Dashboard**: Aggregate metrics for organization-wide salary distribution, department pay parity, and cross-country comparisons.
