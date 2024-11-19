import dsPromise from "fs/promises";

type tipKonf = {
	jwtValjanost: string;
	jwtTajniKljuc: string;
	tajniKljucSesija: string;
	tmdbApiKeyV3: string;
	tmdbApiKeyV4: string;
};

export class Konfiguracija {
	private konf: tipKonf;
	constructor() {
		this.konf = this.initKonf();
	}

	private initKonf() {
		return {
			jwtTajniKljuc: "",
			jwtValjanost: "",
			tajniKljucSesija: "",
			tmdbApiKeyV3: "",
			tmdbApiKeyV4: "",
		};
	}

	public dajKonf() {
		return this.konf;
	}

	public async ucitajKonfiguraciju() {
		console.log(this.konf);

		if (process.argv[2] == undefined)
			throw new Error("Nedostaje putanja do konfiguracijske datoteke!");
		let putanja: string = process.argv[2];

		var podaci: string = await dsPromise.readFile(putanja, {
			encoding: "utf-8",
		});
		this.pretvoriJSONkonfig(podaci);
		console.log(this.konf);
		this.provjeriPodatkeKonfiguracije();
	}

	private pretvoriJSONkonfig(podaci: string) {
		console.log(podaci);
		let konf: { [kljuc: string]: string } = {};
		var nizPodataka = podaci.split("\n");
		for (let podatak of nizPodataka) {
			var podatakNiz = podatak.split("#");
			var naziv = podatakNiz[0];
			if (typeof naziv != "string" || naziv == "") continue;
			var vrijednost: string = podatakNiz[1] ?? "";
			konf[naziv] = vrijednost;
		}

		this.konf = konf as tipKonf;
	}

	private provjeriPodatkeKonfiguracije() {
		if (
			this.konf.tmdbApiKeyV3 == undefined ||
			this.konf.tmdbApiKeyV3.trim() == ""
		) {
			throw new Error("Fali TMDB API kljuc u tmdbApiKeyV3");
		}

		if (
			this.konf.jwtValjanost == undefined ||
			this.konf.jwtValjanost.trim() == ""
		) {
			throw new Error("Fali JWT valjanost");
		}

		if (
			this.konf.jwtTajniKljuc == undefined ||
			this.konf.jwtTajniKljuc.trim() == ""
		) {
			throw new Error("Fali JWT tajni kljuc");
		}

		if (
			this.konf.tajniKljucSesija == undefined ||
			this.konf.tajniKljucSesija.trim() == ""
		) {
			throw new Error("Fali tajni kljuc sesije");
		}

		if (
			this.konf.tmdbApiKeyV4 == undefined ||
			this.konf.tmdbApiKeyV4.trim() == ""
		) {
			throw new Error("Fali TMDB API kljuc u tmdbApiKeyV4");
		}

		if (
			isNaN(parseInt(this.konf.jwtValjanost)) || 
			parseInt(this.konf.jwtValjanost) < 15 || 
			parseInt(this.konf.jwtValjanost) > 300
		) {
			throw new Error("Ne valja duljina jwtValjanosti");
		}
		

		if (
			this.konf.jwtTajniKljuc.length < 100 ||
			this.konf.jwtTajniKljuc.length > 200 ||
			!/^[a-z0-9!%$]+$/.test(this.konf.jwtTajniKljuc)
		) {
			throw new Error("Ne valja format jwtTajnogKljuca");
		}

		if (
			this.konf.tajniKljucSesija.length < 100 ||
			this.konf.tajniKljucSesija.length > 200 ||
			!/^[a-z0-9!%$]+$/.test(this.konf.jwtTajniKljuc)
		) {
			throw new Error("Ne valja format jwtTajnogKljuca");
		}
		


	}
}
