import { Injectable } from '@angular/core';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  constructor(private recaptchaV3Service: ReCaptchaV3Service) {}

  executeRecaptcha(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recaptchaV3Service.execute(action).subscribe(
        (token: string) => resolve(token),
        (error: any) => reject('Greška pri izvršavanju reCAPTCHA: ' + error)
      );
    });
  }
}
