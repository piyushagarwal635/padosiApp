import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = 'http://localhost:5001/api/worker';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  getJobs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs`, { headers: this.getHeaders() });
  }

  acceptJob(jobId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/jobs/${jobId}/accept`, {}, { headers: this.getHeaders() });
  }

  getWallet(): Observable<any> {
    return this.http.get(`${this.apiUrl}/wallet`, { headers: this.getHeaders() });
  }
}
