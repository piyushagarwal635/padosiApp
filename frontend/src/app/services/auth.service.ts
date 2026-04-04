import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoginRequest {
  phoneNumber: string;
}

export interface SignUpRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  accountType: 'user' | 'worker';
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Initialize authentication state only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.isAuthenticatedSubject.next(this.hasToken());
    }
  }

  /**
   * Validate phone number (Indian format: 10 digits)
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Requirements:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character (!@#$%^&*)
   */
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate full name
   */
  validateFullName(name: string): boolean {
    return name.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(name);
  }

  /**
   * Login with phone number (OTP)
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        if (this.validatePhoneNumber(request.phoneNumber)) {
          const response: AuthResponse = {
            success: true,
            message: 'OTP sent successfully',
            token: 'mock-token-' + Date.now()
          };
          observer.next(response);
          observer.complete();
        } else {
          observer.error({
            success: false,
            message: 'Invalid phone number'
          });
        }
      }, 500);
    });
  }

  /**
   * Sign up new user
   */
  signUp(request: SignUpRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        // Validate all fields
        if (!this.validateFullName(request.fullName)) {
          observer.error({
            success: false,
            message: 'Invalid full name'
          });
          return;
        }

        if (!this.validateEmail(request.email)) {
          observer.error({
            success: false,
            message: 'Invalid email address'
          });
          return;
        }

        if (!this.validatePhoneNumber(request.phoneNumber)) {
          observer.error({
            success: false,
            message: 'Invalid phone number'
          });
          return;
        }

        const passwordValidation = this.validatePassword(request.password);
        if (!passwordValidation.isValid) {
          observer.error({
            success: false,
            message: 'Password does not meet requirements',
            errors: passwordValidation.errors
          });
          return;
        }

        // All validations passed
        const response: AuthResponse = {
          success: true,
          message: 'Account created successfully',
          token: 'mock-token-' + Date.now(),
          user: {
            id: Math.random().toString(36).substr(2, 9),
            fullName: request.fullName,
            email: request.email,
            phoneNumber: request.phoneNumber,
            accountType: request.accountType
          }
        };

        // Store token only in browser
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('auth_token', response.token!);
          this.isAuthenticatedSubject.next(true);
        }

        observer.next(response);
        observer.complete();
      }, 800);
    });
  }

  /**
   * Logout
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.hasToken();
    }
    return false;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Helper method to check if token exists
   */
  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }
}
