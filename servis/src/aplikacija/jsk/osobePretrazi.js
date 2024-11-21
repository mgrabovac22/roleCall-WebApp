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
    const apiKey = "1280aa15ece9584768dd84dd4aa3d294";
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
        tablica += "<tr>";
        tablica += `<td>${osoba.name}</td>`;
        tablica += `<td>${osoba.known_for_department || "N/A"}</td>`;
        tablica += `<td>${osoba.popularity ? osoba.popularity.toFixed(2) : "N/A"}</td>`;
        tablica += `<td>${osoba.profile_path ? `<img src="https://image.tmdb.org/t/p/w200${osoba.profile_path}" alt="${osoba.name}" style="width: 50px;">` : "N/A"}</td>`;
        tablica += `<td>
                        <button onclick="dodajOsobu(${osoba.id}, '${osoba.name}')">Dodaj</button>
                        <button onclick="brisiOsobu(${osoba.id}, '${osoba.name}')">Briši</button>
                    </td>`;
        tablica += "</tr>";
    }
    tablica += "</table>";

    glavna.innerHTML = tablica;
}

async function dodajOsobu(id, ime) {
    try {
        const url = `/servis/osoba/${id}`;
        const body = JSON.stringify({ id, ime });

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
        };

        const odgovor = await fetch(url, options);

        if (odgovor.ok) {
            alert(`Osoba "${ime}" je dodana u bazu.`);
            dajOsobe(currentPage);
        } else {
            throw new Error(`Greška: ${odgovor.status}`);
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

        const url = `/servis/osoba/${id}`;

        const options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        };

        const odgovor = await fetch(url, options);

        if (odgovor.ok) {
            alert(`Osoba "${ime}" je obrisana iz baze.`);
            dajOsobe(currentPage);
        } else {
            throw new Error(`Greška: ${odgovor.status}`);
        }
    } catch (error) {
        console.error("Greška prilikom brisanja osobe:", error);
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
