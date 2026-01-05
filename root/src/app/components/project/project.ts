import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
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
  timerText = signal('00:00:00');
  projectId: any | null = null;
  private intervalId : any;
  allUsers: any[] = [];
  //selectedMembers: string[] = [];

  projectForm = this.fb.group({
    
    name: ['', [Validators.required, Validators.minLength(4)]],
    deadline: ['', Validators.required],
    manager: ['', [Validators.required, Validators.minLength(4)]],
    members: this.fb.control<string[]>([]),

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
  if (params['id']) {
    this.projectId = params['id'];
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.fillForm(project);
        

       this.projectService.getRunningTask(this.projectId).subscribe(runningTask => {
          if (!runningTask) return;

          const index = this.tasks.controls.findIndex(
            t => t.value._id === runningTask._id
          );

          if (index !== -1) {
            this.tasks.at(index).patchValue({
              isRunning: true,
              startTime: runningTask.startTime,
              totalTime: runningTask.totalTime
            });
          }
        });

      },
      error: (err) => console.error(err)
    });
  } else {
    this.addTask();
  }
});


this.authService.getAllUsers().subscribe(users => {
    this.allUsers = users;
  });

   

  this.intervalId = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000)
  
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
    manager: project.manager || "",
    members: project.members || []
  });

  this.tasks.clear();
  const tasks = project.tasks || [];
  console.log('Project tasks:', tasks);

  tasks.forEach((task: any) => {

    const startTime = task.isRunning && task.startTime ? task.startTime : null;
    let totalTime = task.totalTime || 0;

   if (task.isRunning && task.startTime) {
      const now = new Date();
      const start = new Date(task.startTime);
      const elapsed = now.getTime() - start.getTime();
      totalTime += elapsed; 
      console.log(`Task ${task.description} is running. Elapsed: ${elapsed}ms, Total: ${totalTime}ms`);
    }

    this.tasks.push(
      this.fb.group({
        description: [task.description || "", Validators.required],
        status: [task.status || 'Pending' , Validators.required],
        isRunning: task.isRunning  || false,
        startTime: [startTime],
        totalTime: task.totalTime || 0,
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
      totalTime: 0,
      logs: this.fb.control([])
    })
  );
}


 removeTask(taskIndex: number) {
  Swal.fire({
    title: 'Delete Task',
    html: `
      <div class="text-left">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 rounded-lg bg-red-100">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-blue-800 text-xl font-bold">Delete Task</h3>
        </div>
        <p class="text-blue-700 mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#3b82f6',
    background: 'white',
    color: '#1e40af',
    backdrop: 'rgba(96, 165, 250, 0.2)',
    customClass: {
      container: 'z-[9999]',
      popup: 'bg-white rounded-xl border border-blue-200 p-6',
      title: 'hidden',
      htmlContainer: '!m-0 !p-0',
      actions: 'mt-6 space-x-3',
      confirmButton: 'px-6 py-3 bg-red-600 text-white font-medium rounded-lg border border-red-200 hover:bg-red-700 transition-all duration-200',
      cancelButton: 'px-6 py-3 bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-200 transition-all duration-200'
    },
    buttonsStyling: false
  }).then((result) => {
    if (result.isConfirmed) {
      // Remove from FormArray
      this.tasks.removeAt(taskIndex);
      
      // You probably don't want to delete the entire project
      // Just update it to remove the task
      // First, get current project data
      const projectData = {
        ...this.projectForm.value,
        tasks: this.tasks.value // Updated tasks array
      };
      
      // Update project (not delete!)
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: () => {
          Swal.fire({
            title: 'Deleted!',
            html: `
              <div class="text-center">
                <div class="p-3 rounded-full bg-green-100 inline-block mb-4">
                  <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 class="text-blue-800 text-xl font-bold mb-2">Task Deleted</h3>
                <p class="text-blue-600">Task has been successfully removed from the project.</p>
              </div>
            `,
            background: 'white',
            color: '#1e40af',
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (err) => {
          console.log(err);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete task. Please try again.',
            icon: 'error',
            background: 'white',
            color: '#1e40af',
            confirmButtonColor: '#dc2626'
          });
        }
      });
    }
  });
}

   toggleUser(userId: string, event: any) {
  const members = this.projectForm.value.members || [];

  if (event.target.checked) {
    this.projectForm.patchValue({
      members: [...members, userId]
    });
  } else {
    this.projectForm.patchValue({
      members: members.filter((id: string) => id !== userId)
    });
  }
}

getUserName(userId: string): string {
  return this.allUsers.find(u => u._id === userId)?.fullName || '';
}




 onSubmit() {
  if (this.projectForm.invalid) {
    this.projectForm.markAllAsTouched();
    return;
  }
  
  
  this.tasks.controls.forEach(control => {
    const task = control.value;
    if (task.isRunning) {
      const updated = this.timesheet.checkPoint(task);
      control.patchValue(updated);
    }
  });

  if (!this.user || !this.user._id) {
    console.error('User not loaded');
    return;
  }

  
  const formValue = this.projectForm.value;
  
  
  const tasks = this.tasks.controls.map(control => {
    const task = control.value;
    return {
      description: task.description,
      status: task.status,
      isRunning: task.isRunning,
      startTime: task.startTime,
      totalTime: Number(task.totalTime) || 0, 
      logs: task.logs || []
    };
  });

  const payload = {
    ...formValue,
    user: this.user._id,
    tasks: tasks
  };

  if (this.projectId !== null) {
    this.projectService.updateProject(this.projectId, payload).subscribe(() => {
      this.successMessage.set('Project Updated Successfully!');
      
    });
  } else {
    this.projectService.createProject(payload).subscribe(() => {
      this.successMessage.set('Project Created Successfully!');
      
    });
  }

  setTimeout(() => {
    this.successMessage.set('');
    this.router.navigate(['/home']); 
  }, 1200);
}


// Add these properties
showTimeLogsModal = false;
selectedTimeLogs: any[] = [];
selectedTaskIndex = 0;

// Add these methods
openTimeLogsModal(logs: any[], taskIndex: number) {
  this.selectedTimeLogs = logs;
  this.selectedTaskIndex = taskIndex;
  this.showTimeLogsModal = true;
}

closeTimeLogsModal() {
  this.showTimeLogsModal = false;
  this.selectedTimeLogs = [];
  this.selectedTaskIndex = 0;
}

formatLogDuration(duration: number): string {
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

getSessionProgress(duration: number): number {
  // Assuming 8-hour work day as max
  const maxDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  const progress = Math.min((duration / maxDuration) * 100, 100);
  return Math.round(progress);
}



  /*
  onSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    this.tasks.controls.forEach(control =>{
      const task = control.value;
      if(task.isRunning){
        const updated = this.timesheet.checkPoint(task);
        control.patchValue(updated);
      }
    })

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

*/

startTimer(i: number) {
  const formGroup = this.tasks.at(i);
  
  const updated = {
    ...formGroup.value,
    isRunning: true,
    startTime: Date.now(), 
    totalTime: formGroup.value.totalTime || 0
  };
  
  formGroup.patchValue(updated);
  
  this.projectService.updateProject(this.projectId, this.projectForm.value).subscribe({
    next: res => console.log('Timer started, backend updated', res),
    error: err => console.error(err)
  });
}

/*
  startTimer(i: number) {
  const formGroup = this.tasks.at(i);
 
  const updated = this.timesheet.startTask(formGroup.value);
  formGroup.patchValue(updated);

  this.projectService.updateProject(this.projectId, this.projectForm.value).subscribe({
    next: res => console.log('Start timer updated', res),
    error: err => console.error(err)
  });
  
}
*/

stopTimer(i: number) {
  const formGroup = this.tasks.at(i);
  const currentTask = formGroup.value;
  
  console.log('STOP TIMER:', currentTask);
  
  
  if (!currentTask.startTime) {
    console.error('No startTime found for running task!');
    return;
  }
  
  
  let startTimeMs: number;
  if (typeof currentTask.startTime === 'string') {
    startTimeMs = new Date(currentTask.startTime).getTime();
    
  } else if (typeof currentTask.startTime === 'number') {
    startTimeMs = currentTask.startTime;
  } else if (currentTask.startTime instanceof Date) {
    startTimeMs = currentTask.startTime.getTime();
  } else {
    console.error('Invalid startTime type:', typeof currentTask.startTime, currentTask.startTime);
    return;
  }
  
  
  const now = Date.now();
  const elapsed = now - startTimeMs;
  
  
  const previousTotal = Number(currentTask.totalTime) || 0;
  const newTotalTime = previousTotal + elapsed;
  
 
  
  
  const updatedTask = {
    ...currentTask,
    isRunning: false,
    startTime: null,
    totalTime: newTotalTime,
    logs: [
      ...(currentTask.logs || []),
      {
        startTime: currentTask.startTime, 
        endTime: new Date().toISOString(), 
        duration: elapsed
      }
    ]
  };
  
  console.log('Updated task:', updatedTask);
  
  
  formGroup.patchValue(updatedTask);
  
  
  const formValue = this.projectForm.value;
  const tasksPayload = this.tasks.controls.map(control => {
    const task = control.value;
    return {
      description: task.description,
      status: task.status,
      isRunning: task.isRunning,
      startTime: task.startTime,
      totalTime: Number(task.totalTime) || 0,
      logs: task.logs || []
    };
  });
  
  const payload = {
    ...formValue,
    tasks: tasksPayload
  };
  
  
  
  
  this.projectService.updateProject(this.projectId, payload).subscribe({
    next: (res) => {
      console.log('End time:', res);
      
    },
    error: (err) => console.error('Error stopping timer:', err)
  });
}

/*
stopTimer(i: number) {
  const formGroup = this.tasks.at(i);
  
  
  const updated = this.timesheet.stopTask(formGroup.value);
  formGroup.patchValue(updated); 
  
  this.projectService.updateProject(this.projectId, this.projectForm.value).subscribe({
    next: res => console.log('Project updated', res),
    error: err => console.error(err)
  });
}
*/
formatDisplay(i: number) {
  const task = this.tasks.at(i).value;

  let displayTime = task.totalTime || 0;
  
  // If task is currently running in the UI, add current elapsed
  if (task.isRunning && task.startTime) {
    const now = new Date();
    const start = new Date(task.startTime);
    const elapsed = now.getTime() - start.getTime();
    displayTime += elapsed;
  }
  
  return this.timesheet.formatTime(displayTime);
}

formatLog(i: number){
  return this.timesheet.formatTime(i);
}

ngOnDestroy() {
    clearInterval(this.intervalId);
  }

}
