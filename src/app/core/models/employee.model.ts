/**
 * Domain model representing an Employee in the ACME Salary Management system.
 * Designed for enterprise-scale HR management (~10,000 employees).
 */
export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  department: string;
  jobTitle: string;
  currency: string;
  salary: number;
  hireDate: string;
  salaryEffectiveDate: string;
}

/**
 * Request DTO payload for PUT /api/employees/{id}/salary endpoint.
 */
export interface UpdateSalaryRequest {
  newSalary: number;
  currency: string;
  effectiveDate: string;
}

/**
 * Filter parameters for searching and querying employees.
 */
export interface EmployeeFilter {
  searchQuery?: string;
  department?: string;
  country?: string;
  minSalary?: number;
  maxSalary?: number;
}

/**
 * Paginated API/Service response envelope suitable for 10,000+ employee backend integration.
 */
export interface PaginatedResult<T> {
  data: T[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Spring Boot standard Page<T> JSON response contract.
 */
export interface SpringBootPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last?: boolean;
  first?: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  page?: number;
  number?: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * High-level salary summary statistics for organization insights.
 */
export interface SalaryInsight {
  totalEmployees: number;
  totalPayrollAnnual: number;
  averageSalary: number;
  medianSalary: number;
  currency: string;
  departmentCount: number;
  countryCount: number;
}
