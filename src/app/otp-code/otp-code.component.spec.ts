import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpCodeComponent } from './otp-code.component';

describe('OtpCodeComponent', () => {
  let component: OtpCodeComponent;
  let fixture: ComponentFixture<OtpCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OtpCodeComponent]
    });
    fixture = TestBed.createComponent(OtpCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
