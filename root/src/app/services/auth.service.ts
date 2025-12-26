import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Observable, tap, of } from "rxjs";

@Injectable({
  providedIn:'root'
})

export class AuthService{
  constructor(private router : Router, private http: HttpClient){}


  saveInfo(data: any): Observable<any[]>{
 //  const saved =  JSON.parse(localStorage.getItem('users') || ('[]') );
 // saved.push(data);

  //  localStorage.setItem('users',JSON.stringify(saved));
  return this.http.post<any>('http://localhost:5000/api/auth/register', data);
  }

  getUser(){
    return JSON.parse(localStorage.getItem('users') || ('{}') );
  }

  

  login(userName: string, password: string): Observable<any> {
    return this.http.post('http://localhost:5000/api/auth/login', { userName, password })
      .pipe(
        tap((res: any) => {

          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        })
      );
  }

  


  getCurrentUser(): Observable<any | null> {
  const token = localStorage.getItem('token');
  if (!token) return of(null);

  return this.http.get<any>('http://localhost:5000/api/attendance/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

/*
getCurrentUserProject(): Observable<any | null> {
  const token = localStorage.getItem('token');
  if (!token) return of(null);

  return this.http.get<any>('http://localhost:5000/api/attendance/projectshow', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
  */

getLoggedUser(): Observable<any | null> {
  const token = localStorage.getItem('token');
  if (!token) return of(null);

  return this.http.get<any>('http://localhost:5000/api/auth/loggeduser');
}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }



}
