# App Routes Configuration

## How to Set Up Routes in Your App

### Current `app.routes.ts` (or create if doesn't exist)

```typescript
import { Routes } from '@angular/router';
import { Login } from './login/login';
import { SignUp } from './login/sign-up/sign-up';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public Routes (no guard)
  { 
    path: '', 
    component: Login 
  },
  
  { 
    path: 'signup', 
    component: SignUp 
  },

  // Protected Routes (with AuthGuard)
  // Add your dashboard/home routes here:
  // {
  //   path: 'dashboard',
  //   component: Dashboard,
  //   canActivate: [AuthGuard]  // ← User must be logged in
  // },

  // Catch-all (optional)
  { 
    path: '**', 
    redirectTo: '' 
  }
];
```

---

## Route Flow

```
User visits app
    ↓
/ (Login page)
    ↓
    ├→ New User: /signup
    │     ↓
    │  Fill form → Validate → Success modal → Back to /
    │
    └→ Existing User: Enter OTP
          ↓
       OTP Verified
          ↓
       /dashboard (Protected by AuthGuard)
```

---

## Auth Guard in Action

When user tries to access protected route:

```typescript
// Without AuthGuard ❌
{ path: 'dashboard', component: Dashboard }
// Any user can access!

// With AuthGuard ✅
{ path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] }
// Only authenticated users can access
// Others redirected to /
```

---

## Login Flow Integration

### 1. Login Page (`/`)
```typescript
{ 
  path: '', 
  component: Login 
}
```
- Users enter phone number
- Validation happens in real-time
- Success modal appears
- Confirms data submission
- Ready for OTP verification

### 2. Sign-Up Page (`/signup`)
```typescript
{ 
  path: 'signup', 
  component: SignUp 
}
```
- New users create account
- All validations enforced
- Password strength shown
- Success modal confirms
- Account created

### 3. Protected Dashboard (example)
```typescript
{ 
  path: 'dashboard', 
  component: Dashboard,
  canActivate: [AuthGuard]
}
```
- Only logged-in users access
- Automatic redirect if not authenticated
- Token checked via AuthService

---

## Token Management

### How Auth Token Works

1. **Login/SignUp** → Service creates token → Stores in localStorage
2. **AuthGuard** → Checks for token → Allows/denies route access
3. **API Requests** → Include token in headers
4. **Logout** → Remove token from localStorage

```typescript
// In AuthService
login(phoneNumber: string) {
  // ... validation ...
  localStorage.setItem('auth_token', token);  // ← Save token
  this.isAuthenticatedSubject.next(true);     // ← Update state
}

logout() {
  localStorage.removeItem('auth_token');      // ← Remove token
  this.isAuthenticatedSubject.next(false);    // ← Update state
}
```

---

## Example: Complete App Routes

```typescript
import { Routes } from '@angular/router';
import { Login } from './login/login';
import { SignUp } from './login/sign-up/sign-up';
import { AuthGuard } from './guards/auth.guard';

// Import your page components here
// import { Dashboard } from './dashboard/dashboard';
// import { Profile } from './profile/profile';
// import { Services } from './services/services';

export const routes: Routes = [
  // ===== PUBLIC ROUTES =====
  {
    path: '',
    component: Login,
    data: { title: 'Login - PADOSI' }
  },

  {
    path: 'signup',
    component: SignUp,
    data: { title: 'Sign Up - PADOSI' }
  },

  // ===== PROTECTED ROUTES =====
  // {
  //   path: 'dashboard',
  //   component: Dashboard,
  //   canActivate: [AuthGuard],
  //   data: { title: 'Dashboard - PADOSI' }
  // },

  // {
  //   path: 'profile',
  //   component: Profile,
  //   canActivate: [AuthGuard],
  //   data: { title: 'Profile - PADOSI' }
  // },

  // {
  //   path: 'services',
  //   component: Services,
  //   canActivate: [AuthGuard],
  //   data: { title: 'Services - PADOSI' }
  // },

  // Route for OTP verification (example)
  // {
  //   path: 'verify-otp',
  //   component: VerifyOtp,
  //   data: { title: 'Verify OTP - PADOSI' }
  // },

  // Forgot Password (example)
  // {
  //   path: 'forgot-password',
  //   component: ForgotPassword,
  //   data: { title: 'Forgot Password - PADOSI' }
  // },

  // ===== CATCH-ALL (OPTIONAL) =====
  {
    path: '**',
    redirectTo: ''
  }
];
```

---

## Important: AuthGuard Providers

### Make sure AuthGuard is provided in your app config:

In `app.config.ts` or bootstrapping code:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthGuard } from './guards/auth.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    AuthGuard,  // ← Make sure this is provided
    // ... other providers
  ]
};
```

Or in your module:

```typescript
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  // ...
  providers: [AuthGuard]
})
export class AppModule { }
```

---

## Testing Routes

### Test Login Flow
1. Navigate to `/` → Should show login form
2. Enter valid phone → Button enables
3. Click continue → Success modal appears
4. Confirm → Redirects (to OTP page in real app)

### Test Sign-Up Flow
1. Navigate to `/signup` → Should show signup form
2. Fill all required fields
3. Watch password checklist update in real-time
4. All validations pass → Submit enabled
5. Click create account → Success modal
6. Confirm → Redirects back to login

### Test Auth Guard
1. Try accessing `/dashboard` directly → Redirects to `/`
2. Login successfully
3. Now `/dashboard` is accessible
4. Logout → Redirected to login again

---

## Redirect After Login

### Store Return URL

```typescript
// In AuthGuard
this.router.navigate(['/'], { 
  queryParams: { returnUrl: state.url } 
});
```

### Use Return URL After Login

```typescript
// In Login Component
onSuccess() {
  const returnUrl = this.route.snapshot.queryParams['returnUrl'];
  this.router.navigate([returnUrl || '/dashboard']);
}
```

---

## Common Route Patterns

### Lazy Loading (for large apps)
```typescript
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module')
    .then(m => m.AdminModule),
  canActivate: [AuthGuard]
}
```

### Route with Parameters
```typescript
{
  path: 'profile/:userId',
  component: Profile,
  canActivate: [AuthGuard]
}
```

### Route with Query Parameters
```typescript
// Navigate: /search?query=padosi&category=service
// Access: route.snapshot.queryParams['query']
{
  path: 'search',
  component: Search,
  canActivate: [AuthGuard]
}
```

---

## Route Guards Available

### 1. **canActivate** - Route access control ✅ (Already created)
```typescript
canActivate: [AuthGuard]
// Only if authenticated
```

### 2. **canDeactivate** - Prevent leaving if unsaved
```typescript
canDeactivate: [(component: HasUnsavedChanges) => ...)]
// Warn before navigation
```

### 3. **canActivateChild** - Protect child routes
```typescript
canActivateChild: [AuthGuard]
// All children protected
```

---

## Next: Create OTP Verification

After login success, create OTP verification:

```typescript
// New component: verify-otp.component.ts
{
  path: 'verify-otp',
  component: VerifyOtp,
  data: { title: 'Verify OTP - PADOSI' }
}
```

---

## Checklist

- ✅ Routes file set up with Login and SignUp
- ✅ AuthGuard imported and provided
- ✅ Protected routes use `canActivate: [AuthGuard]`
- ✅ Redirect fallback (`**`) configured
- ⏳ OTP verification component (to create)
- ⏳ Dashboard/Home component (to create)
- ⏳ Profile component (to create)
- ⏳ Services listing (to create)
- ⏳ Connect to backend API

---

**Your authentication system is ready! 🎉**
