/**
 * Domain models for organization-wide HR compensation analytics.
 * Designed for seamless replacement with Spring Boot Analytics REST endpoints.
 */

export interface CurrencySummary {
  currency: string;
  employeeCount: number;
  totalAnnualSalary: number;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  highestSalaryEmployee?: {
    id: string;
    name: string;
    jobTitle: string;
    department: string;
    country: string;
    salary: number;
  };
  lowestSalaryEmployee?: {
    id: string;
    name: string;
    jobTitle: string;
    department: string;
    country: string;
    salary: number;
  };
}

export interface CountryAnalytics {
  country: string;
  currency: string;
  employeeCount: number;
  averageSalary: number;
  totalSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface DepartmentCurrencyBreakdown {
  currency: string;
  employeeCount: number;
  averageSalary: number;
  totalSalary: number;
}

export interface DepartmentAnalytics {
  department: string;
  totalEmployeeCount: number;
  currencyBreakdowns: DepartmentCurrencyBreakdown[];
}

export interface SalaryBand {
  label: string;
  min: number;
  max: number | null;
  count: number;
  percentage: number;
}

export interface DistributionAnalytics {
  currency: string;
  totalCount: number;
  bands: SalaryBand[];
}
