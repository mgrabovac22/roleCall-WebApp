let poruka = document.getElementById("poruka");

document.addEventListener("DOMContentLoaded", async () => {
    let pretraziButton = document.getElementById("pretrazi-button");

    pretraziButton.addEventListener("click", async () => {
        const query = dajFilter();
        if (query.length >= 3) {
            dajOsobe(1);
            if(poruka.innerHTML == "Unesite barem 3 znaka za pretragu!"){
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
    const response = await fetch("/servis/apikey");
    const data = await response.json();
    const apiKey = data.apiKey;
    const url = `https://api.themoviedb.org/3/search/person?include_adult=false&language=en-US&page=${stranica}&query=${encodeURIComponent(query)}&api_key=${apiKey}`;

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

function prikaziOsobe(osobe) {
    let glavna = document.getElementById("sadrzaj");
    let tablica = "<table>";
    tablica += "<tr><th>Ime</th><th>Poznat po</th><th>Popularnost</th><th>Profil</th><th>Radnje</th></tr>";

    for (let osoba of osobe) {
        const ime = osoba.name;
        const izvorPoznatosti = osoba.known_for_department || "N/A";
        const popularnost = osoba.popularity ? osoba.popularity.toFixed(2) : null;
        const profilPath = osoba.profile_path ? `https://image.tmdb.org/t/p/w200${osoba.profile_path}` : null;

        tablica += "<tr>";
        tablica += `<td>${ime}</td>`;
        tablica += `<td>${izvorPoznatosti}</td>`;
        tablica += `<td>${popularnost || "N/A"}</td>`;
        tablica += `<td>${profilPath ? `<img src="${profilPath}" alt="${ime}" style="width: 50px;">` : "N/A"}</td>`;
        tablica += `<td>
                        <button onclick="dodajOsobu(${osoba.id}, '${ime}', '${izvorPoznatosti}', '${profilPath}', ${popularnost})">Dodaj</button>
                        <button onclick="brisiOsobu(${osoba.id}, '${ime}')">Briši</button>
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

        const url = `/servis/dodaj/osoba`;

        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        };

        const odgovor = await fetch(url, options);

        if (odgovor.ok) {
            alert(`Osoba "${ime}" je uspješno obrisana.`);
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
