import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { ReactiveFormsModule,FormBuilder, Validators }  from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
private formBuilder = inject(FormBuilder);
private auth = inject(AuthService);

successMessage=signal('');
errorMessage=signal('');

signupForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(4)]],
    userName: ['',  [Validators.required, Validators.minLength(4)]],
    password: ['',  [Validators.required, Validators.minLength(4)]],
    address: ['', [Validators.required, Validators.minLength(4)]],

  });

  get fullName() { return this.signupForm.get('fullName'); }
  get userName() { return this.signupForm.get('userName'); }
  get password() { return this.signupForm.get('password'); }
  get address() { return this.signupForm.get('address'); }

  onSubmit() {
    if(this.signupForm.valid){
      console.log(this.signupForm.value);
      this.auth.saveInfo(this.signupForm.value).subscribe({
        next: (res) =>{
          console.log("Success:",res);
          this.successMessage.set('Form Submitted successfully');
      

         setTimeout(() => {
      
          this.successMessage.set(''); 
          }, 3000);
    this.signupForm.reset();
        },
     
        error: (err) =>{
          console.log("Error:",err);
          if (err.status === 400 && err.error?.msg) {
          this.errorMessage.set(err.error.msg); 

        } 
          this.signupForm.reset();
         setTimeout(() => {
      
          this.errorMessage.set(''); 
          }, 3000);
          
        }

        

      });
      

    } else {
      this.signupForm.markAllAsTouched(); 
    }
  }

}
