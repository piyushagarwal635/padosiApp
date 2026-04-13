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

  isOtpSent: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      otp: ['']
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

    console.log("otp value:", otpValue);

    // 🔥 STEP 1: SEND OTP
    if (!this.isOtpSent) {

      if (this.loginForm.get('phoneNumber')?.invalid) {
        this.errorMessage = 'Please enter a valid phone number';
        return;
      }

      this.loading = true;

      this.authService.login({ phoneNumber }).subscribe({
        next: () => {
          this.loading = false;
          this.isOtpSent = true;
          localStorage.setItem('phone', phoneNumber);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error sending OTP';
        }
      });

    } else {

      // 🔥 STEP 2: VERIFY OTP

      if (!otpValue || otpValue.length !== 6) {
        this.errorMessage = 'Enter valid 6-digit OTP';
        return;
      }

      this.loading = true;

      const storedPhone = localStorage.getItem('phone');

      this.authService.verifyOtp({
        phoneNumber: storedPhone,
        otp: otpValue   // ✅ FIX HERE
      }).subscribe({
        next: () => {
          this.loading = false;

          localStorage.setItem('auth_token', '123');

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid OTP';
        }
      });
    }
  }

  onGoogleLogin(): void {
    console.log('Google login clicked - integrate with Firebase/Google OAuth');
  }
}