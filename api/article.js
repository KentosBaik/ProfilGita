const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  // Setup CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Cari ID dari query string (?id=...) atau path url
  let id = req.query.id;
  if (!id) {
    const urlParts = req.url.split("?")[0].split("/");
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart !== "article") {
      id = lastPart;
    }
  }

  if (!id) {
    return res.status(400).json({ error: "ID artikel wajib dilampirkan" });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }
      if (!data) {
        return res.status(404).json({ error: "Artikel tidak ditemukan" });
      }

      return res.status(200).json({
        id: data.id,
        title: data.title,
        content: data.content,
        image: data.image_url,
        created_at: data.created_at
      });
    } catch (err) {
      console.error("Gagal SELECT single article:", err);
      return res.status(500).json({ error: "Gagal mengambil data artikel: " + err.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { title, content, image } = req.body;

      if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Judul tidak boleh kosong" });
      }
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Konten tidak boleh kosong" });
      }

      const { error } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          content: content.trim(),
          image_url: image || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: "Artikel berhasil diupdate"
      });
    } catch (err) {
      console.error("Gagal UPDATE article:", err);
      return res.status(500).json({ error: "Gagal mengupdate artikel: " + err.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        message: "Artikel berhasil dihapus"
      });
    } catch (err) {
      console.error("Gagal DELETE article:", err);
      return res.status(500).json({ error: "Gagal menghapus artikel: " + err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};
