import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { environment } from '@env/environment';
import { EmployeeService } from './employee.service';
import {
  CurrencySummary,
  CountryAnalytics,
  DepartmentAnalytics,
  DistributionAnalytics,
  SalaryBand,
  Employee
} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class CompensationAnalyticsService {
  private http = inject(HttpClient);
  private employeeService = inject(EmployeeService);
  private analyticsUrl = `${environment.apiBaseUrl}/analytics`;

  /**
   * Fetches total employee count from backend aggregation `GET /api/analytics/total-employees`
   * or falls back to employee service count.
   */
  getTotalEmployees(): Observable<number> {
    return this.http.get<{ count: number } | number>(`${this.analyticsUrl}/total-employees`).pipe(
      retry(1),
      map((res: any) => typeof res === 'number' ? res : (res?.count ?? 0)),
      catchError(() => {
        return this.employeeService.getEmployees(undefined, 0, 10000).pipe(
          map(res => res.totalElements)
        );
      })
    );
  }

  /**
   * Fetches total annual payroll expense for a specific currency via backend aggregation.
   */
  getTotalSalary(currency?: string): Observable<number> {
    let params = new HttpParams();
    if (currency) {
      params = params.set('currency', currency);
    }

    return this.http.get<{ total: number } | number>(`${this.analyticsUrl}/total-salary`, { params }).pipe(
      retry(1),
      map((res: any) => typeof res === 'number' ? res : (res?.total ?? 0)),
      catchError(() => {
        return this.getSummaryByCurrency(currency).pipe(
          map(summaries => summaries.reduce((sum, s) => sum + s.totalAnnualSalary, 0))
        );
      })
    );
  }

  /**
   * Fetches mean (average) salary for a currency via backend aggregation.
   */
  getAverageSalary(currency?: string): Observable<number> {
    let params = new HttpParams();
    if (currency) {
      params = params.set('currency', currency);
    }

    return this.http.get<{ average: number } | number>(`${this.analyticsUrl}/average-salary`, { params }).pipe(
      retry(1),
      map((res: any) => typeof res === 'number' ? res : (res?.average ?? 0)),
      catchError(() => {
        return this.getSummaryByCurrency(currency).pipe(
          map(summaries => summaries[0]?.averageSalary ?? 0)
        );
      })
    );
  }

  /**
   * Fetches median salary for a currency via backend aggregation.
   */
  getMedianSalary(currency?: string): Observable<number> {
    let params = new HttpParams();
    if (currency) {
      params = params.set('currency', currency);
    }

    return this.http.get<{ median: number } | number>(`${this.analyticsUrl}/median-salary`, { params }).pipe(
      retry(1),
      map((res: any) => typeof res === 'number' ? res : (res?.median ?? 0)),
      catchError(() => {
        return this.getSummaryByCurrency(currency).pipe(
          map(summaries => summaries[0]?.medianSalary ?? 0)
        );
      })
    );
  }

  /**
   * Fetches country compensation metrics via backend aggregation `GET /api/analytics/country`.
   */
  getSalaryByCountry(): Observable<CountryAnalytics[]> {
    return this.http.get<CountryAnalytics[]>(`${this.analyticsUrl}/country`).pipe(
      retry(1),
      catchError(() => this.fallbackSalaryByCountry())
    );
  }

  /**
   * Fetches department compensation metrics via backend aggregation `GET /api/analytics/department`.
   */
  getSalaryByDepartment(): Observable<DepartmentAnalytics[]> {
    return this.http.get<DepartmentAnalytics[]>(`${this.analyticsUrl}/department`).pipe(
      retry(1),
      catchError(() => this.fallbackSalaryByDepartment())
    );
  }

  /**
   * Fetches salary distribution bands via backend aggregation `GET /api/analytics/distribution`.
   */
  getSalaryDistribution(targetCurrency?: string): Observable<DistributionAnalytics[]> {
    let params = new HttpParams();
    if (targetCurrency) {
      params = params.set('currency', targetCurrency);
    }

    return this.http.get<DistributionAnalytics[]>(`${this.analyticsUrl}/distribution`, { params }).pipe(
      retry(1),
      catchError(() => this.fallbackSalaryDistribution(targetCurrency))
    );
  }

  /**
   * Fetches currency compensation summaries via backend aggregation `GET /api/analytics/summary`.
   */
  getSummaryByCurrency(targetCurrency?: string): Observable<CurrencySummary[]> {
    let params = new HttpParams();
    if (targetCurrency) {
      params = params.set('currency', targetCurrency);
    }

    return this.http.get<CurrencySummary[]>(`${this.analyticsUrl}/summary`, { params }).pipe(
      retry(1),
      catchError(() => this.fallbackSummaryByCurrency(targetCurrency))
    );
  }

  /**
   * Fetches highest and lowest earners for a currency zone via backend aggregation.
   */
  getHighestAndLowestSalary(currency?: string): Observable<{
    highest?: CurrencySummary['highestSalaryEmployee'];
    lowest?: CurrencySummary['lowestSalaryEmployee'];
  }> {
    return this.getSummaryByCurrency(currency).pipe(
      map(summaries => {
        if (summaries.length === 0) return {};
        const first = summaries[0];
        return {
          highest: first.highestSalaryEmployee,
          lowest: first.lowestSalaryEmployee
        };
      })
    );
  }

  // --- Dev Fallback Helpers (Active when backend server offline) ---

  private fallbackSalaryByCountry(): Observable<CountryAnalytics[]> {
    return this.employeeService.getEmployees(undefined, 0, 10000).pipe(
      map(result => {
        const mapByCountry = new Map<string, Employee[]>();
        result.data.forEach(emp => {
          const list = mapByCountry.get(emp.country) || [];
          list.push(emp);
          mapByCountry.set(emp.country, list);
        });

        const list: CountryAnalytics[] = [];
        mapByCountry.forEach((empList, countryName) => {
          const count = empList.length;
          const currency = empList[0]?.currency || 'USD';
          const totalSalary = empList.reduce((sum, e) => sum + e.salary, 0);
          const avgSalary = Math.round(totalSalary / count);
          const minSalary = Math.min(...empList.map(e => e.salary));
          const maxSalary = Math.max(...empList.map(e => e.salary));

          list.push({
            country: countryName,
            currency,
            employeeCount: count,
            averageSalary: avgSalary,
            totalSalary,
            minSalary,
            maxSalary
          });
        });
        return list.sort((a, b) => b.employeeCount - a.employeeCount);
      })
    );
  }

  private fallbackSalaryByDepartment(): Observable<DepartmentAnalytics[]> {
    return this.employeeService.getEmployees(undefined, 0, 10000).pipe(
      map(result => {
        const mapByDept = new Map<string, Employee[]>();
        result.data.forEach(emp => {
          const list = mapByDept.get(emp.department) || [];
          list.push(emp);
          mapByDept.set(emp.department, list);
        });

        const list: DepartmentAnalytics[] = [];
        mapByDept.forEach((empList, deptName) => {
          const totalCount = empList.length;
          const mapByCurr = new Map<string, Employee[]>();

          empList.forEach(e => {
            const currList = mapByCurr.get(e.currency) || [];
            currList.push(e);
            mapByCurr.set(e.currency, currList);
          });

          const currencyBreakdowns = Array.from(mapByCurr.entries()).map(([curr, currList]) => {
            const currCount = currList.length;
            const total = currList.reduce((sum, e) => sum + e.salary, 0);
            return {
              currency: curr,
              employeeCount: currCount,
              averageSalary: Math.round(total / currCount),
              totalSalary: total
            };
          });

          list.push({
            department: deptName,
            totalEmployeeCount: totalCount,
            currencyBreakdowns
          });
        });
        return list.sort((a, b) => b.totalEmployeeCount - a.totalEmployeeCount);
      })
    );
  }

  private fallbackSalaryDistribution(targetCurrency?: string): Observable<DistributionAnalytics[]> {
    return this.employeeService.getEmployees(undefined, 0, 10000).pipe(
      map(result => {
        const mapByCurr = new Map<string, Employee[]>();
        result.data.forEach(emp => {
          if (!targetCurrency || emp.currency === targetCurrency) {
            const list = mapByCurr.get(emp.currency) || [];
            list.push(emp);
            mapByCurr.set(emp.currency, list);
          }
        });

        const list: DistributionAnalytics[] = [];
        mapByCurr.forEach((empList, curr) => {
          const totalCount = empList.length;
          let rawBands: { label: string; min: number; max: number | null }[] = [];

          if (curr === 'JPY') {
            rawBands = [
              { label: 'Below ¥10M', min: 0, max: 9999999 },
              { label: '¥10M - ¥13M', min: 10000000, max: 13000000 },
              { label: '¥13M - ¥16M', min: 13000001, max: 16000000 },
              { label: 'Above ¥16M', min: 16000001, max: null }
            ];
          } else if (curr === 'INR') {
            rawBands = [
              { label: 'Below ₹2.5M', min: 0, max: 2499999 },
              { label: '₹2.5M - ₹3.0M', min: 2500000, max: 3000000 },
              { label: '₹3.0M - ₹3.5M', min: 3000001, max: 3500000 },
              { label: 'Above ₹3.5M', min: 3500001, max: null }
            ];
          } else {
            rawBands = [
              { label: 'Below $80k', min: 0, max: 79999 },
              { label: '$80k - $120k', min: 80000, max: 120000 },
              { label: '$120k - $150k', min: 120001, max: 150000 },
              { label: 'Above $150k', min: 150001, max: null }
            ];
          }

          const bands: SalaryBand[] = rawBands.map(b => {
            const count = empList.filter(e => {
              if (b.max === null) return e.salary >= b.min;
              return e.salary >= b.min && e.salary <= b.max;
            }).length;

            return {
              label: b.label,
              min: b.min,
              max: b.max,
              count,
              percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
            };
          });

          list.push({
            currency: curr,
            totalCount,
            bands
          });
        });
        return list;
      })
    );
  }

  private fallbackSummaryByCurrency(targetCurrency?: string): Observable<CurrencySummary[]> {
    return this.employeeService.getEmployees(undefined, 0, 10000).pipe(
      map(result => {
        const mapByCurr = new Map<string, Employee[]>();
        result.data.forEach(emp => {
          if (!targetCurrency || emp.currency === targetCurrency) {
            const list = mapByCurr.get(emp.currency) || [];
            list.push(emp);
            mapByCurr.set(emp.currency, list);
          }
        });

        const list: CurrencySummary[] = [];
        mapByCurr.forEach((empList, curr) => {
          const count = empList.length;
          const totalAnnualSalary = empList.reduce((sum, e) => sum + e.salary, 0);
          const averageSalary = Math.round(totalAnnualSalary / count);

          const sortedSalaries = empList.map(e => e.salary).sort((a, b) => a - b);
          const mid = Math.floor(sortedSalaries.length / 2);
          const medianSalary = sortedSalaries.length % 2 !== 0
            ? sortedSalaries[mid]
            : Math.round((sortedSalaries[mid - 1] + sortedSalaries[mid]) / 2);

          const sortedEmp = [...empList].sort((a, b) => b.salary - a.salary);
          const highestEmp = sortedEmp[0];
          const lowestEmp = sortedEmp[sortedEmp.length - 1];

          list.push({
            currency: curr,
            employeeCount: count,
            totalAnnualSalary,
            averageSalary,
            medianSalary,
            minSalary: sortedSalaries[0],
            maxSalary: sortedSalaries[sortedSalaries.length - 1],
            highestSalaryEmployee: highestEmp ? {
              id: highestEmp.id,
              name: `${highestEmp.firstName} ${highestEmp.lastName}`,
              jobTitle: highestEmp.jobTitle,
              department: highestEmp.department,
              country: highestEmp.country,
              salary: highestEmp.salary
            } : undefined,
            lowestSalaryEmployee: lowestEmp ? {
              id: lowestEmp.id,
              name: `${lowestEmp.firstName} ${lowestEmp.lastName}`,
              jobTitle: lowestEmp.jobTitle,
              department: lowestEmp.department,
              country: lowestEmp.country,
              salary: lowestEmp.salary
            } : undefined
          });
        });

        return list.sort((a, b) => b.employeeCount - a.employeeCount);
      })
    );
  }
}
