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
 this.auth.getCurrentUser().subscribe(res => {
    if (res.user) this.loggedName = res.user.fullName;


    if (res.runningAttendance) {
      this.dayStarted.set(true);
      const startTime = new Date(res.runningAttendance.startTime).getTime();
      this.startTimer(startTime);
    }
  });

this.loadProjects();

}

loadProjects(){
  this.projectService.getProjects().subscribe({
    next: (res) =>{
      this.projects = res;
      console.log("Projects: ",this.projects);
    },
    error: (err) => console.log(err)
  })
}

startDay() {
    this.attendance.startDay().subscribe(res => {
      console.log("Day started:", res);
      this.dayStarted.set(true);


      const startTime = new Date(res.attendance.startTime).getTime();
      this.startTimer(startTime);
    });
  }

  endDay() {
    this.attendance.endDay().subscribe(res => {
      console.log("Day ended:", res);
      this.dayStarted.set(false);
      this.timerText.set('00:00:00');
      clearInterval(this.intervalId);
    });
  }

  startTimer(startTime: number) {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      this.timerText.set(this.formatTime(diff));
    }, 1000);
  }


  formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const min = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const sec = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${min}:${sec}`;
  }



  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }



  openProject(id: string) {
    this.router.navigate(['/project'], { queryParams: { id } });
  }

  editProject(project: any) {
  this.router.navigate(['/project'], { queryParams: { id: project._id } });
}


  deleteProject(projectId: any) {
    this.projectService.deleteProject(projectId).subscribe({
      next: () => {
      this.projects = this.projects.filter(p => p._id !== projectId);
    },     
      error: (err) => console.log(err)
    });
  }

  addProject() {
    this.router.navigate(['/project']);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

}
