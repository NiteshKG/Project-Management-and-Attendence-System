// services/trash.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrashService {
  private apiUrl = 'http://localhost:5000/api/projects';

  constructor(private http: HttpClient) {}

  // Get all deleted projects
  getDeletedProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trash/projects`);
  }

  // Get all deleted tasks
  getDeletedTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trash/tasks`);
  }

  // Get trash summary
  getTrashSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trash/summary`);
  }

  // Restore project
  restoreProject(projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/trash/projects/${projectId}/restore`, {});
  }

  // Restore task
  restoreTask(projectId: string, taskId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/trash/projects/${projectId}/tasks/${taskId}/restore`, {});
  }

  // Empty trash
  emptyTrash(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/trash/empty`);
  }

  // Permanently delete project from trash
  permanentlyDeleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/trash/projects/${projectId}/permanent`);
  }
}