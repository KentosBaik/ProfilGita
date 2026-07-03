const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  // Setup CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Map image_url ke image agar kompatibel dengan javascript di frontend
      const formattedData = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        image: item.image_url,
        created_at: item.created_at
      }));

      return res.status(200).json(formattedData);
    } catch (err) {
      console.error("Gagal SELECT articles:", err);
      return res.status(500).json({ error: "Gagal mengambil data artikel: " + err.message });
    }
  } else if (req.method === "POST") {
    try {
      const { title, content, image } = req.body;

      // Validasi input
      if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Judul tidak boleh kosong" });
      }
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Konten tidak boleh kosong" });
      }

      const { error } = await supabase
        .from("articles")
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            image_url: image || null
          }
        ]);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: "Artikel berhasil ditambahkan"
      });
    } catch (err) {
      console.error("Gagal INSERT articles:", err);
      return res.status(500).json({ error: "Gagal menambahkan artikel: " + err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};
