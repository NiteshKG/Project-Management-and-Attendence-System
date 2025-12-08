import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Home } from './components/home/home';
import { ProjectComponent } from './components/project/project';
import { AuthGuard } from './auth.guard';



export const routes: Routes = [

  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: '',   redirectTo: '/login', pathMatch: 'full' }, 
  { path: 'project', component: ProjectComponent },
  { path: 'home', component: Home , canActivate:[AuthGuard]},

];
