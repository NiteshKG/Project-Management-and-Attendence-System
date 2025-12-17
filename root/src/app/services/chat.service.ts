import { HttpClient } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { BehaviorSubject } from "rxjs";

import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class ChatService{
  
  private socket!: Socket;
  private messages$ = new BehaviorSubject<any[]>([]);
  constructor(private router : Router, private http: HttpClient, private zone: NgZone){}
 
  connect(){
    this.socket = io('http://localhost:5000');

    this.socket.emit('loadMessages');

    this.socket.on('previousMessages', (msgs) => {
      this.zone.run(() => this.messages$.next(msgs));
    });

    this.socket.on('newMessage', (msg) => {
      this.zone.run(() => {
        this.messages$.next([...this.messages$.value, msg]);
      });
    });
  }

sendMessage(message: any) {
    this.socket.emit('sendMessage', message);
  }

  getMessages() {
    return this.messages$.asObservable();
  }

  disconnect() {
    this.socket.disconnect();
  }

/*
  createMessage(data : any){
    return this.http.post('http://localhost:5000/api/message', data);
  }

  /*
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

  */

}
