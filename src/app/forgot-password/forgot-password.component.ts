import { Component, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../Services/auth.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { OtpCodeComponent } from '../otp-code/otp-code.component';
import { LoadingComponent } from '../loading/loading.component';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [MessageService, DynamicDialogRef]
})
export class ForgotPasswordComponent {
  @ViewChild(OtpCodeComponent) otpCodeComponent!: OtpCodeComponent;
  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  private REST_API_SERVER_SEND_OTP = 'https://best-point-production.up.railway.app/api/v1/auth/sendOTPForgotPassword';
  private REST_API_SERVER_FORGOTPASSWORD   = 'https://best-point-production.up.railway.app/api/v1/auth/forgotPassword';

  passwordMatchValidator(control: AbstractControl): ValidationErrors| null {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private messageService: MessageService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef
  ) { }

  isSendOTP: boolean = false;
  public isOtpVisible = false;

  public formData2 = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6), this.passwordMatchValidator.bind(this)]]
  });

  public sendOTP(): void {
    const request = {
      email: this.formData2.value.email
    };
    this.sendOTPAPI(request).subscribe(
      (response:any) => {
        console.log('', response.message);
        this.otpCodeComponent.startCountdown(); // Khởi động đồng hồ đếm ngược
      },
      (error:any) => {
        console.log('Send OTP failed:', error);
        // Xử lý khi xác thực thất bại
      }
    );
  }

  public sendOTPAPI(request: any): Observable<any> {
    const url = `${this.REST_API_SERVER_SEND_OTP}`;
    console.log(request.email);
    return this.httpClient.post<any>(url, request, this.httpOptions);
  }

  public forgotPassword(request: any): Observable<any> {
    const url = `${this.REST_API_SERVER_FORGOTPASSWORD}`;
    return this.httpClient.post<any>(url, request, this.httpOptions);
  }


  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Phương thức mở spinner
  openSpinner(): void {
    this.isOtpVisible = true;
  }

  // Phương thức đóng spinner
  closeSpinner(): void {
    this.isOtpVisible = false;
  }

  public onSubmit2(otp: string): void {
    if (this.formData2.valid) {
      this.loadingComponent.loading = true;
      if (this.isOtpVisible) {
        this.closeSpinner();
        const request = {
          email: this.formData2.value.email,
          newPassword: this.formData2.value.password,
          otpCode: otp
        };

        this.forgotPassword(request).subscribe(
          (response) => {
            this.loadingComponent.loading = false;
            this.ref.close();
            this.messageService.add({ severity: 'success', summary: 'Success!', detail: 'Please login with email and new password!' });
          },
          (error) => {
            console.log(error);
            this.loadingComponent.loading = false;
            if (error.message == 'Invalid credentials!') {
              this.messageService.add({ severity: 'error', summary: 'Email does not already exist!', detail: 'Please choose another email and try again!' });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Email does not already exist!', detail: 'Please choose another email and try again!' });
            }
          }
        );
      } else {
        // Gửi yêu cầu OTP và hiển thị cửa sổ nhập OTP
        const request = {
          email: this.formData2.value.email
        };
        console.log(request);
        this.sendOTPAPI(request).subscribe(
          (response) => {
            console.log('', response.message);
            this.loadingComponent.loading = false;
            this.isOtpVisible = true; // Hiển thị cửa sổ nhập OTP
            this.otpCodeComponent.startCountdown(); // Khởi động đồng hồ đếm ngược
          },
          (error) => {
            console.log('Send OTP failed:', error);
            this.loadingComponent.loading = false;
            if (error.message == 'Invalid credentials!') {
              this.messageService.add({ severity: 'warn', summary: 'Email does not already exist!', detail: 'Please choose another email and try again!' });
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Email does not already exist!', detail: 'Please choose another email and try again!' });

            }
          }
        );
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Not have enought!', detail: 'Please fill in all the required fields correctly!' });
    }
  }


  validationEmail2(): void {
    const emailControl = this.formData2.get('email');
    if (emailControl?.invalid && emailControl?.touched) {
      if (emailControl.errors?.['required']) {
        this.messageService.add({ severity: 'warn', summary: 'Email is required!'});
      } else if (emailControl.errors?.['email']) {
        this.messageService.add({ severity: 'warn', summary: 'Invalid email format!'});
      }
    }
  }
  
  validationPassword2(): void {
    const passwordControl = this.formData2.get('password');
    if (passwordControl?.invalid && passwordControl?.touched) {
      if (passwordControl.errors?.['required']) {
        this.messageService.add({ severity: 'warn', summary: 'Password is required!'});
      } else if (passwordControl.errors?.['minlength']) {
        this.messageService.add({ severity: 'warn', summary: 'Password invalid!', detail: 'Password should have a minimum length of 6 characters'});
      }
    }
  }
  
  validationConfirmPassword(): void {
    const password = this.formData2.get('password')?.value;
    const confirmPasswordControl = this.formData2.get('confirmPassword');
  
    if (confirmPasswordControl?.invalid && confirmPasswordControl?.touched) {
      if (confirmPasswordControl.hasError('required')) {
        this.messageService.add({ severity: 'warn', summary: 'Confirm password is required!'});
      } else if (confirmPasswordControl.hasError('passwordMismatch')) {
        this.messageService.add({ severity: 'warn', summary: 'Password and confirm password do not match!'});
      }
    }
  }

}
