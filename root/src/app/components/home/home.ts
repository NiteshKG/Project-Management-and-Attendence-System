import { Component, OnInit, inject, OnDestroy, signal, Signal, ViewChild, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { Project } from '../../services/project.service';


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, RouterLinkActive,RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit,OnDestroy {
  isRunning!: Signal<boolean>;
  timerText!: Signal<string>;

projects: any[] = [];

  constructor(private auth: AuthService, private router: Router,
     private attendance: AttendanceService, private projectService: Project, private elementRef: ElementRef ){
      
     }
  loggedName = signal('');
  address = signal('');
  email = signal('');
  showProfile = false;
  showMobileMenu = false;
 // currentUser: any = null;
  //timerText = signal('00:00:00'); 
 // private attendanceInterval: any; 
 // dayStarted = signal(false);
  private intervalId: any;
  
  

   

  ngOnInit() {

     
    
    this.loadUserData();
    this.loadProjects();
   // this.loadAttendance();

    this.isRunning = this.attendance.isRunning;
    this.timerText = this.attendance.timerText;

    this.attendance.initFromBackend();

    } 
    
    

   

loadUserData() {

   // this.loadProjects();
    this.auth.getCurrentUser().subscribe({
      next: (res) => {
        if (res.user) {
          this.loggedName.set(res.user.fullName);
          this.address.set(res.user.address);
          this.email.set(res.user.userName);
          console.log('username: ',this.loggedName)
         // this.cdr.detectChanges();
        }
     /*
        if (res.runningAttendance) {
          this.dayStarted.set(true);
          const startTime = new Date(res.runningAttendance.startTime).getTime();
          this.startTimer(startTime);
        }*/
        
      },
      error: (err) => {
        console.error('Error loading user data:', err);
        
        
        //this.loadProjects();
      }
    });
  }

loadProjects(){

  

   

  this.projectService.getProjects().subscribe({
    next: (res) =>{
      this.projects = res;
     // this.cdr.detectChanges();
      console.log("Projects: ",this.projects);
    },
    error: (err) => console.log(err)
  })
    
}
/*
loadAttendance() {
  this.attendance.me().subscribe(res => {
    this.handleAttendance(res.attendance);
  });
}
*/



  getInitials(): string {
    const name = this.loggedName();
    if (!name) return 'U';
    
    const names = name.split(' ');
    if (names.length === 1) return name.charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  
  toggleProfile(event: Event) {
  event.stopPropagation(); // THIS IS THE KEY FIX
  event.preventDefault();
  this.showProfile = !this.showProfile;
}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    console.log('Document clicked');
  console.log('showProfile:', this.showProfile);
    const profileElement = this.elementRef.nativeElement.querySelector('.relative');
    console.log('profileElement found:', !!profileElement);
    const clickedInside = profileElement?.contains(event.target as Node);
    
   if (profileElement) {
    const clickedInside = profileElement.contains(event.target as Node);
    console.log('clickedInside:', clickedInside);
    
    if (!clickedInside && this.showProfile) {
      console.log('Closing profile dropdown');
      this.showProfile = false;
    }
  }
  }



  // Add this method to your Home component class
getCreatedDate(_id: string): string {
  if (!_id || typeof _id !== 'string') return 'N/A';
  
  try {
    // Extract timestamp from MongoDB ObjectId string
    // First 4 bytes (8 hex characters) represent the timestamp
    const timestampHex = _id.substring(0, 8);
    const timestamp = parseInt(timestampHex, 16) * 1000;
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error parsing date from ObjectId:', error);
    return 'N/A';
  }
}
/*
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
     // this.timerText.set('00:00:00');
     // clearInterval(this.intervalId);
    });
  }
*/
  

toggleMobileMenu() {
  this.showMobileMenu = !this.showMobileMenu;
}
/*
  startTimer(startTime: number) {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      this.timerText.set(this.formatTime(diff));
    }, 1000);
  }

*/
/*  handleAttendance(attendance: any) {
  clearInterval(this.attendanceInterval);

  
  if (attendance?.startTime && !attendance.endTime) {
    const start = new Date(attendance.startTime).getTime();

    this.attendanceInterval = setInterval(() => {
      const diff = Date.now() - start;
      this.timerText.set(this.formatTime(diff));
    }, 1000);

  } else {
    
    this.timerText.set(this.formatTime(0));
  }
}
*/


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


  

  addProject() {
    this.router.navigate(['/project']);
  }



/*
deleteProject(projectId: any) {
    this.projectService.deleteProject(projectId).subscribe({
      next: () => {
      this.projects = this.projects.filter(p => p._id !== projectId);
    },     
      error: (err) => console.log(err)
    });
  }
*/
deleteProject(projectId: any) {
  const projectToDelete = this.projects.find(p => p._id === projectId);
  
  // Show warning modal
  const swalWithDarkTheme = Swal.mixin({
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    color: '#ffffff',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    customClass: {
      container: 'z-[9999]',
      popup: 'rounded-2xl border border-gray-700/50 shadow-2xl',
      title: 'text-white font-bold text-xl',
      htmlContainer: 'text-gray-300',
      confirmButton: '!bg-gradient-to-r !from-red-600 !to-pink-600 !text-white !font-semibold !rounded-lg !px-6 !py-3 !border !border-red-500/30 hover:!shadow-lg hover:!shadow-red-500/25 transition-all duration-300',
      cancelButton: '!bg-gradient-to-r !from-gray-800 !to-gray-900 !text-gray-300 !font-semibold !rounded-lg !px-6 !py-3 !border !border-gray-700 hover:!border-gray-600 transition-all duration-300'
    },
    buttonsStyling: false,
    showCancelButton: true,
    reverseButtons: true
  });

  swalWithDarkTheme.fire({
    title: `<div class="flex items-center space-x-3 mb-2">
              <div class="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <span>Delete Project?</span>
            </div>`,
    html: `
      <div class="text-left space-y-4">
        <p class="text-gray-300">Are you sure you want to delete <span class="text-white font-semibold">"${projectToDelete?.name}"</span>? This action cannot be undone.</p>
        
        <div class="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-400 text-sm">Project</p>
              <p class="text-white font-medium">${projectToDelete?.name}</p>
            </div>
            <div>
              <p class="text-gray-400 text-sm">Tasks</p>
              <p class="text-white font-medium">${projectToDelete?.tasks?.length || 0}</p>
            </div>
            <div>
              <p class="text-gray-400 text-sm">Created</p>
              <p class="text-white font-medium">${this.getCreatedDate(projectId)}</p>
            </div>
            <div>
              <p class="text-gray-400 text-sm">Deadline</p>
              <p class="text-white font-medium">${projectToDelete?.deadline?.split("T")[0] || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <p class="text-red-300 text-sm">All project data including tasks and progress will be permanently removed.</p>
          </div>
        </div>
      </div>
    `,
    icon: 'warning',
    confirmButtonText: 'Yes, Delete Project',
    cancelButtonText: 'Cancel',
    showLoaderOnConfirm: true,
    preConfirm: () => {
      return this.projectService.deleteProject(projectId).toPromise()
        .then(() => {
          this.projects = this.projects.filter(p => p._id !== projectId);
          return true;
        })
        .catch(err => {
          console.log(err);
          throw new Error('Failed to delete project');
        });
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Show success toast
      const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: '#ffffff',
        customClass: {
          popup: '!border !border-green-500/30 !shadow-lg !shadow-green-500/10'
        }
      });
      
      toast.fire({
        icon: 'success',
        title: `<div class="flex items-center space-x-3">
                  <div class="p-1.5 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-white">Project Deleted</p>
                    <p class="text-gray-300 text-sm">Successfully removed from your workspace</p>
                  </div>
                </div>`
      });
    }
  }).catch(err => {
    // Show error toast
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to delete project. Please try again.',
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: '#ffffff',
      confirmButtonColor: '#dc2626'
    });
  });
}


  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

}
