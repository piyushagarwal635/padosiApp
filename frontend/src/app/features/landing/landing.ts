import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    const role = (typeof window !== 'undefined' && typeof localStorage !== 'undefined') ?
      (localStorage.getItem('user_role') || sessionStorage.getItem('user_role')) : null;
    this.isLoggedIn = !!(token && role);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onGetStarted() {
    const token = this.authService.getToken();
    const role = (typeof window !== 'undefined' && typeof localStorage !== 'undefined') ?
      (localStorage.getItem('user_role') || sessionStorage.getItem('user_role')) : null;

    if (token && role) {
      if (role === 'worker') {
        this.router.navigate(['/worker-dashboard']);
      } else {
        this.router.navigate(['/user-dashboard']);
      }
    } else {
      this.router.navigate(['/signup']);
    }
  }
}
