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
    const { username, password, photo } = req.body;

    // Validasi input
    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username tidak boleh kosong" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ error: "Password tidak boleh kosong" });
    }

    // Cek apakah data profil sudah ada di database
    const { data: existingProfile, error: selectError } = await supabase
      .from("profile")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    let queryError;
    if (existingProfile) {
      // Jika profil sudah ada, update profil tersebut (tanpa mengirimkan kolom ID agar tidak error di PostgreSQL)
      const { error } = await supabase
        .from("profile")
        .update({
          nama: username.trim(),
          foto: photo || null,
          profesi: "Mahasiswa Informatika",
          deskripsi: `Hi, saya ${username.trim()}. Saya berusia 19 tahun dan berasal dari Cilacap. Saat ini saya sedang menempuh pendidikan di Universitas Nahdlatul Ulama Al-Ghazali Cilacap prodi Informatika.`
        })
        .eq("id", existingProfile.id);
      queryError = error;
    } else {
      // Jika profil belum ada, insert baris baru tanpa kolom ID (PostgreSQL akan generate otomatis)
      const { error } = await supabase
        .from("profile")
        .insert([
          {
            nama: username.trim(),
            foto: photo || null,
            profesi: "Mahasiswa Informatika",
            deskripsi: `Hi, saya ${username.trim()}. Saya berusia 19 tahun dan berasal dari Cilacap. Saat ini saya sedang menempuh pendidikan di Universitas Nahdlatul Ulama Al-Ghazali Cilacap prodi Informatika.`
          }
        ]);
      queryError = error;
    }

    if (queryError) {
      throw queryError;
    }

    return res.status(200).json({
      success: true,
      message: "Akun berhasil dibuat! Profil pemilik website otomatis ter-update di homepage."
    });
  } catch (err) {
    console.error("Gagal registrasi profile:", err);
    return res.status(500).json({ error: "Gagal memproses pendaftaran: " + err.message });
  }
};
