import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class ChatService{
  constructor(private router : Router){}

  getCurrentUserEmail() {
  const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    return user ? user.userName : null;
}

createMessages(data: any) {
  const email = this.getCurrentUserEmail();
  if (!email) return;
    const key = `messages_${email}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    saved.push(data);
    localStorage.setItem(key, JSON.stringify(saved));
  }

  getMessages() {
  const email = this.getCurrentUserEmail();
  if (!email) return [];
  const key = `messages_${email}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

}