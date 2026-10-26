// about.js — the playlist card on the About page. Spotify's player (and its cookies) loads only when someone
// presses "Listen here"; until then the card is a local image and a button, so the page stays light.

(() => {
  const card = document.querySelector("[data-spotify]");
  const btn = card?.querySelector("[data-spotify-play]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.className = "tune__frame";
    frame.src = `https://open.spotify.com/embed/playlist/${card.dataset.spotify}?utm_source=generator&theme=0`;
    frame.title = "Spotify player: krishyeah playlist";
    frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    card.replaceWith(frame);
    frame.focus(); // the button is gone, so keyboard users continue from the player rather than the top of the page
  });
})();
