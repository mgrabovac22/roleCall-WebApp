import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  private siteKey = environment.recaptchaSiteKey;

  executeRecaptcha(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!(window as any).grecaptcha) {
        reject('reCAPTCHA nije učitan.');
        return;
      }

      (window as any).grecaptcha.ready(() => {
        (window as any).grecaptcha.execute(this.siteKey, { action }).then(
          (token: string) => resolve(token),
          (error: any) => reject(error)
        );
      });
    });
  }
}
