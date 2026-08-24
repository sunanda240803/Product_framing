import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return paginated employees from GET /api/employees', (done) => {
    service.getEmployees(undefined, 0, 10).subscribe(result => {
      expect(result.data.length).toBe(1);
      expect(result.totalElements).toBe(1);
      expect(result.data[0].firstName).toBe('Sarah');
      done();
    });

    const req = httpMock.expectOne('/api/employees?page=0&size=10');
    expect(req.request.method).toBe('GET');
    req.flush({
      content: [{
        id: 'emp-101',
        employeeCode: 'ACM-1001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@acme.com',
        country: 'United States',
        department: 'Engineering',
        jobTitle: 'Principal Software Engineer',
        currency: 'USD',
        salary: 165000,
        hireDate: '2020-03-15',
        salaryEffectiveDate: '2023-01-15'
      }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    });
  });

  it('should pass search, country, and department query params to GET /api/employees', (done) => {
    service.getEmployees({ searchQuery: 'sarah', country: 'United States', department: 'Engineering' }, 0, 10).subscribe(result => {
      expect(result.data.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne('/api/employees?page=0&size=10&search=sarah&country=United%20States&department=Engineering');
    expect(req.request.method).toBe('GET');
    req.flush({
      content: [{
        id: 'emp-101',
        employeeCode: 'ACM-1001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@acme.com',
        country: 'United States',
        department: 'Engineering',
        jobTitle: 'Principal Software Engineer',
        currency: 'USD',
        salary: 165000,
        hireDate: '2020-03-15',
        salaryEffectiveDate: '2023-01-15'
      }],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    });
  });

  it('should retrieve a single employee by ID via GET /api/employees/{id}', (done) => {
    service.getEmployeeById('emp-101').subscribe(emp => {
      expect(emp).toBeDefined();
      expect(emp?.firstName).toBe('Sarah');
      done();
    });

    const req = httpMock.expectOne('/api/employees/emp-101');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'emp-101',
      employeeCode: 'ACM-1001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@acme.com',
      country: 'United States',
      department: 'Engineering',
      jobTitle: 'Principal Software Engineer',
      currency: 'USD',
      salary: 165000,
      hireDate: '2020-03-15',
      salaryEffectiveDate: '2023-01-15'
    });
  });

  it('should send PUT /api/employees/{id}/salary request when updating salary', (done) => {
    service.updateSalary('emp-101', 185000, 'USD', '2026-09-01').subscribe(emp => {
      expect(emp.salary).toBe(185000);
      done();
    });

    const req = httpMock.expectOne('/api/employees/emp-101/salary');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      newSalary: 185000,
      currency: 'USD',
      effectiveDate: '2026-09-01'
    });

    req.flush({
      id: 'emp-101',
      employeeCode: 'ACM-1001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@acme.com',
      country: 'United States',
      department: 'Engineering',
      jobTitle: 'Principal Software Engineer',
      currency: 'USD',
      salary: 185000,
      hireDate: '2020-03-15',
      salaryEffectiveDate: '2026-09-01'
    });
  });
});
