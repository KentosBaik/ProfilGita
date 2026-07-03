const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  // Setup CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nama, email, pesan } = req.body;

    // Validasi input
    if (!nama || nama.trim() === "") {
      return res.status(400).json({ error: "Nama wajib diisi" });
    }
    if (!email || email.trim() === "") {
      return res.status(400).json({ error: "Email wajib diisi" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "Format email tidak valid" });
    }
    if (!pesan || pesan.trim() === "") {
      return res.status(400).json({ error: "Pesan wajib diisi" });
    }

    const { error } = await supabase
      .from("contacts")
      .insert([
        {
          nama: nama.trim(),
          email: email.trim(),
          pesan: pesan.trim()
        }
      ]);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Pesan Anda berhasil dikirim dan disimpan!"
    });
  } catch (err) {
    console.error("Gagal menyimpan kontak:", err);
    return res.status(500).json({ error: "Gagal menyimpan pesan kontak: " + err.message });
  }
};
