import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-neovlasten-pristup',
  standalone: false,
  
  templateUrl: './neovlasten-pristup.component.html',
  styleUrl: './neovlasten-pristup.component.scss'
})
export class NeovlastenPristupComponent implements OnInit {

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];
  
  constructor(private router: Router){}
  ngOnInit(): void {
    this.generateSnowflakes();
  }

  goBack(){
    this.router.navigate(['/login']);
  }

  private generateSnowflakes() {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }
}
