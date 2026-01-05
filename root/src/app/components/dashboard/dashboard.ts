// dashboard.ts
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../services/project.service'; 

Chart.register(...registerables);

interface Activity {
  title: string;
  description: string;
  time: Date;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface TeamMember {
  _id: string;
  fullName: string;
  userName: string;
  address: string;
  
}

interface AttendanceRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'present' | 'absent' | 'half-day';
  totalSessions: number;
}

interface ProjectData {
  _id: string;
  name: string;
  deadline?: string;
  tasks?: any[];
  manager?: {
    fullName: string;
  };
}

interface AttendanceStatus {
  isRunning: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('attendanceChart') attendanceChartRef!: ElementRef;
  @ViewChild('projectChart') projectChartRef!: ElementRef;
  
  private attendanceChart: any;
  private projectChart: any;
  
  // Current Date & Time
  currentDate = new Date();
  currentTime = new Date();
  private timeInterval: any;
  
  // Month navigation
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Stats
  totalProjects = 0;
  activeProjects = 0;
  totalTasks = 0;
  completedTasks = 0;
  presentDays = 0;
  totalWorkingDays = 0;
  totalHours = 0;
  attendancePercentage = 0;
  avgDailyHours = 0;
  todayHours = 0;
  isWorking = false;
  
  // Attendance data for chart
  attendanceData: AttendanceRecord[] = [];
  
  // Recent Activity
  recentActivities: Activity[] = [];

  teamMembers: TeamMember[] = [];
  isLoadingTeamMembers = false;
  
  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private projectService: Project,
    private router: Router
  ) {}

  ngOnInit() {
    this.startTimeUpdates();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }
    if (this.projectChart) {
      this.projectChart.destroy();
    }
  }

  private startTimeUpdates() {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 60000); // Update every minute
  }

  loadDashboardData() {
    this.loadAttendanceData();
    this.loadProjectData();
    this.loadRecentActivity();
    this.loadCurrentAttendanceStatus();
  }

  loadAttendanceData() {
    this.attendanceService.getAllAttendance().subscribe({
      next: (response: any) => {
        const allRecords: AttendanceRecord[] = response.records || [];
        
        // Filter current month
        const currentMonthRecords = allRecords.filter((record: AttendanceRecord) => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() + 1 === this.currentMonth && 
                 recordDate.getFullYear() === this.currentYear;
        });
        
        this.attendanceData = currentMonthRecords;
        
        // Calculate stats
        this.calculateAttendanceStats(currentMonthRecords);
        
        // Initialize chart after data is loaded
        setTimeout(() => this.createAttendanceChart(), 100);
      },
      error: (error: any) => {
        console.error('Error loading attendance:', error);
      }
    });
  }

  loadProjectData() {
    // Based on your project component, the service method might be different
    // Adjust the method name based on your actual service
    this.projectService.getProjects().subscribe({
      next: (projects: any) => {
        const projectList: ProjectData[] = projects || [];
        this.totalProjects = projectList.length;
        this.activeProjects = projectList.filter((p: ProjectData) => 
          !p.deadline || new Date(p.deadline) >= new Date()
        ).length;
        
        let total = 0;
        let completed = 0;
        
        projectList.forEach((project: ProjectData) => {
          if (project.tasks) {
            total += project.tasks.length;
            completed += project.tasks.filter((task: any) => task.status === 'Completed').length;
          }
        });
        
        this.totalTasks = total;
        this.completedTasks = completed;
        
        setTimeout(() => this.createProjectChart(), 100);
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  loadCurrentAttendanceStatus() {
    // Since getCurrentStatus doesn't exist in your service,
    // check the current running status from the attendance service
    // Based on your timesheet component, you might have a different approach
    this.attendanceService.getAllAttendance().subscribe({
      next: (response: any) => {
        const allRecords: AttendanceRecord[] = response.records || [];
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = allRecords.find((record: AttendanceRecord) => record.date === today);
        
        // Check if the user is currently working based on the timesheet service
        // You might need to adjust this based on your actual implementation
        this.isWorking = false; // Default to false
      },
      error: (error: any) => {
        console.error('Error loading current status:', error);
      }
    });
  }

  calculateAttendanceStats(records: AttendanceRecord[]) {
    // Get today's date for calculations
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate present days
    this.presentDays = records.reduce((count: number, record: AttendanceRecord) => {
      if (record.status === 'present') return count + 1;
      if (record.status === 'half-day') return count + 0.5;
      return count;
    }, 0);
    
    
    this.totalWorkingDays = this.getWorkingDaysInMonth(this.currentMonth, this.currentYear);
    
    
    this.attendancePercentage = Math.round((this.presentDays / this.totalWorkingDays) * 100);
    
    
    let totalMinutes = 0;
    
    records.forEach((record: AttendanceRecord) => {
      if (record.duration) {
        const parts = record.duration.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          totalMinutes += (hours * 60) + minutes;
        }
      }
    });
    
    this.totalHours = totalMinutes / 60;
    this.avgDailyHours = this.presentDays > 0 ? Math.round((this.totalHours / this.presentDays) * 10) / 10 : 0;
    
    
    const todayRecord = records.find((record: AttendanceRecord) => record.date === todayStr);
    if (todayRecord && todayRecord.duration) {
      const parts = todayRecord.duration.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        this.todayHours = Math.round((hours + minutes / 60) * 10) / 10;
      }
    }
  }

  getWorkingDaysInMonth(month: number, year: number): number {
    let count = 0;
    const date = new Date(year, month - 1, 1);
    
    while (date.getMonth() === month - 1) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) { 
        count++;
      }
      date.setDate(date.getDate() + 1);
    }
    
    return count;
  }

  createAttendanceChart() {
    if (!this.attendanceChartRef?.nativeElement) return;
    
    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }
    
    const ctx = this.attendanceChartRef.nativeElement.getContext('2d');
    
    
    const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const dayLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    const presentData = Array(daysInMonth).fill(0);
    const halfDayData = Array(daysInMonth).fill(0);
    const absentData = Array(daysInMonth).fill(0);
    
    this.attendanceData.forEach((record: AttendanceRecord) => {
      const day = new Date(record.date).getDate();
      const index = day - 1;
      
      if (record.status === 'present') {
        presentData[index] = 1;
      } else if (record.status === 'half-day') {
        halfDayData[index] = 1;
      } else if (record.status === 'absent') {
        absentData[index] = 1;
      }
    });
    
    this.attendanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [
          {
            label: 'Present',
            data: presentData,
            backgroundColor: '#10B981',
            borderColor: '#10B981',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Half Day',
            data: halfDayData,
            backgroundColor: '#F59E0B',
            borderColor: '#F59E0B',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Absent',
            data: absentData,
            backgroundColor: '#EF4444',
            borderColor: '#EF4444',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: 'rgba(59, 130, 246, 0.1)'
            },
            ticks: {
              color: '#4B5563'
            }
          },
          y: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 1,
              color: '#4B5563'
            },
            grid: {
              color: 'rgba(59, 130, 246, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const day = context.label;
                const datasetLabel = context.dataset.label;
                return `${datasetLabel} on ${this.monthNames[this.currentMonth - 1]} ${day}`;
              }
            }
          }
        }
      }
    });
  }

  createProjectChart() {
    if (!this.projectChartRef?.nativeElement) return;
    
    if (this.projectChart) {
      this.projectChart.destroy();
    }
    
    const ctx = this.projectChartRef.nativeElement.getContext('2d');
    
    
    const projectData = [this.activeProjects, this.totalProjects - this.activeProjects];
    
    this.projectChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active Projects', 'Inactive Projects'],
        datasets: [{
          data: projectData,
          backgroundColor: ['#3B82F6', '#E5E7EB'],
          borderColor: ['#2563EB', '#D1D5DB'],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#4B5563',
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label;
                const value = context.raw;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value as number / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

 loadRecentActivity() {
  this.isLoadingTeamMembers = true;
  
  this.authService.getAllUsers().subscribe({
    next: (users: TeamMember[]) => {
      this.teamMembers = users.map(user => ({
        ...user,
       
      }));
      this.isLoadingTeamMembers = false;
    },
    error: (error: any) => {
      console.error('Error loading team members:', error);
      this.isLoadingTeamMembers = false;
      
      
      this.teamMembers = [
        {
          _id: '1',
          fullName: 'John Doe',
          userName: 'john@example.com',
          address: 'Jaipur',
         
        },
        {
          _id: '2',
          fullName: 'Jane Smith',
          userName: 'jane@example.com',
          address: 'Jaipur',
          
        },
        {
          _id: '3',
          fullName: 'Bob Johnson',
          userName: 'bob@example.com',
          address: 'Jaipur',
          
        },
        {
          _id: '4',
          fullName: 'Alice Williams',
          userName: 'alice@example.com',
          address: 'Jaipur',
          
        }
      ];
    }
  });
}

  // Navigation methods
  previousMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadAttendanceData();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadAttendanceData();
  }

  

  navigateToProjects() {
    this.router.navigate(['/home/projects']);
  }

  navigateToAttendance() {
    this.router.navigate(['/home/attendance']);
  }

  navigateToTimesheet() {
    this.router.navigate(['/home/timesheet']);
  }

  // Helper methods
  getTodayStatusText(): string {
    if (this.isWorking) return 'Working Now';
    if (this.todayHours > 0) return 'Completed';
    return 'Not Started';
  }

  getTodayStatusColor(): string {
    if (this.isWorking) return 'text-green-600';
    if (this.todayHours > 0) return 'text-blue-600';
    return 'text-gray-600';
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
}