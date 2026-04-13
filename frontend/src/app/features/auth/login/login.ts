import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  // Initialize with an empty FormGroup to avoid undefined during SSR/hydration
  loginForm: FormGroup = new FormGroup({});
  loading: boolean = false;
  errorMessage: string = '';

  isOtpSent: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Ensure the form exists before Angular runs change detection
    // (prevents "formGroup expects a FormGroup instance" during hydration)
    this.initializeForm();

    // 🔥 AUTO LOGIN (REMEMBER ME)
    const token = this.authService.getToken();

    const role = (typeof window !== 'undefined' && typeof localStorage !== 'undefined') ?
      (localStorage.getItem('user_role') || sessionStorage.getItem('user_role')) : null;

    if (token && role) {
      if (role === 'worker') {
        this.router.navigate(['/worker-dashboard'], { replaceUrl: true });
      } else {
        this.router.navigate(['/user-dashboard'], { replaceUrl: true });
      }
      return;
    }
  }

  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      otp: [''],
      rememberMe: [false] // 🔥 NEW
    });
  }

  get phoneNumber() {
    return this.loginForm.get('phoneNumber');
  }

  get otp() {
    return this.loginForm.get('otp');
  }

  onSubmit(): void {

    this.errorMessage = '';

    const phoneNumber = this.phoneNumber?.value;
    const otpValue = this.otp?.value;
    const rememberMe = this.loginForm.get('rememberMe')?.value;

    // ================= SEND OTP =================
    if (!this.isOtpSent) {

      if (this.phoneNumber?.invalid) {
        this.errorMessage = 'Please enter valid phone number';
        return;
      }

      this.loading = true;

      this.authService.login({ phoneNumber }).subscribe({
        next: () => {
          this.loading = false;
          this.isOtpSent = true;
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem('phone', phoneNumber);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error sending OTP';
        }
      });

    }

    // ================= VERIFY OTP =================
    else {

      if (!otpValue || otpValue.length !== 6) {
        this.errorMessage = 'Enter valid 6-digit OTP';
        return;
      }

      this.loading = true;

      const storedPhone = (typeof window !== 'undefined' && typeof localStorage !== 'undefined') ?
        localStorage.getItem('phone') : null;

      this.authService.verifyOtp({
        phoneNumber: storedPhone,
        otp: otpValue
      }).subscribe({
        next: (response: any) => {
          this.loading = false;

          // 🔥 TOKEN STORE (REMEMBER ME LOGIC)
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            if (rememberMe) {
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('user_role', response.user.accountType);
            } else {
              sessionStorage.setItem('auth_token', response.token);
              sessionStorage.setItem('user_role', response.user.accountType);
            }
          }

          // 🔥 ROLE BASED REDIRECT
          if (response.user.accountType === 'worker') {
            this.router.navigate(['/worker-dashboard'], { replaceUrl: true });
          } else {
            this.router.navigate(['/user-dashboard'], { replaceUrl: true });
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid OTP';
        }
      });
    }
  }

  onGoogleLogin(): void {
    console.log('Google login clicked');
  }
}