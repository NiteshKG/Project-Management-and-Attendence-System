import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Project } from '../../services/project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trash',
  imports: [CommonModule],
  templateUrl: './trash.html',
  styleUrls: ['./trash.css']
})
export class Trash implements OnInit {
  
  projects: any[] = [];
  loading: boolean = false; // Add loading state

  constructor(
    private projectService: Project, 
    private router: Router,
    private cdr: ChangeDetectorRef  // Add ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('Trash Component Initialized');
    this.loadDeletedProjects();
  }

  loadDeletedProjects() {
    this.loading = true;
    console.log('=== DEBUG: Loading deleted projects ===');
    
    this.projectService.getDeletedProjects().subscribe({
      next: (res) => {
        console.log('API Response:', res);
        console.log('First project:', res[0]);
        
        this.projects = res;
        this.loading = false;
        
        // Force change detection
        this.cdr.detectChanges();
        
        console.log('Projects loaded:', this.projects.length);
        
        // Debug DOM after Angular updates
        setTimeout(() => {
          this.debugDOM();
        }, 100);
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Debug DOM function
  debugDOM() {
    const grid = document.querySelector('.grid');
    console.log('Grid element:', grid);
    console.log('Grid children:', grid?.children?.length);
    console.log('Grid innerHTML:', grid?.innerHTML?.substring(0, 200) + '...');
    
    if (grid && grid.children.length === 0) {
      console.error('DOM ISSUE: Grid has no children!');
      
      // Create test element to check if Angular is working
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '<div style="color: red; border: 2px solid red; padding: 10px;">TEST DIV - If you see this, Angular is working</div>';
      document.body.appendChild(testDiv);
    }
  }

  restoreProject(project: any) {
    console.log('Restoring project:', project);
    
    const restoreId = project.originalDeletedDocId || project._id;
    
    Swal.fire({
      title: 'Restore Project?',
      html: `Are you sure you want to restore <b>"${project.name}"</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Restore',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.restoreProject(restoreId).subscribe({
          next: (response) => {
            console.log('Restore response:', response);
            // Filter by the correct ID
            this.projects = this.projects.filter(p => 
              p.originalDeletedDocId !== project.originalDeletedDocId
            );
            this.cdr.detectChanges();
            Swal.fire('Restored!', 'Project has been restored.', 'success');
          },
          error: (err) => {
            console.error('Restore error:', err);
            Swal.fire('Error!', 'Failed to restore project.', 'error');
          }
        });
      }
    });
  }

  deletePermanently(projectId: string, projectName: string) {
    console.log('Deleting permanently:', projectId, projectName);
    
    Swal.fire({
      title: 'Delete Forever?',
      html: `This will permanently delete <b>"${projectName}"</b>. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Forever',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteFromTrash(projectId).subscribe({
          next: () => {
            // Filter by originalDeletedDocId
            this.projects = this.projects.filter(p => p.originalDeletedDocId !== projectId);
            this.cdr.detectChanges();
            Swal.fire('Deleted!', 'Project permanently deleted.', 'success');
          },
          error: (err) => {
            console.error('Delete error:', err);
            Swal.fire('Error!', 'Failed to delete project.', 'error');
          }
        });
      }
    });
  }

  getDeletedDate(project: any): string {
    return project.deletedAt ? new Date(project.deletedAt).toLocaleDateString() : 'Unknown';
  }

  getDaysLeft(project: any): number {
    // Handle both possible field names
    const deleteDateStr = project.willAutoDeleteAt || project.willBeDeletedAt;
    
    if (!deleteDateStr) return 30;
    
    try {
      const deleteDate = new Date(deleteDateStr);
      const now = new Date();
      const diffTime = deleteDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return daysLeft > 0 ? daysLeft : 0;
    } catch (error) {
      return 30;
    }
  }
  
  // Add trackBy function for better performance
  trackByProjectId(index: number, project: any): string {
    return project.originalDeletedDocId || index.toString();
  }
}