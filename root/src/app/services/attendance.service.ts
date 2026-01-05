import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  timerText = signal('00:00:00');
  isRunning = signal(false);
  logs = signal<any[]>([]);

  private timerInterval: any;
  private storedDurationMs = 0;
  private startTimestamp = 0;

  constructor(private http: HttpClient) {
    this.initFromBackend();
  }


  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  initFromBackend() {
    this.http.get<any>('http://localhost:5000/api/attendance/me')
      .pipe(
        catchError(err => {
          console.error('Error fetching attendance:', err);
          this.resetTimer();
          return of(null);
        })
      )
      .subscribe(res => {
        if (!res || !res.attendance) {
          this.resetTimer();
          return;
        }

        const att = res.attendance;

        if (att.logs && Array.isArray(att.logs)) {
          this.logs.set(att.logs);
        }

        this.storedDurationMs = att.duration ? this.parse(att.duration) : 0;

        if (!att.isRunning) {
          
          this.timerText.set(this.format(this.storedDurationMs));
          this.isRunning.set(false);
          this.stopTimer();
        } else {
          
          this.isRunning.set(true);
          
          if (att.startTime) {
            this.startTimestamp = new Date(att.startTime).getTime();
            this.updateTimerDisplay();
            this.startTimer();
          }
        }
      });
  }

  startDay() {
    this.http.post<any>('http://localhost:5000/api/attendance/start', {})
      .pipe(
        catchError(err => {
          console.error('Error starting day:', err);
          
          
          if (err.status === 400) {
            this.initFromBackend();
          }
          
          return of(null);
        })
      )
      .subscribe(res => {
        if (!res) return;
        
        const att = res.attendance;
        this.storedDurationMs = this.parse(att.duration);
        this.isRunning.set(att.isRunning);
        
        if (att.isRunning && att.startTime) {
          this.startTimestamp = new Date(att.startTime).getTime();
          this.updateTimerDisplay();
          this.startTimer();
        } else {
          this.timerText.set(this.format(this.storedDurationMs));
          this.stopTimer();
        }
      });
  }

  endDay() {
    this.http.post<any>('http://localhost:5000/api/attendance/end', {})
      .pipe(
        catchError(err => {
          console.error('Error ending day:', err);
          return of(null);
        })
      )
      .subscribe(res => {
        if (!res) return;
        
        const att = res.attendance;
        this.storedDurationMs = this.parse(att.duration);
        this.timerText.set(this.format(this.storedDurationMs));
        this.isRunning.set(false);
        this.stopTimer();
      });
  }



 getAllAttendance() {
    return this.http.get<any>('http://localhost:5000/api/attendance/all', this.getAuthHeaders())
      .pipe(
        catchError(err => {
          console.error('Error getting all attendance:', err);
          return of({ records: [] });
        })
      );
  }

  // Load logs for current day
  loadLogs() {
    this.http.get<any>('http://localhost:5000/api/attendance/me', this.getAuthHeaders())
      .pipe(
        catchError(err => {
          console.error('Load logs error:', err);
          return of({ attendance: { logs: [] } });
        })
      )
      .subscribe(res => {
        if (res && res.attendance && res.attendance.logs) {
          this.logs.set(res.attendance.logs);
        }
      });
  }



  private startTimer() {
    this.stopTimer();
    
    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimerDisplay() {
    if (!this.isRunning()) {
      this.timerText.set(this.format(this.storedDurationMs));
      return;
    }

    const now = Date.now();
    const elapsed = now - this.startTimestamp;
    const totalMs = this.storedDurationMs + elapsed;
    this.timerText.set(this.format(totalMs));
  }

  private resetTimer() {
    this.storedDurationMs = 0;
    this.startTimestamp = 0;
    this.timerText.set('00:00:00');
    this.isRunning.set(false);
    this.stopTimer();
  }

  private parse(time: string): number {
    if (!time) return 0;
    const [h, m, s] = time.split(':').map(Number);
    return ((h * 60 + m) * 60 + s) * 1000;
  }

  private format(ms: number): string {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}