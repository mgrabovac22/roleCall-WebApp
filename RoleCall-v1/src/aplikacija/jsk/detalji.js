document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split("/");
    const osobaId = pathParts[pathParts.length - 1];
    const detaljiContainer = document.querySelector("#detaljiOsobe");
    const galerijaContainer = document.querySelector("#galerija");
    const filmoviContainer = document.querySelector("#filmovi");
    const ucitajJosBtn = document.querySelector("#ucitajJos");
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

    let trenutnaStranicaFilmova = 1; 
    let dodatnaStranicaFilmova = 1; 
    let bazaFilmoviGotova = false;

    try {
        const osobaResponse = await fetch(`/servis/osoba/${osobaId}`);
        if (!osobaResponse.ok) throw new Error("Greška prilikom dohvaćanja detalja osobe.");
        const osoba = await osobaResponse.json();

        detaljiContainer.innerHTML = `
            <img src="${osoba.putanja_profila || '/images/default-profile.png'}" alt="${osoba.ime_prezime}">
            <h1>${osoba.ime_prezime}</h1>
            <p>Poznat po: ${osoba.izvor_poznatosti || "Nepoznato"}</p>
            <p>Popularnost: ${osoba.rang_popularnosti || "Nepoznato"}</p>
        `;

        osoba.slike.forEach(slika => {
            const img = document.createElement("img");
            img.src = slika.putanja_do_slike.startsWith("http") ? slika.putanja_do_slike : `https://image.tmdb.org/t/p/w200${slika.putanja_do_slike}`;
            galerijaContainer.appendChild(img);
        });

        async function ucitajFilmoveIzBaze() {
            const filmoviResponse = await fetch(`/servis/osoba/${osobaId}/film?stranica=${trenutnaStranicaFilmova}`);
            if (!filmoviResponse.ok) throw new Error("Greška prilikom dohvaćanja filmova iz baze.");
            const filmovi = await filmoviResponse.json();

            filmovi.forEach(film => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${film.jezik || "Nepoznato"}</td>
                    <td><span title="${film.opis || "Nema opisa"}">${film.org_naslov || "Nepoznato"}</span></td>
                    <td>${film.naslov || "Nepoznato"}</td>
                    <td>${film.rang_popularnosti || "Nepoznato"}</td>
                    <td>${film.putanja_postera ? `<img src="https://image.tmdb.org/t/p/w92${film.putanja_postera}" alt="${film.naslov}">` : "N/A"}</td>
                    <td>${film.datum_izdavanja || "Nepoznato"}</td>
                    <td>${film.lik || "Nepoznato"}</td>
                `;
                filmoviContainer.appendChild(row);
            });

            if (filmovi.length < 20) {
                bazaFilmoviGotova = true; 
            }
        }

        async function ucitajFilmoveSaTMDB() {
            const filmoviResponse = await fetch(`/servis/osoba/${osobaId}/filmOd21?stranica=${dodatnaStranicaFilmova}`);
            if (!filmoviResponse.ok) throw new Error("Greška prilikom dohvaćanja dodatnih filmova.");
            const filmovi = await filmoviResponse.json();
            
            filmovi.filmovi.forEach(film => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${film.original_language || "Nepoznato"}</td>
                    <td><span title="${film.overview || "Nema opisa"}">${film.original_title || "Nepoznato"}</span></td>
                    <td>${film.title || "Nepoznato"}</td>
                    <td>${film.popularity?.toFixed(2) || "Nepoznato"}</td>
                    <td>${film.poster_path ? `<img src="https://image.tmdb.org/t/p/w92${film.poster_path}" alt="${film.title}">` : "N/A"}</td>
                    <td>${film.release_date || "Nepoznato"}</td>
                    <td>${film.character || "Nepoznato"}</td>
                `;
                filmoviContainer.appendChild(row);
            });

            if (filmovi.length < 20) {
                ucitajJosBtn.disabled = true; 
            }
        }

        await ucitajFilmoveIzBaze();

        ucitajJosBtn.addEventListener("click", async () => {
            if (!bazaFilmoviGotova) {
                trenutnaStranicaFilmova++;
                await ucitajFilmoveIzBaze();
            } else {
                dodatnaStranicaFilmova++;
                await ucitajFilmoveSaTMDB();
            }
        });
    } catch (error) {
        console.error("Greška:", error);
        detaljiContainer.innerHTML = `<p>Došlo je do greške prilikom dohvaćanja podataka.</p>`;
    }
});
