import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import { Konfiguracija } from "./upravljateljKonfiguracije.js";


const konfiguracija = new Konfiguracija();
await konfiguracija.ucitajKonfiguraciju();

export function kreirajToken(korisnik:{korime:string}, tajniKljucJWT:string){
	let token = jwt.sign({ korime: korisnik.korime }, tajniKljucJWT, { expiresIn: `${konfiguracija.dajKonf().jwtValjanost}s` });
	//console.log(token);
  return token;
}

export function provjeriToken(zahtjev:Request, tajniKljucJWT:string) {
  	//console.log("Provjera tokena: "+zahtjev.headers.authorization);
    if (zahtjev.headers.authorization != null) {
        //console.log(zahtjev.headers.authorization);
        let token = zahtjev.headers.authorization.split(" ")[1] ?? "";
        //console.log(token)
        try {
            let podaci = jwt.verify(token, tajniKljucJWT);
            //console.log("JWT podaci: "+podaci);
            return podaci;
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    return false;
}

export function jwtMiddleware() {
  return (req: Request, res: Response, next: NextFunction): any => {
      const token = req.headers['authorization']; 

      if (!token) {
          return res.status(401).json({ greska: "Token nije dostavljen." }); 
      }

      try {
          const tokenValidan = provjeriToken(req, konfiguracija.dajKonf().jwtTajniKljuc);
          if (!tokenValidan) {
              return res.status(406).json({ greska: "Nevažeći token" });
          }

          next();  
      } catch (err) {
          return res.status(422).json({ greska: "Token je istekao." });  
      }
  };
}

export function dajToken(zahtjev:Request) {
  return zahtjev.headers.authorization;
}

export function ispisiDijelove(token:string){
	let dijelovi = token.split(".");
  if(dijelovi[0] != undefined){
	  let zaglavlje =  dekodirajBase64(dijelovi[0]);
	  console.log(zaglavlje);
  }
  if(dijelovi[1] != undefined){
	  let tijelo =  dekodirajBase64(dijelovi[1]);
	  console.log(tijelo);
  }
  if(dijelovi[2] != undefined){
	  let potpis =  dekodirajBase64(dijelovi[2]);
	  console.log(potpis);
  }
}

export function dajTijelo(token:string){
	let dijelovi = token.split(".");
  if(dijelovi[1] == undefined)
    return {};
	return JSON.parse(dekodirajBase64(dijelovi[1]));
}

export function dajZaglavlje(token:string){
	let dijelovi = token.split(".");
  if(dijelovi[1] == undefined)
    return {};
	return JSON.parse(dekodirajBase64(dijelovi[1]));
}

function dekodirajBase64(data:string){
	let buff = Buffer.from(data, 'base64');
	return buff.toString('ascii');
}
