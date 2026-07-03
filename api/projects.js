const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  // Setup CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      // Fallback data jika tabel di database kosong
      return res.status(200).json([
        {
          id: 1,
          nama: "Website Profile Pribadi",
          deskripsi: "Website portofolio responsive lengkap dengan fitur push notification, geolocation, dan CMS artikel.",
          teknologi: "HTML, CSS, JavaScript, Express.js, MySQL",
          github: "https://github.com/gitawahyuni/profile-gita",
          demo: "https://profile-gita.vercel.app",
          gambar: "images/icon-profile1.png"
        },
        {
          id: 2,
          nama: "PWA Push Notification Demo",
          deskripsi: "Aplikasi demo implementasi Progressive Web App dengan caching offline dan notifikasi push dari server.",
          teknologi: "HTML, CSS, Service Worker, Web Push API",
          github: "https://github.com/gitawahyuni/pwa-notification",
          demo: "https://pwa-notification.vercel.app",
          gambar: "images/icon-profile2.png"
        }
      ]);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Gagal mengambil data projects:", err);
    return res.status(500).json({ error: "Gagal mengambil data projek: " + err.message });
  }
};
