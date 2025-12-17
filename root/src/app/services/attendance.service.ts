import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  startDay(): Observable<any> {
    return this.http.post('http://localhost:5000/api/attendance/start', {}, { headers: this.getHeaders() });
  }

  endDay(): Observable<any> {
    return this.http.post('http://localhost:5000/api/attendance/end', {}, { headers: this.getHeaders() });
  }
}
