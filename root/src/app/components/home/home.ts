import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { Project } from '../../services/project.service';
import { Chat } from '../chat/chat';

@Component({
  selector: 'app-home',
  imports: [CommonModule,Chat],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit,OnDestroy {

projects: any[] = [];

  constructor(private auth: AuthService, private router: Router,
     private attendance: AttendanceService, private projectService: Project ){}
  loggedName: string = '';
  timerText = signal('00:00:00');
  dayStarted = signal(false);
  private intervalId: any;

  ngOnInit() {
  const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
  this.loggedName = user.fullName || '';

  if(this.attendance.isDayRunning()){
    this.dayStarted.set(true);
    this.startTimer();
  }

 this.projects = this.projectService.getProjects();
}

startDay(){
  this.attendance.startDay();
  this.dayStarted.set(true);
  this.startTimer();
}

endDay(){
  this.attendance.endDay();
  this.dayStarted.set(false);
  this.timerText.set('00:00:00');
  clearInterval(this.intervalId);
}

startTimer(){
  const email = this.projectService.getCurrentUserEmail();
  if (!email) return;
    const key = `attendanceStart_${email}`;
  const startTime = Number(localStorage.getItem(key));
  this.intervalId = setInterval(() =>{
    const now = Date.now();
    const diff = now - startTime;
    this.timerText.set(this.attendance.formatTime(diff));
  },1000)
}



  

  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  

  openProject(id: number) {
    this.router.navigate(['/project', id]);
  }

  deleteProject(id: number) {
    this.projectService.deleteProject(id);
    this.projects = this.projectService.getProjects();
  }

  editProject(i: number) {
  this.router.navigate(['/project'], { queryParams: { id: i } });
}

addProject(){
  this.router.navigate(['/project']);
}

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

}
