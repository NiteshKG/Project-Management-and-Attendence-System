import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn:'root'
})

export class AuthService{
  constructor(private router : Router){}
  

  saveInfo(data: any){
   const saved =  JSON.parse(localStorage.getItem('users') || ('[]') );
   saved.push(data);

    localStorage.setItem('users',JSON.stringify(saved));
  }

  getUser(){
    return JSON.parse(localStorage.getItem('users') || ('{}') );
  }

  generateToken(email: string): string{
    const token = btoa(email+'.' + new Date().getTime());
    localStorage.setItem('token',token);
    return token;
  }

  login(email: string, password: string) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const user = users.find((u: any) =>
    u.userName === email && u.password === password
  );

  if (user) {
    this.generateToken(email);

    
    localStorage.setItem('loggedUser', JSON.stringify(user));

    return true;
  } else {
    return false;
  }
}

logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('loggedUser'); 
  
}

isLoggedIn() {
  return !!localStorage.getItem('token');
}

}