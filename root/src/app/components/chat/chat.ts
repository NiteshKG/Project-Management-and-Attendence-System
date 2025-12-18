import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../services/project.service';
import { ActivatedRoute } from '@angular/router';


interface User{
  
  _id: string;
  userName: string;
  fullName: string;

 }

 interface ProjectData{
  
  _id: string;
  

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
  project: ProjectData = { _id: '' };

  messages : any[] = [];
 constructor(private chatService: ChatService, private authService: AuthService, private projectService: Project, private route: ActivatedRoute){};
  

 

  ngOnInit() {
      
     this.route.queryParams.subscribe(params => {
    this.project._id = params['id'];

    if (this.project._id) {
      this.chatService.connect(this.project._id);
    }
  });

      this.authService.getLoggedUser().subscribe(users =>{
        this.user = users;
      })
    
      
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
  if (!this.project._id) {
    console.log("Project is not assigned");
    return;
  }
    this.chatService.sendMessage({
    senderId: this.user._id,
    senderName: this.user.userName,
    projectId: this.project._id,
    message: this.message,
    

  });
  console.log("Sending user:", this.user)
  this.message = '';
  
  form.resetForm();
  setTimeout(() => this.scrollToBottom(), 50); 
  
  }

  socketConnect() {
  this.chatService.connect(this.project._id);
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
