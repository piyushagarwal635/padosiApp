import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, ConfirmationModalComponent],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp implements OnInit {
  signupForm!: FormGroup;
  loading: boolean = false;
  showModal: boolean = false;
  modalData: any = null;
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

  /**
   * Initialize the signup form with validation
   */
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
      accountType: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator.bind(this)
      ]]
    });
  }

  /**
   * Custom validator for name (only letters and spaces)
   */
  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return /^[a-zA-Z\s]+$/.test(value) ? null : { invalidName: true };
  }

  /**
   * Custom validator for password strength
   */
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

  /**
   * Get form controls for template access
   */
  get fullName() { return this.signupForm.get('fullName'); }
  get email() { return this.signupForm.get('email'); }
  get phoneNumber() { return this.signupForm.get('phoneNumber'); }
  get accountType() { return this.signupForm.get('accountType'); }
  get password() { return this.signupForm.get('password'); }

  /**
   * Handle signup form submission
   */
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
        this.modalData = {
          'Name': signupData.fullName,
          'Email': signupData.email,
          'Phone': '+91 ' + signupData.phoneNumber,
          'Account Type': signupData.accountType.charAt(0).toUpperCase() + signupData.accountType.slice(1),
          'Status': 'Account Created Successfully'
        };
        this.showModal = true;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Sign up failed. Please try again.';
      }
    });
  }

  /**
   * Handle modal confirmation
   */
  onModalConfirm(): void {
    this.showModal = false;
    // Navigate to login or dashboard
    this.router.navigate(['/']);
  }

  /**
   * Handle Google signup
   */
  onGoogleSignup(): void {
    console.log('Google signup clicked - integrate with Firebase/Google OAuth');
  }

  /**
   * Toggle password field visibility
   */
  togglePasswordField(): void {
    this.showPasswordField = !this.showPasswordField;
  }
}

