import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-otp-code',
  templateUrl: './otp-code.component.html',
  styleUrls: ['./otp-code.component.scss']
})
export class OtpCodeComponent implements OnInit {
  @Input() isOtpVisible: boolean = false;
  ngOnInit(): void {

  }
  otpSent: boolean = false;
  countdown: number = 0;
  countdownTimer: any;

  startCountdown(): void {
    this.otpSent = true;
    this.countdown = 60; // 5 phút (300 giây)
    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown(): void {
    this.otpSent = false;
    clearInterval(this.countdownTimer);
  }

  @Output() closeSpinner = new EventEmitter<void>();
  @Output() submitSpinner = new EventEmitter<string>();
  @Output() resendOTP = new EventEmitter<void>();


  onClose(): void {
    this.closeSpinner.emit();
  }

  onResendOTP(): void {
    this.resendOTP.emit();
  }

  otp: string = '';

  onSubmit() {
    const otpCode = this.otp; // Lấy giá trị từ ô nhập liệu
    this.submitSpinner.emit(otpCode); // Truyền mã OTP qua đầu ra
  }
  

}
