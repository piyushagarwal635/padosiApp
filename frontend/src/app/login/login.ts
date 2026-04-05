import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the login form with validation
   */
  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]]
    });
  }

  /**
   * Get form control for template access
   */
  get phoneNumber() {
    return this.loginForm.get('phoneNumber');
  }

  /**
   * Handle login form submission
   */
  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter a valid phone number';
      return;
    }

    this.loading = true;

    const loginData = {
      phoneNumber: this.loginForm.get('phoneNumber')?.value
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        // Navigate directly to OTP verification
        this.router.navigate(['/verify-otp']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }

  /**
   * Handle modal confirmation
   */
  onModalConfirm(): void {
    // (removed modal) kept for compatibility if called elsewhere
    this.router.navigate(['/verify-otp']);
  }

  /**
   * Handle Google login
   */
  onGoogleLogin(): void {
    console.log('Google login clicked - integrate with Firebase/Google OAuth');
  }
}

