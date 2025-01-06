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

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    await this.authService.loadUserRole();

    this.authService.role$.pipe(take(1)).subscribe(role => {

      const allowedRoles = route.data['roles'] as number[];

      if (allowedRoles && !allowedRoles.includes(role)) {
        this.router.navigate(['/neovlastenPristup'], { queryParams: { returnUrl: state.url }});
      }
    });

    return true;
  }
}
