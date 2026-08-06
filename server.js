const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "6001", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) {
      if (err.code === "EADDRINUSE") {
        console.error(`\nPort ${port} is already in use. Stop the other server first, then run npm run dev again.\n`);
        process.exit(1);
      }
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});
