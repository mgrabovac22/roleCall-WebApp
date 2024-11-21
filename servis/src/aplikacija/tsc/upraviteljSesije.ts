/*import { Request, Response, NextFunction } from "express";
import session from "express-session";
import { Konfiguracija } from "../../moduli/upravljateljKonfiguracije";

const konfiguracija = new Konfiguracija();
let konf = konfiguracija.dajKonf();
declare module "express-session" {
  interface SessionData {
    user: { id: number; korime: string } | null;
  }
}

const sessionMiddleware = session({
  secret: konf.tajniKljucSesija, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
});

const sessionValidation = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
        res.status(401).json({ error: "Unauthorized" });
        return; 
    }
    next(); 
};
  

export { sessionMiddleware, sessionValidation };*/
