let poruka = document.getElementById("poruka");

document.addEventListener("DOMContentLoaded", async () => {
    let pretraziButton = document.getElementById("pretrazi-button");

    pretraziButton.addEventListener("click", async () => {
        const query = dajFilter();
        if (query.length >= 3) {
            dajOsobe(1);
            if (poruka.innerHTML == "Unesite barem 3 znaka za pretragu!") {
                poruka.innerHTML = "";
            }
        } else {
            poruka.innerHTML = "Unesite barem 3 znaka za pretragu!";
        }
    });

    poruka = document.getElementById("poruka");
});

let currentPage = 1;
let totalPages = 1;

async function dajOsobe(stranica) {
    const query = dajFilter();
    const url = `/servis/osobe?query=${encodeURIComponent(query)}&stranica=${stranica}`;

    try {
        let odgovor = await fetch(url);

        if (odgovor.status === 200) {
            let podaci = await odgovor.json();
            totalPages = podaci.total_pages;
            currentPage = podaci.page;

            prikaziOsobe(podaci.results);
            prikaziStranicenje(currentPage, totalPages);
        } else {
            throw new Error(`Greška: ${odgovor.status}`);
        }
    } catch (error) {
        console.error("Greška prilikom dohvaćanja podataka:", error);
        poruka.innerHTML = "Došlo je do greške prilikom dohvaćanja podataka!";
    }
}

async function prikaziOsobe(osobe) {
    let glavna = document.getElementById("sadrzaj");
    let tablica = "<table>";
    tablica += "<tr><th>Ime</th><th>Poznat po</th><th>Popularnost</th><th>Profil</th><th>Radnje</th></tr>";

    for (let osoba of osobe) {
        const ime = osoba.name;
        const izvorPoznatosti = osoba.known_for_department || "N/A";
        const popularnost = osoba.popularity ? osoba.popularity.toFixed(2) : null;
        const profilPath = osoba.profile_path ? `https://image.tmdb.org/t/p/w200${osoba.profile_path}` : null;
        const osobaId = osoba.id;

        const postojiUBazi = await daLiOsobaPostojiUBazi(osobaId);

        tablica += "<tr>";
        tablica += `<td>${ime}</td>`;
        tablica += `<td>${izvorPoznatosti}</td>`;
        tablica += `<td>${popularnost || "N/A"}</td>`;
        tablica += `<td>${profilPath ? `<img src="${profilPath}" alt="${ime}" style="width: 50px;">` : "N/A"}</td>`;
        tablica += `<td>
                        ${
                            postojiUBazi
                                ? `<button onclick="brisiOsobu(${osobaId}, '${ime}')">Obriši</button>`
                                : `<button onclick="dodajOsobu(${osobaId}, '${ime}', '${izvorPoznatosti}', '${profilPath}', ${popularnost})">Dodaj</button>`
                        }
                    </td>`;
        tablica += "</tr>";
    }
    tablica += "</table>";

    glavna.innerHTML = tablica;
}


async function dodajOsobu(id, ime, izvor_poznatosti, putanja_profila, rang_popularnosti) {
    try {
        const url = `/servis/dodaj/osoba`;
        const body = JSON.stringify({
            id,
            ime_prezime: ime,
            izvor_poznatosti,
            putanja_profila,
            rang_popularnosti,
        });

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
        };

        const odgovor = await fetch(url, options);

        if (odgovor.ok) {
            alert(`Osoba "${ime}" je uspješno dodana.`);
            dajOsobe(currentPage);
        } else {
            const greska = await odgovor.json();
            throw new Error(greska.greska || `Greška: ${odgovor.status}`);
        }
    } catch (error) {
        console.error("Greška prilikom dodavanja osobe:", error);
        poruka.innerHTML = "Došlo je do greške prilikom dodavanja osobe!";
    }
}

async function brisiOsobu(id, ime) {
    try {
        const potvrda = confirm(`Jeste li sigurni da želite obrisati osobu "${ime}" iz baze?`);
        if (!potvrda) return;

        const url = `/servis/obrisi/osoba/${id}`;

        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        };

        const odgovor = await fetch(url, options);

        if (odgovor.ok) {
            alert(`Osoba "${ime}" i povezani filmovi su uspješno obrisani.`);
            dajOsobe(currentPage);
        } else {
            const greska = await odgovor.json();
            throw new Error(greska.greska || `Greška: ${odgovor.status}`);
        }
    } catch (error) {
        console.error("Greška prilikom brisanja osobe:", error);
        poruka.innerHTML = "Došlo je do greške prilikom brisanja osobe!";
    }
}

async function daLiOsobaPostojiUBazi(id) {
    const url = `/servis/provjera-postojanja/${id}`;
    try {
        const odgovor = await fetch(url, { method: "GET" });
        if (odgovor.status === 200) {
            return true; 
        }
        return false; 
    } catch (error) {
        console.error(`Greška prilikom provere osobe sa ID ${id}:`, error);
        return false;
    }
}


function prikaziStranicenje(trenutna, ukupno) {
    let navigacija = document.getElementById("stranicenje");
    navigacija.innerHTML = "";

    const infoStranice = document.createElement("p");
    infoStranice.textContent = `Stranica ${trenutna} od ${ukupno}`;
    infoStranice.style.textAlign = "center";
    navigacija.appendChild(infoStranice);

    const prvGumb = document.createElement("button");
    prvGumb.textContent = "Prva";
    prvGumb.disabled = trenutna === 1;
    prvGumb.onclick = () => dajOsobe(1);
    navigacija.appendChild(prvGumb);

    const prevGumb = document.createElement("button");
    prevGumb.textContent = "Prethodna";
    prevGumb.disabled = trenutna === 1;
    prevGumb.onclick = () => dajOsobe(trenutna - 1);
    navigacija.appendChild(prevGumb);

    const nextGumb = document.createElement("button");
    nextGumb.textContent = "Sljedeća";
    nextGumb.disabled = trenutna === ukupno;
    nextGumb.onclick = () => dajOsobe(trenutna + 1);
    navigacija.appendChild(nextGumb);

    const zadGumb = document.createElement("button");
    zadGumb.textContent = "Zadnja";
    zadGumb.disabled = trenutna === ukupno;
    zadGumb.onclick = () => dajOsobe(ukupno);
    navigacija.appendChild(zadGumb);
}

function dajFilter() {
    return document.getElementById("pretrazivanje").value;
}
