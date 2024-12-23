import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    console.log('AuthGuard: Checking authentication and authorization');

    if (!this.authService.isLoggedIn()) {
      console.log('AuthGuard: User is not logged in. Redirecting to login page.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    await this.authService.loadUserRole();

    this.authService.role$.pipe(take(1)).subscribe(role => {
      console.log('Trenutna uloga korisnika:', role);

      const allowedRoles = route.data['roles'] as number[];

      if (allowedRoles && !allowedRoles.includes(role)) {
        console.log(`AuthGuard: Access denied. User role (${role}) is not allowed for this route.`);
        this.router.navigate(['/neovlastenPristup'], { queryParams: { returnUrl: state.url }});
      }
    });

    return true;
  }
}
