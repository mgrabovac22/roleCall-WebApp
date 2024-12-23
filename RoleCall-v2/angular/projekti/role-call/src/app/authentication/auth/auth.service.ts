import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loggedIn$ = this.loggedInSubject.asObservable();
  private roleSubject: BehaviorSubject<number> = new BehaviorSubject<number>(3);
  public role$ = this.roleSubject.asObservable();

  constructor(private router: Router) {
    this.checkAndClearToken();  
  }

  private checkAndClearToken(): void {
    if (!localStorage.getItem('token')) {
      this.logout(); 
    } else {
      this.loadUserRole();
      const isFirstTime = sessionStorage.getItem('isFirstTime');
      if (!isFirstTime) {
        sessionStorage.setItem('isFirstTime', 'true');
      }
    }
  }

  loadUserRole(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getSesija().then(session => {
        if (session && session.tip_korisnika) {
          this.roleSubject.next(session.tip_korisnika); 
          resolve();
        } else {
          this.router.navigate(['/login']);
          reject('Greška pri dohvaćanju sesije');
        }
      }).catch(error => {
        reject(error);
      });
    });
  }


  async register(userData: any) {
    const response = await fetch(`${environment.restServis}app/korisnici`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.greska || 'Greška prilikom registracije.');
    }

    return data;
  }

  async login(credentials: { korime: string, lozinka: string }) {
    const response = await fetch(`${environment.restServis}app/korisnici/prijava`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (response.ok) {
      const sesija = await this.getSesija()
      this.roleSubject.next(sesija.tip_korisnika);
      this.loggedInSubject.next(true);
      localStorage.setItem('token', data.token);
      return data;
    } else {
      throw new Error(data.greska);
    }
  }

  async getSesija() {
    const response = await fetch(`${environment.restServis}app/getSesija`, {
      method: 'GET',
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error('Neuspelo dobijanje sesije.');
    }

    const sessionData = await response.json();
    return sessionData.session;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  async logout() {
    console.log("Pokrenuta odjava");
    try {
      const response = await fetch(`${environment.restServis}app/odjava`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (response.ok) {
        console.log("Odjava uspješna");
        localStorage.removeItem('token'); 
        sessionStorage.removeItem('isFirstTime');
        this.roleSubject.next(3);
        this.loggedInSubject.next(false);
        return true; 
      } else {
        console.error("Odjava nije uspjela:", response.statusText);
        return false; 
      }
    } catch (error) {
      console.error("Greška pri odjavi:", error);
      throw new Error('Greška pri odjavi');
    }
  }
  
}
