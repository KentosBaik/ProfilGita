const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const webpush = require("web-push");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

// Setup VAPID Keys untuk Web Push
const vapidKeysPath = path.join(__dirname, "vapid-keys.json");
let vapidKeys;

if (fs.existsSync(vapidKeysPath)) {
  vapidKeys = JSON.parse(fs.readFileSync(vapidKeysPath, "utf8"));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(vapidKeysPath, JSON.stringify(vapidKeys, null, 2), "utf8");
}

webpush.setVapidDetails(
  "mailto:gita@email.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];


const db = mysql.createPool({
  host: "by4oyvscixn3eg4ggfvd-mysql.services.clever-cloud.com",
  user: "uh8d3yioct872doc",
  password: "BC5VAfeAbNLK8XP0NmWP",
  database: "by4oyvscixn3eg4ggfvd",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Database gagal terhubung:", err.message);
  } else {
    console.log("Database berhasil terhubung");
    connection.release();
  }
});

app.get("/articles", (req, res) => {
  db.query("SELECT * FROM articles", (err, result) => {
    if (err) {
      console.error("Gagal SELECT articles:", err);
      return res.status(500).json({ error: "Gagal mengambil data artikel" });
    }
    res.json(result);
  });
});

app.post("/articles", (req, res) => {
  const { title, content, image } = req.body;

  db.query(
    "INSERT INTO articles(title, content, image) VALUES (?, ?, ?)",
    [title, content, image || null],
    (err, result) => {
      if (err) {
        console.error("Gagal INSERT articles:", err);
        return res.status(500).json({ error: "Gagal menambahkan artikel" });
      }

      res.json({
        message: "Artikel berhasil ditambahkan"
      });
    }
  );
});

app.put("/articles/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;

  db.query(
    "UPDATE articles SET title=?, content=?, image=? WHERE id=?",
    [title, content, image || null, id],
    (err, result) => {
      if (err) {
        console.error("Gagal UPDATE articles:", err);
        return res.status(500).json({ error: "Gagal mengupdate artikel" });
      }

      res.json({
        message: "Artikel berhasil diupdate"
      });
    }
  );
});

app.delete("/articles/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM articles WHERE id=?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Gagal DELETE articles:", err);
        return res.status(500).json({ error: "Gagal menghapus artikel" });
      }

      res.json({
        message: "Artikel berhasil dihapus"
      });
    }
  );
});

// Endpoints untuk Web Push Notification
app.get("/api/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;
  
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  // Cek apakah subscription sudah ada
  const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
  }
  
  res.status(201).json({ message: "Subscription saved successfully" });
});

app.post("/api/send-notification", (req, res) => {
  const { title, body, url } = req.body;
  const payload = JSON.stringify({ title, body, url: url || "/" });

  const promises = subscriptions.map(sub => {
    return webpush.sendNotification(sub, payload)
      .catch(err => {
        console.error("Error sending push notification to", sub.endpoint, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Hapus subscription yang sudah tidak valid/kedaluwarsa
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      });
  });

  Promise.all(promises)
    .then(() => res.json({ success: true, message: "Notification sent to active subscribers." }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.post("/api/send-push-to-sub", (req, res) => {
  const { subscription, title, body, url } = req.body;
  
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  const payload = JSON.stringify({ title, body, url: url || "/" });

  webpush.sendNotification(subscription, payload)
    .then(() => res.json({ success: true, message: "Direct notification sent successfully." }))
    .catch(err => {
      console.error("Error sending direct push notification:", err);
      res.status(500).json({ error: err.message });
    });
});

app.listen(3000, () => {
  console.log("Server berjalan di port 3000");
});