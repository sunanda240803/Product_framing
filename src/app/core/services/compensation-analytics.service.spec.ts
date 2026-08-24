import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CompensationAnalyticsService } from './compensation-analytics.service';
import { EmployeeService } from './employee.service';

describe('CompensationAnalyticsService', () => {
  let service: CompensationAnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CompensationAnalyticsService,
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CompensationAnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch total employees from backend API GET /api/analytics/total-employees', (done) => {
    service.getTotalEmployees().subscribe(count => {
      expect(count).toBe(1500);
      done();
    });

    const req = httpMock.expectOne('/api/analytics/total-employees');
    expect(req.request.method).toBe('GET');
    req.flush({ count: 1500 });
  });

  it('should fetch total annual salary from backend API GET /api/analytics/total-salary', (done) => {
    service.getTotalSalary('USD').subscribe(total => {
      expect(total).toBe(410000);
      done();
    });

    const req = httpMock.expectOne('/api/analytics/total-salary?currency=USD');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 410000 });
  });

  it('should fetch country analytics from backend API GET /api/analytics/country', (done) => {
    service.getSalaryByCountry().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].country).toBe('United States');
      done();
    });

    const req = httpMock.expectOne('/api/analytics/country');
    expect(req.request.method).toBe('GET');
    req.flush([{
      country: 'United States',
      currency: 'USD',
      employeeCount: 50,
      averageSalary: 135000,
      totalSalary: 6750000,
      minSalary: 80000,
      maxSalary: 200000
    }]);
  });

  it('should fetch department analytics from backend API GET /api/analytics/department', (done) => {
    service.getSalaryByDepartment().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].department).toBe('Engineering');
      done();
    });

    const req = httpMock.expectOne('/api/analytics/department');
    expect(req.request.method).toBe('GET');
    req.flush([{
      department: 'Engineering',
      totalEmployeeCount: 120,
      currencyBreakdowns: [{
        currency: 'USD',
        employeeCount: 120,
        averageSalary: 145000,
        totalSalary: 17400000
      }]
    }]);
  });

  it('should fetch salary distribution from backend API GET /api/analytics/distribution', (done) => {
    service.getSalaryDistribution('USD').subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].currency).toBe('USD');
      done();
    });

    const req = httpMock.expectOne('/api/analytics/distribution?currency=USD');
    expect(req.request.method).toBe('GET');
    req.flush([{
      currency: 'USD',
      totalCount: 100,
      bands: [
        { label: 'Below $80k', min: 0, max: 79999, count: 20, percentage: 20 },
        { label: '$80k - $120k', min: 80000, max: 120000, count: 50, percentage: 50 }
      ]
    }]);
  });
});
