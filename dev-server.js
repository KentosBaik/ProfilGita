const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;

// Definisikan default environment variables jika belum diset
process.env.SUPABASE_URL = process.env.SUPABASE_URL || "https://lffazdmwcpdhhogjylqc.supabase.co";
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_doyqMy2iCcEb_YPQcsyoqA_K57m0F8x";

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. Handling API Endpoints (Vercel Serverless Functions)
  if (pathname.startsWith("/api/")) {
    const apiName = pathname.substring(5); // Mengambil nama endpoint e.g., "profile"
    const apiPath = path.join(__dirname, "api", `${apiName}.js`);

    if (fs.existsSync(apiPath)) {
      // Mock parameter query dan body untuk mencocokkan Vercel
      req.query = parsedUrl.query;
      
      let bodyData = "";
      req.on("data", (chunk) => {
        bodyData += chunk;
      });

      req.on("end", async () => {
        try {
          if (bodyData) {
            req.body = JSON.parse(bodyData);
          }
        } catch (e) {
          req.body = {};
        }

        // Mock method-helper bawaan Vercel response
        res.status = (statusCode) => {
          res.statusCode = statusCode;
          return res;
        };
        res.json = (data) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };
        res.send = (data) => {
          res.end(data);
        };

        try {
          // Bersihkan cache node require untuk reload perubahan dinamis
          delete require.cache[require.resolve(apiPath)];
          const handler = require(apiPath);
          await handler(req, res);
        } catch (err) {
          console.error(`Error pada API /api/${apiName}:`, err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "API Internal Server Error: " + err.message }));
        }
      });
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `API endpoint /api/${apiName} tidak ditemukan` }));
    }
    return;
  }

  // 2. Handling File Statis Frontend (Mendukung React SPA)
  // Gunakan folder 'dist' hasil build Vite jika ada, jika tidak gunakan root
  const hasDist = fs.existsSync(path.join(__dirname, "dist"));
  const staticRoot = hasDist ? path.join(__dirname, "dist") : __dirname;

  let filePath = path.join(staticRoot, pathname === "/" ? "index.html" : pathname);

  // Jika file statis fisik tidak ditemukan
  if (!fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    if (ext) {
      // Jika itu adalah file (misal .png, .js, .css) tapi tidak ada di dist, coba cek di public/
      const publicPath = path.join(__dirname, "public", pathname);
      if (fs.existsSync(publicPath)) {
        filePath = publicPath;
      } else {
        res.statusCode = 404;
        res.end("File Tidak Ditemukan");
        return;
      }
    } else {
      // Jika tidak ada ekstensi (SPA Router path, e.g. /about, /login), kembalikan index.html
      filePath = path.join(staticRoot, "index.html");
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.statusCode = 500;
      res.end(`Server Error: ${err.code}`);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`Server dev lokal berjalan di http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
