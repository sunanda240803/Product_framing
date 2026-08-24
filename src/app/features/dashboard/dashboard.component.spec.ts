import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { CompensationAnalyticsService, EmployeeService } from '@core/services';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let analyticsSpy: jasmine.SpyObj<CompensationAnalyticsService>;

  beforeEach(async () => {
    analyticsSpy = jasmine.createSpyObj('CompensationAnalyticsService', [
      'getTotalEmployees',
      'getSummaryByCurrency',
      'getSalaryByCountry',
      'getSalaryByDepartment',
      'getSalaryDistribution'
    ]);

    analyticsSpy.getTotalEmployees.and.returnValue(of(15));
    analyticsSpy.getSummaryByCurrency.and.callFake((curr?: string) => {
      if (curr === 'USD') {
        return of([{
          currency: 'USD',
          employeeCount: 3,
          totalAnnualSalary: 410000,
          averageSalary: 136667,
          medianSalary: 135000,
          minSalary: 110000,
          maxSalary: 165000
        }]);
      }
      return of([
        {
          currency: 'USD',
          employeeCount: 3,
          totalAnnualSalary: 410000,
          averageSalary: 136667,
          medianSalary: 135000,
          minSalary: 110000,
          maxSalary: 165000
        },
        {
          currency: 'EUR',
          employeeCount: 4,
          totalAnnualSalary: 333000,
          averageSalary: 83250,
          medianSalary: 88500,
          minSalary: 58000,
          maxSalary: 98000
        }
      ]);
    });

    analyticsSpy.getSalaryByCountry.and.returnValue(of([
      {
        country: 'United States',
        currency: 'USD',
        employeeCount: 3,
        averageSalary: 136667,
        totalSalary: 410000,
        minSalary: 110000,
        maxSalary: 165000
      }
    ]));

    analyticsSpy.getSalaryByDepartment.and.returnValue(of([
      {
        department: 'Engineering',
        totalEmployeeCount: 5,
        currencyBreakdowns: [{ currency: 'USD', employeeCount: 3, averageSalary: 136667, totalSalary: 410000 }]
      }
    ]));

    analyticsSpy.getSalaryDistribution.and.returnValue(of([
      {
        currency: 'USD',
        totalCount: 3,
        bands: [{ label: '$80k - $120k', min: 80000, max: 120000, count: 1, percentage: 33 }]
      }
    ]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: CompensationAnalyticsService, useValue: analyticsSpy },
        EmployeeService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', fakeAsync(() => {
    fixture.detectChanges();
    tick(200);
    expect(component).toBeTruthy();
  }));

  it('should load organization compensation analytics on initialization', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();

    expect(component['isLoading']).toBeFalse();
    expect(component['totalEmployees']).toBe(15);
    expect(component['currencySummaries'].length).toBeGreaterThan(0);
    expect(component['countryAnalytics'].length).toBeGreaterThan(0);
    expect(component['departmentAnalytics'].length).toBeGreaterThan(0);
    expect(component['distributionAnalytics'].length).toBeGreaterThan(0);
  }));

  it('should reload analytics when currency filter is changed', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);

    const spy = spyOn(component as any, 'loadAnalytics').and.callThrough();
    component['onCurrencyChange']('USD');
    tick(300);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(component['selectedCurrency']).toBe('USD');
    expect(component['currencySummaries'].length).toBe(1);
    expect(component['currencySummaries'][0].currency).toBe('USD');
  }));
});
