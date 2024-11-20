export interface Korisnici {
    id: number; 
    naziv: string; 
  }

  export interface Korisnik {
    id: number;
    korime: string; 
    status: string; 
    korisnici_id: number; 
  }
  
  