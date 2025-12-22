import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn:'root'
})

export class Project{

  private API = 'http://localhost:5000/api/projects';
  constructor(private router : Router, private http: HttpClient){}


  createProject(data: any): Observable<any> {
       return this.http.post(this.API, data);
  }
  getProjects(): Observable<any> {
    return this.http.get(this.API);
}

getProject(id: string): Observable<any> {
  return this.http.get(`${this.API}/${id}`);
}

updateProject(id: string, data: any): Observable<any> {
  return this.http.put(`${this.API}/${id}`, data);
}

deleteProject(id: string): Observable<any> {
  return this.http.delete(`${this.API}/${id}`);
}

addTask(projectId: string, data: any): Observable<any> {
  return this.http.post(`${this.API}/${projectId}/tasks`, data);
  }

startTask(projectId: string, taskId: string): Observable<any> {
  return this.http.post(`${this.API}/${projectId}/tasks/${taskId}/start`, {});
  }

stopTask(projectId: string, taskId: string): Observable<any> {
  return this.http.post(`${this.API}/${projectId}/tasks/${taskId}/stop`, {});
  }

getTaskLogs(projectId: string, taskId: string): Observable<any> {
  return this.http.get(`${this.API}/${projectId}/tasks/${taskId}/logs`);
  }

getRunningTask(projectId: string): Observable<any> {

     return this.http.get(`${this.API}/${projectId}/running-task`);

}



/*
  getCurrentUserEmail() {
  const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    return user ? user.userName : null;
}

  createProject(data: any) {
  const email = this.getCurrentUserEmail();
  if (!email) return;
    const key = `projects_${email}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    saved.push(data);
    localStorage.setItem(key, JSON.stringify(saved));
  }

  getProjects() {
  const email = this.getCurrentUserEmail();
  if (!email) return [];
  const key = `projects_${email}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  getProjectById(id: number) {
    const projects = this.getProjects();
    return projects[id];
  }

  deleteProject(index: number) {
    const email = this.getCurrentUserEmail();
    const key = `projects_${email}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    saved.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(saved));
  }

  updateProject(index: number, updatedData: any) {
    const email = this.getCurrentUserEmail();
  const key = `projects_${email}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    saved[index] = updatedData;
    localStorage.setItem(key, JSON.stringify(saved));
  }


*/

}




