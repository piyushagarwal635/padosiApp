import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css', '../login/login.css'],
})
export class SignUp implements OnInit {
  signupForm!: FormGroup;
  loading: boolean = false;
  
  errorMessage: string = '';
  passwordErrors: string[] = [];
  showPasswordField: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        this.nameValidator.bind(this)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      accountType: ['user', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator.bind(this)
      ]]
    });
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return /^[a-zA-Z\s]+$/.test(value) ? null : { invalidName: true };
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const validation = this.authService.validatePassword(password);
    if (!validation.isValid) {
      this.passwordErrors = validation.errors;
      return { weakPassword: true };
    }
    this.passwordErrors = [];
    return null;
  }

  get fullName() { return this.signupForm.get('fullName'); }
  get email() { return this.signupForm.get('email'); }
  get phoneNumber() { return this.signupForm.get('phoneNumber'); }
  get accountType() { return this.signupForm.get('accountType'); }
  get password() { return this.signupForm.get('password'); }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.loading = true;

    const signupData = {
      fullName: this.signupForm.get('fullName')?.value,
      email: this.signupForm.get('email')?.value,
      phoneNumber: this.signupForm.get('phoneNumber')?.value,
      accountType: this.signupForm.get('accountType')?.value,
      password: this.signupForm.get('password')?.value
    };

    this.authService.signUp(signupData).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Sign up failed. Please try again.';
      }
    });
  }

  onModalConfirm(): void {
    this.router.navigate(['/']);
  }

  onGoogleSignup(): void {
    console.log('Google signup clicked - integrate with Firebase/Google OAuth');
  }

  togglePasswordField(): void {
    this.showPasswordField = !this.showPasswordField;
  }
}
