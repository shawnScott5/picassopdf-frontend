import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllFiltersComponent } from './all-filters.component';

describe('AllFiltersComponent', () => {
  let component: AllFiltersComponent;
  let fixture: ComponentFixture<AllFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
