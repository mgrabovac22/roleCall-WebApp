import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
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
  private token: string = "";

  constructor(private router: Router) {
    this.checkAndClearToken();  
  }

  async getJWT(): Promise<string> {
    const response = await fetch(`${environment.restServis}app/getJWT`);
    const data = await response.json();
    return data.token;
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


  async register(userData: any, recaptchaToken: string) {
    const response = await fetch(`${environment.restServis}app/korisnici`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        recaptchaToken,
      }),
    });
  
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.greska || 'Greška prilikom registracije.');
    }
  
    return data;
  }

  async login(credentials: { korime: string, lozinka: string }, recaptchaToken: string, totpEnabled: boolean) {
    const response = await fetch(`${environment.restServis}app/korisnici/prijava`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify({
        ...credentials,
        recaptchaToken,
      }),
    });
  
    const data = await response.json();
    
    if (response.ok) {
      if(!totpEnabled){
        const sesija = await this.getSesija();
        this.roleSubject.next(sesija.tip_korisnika);
        this.loggedInSubject.next(true);
        localStorage.setItem('token', data.token);
      }
      this.token = data.token;
      return data;
    } else {
      throw new Error(data.greska || 'Greška prilikom prijave.');
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

  async verifyTotpCode(korime: string, uneseniKod: string): Promise<void> {
    console.log(`${environment.restServis}app/korisnici/${korime}/totp-provjera`);
    var jwtToken = await this.getJWT();
    
    const response = await fetch(`${environment.restServis}app/korisnici/${korime}/totp-provjera`, {
      method: 'POST',
      headers: {
        'Authorization': jwtToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uneseniKod }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.greska || 'Neispravan TOTP kod.');
    }
    
    const sesija = await this.getSesija();
    this.roleSubject.next(sesija.tip_korisnika);
    localStorage.setItem('token', this.token);
    this.loggedInSubject.next(true);
  }
  

  async getTotpStatus(korime: string): Promise<{status: boolean}> {
    console.log("Korime u serv", korime);
    
    const response = await fetch(`${environment.restServis}app/korisnici/${korime}/totp-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Došlo je do greške prilikom dohvaćanja TOTP statusa.');
    }

    const data = await response.json();
    return data; 
  }
  
  
}
