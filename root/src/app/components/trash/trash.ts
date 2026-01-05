// components/trash.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { TrashService } from '../../services/trash.service';

@Component({
  selector: 'app-trash',
  imports: [CommonModule],
  templateUrl: './trash.html',
  styleUrls: ['./trash.css']
})
export class Trash implements OnInit {
  deletedProjects: any[] = [];
  deletedTasks: any[] = [];
  summary: any = {};
  loading = true;

  constructor(private trashService: TrashService) {}

  ngOnInit() {
    this.loadTrash();
  }

  loadTrash() {
    this.loading = true;
    
    // Load summary first
    this.trashService.getTrashSummary().subscribe(summary => {
      this.summary = summary;
    });

    // Load deleted projects
    this.trashService.getDeletedProjects().subscribe(projects => {
      this.deletedProjects = projects;
    });

    // Load deleted tasks
    this.trashService.getDeletedTasks().subscribe(tasks => {
      this.deletedTasks = tasks;
      this.loading = false;
    });
  }

  restoreProject(projectId: string) {
    if (confirm('Are you sure you want to restore this project?')) {
      this.trashService.restoreProject(projectId).subscribe(() => {
        this.loadTrash(); // Refresh the list
      });
    }
  }

  restoreTask(projectId: string, taskId: string) {
    this.trashService.restoreTask(projectId, taskId).subscribe(() => {
      this.loadTrash(); // Refresh the list
    });
  }

  emptyTrash() {
    if (confirm('This will permanently delete all expired items. Continue?')) {
      this.trashService.emptyTrash().subscribe(() => {
        this.loadTrash(); // Refresh the list
      });
    }
  }
}