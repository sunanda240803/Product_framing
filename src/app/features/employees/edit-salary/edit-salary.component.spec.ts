import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditSalaryComponent } from './edit-salary.component';
import { EmployeeService } from '@core/services';
import { Employee } from '@core/models';

describe('EditSalaryComponent', () => {
  let component: EditSalaryComponent;
  let fixture: ComponentFixture<EditSalaryComponent>;
  let serviceSpy: jasmine.SpyObj<EmployeeService>;
  let router: Router;

  const mockEmployee: Employee = {
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
    serviceSpy = jasmine.createSpyObj('EmployeeService', ['getEmployeeById', 'updateSalary']);
    serviceSpy.getEmployeeById.and.returnValue(of(mockEmployee));
    serviceSpy.updateSalary.and.returnValue(of({
      ...mockEmployee,
      salary: 180000,
      salaryEffectiveDate: '2026-09-01'
    }));

    await TestBed.configureTestingModule({
      imports: [EditSalaryComponent, NoopAnimationsModule],
      providers: [
        { provide: EmployeeService, useValue: serviceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditSalaryComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the component', fakeAsync(() => {
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    expect(component).toBeTruthy();
  }));

  it('should load employee record and populate initial form values', fakeAsync(() => {
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    expect(component['employee']).toBeDefined();
    expect(component['employee']?.firstName).toBe('Sarah');
    expect(component['salaryForm'].value.newSalary).toBe(165000);
    expect(component['salaryForm'].value.currency).toBe('USD');
  }));

  it('should invalidate form when required fields are empty', fakeAsync(() => {
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    component['salaryForm'].patchValue({
      newSalary: null,
      currency: '',
      effectiveDate: ''
    });

    expect(component['salaryForm'].valid).toBeFalse();
    expect(component['salaryForm'].get('newSalary')?.hasError('required')).toBeTrue();
    expect(component['salaryForm'].get('currency')?.hasError('required')).toBeTrue();
    expect(component['salaryForm'].get('effectiveDate')?.hasError('required')).toBeTrue();
  }));

  it('should reject negative new salary values', fakeAsync(() => {
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    component['salaryForm'].patchValue({ newSalary: -5000 });

    expect(component['salaryForm'].valid).toBeFalse();
    expect(component['salaryForm'].get('newSalary')?.hasError('min')).toBeTrue();
  }));

  it('should navigate back to employee details when cancel is invoked', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate');
    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    component['cancel']();

    expect(navigateSpy).toHaveBeenCalledWith(['/employees', 'emp-101']);
  }));

  it('should open confirmation dialog and execute successful salary update when confirmed', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate');
    const snackBarSpy = spyOn(component['snackBar'], 'open');

    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    (component as any).employee = mockEmployee;
    component['salaryForm'].setValue({
      newSalary: 180000,
      currency: 'USD',
      effectiveDate: '2026-09-01'
    });

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(true));
    const dialogOpenSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy as any);

    component['onSubmit']();

    expect(dialogOpenSpy).toHaveBeenCalled();
    tick(200);

    expect(serviceSpy.updateSalary).toHaveBeenCalledWith('emp-101', 180000, 'USD', '2026-09-01');
    expect(snackBarSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/employees', 'emp-101']);
  }));

  it('should handle salary update failure gracefully and preserve form data', fakeAsync(() => {
    const snackBarSpy = spyOn(component['snackBar'], 'open');
    serviceSpy.updateSalary.and.returnValue(throwError(() => new Error('Service error')));

    component.id = 'emp-101';
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();

    (component as any).employee = mockEmployee;
    component['salaryForm'].setValue({
      newSalary: 195000,
      currency: 'USD',
      effectiveDate: '2026-10-01'
    });

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(true));
    const dialogOpenSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy as any);

    component['onSubmit']();

    expect(dialogOpenSpy).toHaveBeenCalled();
    tick(200);

    expect(snackBarSpy).toHaveBeenCalled();
    expect(component['salaryForm'].value.newSalary).toBe(195000);
    expect(component['isSubmitting']).toBeFalse();
  }));
});
