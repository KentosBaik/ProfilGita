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
      .from("profile")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      // Fallback jika tabel profile masih kosong di database
      return res.status(200).json({
        nama: "Gita Wahyuni",
        profesi: "Mahasiswa Informatika",
        deskripsi: "Hi, saya Gita Wahyuni. Saya berusia 19 tahun dan berasal dari Cilacap. Saat ini saya sedang menempuh pendidikan di Universitas Nahdlatul Ulama Al-Ghazali Cilacap prodi Informatika.",
        email: "gita@email.com",
        github: "https://github.com/gitawahyuni",
        linkedin: "https://linkedin.com/in/gitawahyuni",
        instagram: "https://instagram.com/gitawahyuni",
        foto: "images/fotogita.jpeg"
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Gagal mengambil data profile:", err);
    return res.status(500).json({ error: "Internal Server Error: " + err.message });
  }
};
