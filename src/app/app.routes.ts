import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard | ACME Salary Management'
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employees.component').then(m => m.EmployeesComponent),
        title: 'Employees | ACME Salary Management'
      },
      {
        path: 'employees/:id',
        loadComponent: () => import('./features/employees/employee-details/employee-details.component').then(m => m.EmployeeDetailsComponent),
        title: 'Employee Details | ACME Salary Management'
      },
      {
        path: 'employees/:id/edit-salary',
        loadComponent: () => import('./features/employees/edit-salary/edit-salary.component').then(m => m.EditSalaryComponent),
        title: 'Edit Salary | ACME Salary Management'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
