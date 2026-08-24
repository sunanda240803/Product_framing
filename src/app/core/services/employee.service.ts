import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { environment } from '@env/environment';
import {
  Employee,
  EmployeeFilter,
  PaginatedResult,
  SpringBootPage,
  PagedResponse,
  UpdateSalaryRequest
} from '@core/models';

/**
 * Generates 10,000 realistic mock employees for enterprise-scale local development and testing.
 */
function generate10kMockEmployees(): Employee[] {
  const firstNames = ['Sarah', 'Marcus', 'Elena', 'Kenji', 'Priya', 'Carlos', 'Amara', 'David', 'Sophie', 'Liam', 'Aarav', 'Yuki', 'Rachel', 'Hans', 'Ananya', 'Alex', 'Emily', 'Michael', 'Jessica', 'Daniel'];
  const lastNames = ['Jenkins', 'Vance', 'Rostova', 'Takahashi', 'Sharma', 'Mendoza', 'Okonkwo', 'Tremblay', 'Dubois', 'O\'Connor', 'Patel', 'Sato', 'Green', 'Weber', 'Iyer', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];

  const locations = [
    { country: 'United States', currency: 'USD', baseSalary: 125000 },
    { country: 'United Kingdom', currency: 'GBP', baseSalary: 85000 },
    { country: 'Germany', currency: 'EUR', baseSalary: 78000 },
    { country: 'Japan', currency: 'JPY', baseSalary: 9500000 },
    { country: 'India', currency: 'INR', baseSalary: 2400000 },
    { country: 'Spain', currency: 'EUR', baseSalary: 65000 },
    { country: 'Canada', currency: 'CAD', baseSalary: 105000 },
    { country: 'France', currency: 'EUR', baseSalary: 72000 }
  ];

  const departments = [
    { name: 'Engineering', titles: ['Principal Software Engineer', 'Senior Backend Engineer', 'Frontend Engineer', 'Staff Architect', 'DevOps Lead Engineer', 'QA Automation Engineer'] },
    { name: 'Product', titles: ['VP of Product Management', 'Lead Product Manager', 'Senior Product Designer', 'UX Researcher'] },
    { name: 'Data & Analytics', titles: ['Lead Data Scientist', 'BI Solutions Architect', 'Data Engineer', 'Analytics Manager'] },
    { name: 'Finance', titles: ['Director of Financial Operations', 'Senior Tax Analyst', 'Financial Controller', 'Accountant'] },
    { name: 'Human Resources', titles: ['Global HR Manager', 'Talent Acquisition Specialist', 'HR Business Partner'] },
    { name: 'Marketing', titles: ['VP of Brand Marketing', 'Growth Marketing Manager', 'Content Strategist'] },
    { name: 'Sales', titles: ['Enterprise Account Executive', 'Sales Development Rep', 'Regional Sales Director'] },
    { name: 'Legal', titles: ['Senior Corporate Counsel', 'Legal Operations Manager', 'Compliance Officer'] }
  ];

  const list: Employee[] = [];
  for (let i = 0; i < 10000; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const loc = locations[i % locations.length];
    const deptObj = departments[i % departments.length];
    const title = deptObj.titles[i % deptObj.titles.length];
    
    const salaryMultiplier = 0.85 + ((i * 17) % 65) / 100;
    const salary = Math.round(loc.baseSalary * salaryMultiplier);
    
    const year = 2017 + (i % 7);
    const month = String(1 + (i % 12)).padStart(2, '0');
    const day = String(1 + (i % 28)).padStart(2, '0');

    list.push({
      id: `emp-${101 + i}`,
      employeeCode: `ACM-${1001 + i}`,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}.${i + 1}@acme.com`,
      country: loc.country,
      department: deptObj.name,
      jobTitle: title,
      currency: loc.currency,
      salary,
      hireDate: `${year}-${month}-${day}`,
      salaryEffectiveDate: `2023-${month}-01`
    });
  }

  return list;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/employees`;
  private localEmployeesStore: Employee[] = generate10kMockEmployees();

  /**
   * Retrieves server-side paginated & filtered employees.
   * Sends parameters `page` and `size=10000` to Spring Boot REST endpoint `GET /api/employees`.
   */
  getEmployees(
    filter?: EmployeeFilter,
    pageIndex: number = 0,
    pageSize: number = 10000
  ): Observable<PaginatedResult<Employee>> {
    let params = new HttpParams()
      .set('page', pageIndex.toString())
      .set('size', pageSize.toString());

    if (filter?.searchQuery?.trim()) {
      params = params.set('search', filter.searchQuery.trim());
    }
    if (filter?.country) {
      params = params.set('country', filter.country);
    }
    if (filter?.department) {
      params = params.set('department', filter.department);
    }

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      retry(1),
      map((res: any) => this.normalizePaginatedResult(res, pageIndex, pageSize)),
      catchError((error: HttpErrorResponse) => {
        console.warn('Backend API request failed, falling back to 10k local mock store:', error.message);
        return of(this.getMockPaginatedResult(filter, pageIndex, pageSize));
      })
    );
  }

  /**
   * Fetches detailed information for a single employee via `GET /api/employees/{id}`.
   */
  getEmployeeById(id: string): Observable<Employee | undefined> {
    return this.http.get<Employee>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        console.warn(`Backend API request for employee ${id} failed, falling back to local store:`, error.message);
        const found = this.localEmployeesStore.find(e => e.id === id || e.employeeCode === id);
        return of(found);
      })
    );
  }

  /**
   * Updates an employee's salary via `PUT /api/employees/{id}/salary`.
   */
  updateSalary(
    employeeId: string,
    newSalary: number,
    currency: string,
    effectiveDate: string
  ): Observable<Employee> {
    const payload: UpdateSalaryRequest = {
      newSalary,
      currency,
      effectiveDate
    };

    return this.http.put<Employee>(`${this.baseUrl}/${encodeURIComponent(employeeId)}/salary`, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        console.warn(`Backend API update for employee ${employeeId} failed, falling back to local store:`, error.message);
        const index = this.localEmployeesStore.findIndex(e => e.id === employeeId || e.employeeCode === employeeId);
        if (index !== -1) {
          const updated: Employee = {
            ...this.localEmployeesStore[index],
            salary: newSalary,
            currency,
            salaryEffectiveDate: effectiveDate
          };
          this.localEmployeesStore[index] = updated;
          return of(updated);
        }
        return throwError(() => new Error(this.getErrorMessage(error)));
      })
    );
  }

  /**
   * Retrieves unique filter list of countries via `GET /api/employees/countries`.
   */
  getCountries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/countries`).pipe(
      retry(1),
      catchError(() => {
        const countries = Array.from(new Set(this.localEmployeesStore.map(e => e.country))).sort();
        return of(countries);
      })
    );
  }

  /**
   * Retrieves unique filter list of departments via `GET /api/employees/departments`.
   */
  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/departments`).pipe(
      retry(1),
      catchError(() => {
        const departments = Array.from(new Set(this.localEmployeesStore.map(e => e.department))).sort();
        return of(departments);
      })
    );
  }

  /**
   * Converts Spring Boot Page<T> or custom envelopes to standardized PaginatedResult<Employee>.
   */
  private normalizePaginatedResult(res: any, pageIndex: number, pageSize: number): PaginatedResult<Employee> {
    if (!res) {
      return { data: [], totalElements: 0, pageIndex, pageSize, totalPages: 0 };
    }
    if (Array.isArray(res.content)) {
      const total = res.totalElements ?? res.content.length;
      const actualSize = res.size ?? pageSize;
      return {
        data: res.content,
        totalElements: total,
        pageIndex: res.page ?? res.number ?? pageIndex,
        pageSize: actualSize,
        totalPages: res.totalPages ?? Math.ceil(total / actualSize)
      };
    }
    if (Array.isArray(res.data)) {
      return res as PaginatedResult<Employee>;
    }
    if (Array.isArray(res)) {
      return {
        data: res,
        totalElements: res.length,
        pageIndex,
        pageSize,
        totalPages: Math.ceil(res.length / pageSize)
      };
    }
    return { data: [], totalElements: 0, pageIndex, pageSize, totalPages: 0 };
  }

  /**
   * Fallback mock filtering logic for dev mode when backend server is offline.
   */
  private getMockPaginatedResult(
    filter?: EmployeeFilter,
    pageIndex: number = 0,
    pageSize: number = 10000
  ): PaginatedResult<Employee> {
    let filtered = [...this.localEmployeesStore];

    if (filter?.searchQuery?.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(e =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      );
    }

    if (filter?.country) {
      filtered = filtered.filter(e => e.country === filter.country);
    }

    if (filter?.department) {
      filtered = filtered.filter(e => e.department === filter.department);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize) || 1;
    const startIndex = pageIndex * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      totalElements,
      pageIndex,
      pageSize,
      totalPages
    };
  }

  /**
   * Constructs user-friendly HTTP error messages.
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to ACME Salary Service. Please check your network connection.';
    }
    if (error.status === 400) {
      return 'Invalid request payload. Please verify input data.';
    }
    if (error.status === 404) {
      return 'The requested employee record was not found.';
    }
    if (error.status === 500) {
      return 'Internal server error occurred on ACME backend. Please contact system administrator.';
    }
    return error.error?.message || `Server returned error code ${error.status}`;
  }
}
