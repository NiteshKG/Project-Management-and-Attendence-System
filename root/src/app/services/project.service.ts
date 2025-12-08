import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn:'root'
})

export class Project{
  constructor(private router : Router){}
  
  
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
    
    

   
}




