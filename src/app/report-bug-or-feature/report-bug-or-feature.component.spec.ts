import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBugOrRequestFeature } from './report-bug-or-feature.component';

describe('ReportBugOrRequestFeature', () => {
  let component: ReportBugOrRequestFeature;
  let fixture: ComponentFixture<ReportBugOrRequestFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportBugOrRequestFeature]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportBugOrRequestFeature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
