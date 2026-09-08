/* Les grelots · Kirble — player Spotify-like, vanilla JS. */
(() => {
  "use strict";

  const CONFIG = {
    title: "Les grelots",
    artist: "Kirble",
    context: "Recherches récentes",
    bio: "Léa Texier écrit. Et comme elle est très amoureuse, elle a écrit une chanson.",
    artworkSmall: "assets/cover-512.webp",
    artworkLarge: "assets/cover.webp",
  };

  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  const btnPlay = $("btn-play");
  const progress = $("progress");
  const fill = $("fill");
  const thumb = $("thumb");
  const tElapsed = $("t-elapsed");
  const tRemaining = $("t-remaining");
  const toastEl = $("toast");

  // ---------- Textes depuis CONFIG ----------
  $("track-title").textContent = CONFIG.title;
  $("track-artist").textContent = CONFIG.artist;
  $("context-label").textContent = CONFIG.context;
  $("sheet-artist").textContent = CONFIG.artist;
  $("about-name").textContent = CONFIG.artist;
  $("about-bio").textContent = CONFIG.bio;
  document.title = `${CONFIG.title} · ${CONFIG.artist}`;

  // ---------- Utilitaires ----------
  const fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("on"), 1800);
  };

  // ---------- Lecture ----------
  let duration = 0;
  let scrubbing = false;

  const renderTime = (t) => {
    const d = duration || audio.duration || 0;
    const p = d ? Math.min(1, t / d) : 0;
    fill.style.width = `${p * 100}%`;
    thumb.style.left = `${p * 100}%`;
    progress.setAttribute("aria-valuenow", Math.round(p * 100));
    tElapsed.textContent = fmt(t);
    tRemaining.textContent = `-${fmt(Math.max(0, d - t))}`;
  };

  audio.addEventListener("loadedmetadata", () => {
    duration = audio.duration;
    renderTime(audio.currentTime);
  });
  audio.addEventListener("durationchange", () => { duration = audio.duration; renderTime(audio.currentTime); });
  audio.addEventListener("timeupdate", () => { if (!scrubbing) renderTime(audio.currentTime); });
  audio.addEventListener("play", () => {
    btnPlay.classList.add("is-playing");
    btnPlay.setAttribute("aria-label", "Pause");
    progress.classList.add("playing");
    setPlaybackState("playing");
  });
  audio.addEventListener("pause", () => {
    btnPlay.classList.remove("is-playing");
    btnPlay.setAttribute("aria-label", "Lecture");
    progress.classList.remove("playing");
    setPlaybackState("paused");
  });
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    renderTime(0);
  });

  const play = () => {
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  };
  const toggle = () => (audio.paused ? play() : audio.pause());
  btnPlay.addEventListener("click", toggle);

  $("btn-prev").addEventListener("click", () => { audio.currentTime = 0; renderTime(0); });
  $("btn-next").addEventListener("click", () => { audio.currentTime = 0; renderTime(0); if (audio.paused) play(); });

  // Barre de progression : tap + drag
  const seekFromEvent = (e) => {
    const r = progress.querySelector(".track").getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const d = duration || audio.duration || 0;
    renderTime(p * d);
    return p * d;
  };
  progress.addEventListener("pointerdown", (e) => {
    scrubbing = true;
    progress.classList.add("scrubbing");
    progress.setPointerCapture(e.pointerId);
    seekFromEvent(e);
  });
  progress.addEventListener("pointermove", (e) => { if (scrubbing) seekFromEvent(e); });
  const endScrub = (e) => {
    if (!scrubbing) return;
    scrubbing = false;
    progress.classList.remove("scrubbing");
    const t = seekFromEvent(e);
    if (isFinite(t)) audio.currentTime = t;
  };
  progress.addEventListener("pointerup", endScrub);
  progress.addEventListener("pointercancel", endScrub);

  // Clavier (desktop)
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    if (e.code === "ArrowRight") audio.currentTime = Math.min(duration, audio.currentTime + 5);
    if (e.code === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
  });

  // ---------- Boutons décoratifs ----------
  const btnLike = $("btn-like");
  btnLike.addEventListener("click", () => {
    const liked = btnLike.dataset.liked !== "true";
    btnLike.dataset.liked = String(liked);
    btnLike.setAttribute("aria-label", liked ? "Retirer de Titres likés" : "Ajouter à Titres likés");
    toast(liked ? "Ajouté à Titres likés" : "Retiré de Titres likés");
  });
  const btnShuffle = $("btn-shuffle");
  btnShuffle.addEventListener("click", () => {
    const on = btnShuffle.dataset.on !== "true";
    btnShuffle.dataset.on = String(on);
    toast(on ? "Lecture aléatoire intelligente activée" : "Lecture aléatoire désactivée");
  });
  $("btn-timer").addEventListener("click", () => toast("Minuteur de veille"));
  $("btn-devices").addEventListener("click", () => toast("Cet iPhone"));
  $("btn-queue").addEventListener("click", () => toast("File d'attente"));
  $("btn-more").addEventListener("click", () => toast(`${CONFIG.title} · ${CONFIG.artist}`));
  $("btn-collapse").addEventListener("click", () => { if (sheet.classList.contains("open")) closeSheet(); });
  $("btn-share").addEventListener("click", async () => {
    const data = { title: `${CONFIG.title} · ${CONFIG.artist}`, text: `${CONFIG.artist} — ${CONFIG.title}`, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(location.href); toast("Lien copié"); }
    } catch (_) { /* annulé */ }
  });
  const btnFollow = $("btn-follow");
  btnFollow.addEventListener("click", () => {
    const on = btnFollow.dataset.on !== "true";
    btnFollow.dataset.on = String(on);
    btnFollow.textContent = on ? "Abonné(e)" : "Suivre";
    toast(on ? `Vous suivez ${CONFIG.artist}` : `Vous ne suivez plus ${CONFIG.artist}`);
  });

  // ---------- Tiroir « Découvrez » ----------
  const sheet = $("sheet");
  const handle = $("sheet-handle");
  const body = $("sheet-body");
  const scrim = $("scrim");

  const openSheet = () => { sheet.classList.add("open"); scrim.classList.add("on"); };
  const closeSheet = () => { sheet.classList.remove("open"); scrim.classList.remove("on"); body.scrollTop = 0; };
  scrim.addEventListener("click", closeSheet);

  // Glisser-déposer : le tiroir suit le doigt, puis s'aimante.
  let drag = null;
  const closedY = () => sheet.getBoundingClientRect().height - handle.getBoundingClientRect().height
                        - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sab") || 0);
  const startDrag = (e, fromBody) => {
    if (fromBody && (!sheet.classList.contains("open") || body.scrollTop > 0)) return;
    const isOpen = sheet.classList.contains("open");
    drag = { y0: e.clientY, t0: performance.now(), base: isOpen ? 0 : closedY(), isOpen, moved: false, lastY: e.clientY, lastT: performance.now(), vy: 0 };
    sheet.classList.add("dragging");
    (fromBody ? body : handle).setPointerCapture(e.pointerId);
  };
  const moveDrag = (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y0;
    if (Math.abs(dy) > 4) drag.moved = true;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    drag.vy = (e.clientY - drag.lastY) / dt; // px/ms
    drag.lastY = e.clientY; drag.lastT = now;
    const y = Math.min(closedY(), Math.max(0, drag.base + dy));
    sheet.style.transform = `translateY(${y}px)`;
    scrim.style.opacity = String(1 - y / closedY());
    scrim.style.pointerEvents = "auto";
  };
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null;
    sheet.classList.remove("dragging");
    sheet.style.transform = ""; scrim.style.opacity = ""; scrim.style.pointerEvents = "";
    if (!d.moved) { d.isOpen ? closeSheet() : openSheet(); return; }
    const y = d.base + (d.lastY - d.y0);
    const flickUp = d.vy < -0.35, flickDown = d.vy > 0.35;
    if (flickUp) openSheet();
    else if (flickDown) closeSheet();
    else (y < closedY() / 2 ? openSheet : closeSheet)();
  };
  handle.addEventListener("pointerdown", (e) => startDrag(e, false));
  handle.addEventListener("pointermove", moveDrag);
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
  // Tirer vers le bas depuis le haut du contenu ferme aussi le tiroir.
  body.addEventListener("pointerdown", (e) => { if (body.scrollTop <= 0 && e.pointerType !== "mouse") startDrag(e, true); });
  body.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (e.clientY - drag.y0 < 0) { endDrag(); return; } // remonte : on laisse scroller
    moveDrag(e);
  });
  body.addEventListener("pointerup", endDrag);
  body.addEventListener("pointercancel", endDrag);

  // ---------- Media Session (écran verrouillé, AirPods) ----------
  const setPlaybackState = (s) => { if ("mediaSession" in navigator) try { navigator.mediaSession.playbackState = s; } catch (_) {} };
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: CONFIG.title,
      artist: CONFIG.artist,
      album: CONFIG.title,
      artwork: [
        { src: CONFIG.artworkSmall, sizes: "512x512", type: "image/webp" },
        { src: CONFIG.artworkLarge, sizes: "1000x1000", type: "image/webp" },
        { src: "assets/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    });
    const on = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (_) {} };
    on("play", play);
    on("pause", () => audio.pause());
    on("previoustrack", () => { audio.currentTime = 0; });
    on("nexttrack", () => { audio.currentTime = 0; });
    on("seekto", (d) => { if (d.seekTime != null) audio.currentTime = d.seekTime; });
    on("seekbackward", (d) => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
    on("seekforward", (d) => { audio.currentTime = Math.min(duration, audio.currentTime + (d.seekOffset || 10)); });
  }

  renderTime(0);
})();
