import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Employee, EmployeeFilter, PaginatedResult } from '@core/models';
import { EmployeeService } from '@core/services';
import { PageHeaderComponent, EmptyStateComponent, LoadingStateComponent, ErrorStateComponent } from '@shared/components';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit, OnDestroy {
  protected displayedColumns: string[] = [
    'employeeCode',
    'name',
    'country',
    'department',
    'jobTitle',
    'salary',
    'actions'
  ];

  protected filterForm!: FormGroup;
  protected employees: Employee[] = [];
  protected totalElements = 0;
  protected pageIndex = 0;
  protected pageSize = 10;
  protected pageSizeOptions = [10, 25, 50, 100, 500, 1000, 10000];

  protected countries: string[] = [];
  protected departments: string[] = [];

  protected isLoading = true;
  protected hasError = false;

  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initFilterForm();
    this.loadFilterOptions();
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      country: [''],
      department: ['']
    });

    // React to form changes with debounce for responsive UX
    this.filterForm.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex = 0; // Reset to first page when filter changes
        this.loadEmployees();
      });
  }

  private loadFilterOptions(): void {
    this.employeeService.getCountries().subscribe(countries => {
      this.countries = countries;
    });

    this.employeeService.getDepartments().subscribe(departments => {
      this.departments = departments;
    });
  }

  protected loadEmployees(): void {
    this.isLoading = true;
    this.hasError = false;

    const filter: EmployeeFilter = {
      searchQuery: this.filterForm.value.searchQuery,
      country: this.filterForm.value.country,
      department: this.filterForm.value.department
    };

    this.employeeService.getEmployees(filter, this.pageIndex, this.pageSize).subscribe({
      next: (result: PaginatedResult<Employee>) => {
        this.employees = result.data;
        this.totalElements = result.totalElements;
        this.pageIndex = result.pageIndex;
        this.pageSize = result.pageSize;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  protected clearFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      country: '',
      department: ''
    });
  }

  protected viewEmployeeDetails(employee: Employee): void {
    this.router.navigate(['/employees', employee.id]);
  }
}
