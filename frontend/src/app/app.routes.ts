import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { SignUp } from './features/auth/sign-up/sign-up';
import { UserDashboard } from './features/dashboard/user-dashboard/user-dashboard';
import { WorkerDashboard } from './features/dashboard/worker-dashboard/worker-dashboard'; // 🔥 ADD
import { AuthGuard } from './core/guards/auth.guard'; // 🔥 ADD

export const routes: Routes = [

  // 🔐 Login always first
  { path: '', component: Login },

  // 📝 Signup
  { path: 'signup', component: SignUp },

  // 👤 User Dashboard (Protected)
  { 
    path: 'user-dashboard', 
    component: UserDashboard,
    canActivate: [AuthGuard] // 🔥 PROTECT
  },

  // 👷 Worker Dashboard (Protected)
  { 
    path: 'worker-dashboard', 
    component: WorkerDashboard,
    canActivate: [AuthGuard] // 🔥 PROTECT
  },

  // ❌ Wrong URL → redirect login
  { path: '**', redirectTo: '' }

];