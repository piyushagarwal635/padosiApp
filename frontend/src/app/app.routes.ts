import { Routes } from '@angular/router';
import { Login } from './login/login';
import { SignUp } from './login/sign-up/sign-up';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'signup', component: SignUp }
];
