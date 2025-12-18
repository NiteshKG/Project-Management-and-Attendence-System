import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Project } from '../../services/project.service';
import { TimeSheet } from '../../services/timesheet.service';
import { AuthService } from '../../services/auth.service';
import { Chat } from '../chat/chat';
interface User{
  
  _id: string;
  userName: string;
  fullName: string;

 }
@Component({
  selector: 'app-project',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Chat],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class ProjectComponent implements OnInit {

  private fb = inject(FormBuilder);
  private projectService = inject(Project);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private timesheet = inject(TimeSheet);
  private cdr = inject(ChangeDetectorRef);
  user!: User;
  successMessage = signal('');

  projectId: any | null = null;

  projectForm = this.fb.group({
    
    name: ['', [Validators.required, Validators.minLength(4)]],
    deadline: ['', Validators.required],
    manager: ['', [Validators.required, Validators.minLength(4)]],
    tasks: this.fb.array([])
  });

  get tasks() {
    return this.projectForm.get('tasks') as FormArray;
  }

  ngOnInit() {
    this.authService.getLoggedUser().subscribe(users =>{
        this.user = users;
      })
    this.route.queryParams.subscribe(params => {
      if (params['id'] !== undefined) {
        this.projectId = params['id'];
        const project = this.projectService.getProject(this.projectId);

        if (project) {
          this.fillForm(project);
        }
      } else {

        this.addTask();
      }
    });

  this.route.queryParams.subscribe(params => {
  if (params['id']) {
    this.projectId = params['id'];
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.fillForm(project);
      },
      error: (err) => console.error(err)
    });
  } else {
    this.addTask();
  }
});




    setInterval(() => {
    this.cdr.detectChanges();
  }, 1000);

  }

  loadProject(id: string){
    this.projectService.getProject(id).subscribe(project =>{
      if (!project) return;
      this.fillForm(project);
    })
  }

  fillForm(project: any) {

  const formattedDeadline = project.deadline
    ? project.deadline.split("T")[0]  
    : "";

  this.projectForm.patchValue({
    name: project.name  || "",
    deadline: formattedDeadline  || "",
    manager: project.manager || ""
  });

  this.tasks.clear();
  const tasks = project.tasks || [];
  console.log('Project tasks:', tasks);

  tasks.forEach((task: any) => {
    this.tasks.push(
      this.fb.group({
        description: [task.description || "", Validators.required],
        status: [task.status || 'Pending' , Validators.required],
        isRunning: task.isRunning  || false,
        startTime: task.startTime  || null,
        elapsedTime: task.elapsedTime || 0,
        logs: this.fb.control(task.logs || [])
      })
    );
  });
}


  addTask() {
  this.tasks.push(
    this.fb.group({
      description: ['', Validators.required],
      status: ['Pending', Validators.required],
      isRunning: [false],
      startTime: [null],
      elapsedTime: 0,
      logs: this.fb.control([])
    })
  );
}


  removeTask(i: any) {
    this.tasks.removeAt(i);
    this.projectService.deleteProject(i);
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    if (!this.user || !this.user._id) {
    console.error('User not loaded');
    return;
  }

  const payload = {
    ...this.projectForm.value,
    user: this.user._id  
  };

    if (this.projectId !== null) {
      this.projectService.updateProject(this.projectId, payload).subscribe(() =>{
      this.successMessage.set('Project Updated Successfully!');

      });

    } else {
      this.projectService.createProject(payload).subscribe(() =>{
      this.successMessage.set('Project Created Successfully!');
      });

    }

    setTimeout(() => {
      this.successMessage.set('');
      this.router.navigate(['/home']);
    }, 1200);
  }



  startTimer(i: number) {
  const formGroup = this.tasks.at(i);
  const task = formGroup.value;
  const updated = this.timesheet.startTask(task);
  formGroup.patchValue(updated);
}

stopTimer(i: number) {
  const formGroup = this.tasks.at(i);
  const task = formGroup.value;
  const updated = this.timesheet.stopTask(task);
  formGroup.patchValue(updated);

  this.projectService.updateProject(this.projectId, this.projectForm.value).subscribe({
    next: res => console.log('Project updated', res),
    error: err => console.error(err)
  });
}

formatDisplay(i: number) {
  const task = this.tasks.at(i).value;

  return this.timesheet.formatTime(
    this.timesheet.getDisplayTime(task)
  );
}

}
