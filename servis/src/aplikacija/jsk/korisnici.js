let poruka1 = document.getElementById("poruka");

document.addEventListener("DOMContentLoaded", async () => {
    dajKorisnike();
});

async function dajKorisnike() {
    const url = "/servis/korisnici";

    try {
        let odgovor = await fetch(url);

        if (odgovor.status === 200) {
            let korisnici = await odgovor.json();
            prikaziKorisnike(korisnici);
        } else {
            throw new Error(`Greška: ${odgovor.status}`);
        }
    } catch (error) {
        console.error("Greška prilikom dohvaćanja korisnika:", error);
        poruka1.innerHTML = "Došlo je do greške prilikom dohvaćanja korisnika!";
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
        const url = `/servis/korisnici/${id}/pristup`;
        const options = {
            method: "PUT",
        };

        const odgovor = await fetch(url, options);

        if (odgovor.ok) {
            alert("Pristup je omogućen korisniku.");
            dajKorisnike(); 
        } else {
            const greska = await odgovor.json();
            throw new Error(greska.greska || `Greška: ${odgovor.status}`);
        }
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
