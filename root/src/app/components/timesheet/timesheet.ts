import { Component, OnInit, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-timesheet',
  imports: [CommonModule],
  templateUrl: './timesheet.html',
  styleUrl: './timesheet.css',
})
export class Timesheet implements OnInit {
  isRunning!: Signal<boolean>;
  logs!: Signal<any[]>;
    

  constructor(private attendance: AttendanceService) {}

  ngOnInit(){
    this.isRunning = this.attendance.isRunning;
    this.logs = this.attendance.logs;
  }

  

  start() {
    this.attendance.startDay();
  }

  stop() {
    this.attendance.endDay();
  }

// In your timesheet component TypeScript file
calculateTodayDuration(): string {
  if (this.logs().length === 0) return '0h 0m';
  
  let totalSeconds = 0;
  
  this.logs().forEach(log => {
    if (log.start && log.end) {
      const start = new Date(log.start).getTime();
      const end = new Date(log.end).getTime();
      totalSeconds += Math.floor((end - start) / 1000);
    }
  });
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

calculateDuration(start: Date | string, end: Date | string): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const diffMs = endTime - startTime;
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

}
