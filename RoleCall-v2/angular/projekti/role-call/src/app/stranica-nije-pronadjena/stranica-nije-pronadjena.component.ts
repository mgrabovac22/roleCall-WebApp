import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stranica-nije-pronadjena',
  standalone: false,
  
  templateUrl: './stranica-nije-pronadjena.component.html',
  styleUrl: './stranica-nije-pronadjena.component.scss'
})
export class StranicaNijePronadjenaComponent {
  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];
  
  constructor(private router: Router){}
  ngOnInit(): void {
    this.generateSnowflakes();
  }

  goBack(){
    this.router.navigate(['/']);
  }

  private generateSnowflakes() {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }
}
