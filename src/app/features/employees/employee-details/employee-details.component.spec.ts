import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { EmployeeDetailsComponent } from './employee-details.component';
import { EmployeeService } from '@core/services';
import { Employee } from '@core/models';

describe('EmployeeDetailsComponent', () => {
  let component: EmployeeDetailsComponent;
  let fixture: ComponentFixture<EmployeeDetailsComponent>;
  let serviceSpy: jasmine.SpyObj<EmployeeService>;
  let router: Router;

  const mockEmp: Employee = {
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
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployeeById']);
    serviceSpy.getEmployeeById.and.callFake((id: string) => {
      if (id === 'emp-101') {
        return of(mockEmp);
      }
      return of(undefined);
    });

    await TestBed.configureTestingModule({
      imports: [EmployeeDetailsComponent, NoopAnimationsModule],
      providers: [
        { provide: EmployeeService, useValue: serviceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load employee details when valid ID route parameter is provided', fakeAsync(() => {
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    expect(component['isLoading']).toBeFalse();
    expect(component['employee']).toBeDefined();
    expect(component['employee']?.firstName).toBe('Sarah');
    expect(component['employee']?.salary).toBe(165000);
    expect(component['employee']?.salaryEffectiveDate).toBe('2023-01-15');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Sarah Jenkins');
  }));

  it('should display empty state when employee ID is not found', fakeAsync(() => {
    component.id = 'non-existent-emp-id';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    expect(component['isLoading']).toBeFalse();
    expect(component['employee']).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-empty-state')).toBeTruthy();
  }));

  it('should navigate to edit salary route when Edit Salary button is clicked', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate');
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    component['navigateToEditSalary']();

    expect(navigateSpy).toHaveBeenCalledWith(['/employees', 'emp-101', 'edit-salary']);
  }));

  it('should navigate back to employees directory when goBackToEmployees is invoked', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate');
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    component['goBackToEmployees']();

    expect(navigateSpy).toHaveBeenCalledWith(['/employees']);
  }));
});
