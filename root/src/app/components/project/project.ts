import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Project } from '../../services/project.service';
import { TimeSheet } from '../../services/timesheet.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class ProjectComponent implements OnInit {

  private fb = inject(FormBuilder);
  private projectService = inject(Project);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private timesheet = inject(TimeSheet);
  private cdr = inject(ChangeDetectorRef);

  successMessage = signal('');
  
  projectId: number | null = null;  

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
    this.route.queryParams.subscribe(params => {
      if (params['id'] !== undefined) {
        this.projectId = Number(params['id']);
        const project = this.projectService.getProjectById(this.projectId);

        if (project) {
          this.fillForm(project);
        }
      } else {
        
        this.addTask();
      }
    });

    setInterval(() => {
    this.cdr.detectChanges();  
  }, 1000);

  }

  fillForm(project: any) {
  this.projectForm.patchValue({
    name: project.name,
    deadline: project.deadline,
    manager: project.manager
  });

  this.tasks.clear();

  project.tasks.forEach((task: any) => {
    this.tasks.push(
      this.fb.group({
        description: [task.description, Validators.required],
        status: [task.status, Validators.required],
        isRunning: task.isRunning,    
        startTime: task.startTime,
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


  removeTask(i: number) {
    this.tasks.removeAt(i);
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    if (this.projectId !== null) {
      this.projectService.updateProject(this.projectId, this.projectForm.value);
      this.successMessage.set('Project Updated Successfully!');
    } else {
      this.projectService.createProject(this.projectForm.value);
      this.successMessage.set('Project Created Successfully!');
    }

    setTimeout(() => {
      this.successMessage.set('');
      this.router.navigate(['/home']);
    }, 1200);
  }

  startTimer(i: number) {
  const task = this.tasks.at(i).value;
  this.timesheet.startTask(task);
  this.tasks.at(i).patchValue(task);
}

stopTimer(i: number) {
  const task = this.tasks.at(i).value;
  this.timesheet.stopTask(task);
  this.tasks.at(i).patchValue(task);
}

formatDisplay(i: number) {
  const task = this.tasks.at(i).value;
  
  return this.timesheet.formatTime(
    this.timesheet.getDisplayTime(task)
  );
}

}
