import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Project } from '../../services/project.service';
import { TimeSheet } from '../../services/timesheet.service';
import { AuthService } from '../../services/auth.service';
import { Chat } from '../chat/chat';

interface User {
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
  private intervalId: any;
  
  allUsers: User[] = [];
  filteredUsers: User[] = [];

  // Safe getters for form values
  get members(): string[] {
    return this.projectForm.value.members || [];
  }

  get membersCount(): number {
    return this.members.length;
  }

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
    // Get logged in user
    this.authService.getLoggedUser().subscribe(users => {
      this.user = users;
    });

    // Handle project editing
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.projectId = params['id'];
        this.projectService.getProject(this.projectId).subscribe({
          next: (project) => {
            this.fillForm(project);
            
            // Get running task
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

    // Get all users
    this.authService.getAllUsers().subscribe(users => {
      this.allUsers = users;
      this.filteredUsers = [...users]; // Initialize filtered users
    });

    this.intervalId = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  // Helper method to check if a user is selected
  isUserSelected(userId: string): boolean {
    return this.members.includes(userId);
  }

  // Get user initials for avatar
  getInitials(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Toggle user selection
  toggleUser(userId: string, event: any) {
    const currentMembers = this.members;
    
    if (event.target.checked) {
      // Add user if not already in list
      if (!currentMembers.includes(userId)) {
        this.projectForm.patchValue({
          members: [...currentMembers, userId]
        });
      }
    } else {
      // Remove user
      this.projectForm.patchValue({
        members: currentMembers.filter((id: string) => id !== userId)
      });
    }
    
    // Update filtered users to reflect changes
    this.updateFilteredUsers();
  }

  // Remove user directly (from the chips)
  removeUser(userId: string) {
    const currentMembers = this.members;
    this.projectForm.patchValue({
      members: currentMembers.filter((id: string) => id !== userId)
    });
    this.updateFilteredUsers();
  }

  // Filter users based on search input
  filterUsers(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (!searchTerm) {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(user =>
        (user.fullName?.toLowerCase().includes(searchTerm) || '') ||
        (user.userName?.toLowerCase().includes(searchTerm) || '')
      );
    }
  }

  // Update filtered users (after selection changes)
  updateFilteredUsers() {
    // Sort to show selected users first
    this.filteredUsers = [...this.allUsers].sort((a, b) => {
      const aSelected = this.isUserSelected(a._id);
      const bSelected = this.isUserSelected(b._id);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }

  // Get user name for display
  getUserName(userId: string): string {
    const user = this.allUsers.find(u => u._id === userId);
    return user?.fullName || user?.userName || 'Unknown User';
  }

  
goBack() {
  this.router.navigate(['/home']);
}

  loadProject(id: string) {
    this.projectService.getProject(id).subscribe(project => {
      if (!project) return;
      this.fillForm(project);
    });
  }

  fillForm(project: any) {
    const formattedDeadline = project.deadline
      ? project.deadline.split("T")[0]
      : "";

    this.projectForm.patchValue({
      name: project.name || "",
      deadline: formattedDeadline || "",
      manager: project.manager || "",
      members: project.members || []
    });

    // Update filtered users to reflect current selections
    this.updateFilteredUsers();

    this.tasks.clear();
    const tasks = project.tasks || [];
    
    tasks.forEach((task: any) => {
      const startTime = task.isRunning && task.startTime ? task.startTime : null;
      let totalTime = task.totalTime || 0;

      if (task.isRunning && task.startTime) {
        const now = new Date();
        const start = new Date(task.startTime);
        const elapsed = now.getTime() - start.getTime();
        totalTime += elapsed;
      }

      this.tasks.push(
        this.fb.group({
          description: [task.description || "", Validators.required],
          status: [task.status || 'Pending', Validators.required],
          isRunning: task.isRunning || false,
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
        this.tasks.removeAt(taskIndex);
        
        const projectData = {
          ...this.projectForm.value,
          tasks: this.tasks.value
        };
        
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

  // Timer methods
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

  stopTimer(i: number) {
    const formGroup = this.tasks.at(i);
    const currentTask = formGroup.value;
    
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

  formatDisplay(i: number) {
    const task = this.tasks.at(i).value;
    let displayTime = task.totalTime || 0;
    
    if (task.isRunning && task.startTime) {
      const now = new Date();
      const start = new Date(task.startTime);
      const elapsed = now.getTime() - start.getTime();
      displayTime += elapsed;
    }
    
    return this.timesheet.formatTime(displayTime);
  }

  formatLog(i: number) {
    return this.timesheet.formatTime(i);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}