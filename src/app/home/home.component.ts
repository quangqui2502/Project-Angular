import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { ToastComponent } from '../toast/toast.component';
import { LoadingComponent } from '../loading/loading.component';
import { DataService } from '../Services/data.service';
import { Route, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../loading/loading.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  private REST_API_SERVER = 'https://best-point-production.up.railway.app/api/jobpost/all';

  private httpOptions: any;

  jobPosts: any[] = [];
  data: any;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private cookieService: CookieService,
    private dataService: DataService,
    private messageService: MessageService
  ) {
    this.httpOptions = {
      headers: new HttpHeaders({})
    };
  }

  ngOnInit(): void {
    this.data = this.dataService.getData();
    if (this.data) {
      this.jobPosts = this.data;
    } else {
      this.onLoading();
    }
  }

  public onLoading(): void {
    this.openLoading();
    this.getAllJobPosts().subscribe(
      (data: any) => {
        this.closeLoading();
        this.jobPosts = data.data.content;
        this.dataService.setData(data.data.content);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message Content' });
      },
      (error: any) => {
        console.error('Error retrieving job posts:', error);
      }
    );
  }

  public getAllJobPosts(): Observable<any> {
    const url = `${this.REST_API_SERVER}`;
    return this.httpClient.get<any>(url);
  }

  public openLoading(): void {
    setTimeout(() => {
      if (this.loadingComponent) {
        this.loadingComponent.loading = true;
      }
    });
  }

  public closeLoading(): void {
    setTimeout(() => {
      if (this.loadingComponent) {
        this.loadingComponent.loading = false;
      }
    });
  }

  product(): void {
    this.router.navigate(['/product']);
  }
}
