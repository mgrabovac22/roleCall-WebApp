document.addEventListener("DOMContentLoaded", async () => {
    const navElement = document.getElementById("navigacija");

    nav();

    async function nav() {
        const response = await fetch("/servis/navigacija");
        if (!response.ok) {
            throw new Error("Greška prilikom dohvaćanja navigacije.");
        }

        const data = await response.json();

        let navigationHTML = data.navigacija
            .map((item) => `<a href="${item.link}">${item.naziv}</a>`)
            .join("");

        navElement.innerHTML = navigationHTML;
    }
    dajKorisnike();
});

async function dajKorisnike() {
    const url = "/servis/korisnici";

    try {
        const odgovor = await fetch(url);

        if (odgovor.status === 200) {
            const korisnici = await odgovor.json();

            const trenutniKorisnik = await dohvatiTrenutnogKorisnika();

            const filtriraniKorisnici = korisnici.filter(
                (korisnik) => korisnik.korime !== trenutniKorisnik.korime
            );

            prikaziKorisnike(filtriraniKorisnici);
        } else {
            throw new Error(`Greška: ${odgovor.status}`);
        }
    } catch (error) {
        console.error("Greška prilikom dohvaćanja korisnika:", error);
        poruka1.innerHTML = "Došlo je do greške prilikom dohvaćanja korisnika!";
    }
}

async function dohvatiTrenutnogKorisnika() {
    const url = "/servis/korisnici/trenutni"; 

    try {
        const odgovor = await fetch(url);
        if (odgovor.ok) {
            return await odgovor.json();
        } else {
            throw new Error("Greška prilikom dohvaćanja trenutnog korisnika");
        }
    } catch (error) {
        console.error("Greška prilikom dohvaćanja trenutnog korisnika:", error);
        return null;
    }
}

function prikaziKorisnike(korisnici) {
    let glavna = document.getElementById("sadrzaj");
    let tablica = "<table>";
    tablica += "<tr><th>Korisničko ime</th><th>Email</th><th>Status</th><th>Radnje</th></tr>";

    for (let korisnik of korisnici) {
        const status = korisnik.status;

        tablica += "<tr>";
        tablica += `<td>${korisnik.korime}</td>`;
        tablica += `<td>${korisnik.email}</td>`;
        tablica += `<td>${status}</td>`;
        tablica += `<td>
            ${
                status === "pending"
                    ? `<button onclick="dajPristup(${korisnik.id})">Daj pristup</button>`
                    : status === "ima pristup"
                    ? `<button onclick="zabraniPristup(${korisnik.id})">Zabrani pristup</button>`
                    : "Nema dostupnih radnji"
            }
        </td>`;
        tablica += "</tr>";
    }
    tablica += "</table>";

    glavna.innerHTML = tablica;
}

async function dajPristup(id) {
    try {
        const urlPristup = `/servis/korisnici/${id}/pristup`;
        const optionsPristup = {
            method: "PUT",
        };

        const odgovorPristup = await fetch(urlPristup, optionsPristup);

        if (!odgovorPristup.ok) {
            const greska = await odgovorPristup.json();
            throw new Error(greska.greska || `Greška prilikom omogućavanja pristupa: ${odgovorPristup.status}`);
        }

        const urlDohvatiKorisnika = `/servis/korisnici/${id}`;
        const odgovorDohvatiKorisnika = await fetch(urlDohvatiKorisnika);

        if (!odgovorDohvatiKorisnika.ok) {
            const greska = await odgovorDohvatiKorisnika.json();
            throw new Error(greska.greska || `Greška prilikom dohvaćanja korisnika: ${odgovorDohvatiKorisnika.status}`);
        }

        const korisnik = await odgovorDohvatiKorisnika.json();

        const urlDodajKorisnika = `/servis/korisnici/rest`;
        const optionsDodajKorisnika = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                korime: korisnik.korime,
                status: "ima pristup",
                tip_korisnika_id: korisnik.tip_korisnika_id,
            }),
        };

        const odgovorDodajKorisnika = await fetch(urlDodajKorisnika, optionsDodajKorisnika);

        if (!odgovorDodajKorisnika.ok) {
            const greska = await odgovorDodajKorisnika.json();
            throw new Error(greska.greska || `Greška prilikom dodavanja korisnika: ${odgovorDodajKorisnika.status}`);
        }

        alert("Pristup je omogućen korisniku i korisnik je dodan u bazu.");
        dajKorisnike(); 
    } catch (error) {
        console.error("Greška prilikom dodavanja pristupa korisniku:", error);
        poruka1.innerHTML = "Došlo je do greške prilikom dodavanja pristupa korisniku!";
    }
}


async function zabraniPristup(id) {
    try {
        const potvrda = confirm("Jeste li sigurni da želite zabraniti pristup korisniku?");
        if (!potvrda) return;

        const url = `/servis/korisnici/${id}/zabrani-pristup`;
        const options = {
            method: "PUT",
        };

        const odgovor = await fetch(url, options);

        if (odgovor.ok) {
            alert("Pristup je zabranjen korisniku.");
            dajKorisnike(); 
        } else {
            const greska = await odgovor.json();
            throw new Error(greska.greska || `Greška: ${odgovor.status}`);
        }
    } catch (error) {
        console.error("Greška prilikom zabrane pristupa korisniku:", error);
        poruka1.innerHTML = "Došlo je do greške prilikom zabrane pristupa korisniku!";
    }
}

