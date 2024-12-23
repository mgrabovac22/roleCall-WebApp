import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private role: number = 3;

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking authentication and authorization');

    if (!this.authService.isLoggedIn()) {
      console.log('AuthGuard: User is not logged in. Redirecting to login page.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    this.authService.role$.pipe(take(1)).subscribe(role => {
      this.role = role;
      console.log('Trenutna uloga korisnika:', this.role);

      const allowedRoles = route.data['roles'] as number[];

      if (allowedRoles && !allowedRoles.includes(this.role)) {
        console.log(`AuthGuard: Access denied. User role (${this.role}) is not allowed for this route.`);
        this.router.navigate(['/neovlastenPristup'], { queryParams: { returnUrl: state.url }});
      }
    });

    return true;
  }
}
