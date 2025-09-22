import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBugOrRequestFeatureComponent } from './report-bug-or-request-feature.component';

describe('ReportBugOrRequestFeatureComponent', () => {
  let component: ReportBugOrRequestFeatureComponent;
  let fixture: ComponentFixture<ReportBugOrRequestFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportBugOrRequestFeatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportBugOrRequestFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
