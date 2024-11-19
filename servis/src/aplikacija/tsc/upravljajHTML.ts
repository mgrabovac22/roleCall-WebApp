import { __dirname } from "../../moduli/okolinaUtils";
//import ds from "fs/promises";
//import { ServisKlijent } from "./korisnikServis";
import { Session } from "express-session";

export interface RWASession extends Session {
  korisnik: any;
  korime: string;
}

export class HtmlUpravitelj {
  private tajniKljucJWT: string;
  //private servisKlijent: ServisKlijent;
  //private portRest: number;

  constructor(tajniKljucJWT: string, portRest: number) {
    this.tajniKljucJWT = tajniKljucJWT;
    console.log(this.tajniKljucJWT);
    //this.servisKlijent = new ServisKlijent(portRest);
    //this.portRest = portRest;
  }
}
