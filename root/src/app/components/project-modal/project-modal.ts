import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';
import { Project } from '../../services/project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './project-modal.html',
  styleUrls: ['./project-modal.css']
})
export class ProjectModal implements OnInit {
  constructor(private projectService: Project, private router: Router){}
  projects: any[] = [];

  ngOnInit() {
    
    this.loadProjects();
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


 
  editProject(project: any) {
  this.router.navigate(['/project'], { queryParams: { id: project._id } });
}


  

  addProject() {
    this.router.navigate(['/project']);
  }



 deleteProject(projectId: any) {
  const projectToDelete = this.projects.find(p => p._id === projectId);
  
  // Show warning modal with light blue theme
  const swalWithLightTheme = Swal.mixin({
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    color: '#1e40af',
    backdrop: 'rgba(96, 165, 250, 0.2)',
    customClass: {
      container: 'z-[9999]',
      popup: 'rounded-xl border border-blue-200 shadow-xl',
      title: 'text-blue-800 font-bold text-xl',
      htmlContainer: 'text-blue-700',
      confirmButton: '!bg-red-600 !text-white !font-medium !rounded-lg !px-6 !py-2.5 !hover:bg-red-700 transition-all duration-200',
      cancelButton: '!bg-blue-100 !text-blue-700 !font-medium !rounded-lg !px-6 !py-2.5 !border !border-blue-200 hover:!bg-blue-200 transition-all duration-200'
    },
    buttonsStyling: false,
    showCancelButton: true,
    reverseButtons: true
  });

  swalWithLightTheme.fire({
    title: `<div class="flex items-center space-x-3 mb-2">
              <div class="p-2 rounded-lg bg-red-100">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <span>Delete Project?</span>
            </div>`,
    html: `
      <div class="text-left space-y-4">
        <p class="text-blue-700">Are you sure you want to delete <span class="text-blue-800 font-semibold">"${projectToDelete?.name}"</span>? This action cannot be undone.</p>
        
        <div class="p-4 rounded-lg bg-white border border-blue-200">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-blue-600 text-sm">Project</p>
              <p class="text-blue-800 font-medium">${projectToDelete?.name}</p>
            </div>
            <div>
              <p class="text-blue-600 text-sm">Tasks</p>
              <p class="text-blue-800 font-medium">${projectToDelete?.tasks?.length || 0}</p>
            </div>
            <div>
              <p class="text-blue-600 text-sm">Created</p>
              <p class="text-blue-800 font-medium">${this.getCreatedDate(projectId)}</p>
            </div>
            <div>
              <p class="text-blue-600 text-sm">Deadline</p>
              <p class="text-blue-800 font-medium">${projectToDelete?.deadline?.split("T")[0] || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div class="p-3 rounded-lg bg-red-50 border border-red-200">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <p class="text-red-700 text-sm">All project data including tasks and progress will be permanently removed.</p>
          </div>
        </div>
      </div>
    `,
    icon: 'warning',
    confirmButtonText: 'Delete Project',
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
      // Show success toast with light theme
      const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'white',
        color: '#1e40af',
        customClass: {
          popup: '!border !border-green-200 !shadow-lg'
        }
      });
      
      toast.fire({
        icon: 'success',
        title: `<div class="flex items-center space-x-3">
                  <div class="p-1.5 rounded-lg bg-green-100">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-blue-800">Project Deleted</p>
                    <p class="text-blue-600 text-sm">Successfully removed from your workspace</p>
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
      background: 'white',
      color: '#1e40af',
      confirmButtonColor: '#dc2626'
    });
  });
}


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



}