import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { LoadingComponent } from './loading/loading.component';
import { AuthService } from './Services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Angular';
  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  socialUser!: SocialUser;
  isLoggedin?: boolean;
  constructor(
    private socialAuthService: SocialAuthService,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit() {
    this.socialAuthService.authState.subscribe((user) => {
      console.log(user);
      
      this.socialUser = user;
      this.isLoggedin = user != null;
      this.authService.authenticateWithGoogle({
        token: this.socialUser.idToken,
      }).subscribe(
        (response) => {
          this.setCookie(response.data.accessToken);
          this.authService.loadComponentData();
          this.router.navigate(['/home']);
        },
        (error) => {
          // Xử lý lỗi
          console.error(error);
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
  
  logOut(): void {
    this.socialAuthService.signOut();
    this.cookieService.delete('token');
  }
}