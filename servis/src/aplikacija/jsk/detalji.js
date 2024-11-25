document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split("/");
    const osobaId = pathParts[pathParts.length - 1]; 
    const detaljiContainer = document.querySelector("#detaljiOsobe");
    const galerijaContainer = document.querySelector("#galerija");
    const filmoviContainer = document.querySelector("#filmovi");
    const ucitajJosBtn = document.querySelector("#ucitajJos");

    let trenutnaStranicaFilmova = 1;

    try {
        const osobaResponse = await fetch(`/servis/osoba/${osobaId}`);
        if (!osobaResponse.ok) throw new Error("Greška prilikom dohvaćanja detalja osobe.");
        const osoba = await osobaResponse.json();

        detaljiContainer.innerHTML = `
            <img src="${osoba.putanja_profila || '/images/default-profile.png'}" alt="${osoba.name}">
            <h1>${osoba.ime_prezime}</h1>
            <p>Poznat po: ${osoba.izvor_poznatosti || "Nepoznato"}</p>
            <p>Popularnost: ${osoba.rang_popularnosti || "Nepoznato"}</p>
        `;

        osoba.slike.forEach(slika => {
            const img = document.createElement("img");
            img.src = slika.putanja_do_slike.startsWith("http") ? slika.putanja_do_slike : `https://image.tmdb.org/t/p/w200${slika.putanja_do_slike}`;
            galerijaContainer.appendChild(img);
        });

        async function ucitajFilmove() {
            const filmoviResponse = await fetch(`/servis/osoba/${osobaId}/film?stranica=${trenutnaStranicaFilmova}`);
            if (!filmoviResponse.ok) throw new Error("Greška prilikom dohvaćanja filmova.");
            const filmovi = await filmoviResponse.json();
            console.log(filmovi);
            
            filmovi.forEach(film => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${film.jezik || "Nepoznato"}</td>
                    <td><span title="${film.opis || "Nema opisa"}">${film.org_naslov || "Nepoznato"}</span></td>
                    <td>${film.naslov || "Nepoznato"}</td>
                    <td>${film.rang_popularnosti} || "Nepoznato"}</td>
                    <td>${film.putanja_postera? `<img src="https://image.tmdb.org/t/p/w92${film.putanja_postera}" alt="${film.naslov}">` : "N/A"}</td>
                    <td>${film.datum_izdavanja || "Nepoznato"}</td>
                    <td>${film.lik || "Nepoznato"}</td>
                `;
                filmoviContainer.appendChild(row);
            });

            
        }

        await ucitajFilmove();

        ucitajJosBtn.addEventListener("click", async () => {
            trenutnaStranicaFilmova++;
            await ucitajFilmove();
        });

    } catch (error) {
        console.error("Greška:", error);
        detaljiContainer.innerHTML = `<p>Došlo je do greške prilikom dohvaćanja podataka.</p>`;
    }
});
