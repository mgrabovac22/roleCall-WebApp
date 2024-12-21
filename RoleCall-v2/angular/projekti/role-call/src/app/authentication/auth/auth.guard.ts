import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('Is user logged in?', this.authService.isLoggedIn()); 
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
        console.log('Not logged in. Redirecting to login...');
        this.router.navigate(['/login']);
        return false;
    }
  }
}
