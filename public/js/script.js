document.addEventListener("DOMContentLoaded", async () => {
  const animeList = document.getElementById("animeList");
  const response = await fetch("/anime");
  const anime = await response.json();

  anime.forEach(({ animeId, posterUrl }) => {
    const col = document.createElement("div");
    col.classList.add("col-md-3", "mb-4");
    col.innerHTML = `
      <div class="card">
        <img src="${posterUrl}" class="card-img-top" alt="${animeId}">
        <div class="card-body text-center">
          <a href="/discussion.html?animeId=${animeId}" class="btn btn-primary">Discuss</a>
        </div>
      </div>
    `;
    animeList.appendChild(col);
  });
});
