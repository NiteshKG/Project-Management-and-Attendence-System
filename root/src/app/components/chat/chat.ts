import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


interface User{
  
  _id: string;
  userName: string;
  fullName: string;

 }
@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})




export class Chat implements OnInit, AfterViewInit {
  @ViewChild('chatContainer') chatContainer !: ElementRef;
  user!: User;
  messages : any[] = [];
 constructor(private chatService: ChatService, private authService: AuthService ){};
  

 

  ngOnInit() {

      this.authService.getLoggedUser().subscribe(users =>{
        this.user = users;
      })
      this.chatService.connect();
      this.chatService.getMessages().subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
      
  });
  

  
  }

  ngAfterViewInit() {
      this.scrollToBottom();
  }

  message: string = '';
  show: boolean = false;

  onSubmit(form: NgForm){

   if (!this.user || !this.user._id) {
    console.log("User not loaded yet");
    return;
  }
    this.chatService.sendMessage({
    senderId: this.user._id,
    senderName: this.user.userName,
    message: this.message,
    

  });
  console.log("Sending user:", this.user)
  this.message = '';
  
  form.resetForm();
  setTimeout(() => this.scrollToBottom(), 50); 
  
  }

  socketConnect() {
  this.chatService.connect();
  alert("User connect to chat ")
}

  socketDisconnect() {
  this.chatService.disconnect();
  alert("User Disconnected from chat ")
}

scrollToBottom() {
  if (this.chatContainer) {
    this.chatContainer.nativeElement.scrollTo({
      top: this.chatContainer.nativeElement.scrollHeight,
      behavior: 'smooth'
    });
  }
}



  formShow(){
    this.show = !this.show;

    if (this.show) {
    setTimeout(() => this.scrollToBottom(), 0); 
  }

  }


}
