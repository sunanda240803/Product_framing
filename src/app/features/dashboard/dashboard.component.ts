import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompensationAnalyticsService } from '@core/services';
import {
  CurrencySummary,
  CountryAnalytics,
  DepartmentAnalytics,
  DistributionAnalytics
} from '@core/models';
import { PageHeaderComponent, LoadingStateComponent, ErrorStateComponent } from '@shared/components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  protected selectedCurrency: string = 'USD';
  protected supportedCurrencies: string[] = ['USD', 'GBP', 'EUR', 'JPY', 'INR', 'CAD'];

  protected totalEmployees = 0;
  protected currencySummaries: CurrencySummary[] = [];
  protected countryAnalytics: CountryAnalytics[] = [];
  protected departmentAnalytics: DepartmentAnalytics[] = [];
  protected distributionAnalytics: DistributionAnalytics[] = [];

  protected isLoading = true;
  protected hasError = false;

  private analyticsService = inject(CompensationAnalyticsService);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  protected onCurrencyChange(newCurrency: string): void {
    this.selectedCurrency = newCurrency;
    this.loadAnalytics();
  }

  protected loadAnalytics(): void {
    this.isLoading = true;
    this.hasError = false;

    const currFilter = this.selectedCurrency;

    forkJoin({
      totalEmployees: this.analyticsService.getTotalEmployees().pipe(catchError(() => of(0))),
      currencySummaries: this.analyticsService.getSummaryByCurrency(currFilter).pipe(catchError(() => of([]))),
      countryAnalytics: this.analyticsService.getSalaryByCountry().pipe(catchError(() => of([]))),
      departmentAnalytics: this.analyticsService.getSalaryByDepartment().pipe(catchError(() => of([]))),
      distributionAnalytics: this.analyticsService.getSalaryDistribution(currFilter).pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.totalEmployees = res.totalEmployees;
        this.currencySummaries = res.currencySummaries;
        this.countryAnalytics = currFilter
          ? res.countryAnalytics.filter(c => c.currency === currFilter)
          : res.countryAnalytics;
        this.departmentAnalytics = res.departmentAnalytics;
        this.distributionAnalytics = res.distributionAnalytics;
        this.isLoading = false;

        if (
          res.currencySummaries.length === 0 &&
          res.countryAnalytics.length === 0 &&
          res.departmentAnalytics.length === 0
        ) {
          this.hasError = true;
        }
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
}
