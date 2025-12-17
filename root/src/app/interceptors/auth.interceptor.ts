import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    const skipUrls = [
      '/auth/login',
      '/auth/register'
    ];


    const shouldSkip = skipUrls.some(url => req.url.includes(url));

    if (shouldSkip) {
      console.log('%c[Interceptor SKIPPED] →', 'color: orange;', req.url);
      return next.handle(req);
    }


    const token = localStorage.getItem('token');

    if (token) {
      console.log('%c[Interceptor ATTACHED TOKEN] →', 'color: green;', req.url);

      
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });

      return next.handle(authReq);
    }

    console.log('%c[Interceptor NO TOKEN FOUND] →', 'color: red;', req.url);
    return next.handle(req);
  }
}
