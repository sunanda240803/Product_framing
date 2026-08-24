import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { Employee } from '@core/models';
import { EmployeeService } from '@core/services';
import { PageHeaderComponent, LoadingStateComponent, EmptyStateComponent, ConfirmDialogComponent } from '@shared/components';

@Component({
  selector: 'app-edit-salary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatNativeDateModule,
    PageHeaderComponent,
    LoadingStateComponent,
    EmptyStateComponent
  ],
  providers: [CurrencyPipe],
  templateUrl: './edit-salary.component.html',
  styleUrl: './edit-salary.component.scss'
})
export class EditSalaryComponent implements OnInit {
  @Input() id!: string;

  protected salaryForm!: FormGroup;
  protected employee: Employee | null = null;
  protected isLoading = true;
  protected isSubmitting = false;
  protected hasError = false;

  protected supportedCurrencies: string[] = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF', 'SGD'];

  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private currencyPipe = inject(CurrencyPipe);

  ngOnInit(): void {
    this.initForm();
    if (this.id) {
      this.loadEmployee(this.id);
    } else {
      this.isLoading = false;
      this.hasError = true;
    }
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.salaryForm = this.fb.group({
      newSalary: [null, [Validators.required, Validators.min(0)]],
      currency: ['', [Validators.required]],
      effectiveDate: [today, [Validators.required]]
    });
  }

  private loadEmployee(employeeId: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.employeeService.getEmployeeById(employeeId).subscribe({
      next: (emp) => {
        if (emp) {
          this.employee = emp;
          this.salaryForm.patchValue({
            newSalary: emp.salary,
            currency: emp.currency,
            effectiveDate: emp.salaryEffectiveDate || new Date().toISOString().split('T')[0]
          });
        } else {
          this.employee = null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  private formatCurrencyAmount(amount: number, currencyCode: string): string {
    try {
      return this.currencyPipe.transform(amount, currencyCode, 'symbol', '1.0-0') || `${currencyCode} ${amount}`;
    } catch {
      return `${currencyCode} ${amount}`;
    }
  }

  protected onSubmit(): void {
    if (this.salaryForm.invalid || !this.employee) {
      this.salaryForm.markAllAsTouched();
      return;
    }

    const newSalary = Number(this.salaryForm.value.newSalary);
    const currency = this.salaryForm.value.currency;
    const effectiveDate = this.salaryForm.value.effectiveDate;

    const formattedOldSalary = this.formatCurrencyAmount(this.employee.salary, this.employee.currency);
    const formattedNewSalary = this.formatCurrencyAmount(newSalary, currency);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Confirm Salary Update',
        message: `Update salary for ${this.employee.firstName} ${this.employee.lastName} from ${formattedOldSalary} to ${formattedNewSalary}?`,
        confirmText: 'Confirm Update',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.executeSalaryUpdate(newSalary, currency, effectiveDate);
      }
    });
  }

  private executeSalaryUpdate(newSalary: number, currency: string, effectiveDate: string): void {
    if (!this.employee) return;

    this.isSubmitting = true;

    this.employeeService.updateSalary(this.employee.id, newSalary, currency, effectiveDate).subscribe({
      next: (updatedEmp) => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Salary updated successfully for ${updatedEmp.firstName} ${updatedEmp.lastName}!`,
          'Dismiss',
          { duration: 4000 }
        );
        this.router.navigate(['/employees', updatedEmp.id]);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open(
          'Failed to update salary. Please try again.',
          'Dismiss',
          { duration: 5000 }
        );
      }
    });
  }

  protected cancel(): void {
    if (this.id) {
      this.router.navigate(['/employees', this.id]);
    } else {
      this.router.navigate(['/employees']);
    }
  }
}
