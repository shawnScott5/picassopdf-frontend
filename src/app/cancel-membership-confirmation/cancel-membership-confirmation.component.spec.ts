import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelMembershipConfirmationComponent } from './cancel-membership-confirmation.component';

describe('CancelMembershipConfirmationComponent', () => {
  let component: CancelMembershipConfirmationComponent;
  let fixture: ComponentFixture<CancelMembershipConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelMembershipConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelMembershipConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
