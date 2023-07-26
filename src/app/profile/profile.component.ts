import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../Services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingComponent } from '../loading/loading.component';
import { ToastComponent } from '../toast/toast.component';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFileName: string = 'Browse File to upload!';
  selectedImageUrl: string = '';

  pageUpFile: boolean = false;
  isUpFile: boolean = false;
  isEditing: boolean = false;

  selectedFile: File | null = null;

  deleteFile() {
    this.selectedFile = null;
    this.isUpFile = false;
    this.selectedFileName = '';
    this.selectedImageUrl = '';
  }

  onFileSelected(): void {
    this.selectedFile = this.fileInput.nativeElement.files[0];
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
      this.isUpFile = true;
      this.selectedImageUrl = URL.createObjectURL(this.selectedFile);
      console.log(this.selectedFile);
    } else {
      this.selectedFileName = 'Not selected file';
      this.isUpFile = false;
      this.selectedImageUrl = '';
    }
  }


  id?: number;
  email?: string;
  fullname?: string;
  imageLink?: string;
  roleCode?: string;
  phone?: string;
  address?: string;
  birthday?: string;
  gender?: string;
  skill?: any;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) { }

  userDataSubscription!: Subscription;

  ngOnInit() {
    this.userDataSubscription = new Subscription();
    this.loadDataFromAuthService();
    this.authService.userData$.subscribe((userData) => {
      this.fillData(userData.accountId, userData.email, userData.imageLink, userData.fullname, userData.birthday, userData.phone, userData.address, userData.gender, userData.skill);
    });
  }

  ngOnDestroy() {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  loadDataFromAuthService(): void {
    this.id = this.authService.id;
    this.email = this.authService.email;
    this.fullname = this.authService.fullname;
    this.imageLink = this.authService.imageLink;
    this.roleCode = this.authService.roleCode;
    this.phone = this.authService.phone;
    this.address = this.authService.address;
    const date = new Date(this.authService.birthday ?? '');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    this.birthday = formattedDate;
    this.gender = this.authService.gender;
    this.skill = this.authService.skill;
  }


  upLoadFile(): void {
    this.pageUpFile = true;
  }

  closeupLoadFile(): void {
    this.pageUpFile = false;
  }

  isDragOver = false;

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.isUpFile = true;
      this.selectedImageUrl = URL.createObjectURL(file);
    } else {
      this.selectedFileName = 'Not selected file';
      this.isUpFile = false;
      this.selectedImageUrl = '';
    }
  }


  skills: any;

  toggleEdit(): void {
    this.loadingComponent.loading = true;
    this.isEditing = !this.isEditing;
    const checkbox = document.getElementById('myCheckbox') as HTMLInputElement;
    if (checkbox.checked) {
      checkbox.checked = false;
    }
    if (this.isEditing) {
      this.allSkill().subscribe(
        (response) => {
          console.log(response.data.content);
          this.skills = response.data.content;
          this.loadingComponent.loading = false;
        },
        (error) => {
          this.loadingComponent.loading = true;
          this.messageService.add({ severity: 'error', summary: 'Error!', detail: error.data });
        }
      );
    }
    if (!this.isEditing) {
      this.loadingComponent.loading = false;
    }
  }

  isSkillSelected(skill: any): boolean {
    let isCheck = false;
    this.skill.forEach((item: any) => {
      if (item.skillId === skill.skillId) {
        isCheck = true;
      }
    });

    return isCheck;
  }

  isChanging: boolean = false;
  isValid: boolean = false;
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  validationChangePassword(): void {
    console.log(this.oldPassword.length);
    console.log(this.newPassword.length);
    console.log(this.confirmPassword.length);
    if (!(this.oldPassword.length < 6) || !(this.newPassword.length < 6) || !(this.confirmPassword.length < 6)) {
      if (this.newPassword.toLowerCase() !== this.confirmPassword.toLowerCase()) {
        this.messageService.add({ severity: 'warn', summary: 'Warning!', detail: 'New password and confirm password do not match!' });
      } else {
        this.isValid = true;
      }
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning!', detail: 'Password should have a minimum length of 6 characters!' });
    }

  }

  onChange(): void {
    if (this.isValid) {
      this.loadingComponent.loading = true;
      const request = {
        email: this.email,
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      };
      this.changePassword(request).subscribe(
        (response) => {
          this.isChanging = false;
          this.loadingComponent.loading = false;
          this.messageService.add({ severity: 'success', summary: 'Success!', detail: 'Change password success!' });
        },
        (error) => {
          this.loadingComponent.loading = false;
          if (!error.success) {
            this.messageService.add({ severity: 'error', summary: 'Failed!', detail: 'Current Password is not Correct!' });
          }
        }
      );

    }
  }

  toggleChangePassword(): void {
    this.isChanging = !this.isChanging;
    const checkbox = document.getElementById('myCheckbox') as HTMLInputElement;
    if (checkbox.checked) {
      checkbox.checked = false;
    }
  }

  fillData(accountId: number, email: string, imageLink: string, fullname: string, birthday: string, phone: string, address: string, gender: string, skill: any): void {
    this.loadingComponent.loading = true;
    this.id = accountId;
    this.email = email;
    this.imageLink = imageLink;
    this.fullname = fullname;
    const date = new Date(birthday);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    this.birthday = formattedDate;
    this.phone = phone;
    this.address = address;
    this.gender = gender;
    this.skill = skill;
    const radioInputs = document.querySelectorAll('.radio-input') as NodeListOf<HTMLInputElement>;

    radioInputs.forEach((radio) => {
      if (radio.nextElementSibling?.textContent?.toLowerCase() === gender.toLowerCase()) {
        radio.checked = true;
      }
    });

    this.loadingComponent.loading = false;
  }

  public allSkill(): Observable<any> {
    const url = 'https://best-point-production.up.railway.app/api/skill/all';
    return this.httpClient.get<any>(url, this.httpOptions);
  }


  public changePassword(request: any): Observable<any> {
    const url = 'https://best-point-production.up.railway.app/api/v1/auth/changePassword';
    return this.httpClient.post<any>(url, request, this.httpOptions);
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.cookieService.get('token')
    })
  };

  public uploadFileAPI(request: File): Observable<any> {
    const url = 'https://best-point-production.up.railway.app/api/files/upload';
    return this.httpClient.post<any>(url, request, this.httpOptionFile);
  }

  private httpOptionFile = {
    headers: new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    })
  };

  onUpdate() {
    this.loadingComponent.loading = true;
    // Lấy tất cả các phần tử đã được chọn
    const checkedInputs = document.querySelectorAll('input[type="checkbox"]:checked');

    // Tạo một mảng để lưu trữ các id của phần tử đã được chọn
    const selectedIds: string[] = [];

    // Lặp qua tất cả các phần tử đã được chọn và lấy id của chúng
    checkedInputs.forEach((input: any) => {
      if (input.value != 'on') {
        selectedIds.push(input.value);
      }
    });


    // Lấy tất cả các phần tử radio đã được chọn
    const checkedRadios = document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="gender"]:checked');

    // Kiểm tra xem có phần tử radio được chọn hay không
    if (checkedRadios.length > 0) {
      // Lấy giá trị của phần tử radio được chọn
      const selectedGender = checkedRadios[0].value;
      const request = {
        fullname: this.fullname,
        imageLink: this.imageLink,
        gender: selectedGender,
        birthday: this.birthday,
        phone: this.phone,
        address: this.address,
        skills: selectedIds
      }

      console.log(request);
      this.updateInfoUser(request, 'https://best-point-production.up.railway.app/api/account/edit').subscribe(
        (response) => {
          console.log(response.data);
          this.loadingComponent.loading = false;
          this.fillData(response.data.accountId, response.data.email, response.data.imageLink, response.data.fullname, response.data.birthday, response.data.phone, response.data.address, response.data.gender, response.data.skills);
          this.messageService.add({ severity: 'success', summary: 'Success!', detail: 'Update Info success!' });
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Failed!', detail: 'Update Info unsuccess!' });
        }
      );
      this.isEditing = false;
    }
  }

  onToast(title: string, message: string, type: string): void {
    this.toastComponent.showToastMessage(title, message, type);
  }

  updateInfoUser(request: any, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.cookieService.get('token')
      })
    };
    return this.httpClient.post<any>(url, request, httpOptions);
  }
}
