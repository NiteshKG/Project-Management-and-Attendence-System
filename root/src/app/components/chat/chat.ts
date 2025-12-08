import { Component, inject, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {
 constructor(private chatService: ChatService){};

  messages : any[] = [];

  ngOnInit() {
      this.messages = this.chatService.getMessages();
  }

  message: string = '';
  show: boolean = false;

  onSubmit(form: NgForm){
    this.chatService.createMessages(form.value.msg);
    this.messages = this.chatService.getMessages();
    form.reset();
  }

  formShow(){
    this.show = !this.show;
  }


}
