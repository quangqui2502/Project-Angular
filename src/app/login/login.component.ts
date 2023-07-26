import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastComponent } from '../toast/toast.component';
import { OtpCodeComponent } from '../otp-code/otp-code.component';
import { LoadingComponent } from '../loading/loading.component';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AuthService } from '../Services/auth.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HomeComponent } from '../home/home.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../loading/loading.component.scss'],
  providers: [MessageService, DialogService],

})
export class LoginComponent implements OnInit {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(OtpCodeComponent) otpCodeComponent!: OtpCodeComponent;
  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  private REST_API_SERVER_SEND_OTP = 'https://best-point-production.up.railway.app/api/v1/auth/sendOTP';
  private REST_API_SERVER_REGISTER = 'https://best-point-production.up.railway.app/api/v1/auth/register';
  private REST_API_SERVER_AUTHENTICATE = 'https://best-point-production.up.railway.app/api/v1/auth/authenticate';

  socialUser!: SocialUser;
  googleLoginOptions = {
    scope: 'profile email'
  }; // 

  isLogin = true;
  isSignUp = false;
  isValid = true;
  isEmail = true;

  public isOtpVisible = false;

  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private renderer: Renderer2,
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private messageService: MessageService,
    public dialogService: DialogService
  ) { }

  public formData = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
  

  public formData2 = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    fullname: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6), this.passwordMatchValidator.bind(this)]]
  });
  

  public formData3 = this.formBuilder.group({
    otpCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  })

  ngOnInit(): void {
    this.authService.getCurrentUser();
  }

  public onSubmit(): void {
    if (this.formData.valid) {
      const request = {
        email: this.formData.value.email,
        password: this.formData.value.password
      };
      this.loadingComponent.loading = true;
      this.authenticate(request).subscribe(
        (response) => {
          console.log('Authentication successful', response.data);
          // Xử lý sau khi xác thực thành công
          // Lưu token vào cookies
          this.cookieService.set('token', response.data.accessToken);
          this.authService.loadComponentData();
          this.router.navigate(['/home']);
        },
        (error) => {
          console.log('Authentication failed:', error);
          this.loadingComponent.loading = false;
          if (error.message == 'Invalid credentials!') {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Email or Password is not correct!' });
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Email or Password is not correct!' });

          }
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }

  public authenticate(request: any): Observable<any> {
    const url = `${this.REST_API_SERVER_AUTHENTICATE}`;
    return this.httpClient.post<any>(url, request, this.httpOptions);
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };



  signInWithFB(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
    this.socialAuthService.authState.subscribe((user) => {
      this.socialUser = user;
      this.loadingComponent.loading = true;
      this.authService.authenticateWithGoogle({
        token: this.socialUser.idToken,
      }).subscribe(
        (response) => {
          // Xử lý phản hồi thành công từ API
          this.setCookie(response.data.accessToken);
          this.authService.loadComponentData();
          this.router.navigate(['/home']);
        },
        (error) => {
          // Xử lý lỗi
          console.error(error);
          this.loadingComponent.loading = false;
        }
      );
    });
  }
  

loginWithGoogle(): void {
  this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  this.socialAuthService.authState.subscribe((user) => {
    this.socialUser = user;
    this.loadingComponent.loading = true;
    this.authService.authenticateWithGoogle({
      token: this.socialUser.idToken,
    }).subscribe(
      (response) => {
        // Xử lý phản hồi thành công từ API
        this.setCookie(response.data.accessToken);
        this.authService.loadComponentData();
        this.router.navigate(['/home']);
      },
      (error) => {
        // Xử lý lỗi
        console.error(error);
        this.loadingComponent.loading = false;
      }
    );
  });
}


  setCookie(token: string): void {
    this.cookieService.set('token', token);
  }

  signUp(): void {
    this.isSignUp = true;
    this.isLogin = false;
  }

  login(): void {
    this.isSignUp = false;
    this.isLogin = true;
  }

  public onSubmit2(otp: string): void {
    if (this.formData2.valid) {
      this.loadingComponent.loading = true;
      // Kiểm tra các thông tin đăng ký và thực hiện xác thực OTP
      if (this.isOtpVisible) {
        const request = {
          email: this.formData2.value.email,
          password: this.formData2.value.password,
          fullname: this.formData2.value.fullname,
          otpCode: otp
        };

        console.log(request);

        this.register(request).subscribe(
          (response) => {
            console.log('Register successful', response.data);
            // Xử lý sau khi xác thực thành công
            // Lưu token vào cookies
            this.cookieService.set('token', response.data.accessToken);
            this.authService.loadComponentData();
            this.router.navigate(['/home']);
          },
          (error) => {
            console.log('Register failed:', error);
            this.loadingComponent.loading = false;
            if (error.message == 'Invalid credentials!') {
              this.toastComponent.showToastMessage('Email is already exist!', 'Please choose another email and try again!', 'error');
            } else {
              this.toastComponent.showToastMessage('Register failed!', error.message.message, 'error');
            }
          }
        );
      } else {
        // Gửi yêu cầu OTP và hiển thị cửa sổ nhập OTP
        const request = {
          email: this.formData2.value.email
        };
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
              this.toastComponent.showToastMessage('Email is already exist!', 'Please choose another email and try again!', 'error');
            } else {
              this.toastComponent.showToastMessage('Email is already exist!', 'Please choose another email and try again!', 'error');
            }
          }
        );
      }
    } else {
      this.toastComponent.showToastMessage('Error', 'Please fill in all the required fields correctly', 'error');
    }
  }

  public sendOTP(): void {
    const request = {
      email: this.formData2.value.email
    };
    this.sendOTPAPI(request).subscribe(
      (response) => {
        console.log('', response.message);
        this.otpCodeComponent.startCountdown(); // Khởi động đồng hồ đếm ngược
      },
      (error) => {
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

  public register(request: any): Observable<any> {
    const url = `${this.REST_API_SERVER_REGISTER}`;
    return this.httpClient.post<any>(url, request, this.httpOptions);
  }



  // Phương thức mở spinner
  openSpinner(): void {
    this.isOtpVisible = true;
  }

  // Phương thức đóng spinner
  closeSpinner(): void {
    this.isOtpVisible = false;
  }

  validationEmail(): void {
    const emailControl = this.formData.get('email');
    if (emailControl?.invalid && emailControl?.touched) {
      if (emailControl.errors?.['required']) {
        this.toastComponent.showToastMessage('Warning', 'Email is required', 'warning');
      } else if (emailControl.errors?.['email']) {
        this.toastComponent.showToastMessage('Error', 'Invalid email format', 'error');
      }
    }
  }
  
  validationPassword(): void {
    const passwordControl = this.formData.get('password');
    if (passwordControl?.invalid && passwordControl?.touched) {
      if (passwordControl.errors?.['required']) {
        this.toastComponent.showToastMessage('Warning', 'Password is required', 'warning');
      } else if (passwordControl.errors?.['minlength']) {
        this.toastComponent.showToastMessage('Error', 'Password should have a minimum length of 6 characters', 'error');
      }
    }
  }

  validationEmail2(): void {
    const emailControl = this.formData2.get('email');
    if (emailControl?.invalid && emailControl?.touched) {
      if (emailControl.errors?.['required']) {
        this.toastComponent.showToastMessage('Warning', 'Email is required', 'warning');
      } else if (emailControl.errors?.['email']) {
        this.toastComponent.showToastMessage('Error', 'Invalid email format', 'error');
      }
    }
  }
  
  validationPassword2(): void {
    const passwordControl = this.formData2.get('password');
    if (passwordControl?.invalid && passwordControl?.touched) {
      if (passwordControl.errors?.['required']) {
        this.toastComponent.showToastMessage('Warning', 'Password is required', 'warning');
      } else if (passwordControl.errors?.['minlength']) {
        this.toastComponent.showToastMessage('Error', 'Password should have a minimum length of 6 characters', 'error');
      }
    }
  }



  validationFullname(): void {
    const fullnameControl = this.formData2.get('fullname');
    if (fullnameControl?.invalid && fullnameControl?.touched) {
      if (fullnameControl.hasError('required')) {
        this.toastComponent.showToastMessage('Warning', 'Full name is required', 'warning');
      }
    }
  }
  
  validationConfirmPassword(): void {
    const password = this.formData2.get('password')?.value;
    const confirmPasswordControl = this.formData2.get('confirmPassword');
  
    if (confirmPasswordControl?.invalid && confirmPasswordControl?.touched) {
      if (confirmPasswordControl.hasError('required')) {
        this.toastComponent.showToastMessage('Warning', 'Confirm password is required', 'warning');
      } else if (confirmPasswordControl.hasError('passwordMismatch')) {
        this.toastComponent.showToastMessage('Error', 'Password and confirm password do not match', 'error');
      }
    }
  }
  ref: DynamicDialogRef | undefined;
  
  show() {
    this.ref = this.dialogService.open(ForgotPasswordComponent, {
      header: 'Forgot Password',
      width: '30%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000
  });
  
}
}
