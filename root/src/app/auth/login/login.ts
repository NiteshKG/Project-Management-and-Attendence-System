import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators }  from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

successMessage = signal('');
errorMessage = signal('');

  

  loginForm = this.formBuilder.group({
    
    userName: ['',  [Validators.required, Validators.minLength(4)]],
    password: ['',  [Validators.required, Validators.minLength(4)]],
   

  });

  get userName() { return this.loginForm.get('userName'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched(); 
      return;
      
    }

    const email = this.userName?.value || '';
    const pwd = this.password?.value || '';

    const isValid = this.auth.login(email, pwd);  

    if (isValid) {
      this.successMessage.set('Login successful!');
      
      setTimeout(() => {
        this.router.navigate(['/home']); 
      }, 800);
    } else {
      this.errorMessage.set('Invalid username of password');
      setTimeout(() => {
      
      this.errorMessage.set(''); 
    }, 2000);

      
      
    }
  }


}
