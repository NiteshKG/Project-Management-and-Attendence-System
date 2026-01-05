import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Home } from './components/home/home';
import { Timesheet } from './components/timesheet/timesheet';
import { Profile } from './components/profile/profile';
import { Trash } from './components/trash/trash';
import { ProjectModal } from './components/project-modal/project-modal';
import { Attendance } from './components/attendance/attendance';
import {Dashboard} from './components/dashboard/dashboard';
import { ProjectComponent } from './components/project/project';
import { AuthGuard } from './auth.guard';



export const routes: Routes = [

  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: '',   redirectTo: '/login', pathMatch: 'full' }, 
  { path: 'project', component: ProjectComponent },
 { path: 'trash', component: Trash  },
  { path: 'home', component: Home , 
     children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'timesheet', component: Timesheet },
      { path: 'attendance', component: Attendance },
      { path: 'projects', component: ProjectModal },
      { path: 'profile', component: Profile }
    ]
    , canActivate:[AuthGuard]},
     { path: '**', redirectTo: '' } 

];
