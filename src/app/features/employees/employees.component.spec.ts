import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EmployeesComponent } from './employees.component';
import { EmployeeService } from '@core/services';
import { Employee, PaginatedResult } from '@core/models';

describe('EmployeesComponent', () => {
  let component: EmployeesComponent;
  let fixture: ComponentFixture<EmployeesComponent>;
  let service: EmployeeService;

  const mockEmployees: Employee[] = [
    {
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
    },
    {
      id: 'emp-103',
      employeeCode: 'ACM-1003',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@acme.com',
      country: 'Germany',
      department: 'Engineering',
      jobTitle: 'Senior Engineering Manager',
      currency: 'EUR',
      salary: 98000,
      hireDate: '2019-07-22',
      salaryEffectiveDate: '2023-03-01'
    }
  ];

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployees', 'getCountries', 'getDepartments']);
    employeeServiceSpy.getCountries.and.returnValue(of(['United States', 'Germany']));
    employeeServiceSpy.getDepartments.and.returnValue(of(['Engineering']));
    employeeServiceSpy.getEmployees.and.callFake((filter: any, pageIndex: number, pageSize: number) => {
      let filtered = [...mockEmployees];
      if (filter?.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        filtered = filtered.filter(e => e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q));
      }
      if (filter?.country) {
        filtered = filtered.filter(e => e.country === filter.country);
      }
      if (filter?.department) {
        filtered = filtered.filter(e => e.department === filter.department);
      }
      const result: PaginatedResult<Employee> = {
        data: filtered,
        totalElements: filtered.length,
        pageIndex: pageIndex || 0,
        pageSize: pageSize || 10,
        totalPages: 1
      };
      return of(result);
    });

    await TestBed.configureTestingModule({
      imports: [EmployeesComponent, NoopAnimationsModule],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(EmployeeService);
  });

  it('should create the component', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);
    expect(component).toBeTruthy();
  }));

  it('should initialize filter form controls and load employee records', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    expect(component['employees'].length).toBe(2);
    expect(component['totalElements']).toBe(2);
  }));

  it('should filter employees when searching by name', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);

    component['filterForm'].patchValue({ searchQuery: 'Sarah' });
    tick(350);
    fixture.detectChanges();

    expect(component['employees'].length).toBe(1);
    expect(component['employees'][0].firstName).toBe('Sarah');
  }));

  it('should filter employees when selecting a country', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);

    component['filterForm'].patchValue({ country: 'Germany' });
    tick(350);
    fixture.detectChanges();

    expect(component['employees'].length).toBe(1);
    expect(component['employees'][0].country).toBe('Germany');
  }));

  it('should filter employees when selecting a department', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);

    component['filterForm'].patchValue({ department: 'Engineering' });
    tick(350);
    fixture.detectChanges();

    expect(component['employees'].length).toBe(2);
    expect(component['employees'].every(e => e.department === 'Engineering')).toBeTrue();
  }));

  it('should display empty result state when search query matches no records', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);

    component['filterForm'].patchValue({ searchQuery: 'UnknownPersonXYZ' });
    tick(350);
    fixture.detectChanges();

    expect(component['employees'].length).toBe(0);
    expect(component['totalElements']).toBe(0);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-empty-state')).toBeTruthy();
  }));

  it('should reset all filters when clearFilters is invoked', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);

    component['filterForm'].patchValue({ searchQuery: 'Sarah', country: 'United States' });
    tick(350);
    fixture.detectChanges();

    component['clearFilters']();
    tick(350);
    fixture.detectChanges();

    expect(component['filterForm'].value.searchQuery).toBe('');
    expect(component['filterForm'].value.country).toBe('');
    expect(component['totalElements']).toBe(2);
  }));
});
