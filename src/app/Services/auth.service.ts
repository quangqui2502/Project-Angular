import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { UserGoogleRequest } from './user-google-request.model';
import { Observable, Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  private userDataSubject = new Subject<any>();
  userData$ = this.userDataSubject.asObservable();

  ngOnInit(): void {
    this.loadComponentData();
    
  }

  public REST_API_SERVER_AUTHENTICATE = 'https://best-point-production.up.railway.app/api/v1/auth/authenticateGG';

  isLoadUser: boolean = false;
  isLogin: boolean = false;
  id: number = 0;
  email: string = '';
  fullname: string = '';
  imageLink: string = '';
  roleCode: string = '';
  phone?: string;
  address?: string;
  birthday: Date | undefined;
  gender?: string;
  skill: any;

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService,
    private socialAuthService: SocialAuthService
  ) {}

  authenticateWithGoogle(userRequest: UserGoogleRequest): Observable<any> {
    const url = `${this.REST_API_SERVER_AUTHENTICATE}`;
    return this.httpClient.post<any>(url, userRequest, this.httpOptions);
  }


  sendInfoAccount(): Observable<any> {
    return new Observable((observer) => {
      observer.next({
        id: this.id,
        email: this.email,
        fullname: this.fullname,
        roleCode: this.roleCode,
        imageLink: this.imageLink,
        phone: this.phone,
        address: this.address,
        birthday: this.birthday,
        gender: this.gender,
        skill: this.skill
      });
      observer.complete();
    });
  }
  
  

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public setCurrentUser(id:number, email: string, fullname: string, image_link: string, roleCode:string, phone:string, address:string, birthday:string, gender:string, skill:any) {
    this.id = id;
    this.email = email;
    this.fullname = fullname;
    this.roleCode = roleCode;
    this.imageLink = image_link;
    this.phone = phone;
    this.address = address;
    const parts = birthday.split('-');
    this.birthday = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    console.log(birthday);
    this.gender = gender;
    this.skill = skill;
    this.isLoadUser = true;

    // Gửi thông báo dữ liệu người dùng đã thay đổi
    this.userDataSubject.next({
      isLoadUser: this.isLoadUser,
      isLogin: this.isLogin,
      id: this.id,
      email: this.email,
      fullname: this.fullname,
      imageLink: this.imageLink,
      roleCode: this.roleCode,
      phone: this.phone,
      address: this.address,
      birthday: this.birthday,
      gender: this.gender,
      skill: this.skill
    });
  }

  public loadComponentData(): void {
    if (this.cookieService.get('token')) {
      this.isLoadUser = false;
      this.loadCurrentUser();
      this.isLogin = true;
    } else {
      this.isLogin = false;
    }
    this.userDataSubject.next({
      isLoadUser: this.isLoadUser,
      isLogin: this.isLogin,
      id: this.id,
      email: this.email,
      fullname: this.fullname,
      imageLink: this.imageLink,
      roleCode: this.roleCode,
      phone: this.phone,
      address: this.address,
      birthday: this.birthday,
      gender: this.gender,
      skill: this.skill
    });
  }

  public loadCurrentUser() {
    this.getCurrentUser().subscribe((data) => {
      this.setCurrentUser(
        data.data.accountId,
         data.data.email,
          data.data.fullname,
           data.data.imageLink,
            data.data.roleCode,
            data.data.phone,
            data.data.address,
            data.data.birthday,
            data.data.gender,
            data.data.skills
            );
    });
  }

  public getCurrentUser(): Observable<any> {
    const url = 'https://best-point-production.up.railway.app/api/account/currentUser';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.cookieService.get('token')
      })
    };
    return this.httpClient.get<any>(url, httpOptions);
  }
}
