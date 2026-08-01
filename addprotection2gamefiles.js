const fs = require("fs");
const path = require("path");

const gamesDir = path.join(__dirname, "games");
const distDir = path.join(__dirname, "dist", "games");

const protection = `
<script>
  if (
    window.location.hostname !== "jimothytracker.org" &&
    window.location.hostname !== "localhost"
  ) {
    document.body.innerHTML = "🦝 Jimothy says: This is stolen from JimothyTracker.org!";
  }
</script>
`;

const footer = `
<footer style="margin-top:2rem; padding:1rem; color:#9ca3af; font-size:0.8rem; text-align:center;">
  © 2026 Emily Liu | JimothyTracker.org | All rights reserved. Unauthorized copying prohibited.
</footer>
`;

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.readdirSync(gamesDir).forEach(file => {
  if (!file.endsWith(".html")) return;

  const filePath = path.join(gamesDir, file);
  let html = fs.readFileSync(filePath, "utf8");

  // Inject protection at top of <body>
  html = html.replace("<body>", "<body>\n" + protection);

  // Inject footer before </body>
  html = html.replace("</body>", footer + "\n</body>");

  const outPath = path.join(distDir, file);
  fs.writeFileSync(outPath, html);

  console.log("Protected:", file);
});

console.log("Build complete. Protected files saved to /dist/games/");
