import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TestApiComponent } from './test-api.component';

describe('TestApiComponent', () => {
  let component: TestApiComponent;
  let fixture: ComponentFixture<TestApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestApiComponent ],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default test case selected', () => {
    expect(component.selectedTestCase).toBeTruthy();
    expect(component.selectedTestCase?.id).toBe('complex-css');
  });

  it('should have predefined test cases', () => {
    expect(component.testCases.length).toBeGreaterThan(0);
    expect(component.testCases[0]).toHaveProperty('id');
    expect(component.testCases[0]).toHaveProperty('name');
    expect(component.testCases[0]).toHaveProperty('htmlContent');
  });

  it('should select test case when clicked', () => {
    const testCase = component.testCases[1];
    component.selectTestCase(testCase);
    expect(component.selectedTestCase).toBe(testCase);
  });

  it('should update form when test case is selected', () => {
    const testCase = component.testCases[1];
    component.selectTestCase(testCase);
    expect(component.testForm.get('htmlContent')?.value).toBe(testCase.htmlContent);
    expect(component.testForm.get('fileName')?.value).toBe(testCase.id + '-test');
  });

  it('should validate required fields', () => {
    component.testForm.patchValue({
      htmlContent: '',
      fileName: ''
    });
    expect(component.testForm.valid).toBeFalsy();
  });

  it('should be valid with required fields filled', () => {
    component.testForm.patchValue({
      htmlContent: '<html><body>Test</body></html>',
      fileName: 'test-file'
    });
    expect(component.testForm.valid).toBeTruthy();
  });

  it('should clear results', () => {
    component.testResults = [
      { id: '1', name: 'Test 1', status: 'completed' }
    ];
    component.clearResults();
    expect(component.testResults.length).toBe(0);
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(1500)).toBe('1.50s');
    expect(component.formatDuration(undefined)).toBe('-');
  });

  it('should return correct status classes', () => {
    expect(component.getStatusClass('completed')).toBe('status-success');
    expect(component.getStatusClass('failed')).toBe('status-error');
    expect(component.getStatusClass('running')).toBe('status-warning');
    expect(component.getStatusClass('pending')).toBe('status-pending');
  });

  it('should return correct status icons', () => {
    expect(component.getStatusIcon('completed')).toBe('fas fa-check-circle');
    expect(component.getStatusIcon('failed')).toBe('fas fa-times-circle');
    expect(component.getStatusIcon('running')).toBe('fas fa-spinner fa-spin');
    expect(component.getStatusIcon('pending')).toBe('fas fa-clock');
  });
});
