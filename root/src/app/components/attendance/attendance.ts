import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../services/attendance.service';

interface AttendanceRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'present' | 'absent' | 'half-day';
  totalSessions: number;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Attendance implements OnInit {
  // Month navigation
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Data
  attendanceRecords: AttendanceRecord[] = [];
  allAttendanceRecords: AttendanceRecord[] = [];
  isLoading = false;
  
  // Stats
  presentDays = 0;
  totalHours = 0;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit() {
    this.loadAttendanceRecords();
  }

  loadAttendanceRecords() {
    this.isLoading = true;
    
    this.attendanceService.getAllAttendance().subscribe({
      next: (response) => {
        this.allAttendanceRecords = response.records || [];
        this.filterAndUpdateRecords();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        this.isLoading = false;
      }
    });
  }

  filterAndUpdateRecords() {
    // Filter records for current month
    this.attendanceRecords = this.allAttendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() + 1 === this.currentMonth && 
             recordDate.getFullYear() === this.currentYear;
    });
    
    // Sort by date (newest first)
    this.attendanceRecords.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Calculate stats
    this.calculateStats();
  }

  calculateStats() {
    // Count present days
    this.presentDays = this.attendanceRecords.reduce((count, record) => {
      if (record.status === 'present') return count + 1;
      if (record.status === 'half-day') return count + 0.5;
      
      return count;
    }, 0);
    
    // Calculate total hours
    this.totalHours = this.calculateTotalHours();
  }

  calculateTotalHours(): number {
    let totalMinutes = 0;
    
    this.attendanceRecords.forEach(record => {
      if (record.duration) {
        const parts = record.duration.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          totalMinutes += (hours * 60) + minutes;
        }
      }
    });
    
    return totalMinutes / 60;
  }

  // Month navigation
  previousMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.filterAndUpdateRecords();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.filterAndUpdateRecords();
  }

  // Helper methods
  getDayNumber(dateStr: string): number {
    return new Date(dateStr).getDate();
  }

  getDayName(dateStr: string): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  formatTime(timeStr: string | Date | null): string {
    if (!timeStr) return '--:--';
    
    const time = new Date(timeStr);
    if (isNaN(time.getTime())) return '--:--';
    
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  formatDuration(durationStr: string): string {
    if (!durationStr) return '0h 0m';
    
    const parts = durationStr.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      
      if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
    return durationStr;
  }

  formatHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'present': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'half-day': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'absent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'present': return 'Present';
      case 'half-day': return 'Half Day';
      case 'absent': return 'Absent';
      default: return 'Unknown';
    }
  }
}