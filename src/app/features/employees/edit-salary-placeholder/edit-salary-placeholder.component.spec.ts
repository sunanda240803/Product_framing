import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { EditSalaryPlaceholderComponent } from './edit-salary-placeholder.component';
import { EmployeeService } from '@core/services';
import { Employee } from '@core/models';

describe('EditSalaryPlaceholderComponent', () => {
  let component: EditSalaryPlaceholderComponent;
  let fixture: ComponentFixture<EditSalaryPlaceholderComponent>;
  let router: Router;
  let serviceSpy: jasmine.SpyObj<EmployeeService>;

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
    serviceSpy.getEmployeeById.and.returnValue(of(mockEmp));

    await TestBed.configureTestingModule({
      imports: [EditSalaryPlaceholderComponent, NoopAnimationsModule],
      providers: [
        { provide: EmployeeService, useValue: serviceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditSalaryPlaceholderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load employee record for edit salary placeholder', fakeAsync(() => {
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    expect(component['employee']).toBeDefined();
    expect(component['employee']?.firstName).toBe('Sarah');
  }));

  it('should navigate back to details page when goBackToDetails is invoked', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate');
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);

    component['goBackToDetails']();

    expect(navigateSpy).toHaveBeenCalledWith(['/employees', 'emp-101']);
  }));
});
