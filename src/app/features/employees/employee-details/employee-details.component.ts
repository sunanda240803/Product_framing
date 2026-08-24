import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Employee } from '@core/models';
import { EmployeeService } from '@core/services';
import { PageHeaderComponent, LoadingStateComponent, EmptyStateComponent, ErrorStateComponent } from '@shared/components';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    PageHeaderComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss'
})
export class EmployeeDetailsComponent implements OnInit {
  @Input() id!: string;

  protected employee: Employee | null = null;
  protected isLoading = true;
  protected hasError = false;

  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.id) {
      this.loadEmployeeDetails(this.id);
    } else {
      this.isLoading = false;
      this.hasError = true;
    }
  }

  loadEmployeeDetails(employeeId: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.employeeService.getEmployeeById(employeeId).subscribe({
      next: (data) => {
        this.employee = data || null;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  goBackToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  navigateToEditSalary(): void {
    if (this.employee) {
      this.router.navigate(['/employees', this.employee.id, 'edit-salary']);
    }
  }
}
