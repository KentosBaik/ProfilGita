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

    // Lakukan update database Supabase HANYA jika username-nya adalah 'gita' (Admin Pemilik Web)
    const isGitaAdmin = username.trim().toLowerCase() === "gita";

    if (isGitaAdmin) {
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
        // Jika profil sudah ada, update profil tersebut (tanpa kolom ID)
        const { error } = await supabase
          .from("profile")
          .update({
            nama: username.trim(),
            foto: photo || null
          })
          .eq("id", existingProfile.id);
        queryError = error;
      } else {
        // Jika profil belum ada, insert baris baru tanpa kolom ID
        const { error } = await supabase
          .from("profile")
          .insert([
            {
              nama: username.trim(),
              foto: photo || null,
              profesi: "Mahasiswa Informatika",
              deskripsi: "Hi, saya Gita Wahyuni. Saya berusia 19 tahun dan berasal dari Cilacap. Saat ini saya sedang menempuh pendidikan di Universitas Nahdlatul Ulama Al-Ghazali Cilacap prodi Informatika."
            }
          ]);
        queryError = error;
      }

      if (queryError) {
        throw queryError;
      }
    }

    return res.status(200).json({
      success: true,
      message: isGitaAdmin 
        ? "Registrasi Admin berhasil! Profil otomatis ter-update di database."
        : "Registrasi User berhasil! Selamat datang di platform portofolio Gita."
    });
  } catch (err) {
    console.error("Gagal registrasi profile:", err);
    return res.status(500).json({ error: "Gagal memproses pendaftaran: " + err.message });
  }
};
