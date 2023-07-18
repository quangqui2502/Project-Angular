import { Component, OnInit, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AuthService } from '../Services/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy  {
  sidebarVisible: boolean = false;
  items: MenuItem[] | undefined;
  userDataSubscription!: Subscription;
  online: boolean = navigator.onLine;

  @HostListener('window:online', ['$event'])
  onOnline(event: Event) {
    this.online = true;
    // this.notifyComponent.showNotity('Notification', 'Network is online!');
  }

  @HostListener('window:offline', ['$event'])
  onOffline(event: Event) {
    this.online = false;
    // this.notifyComponent.showNotity('Notification', 'Network is offline!');
  }

  isLoadUser: boolean = false;
  isLogin: boolean = false;
  email = '';
  fullname = '';
  imageLink = '';
  roleCode = '';

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private socialAuthService: SocialAuthService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.loadComponentData();
    if (this.cookieService.get('token')) {
      this.isLoadUser = false;
      this.isLogin = true;
    } else {
      this.isLogin = false;
    }
    this.userDataSubscription = this.authService.userData$.subscribe((userData) => {
      this.updateData(
        userData.isLoadUser,
        userData.isLogin,
        userData.email,
        userData.fullname,
        userData.imageLink,
        userData.roleCode
      );
    });


    
  }

  ngOnDestroy(): void {
    this.userDataSubscription.unsubscribe();
  }

  updateData(
    isLoadUser: boolean,
    isLogin: boolean,
    email: string,
    fullname: string,
    imageLink: string,
    roleCode: string
  ): void {
    this.isLoadUser = isLoadUser;
    this.isLogin = isLogin;
    this.email = email;
    this.fullname = fullname;
    this.imageLink = imageLink;
    this.roleCode = roleCode;
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logOut(): void {
    this.cookieService.delete('token');
    this.isLogin = false;
    this.socialAuthService.signOut();
    // this.notifyComponent.showNotity('Notification', 'Log out success!');
    this.router.navigate(['/home']);
  }

  profile(): void {
    this.router.navigate(['/profile']);
  }
}
