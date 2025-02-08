document.addEventListener("DOMContentLoaded", async () => {
    const animeList = document.getElementById("anime-list");

    try {
        const response = await fetch("/anime");
        const animeData = await response.json();

        animeData.forEach(anime => {
            const card = document.createElement("div");
            card.className = "col-md-3";
            card.innerHTML = `
                <div class="card mb-4">
                    <img src="${anime.posterUrl}" class="card-img-top" alt="Anime Poster">
                    <div class="card-body text-center">
                        <a href="/discussion.html?anime_id=${anime.animeId}" class="btn btn-primary">Discuss</a>
                    </div>
                </div>
            `;
            animeList.appendChild(card);
        });
    } catch (error) {
        animeList.innerHTML = "<p class='text-danger'>Failed to load anime.</p>";
    }
});
