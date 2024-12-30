import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnijegService {
  constructor(){}

  private intenzitetSnijegaSource = new BehaviorSubject<number>(20);
  intenzitetSnijega$ = this.intenzitetSnijegaSource.asObservable(); 

  setIntenzitetSnijega(intenzitet: number): void {
    this.intenzitetSnijegaSource.next(intenzitet); 
  }
}
