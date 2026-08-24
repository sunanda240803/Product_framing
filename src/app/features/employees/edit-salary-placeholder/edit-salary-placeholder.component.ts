import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Employee } from '@core/models';
import { EmployeeService } from '@core/services';
import { PageHeaderComponent, LoadingStateComponent, EmptyStateComponent } from '@shared/components';

@Component({
  selector: 'app-edit-salary-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    PageHeaderComponent,
    LoadingStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './edit-salary-placeholder.component.html',
  styleUrl: './edit-salary-placeholder.component.scss'
})
export class EditSalaryPlaceholderComponent implements OnInit {
  @Input() id!: string;

  protected employee: Employee | null = null;
  protected isLoading = true;
  protected hasError = false;

  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.id) {
      this.loadEmployee(this.id);
    } else {
      this.isLoading = false;
      this.hasError = true;
    }
  }

  loadEmployee(employeeId: string): void {
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

  goBackToDetails(): void {
    if (this.id) {
      this.router.navigate(['/employees', this.id]);
    } else {
      this.router.navigate(['/employees']);
    }
  }
}
