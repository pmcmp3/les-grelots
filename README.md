# Les grelots · Kirble — player

Page unique, sans framework, qui imite l'écran « En cours de lecture » de Spotify pour faire
écouter *Les grelots* de Kirble. Hébergée sur GitHub Pages.

- `index.html` / `style.css` / `app.js` — la page, le style, le player.
- `assets/les-grelots.mp3` — le morceau (160 kbps, tiré du master WAV).
- `assets/cover.webp`, `assets/artist.webp` — pochette et photo (WebP).
- `fonts/` — Spotify Mix (Regular, Medium, Bold, Extrabold) en woff2.

Pour changer le titre, l'artiste, la bio ou l'étiquette en haut : `CONFIG` au début de `app.js`.

Le tiroir « Découvrez Kirble » se tire vers le haut (ou un tap) : photo, bio, bouton Suivre.
Le bouton Play lance vraiment le son ; la barre se déplace au doigt ; l'écran verrouillé de
l'iPhone affiche la pochette (Media Session).

Le fichier peut être « ajouté à l'écran d'accueil » : il s'ouvre alors en plein écran, sans
barre d'adresse.
