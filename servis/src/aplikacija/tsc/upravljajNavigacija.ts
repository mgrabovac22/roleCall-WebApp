import { Request, Response } from "express";

export class NavigacijaServis {
  async getNavigaciju(req: Request, res: Response) {
      try {
          const jeAdmin = req.session.tip_korisnika === 2; 
          const jeKorisnik = req.session.tip_korisnika === 1;

          let navigacija = [];

          if (jeAdmin) {
              navigacija = [
                  { naziv: "Početna", link: "/" },
                  { naziv: "Osobe", link: "/osobe" },
                  { naziv: "Dokumentacija", link: "/dokumentacija" },
                  { naziv: "Korisnici", link: "/korisnici" },
                  { naziv: "Dodavanje", link: "/dodavanje" },
                  { naziv: "Odjava", link: "/odjava" }
              ];
          } else if (jeKorisnik) {
              navigacija = [
                  { naziv: "Početna", link: "/" },
                  { naziv: "Osobe", link: "/osobe" },
                  { naziv: "Dokumentacija", link: "/dokumentacija" },
                  { naziv: "Odjava", link: "/odjava" }
              ];
          } else {
              navigacija = [
                  { naziv: "Login", link: "/login" },
                  { naziv: "Dokumentacija", link: "/dokumentacija" }
              ];
          }

          res.status(200).json({ navigacija });
      } catch (error) {
          console.error("Greška prilikom dohvaćanja navigacije:", error);
          res.status(500).json({ greska: "Interna greška servera." });
      }
  }
}

