// profile.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Profile implements OnInit {
  private auth = inject(AuthService);
  
  loggedName = signal('');
  address = signal('');
  email = signal('');

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.auth.getCurrentUser().subscribe({
      next: (res) => {
        if (res.user) {
          this.loggedName.set(res.user.fullName);
          this.address.set(res.user.address);
          this.email.set(res.user.userName);
        }
      },
      error: (err) => {
        console.error('Error loading user data:', err);
      }
    });
  }

  getInitials(): string {
    const name = this.loggedName();
    if (!name) return 'U';
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}