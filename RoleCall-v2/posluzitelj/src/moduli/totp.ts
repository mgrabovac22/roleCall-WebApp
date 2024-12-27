import { TOTP } from "totp-generator";
import { kreirajSHA256, dajNasumceBroj, hexToUint8Array } from "./generatori.js";
import base32 from "base32-encoding";

export function kreirajTajniKljuc (korime:string) {
  let tekst = korime + new Date() + dajNasumceBroj(10000000, 90000000);
  let hash = hexToUint8Array(kreirajSHA256(tekst));
  let tajniKljuc = base32.stringify(hash, "ABCDEFGHIJKLMNOPRSTQRYWXZ234567");
  return tajniKljuc.toUpperCase();
}

export function provjeriTOTP (uneseniKod:string, tajniKljuc:string) {
  const kod = TOTP.generate(tajniKljuc, {
    digits: 6,
    algorithm: "SHA-512",
    period: 60
  });
  console.log(uneseniKod+"="+kod.otp);
  if (uneseniKod == kod.otp)
    return true;

  return false;
}
