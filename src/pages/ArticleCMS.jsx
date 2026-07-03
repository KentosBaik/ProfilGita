import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function ArticleCMS() {
  const navigate = useNavigate();
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [imagePayload, setImagePayload] = useState(null);
  const [editId, setEditId] = useState(null);
  const [articlesList, setArticlesList] = useState([]);

  useEffect(() => {
    // Validasi login admin (CMS)
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");
    if (!savedUsername || !savedPassword) {
      alert("Silakan login terlebih dahulu untuk mengakses CMS!");
      navigate("/login");
    } else {
      fetchArticles();
    }
  }, [navigate]);

  async function fetchArticles() {
    try {
      const response = await fetch("/api/articles");
      if (response.ok) {
        const data = await response.json();
        setArticlesList(data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar artikel:", err);
    }
  }

  // Convert file ke Base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await toBase64(file);
        setImagePayload(base64);
      } catch (err) {
        console.error("Gagal membaca file gambar:", err);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (judul.trim() === "" || isi.trim() === "") {
      alert("Judul dan isi artikel tidak boleh kosong!");
      return;
    }

    try {
      if (editId === null) {
        // POST /api/articles
        const response = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: judul.trim(),
            content: isi.trim(),
            image: imagePayload
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Gagal menyimpan artikel");
        }

        alert("Artikel berhasil ditambahkan");
      } else {
        // PUT /api/article?id=ID
        const response = await fetch(`/api/article?id=${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: judul.trim(),
            content: isi.trim(),
            image: imagePayload
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Gagal mengupdate artikel");
        }

        alert("Artikel berhasil diupdate");
        setEditId(null);
      }

      setJudul("");
      setIsi("");
      setImagePayload(null);
      // Reset input file di DOM
      const fileInput = document.getElementById("gambar");
      if (fileInput) fileInput.value = "";

      fetchArticles();
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  function editArtikel(item) {
    setEditId(item.id);
    setJudul(item.title);
    setIsi(item.content);
    setImagePayload(item.image);
    // Scroll ke form input
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function hapusArtikel(id) {
    if (confirm("Yakin mau hapus artikel ini?")) {
      try {
        const response = await fetch(`/api/article?id=${id}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Gagal menghapus artikel");
        }

        fetchArticles();
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  }

  return (
    <div>
      <Header />

      <div className="container" style={{ margin: "40px auto", maxWidth: "850px", background: "white", padding: "35px", borderRadius: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.08)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#cc3366" }}>Content Management System</h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label style={{ fontWeight: 600 }}>Judul:</label>
          <input
            type="text"
            placeholder="Masukkan judul artikel"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ccc" }}
          />

          <label style={{ fontWeight: 600 }}>Isi Artikel:</label>
          <textarea
            placeholder="Tulis isi artikel..."
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            required
            style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ccc", minHeight: "150px" }}
          ></textarea>

          <label style={{ fontWeight: 600 }}>UPLOAD GAMBAR (OPSIONAL)</label>
          <input
            type="file"
            id="gambar"
            accept="image/*"
            onChange={handleFileChange}
            style={{ padding: "12px", borderRadius: "10px", background: "#fff", border: "1px solid #ccc" }}
          />

          <button type="submit" style={{ padding: "14px", background: "#cc3366", color: "white", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            {editId === null ? "Simpan" : "Update Artikel"}
          </button>
        </form>

        <div className="artikel-section" style={{ marginTop: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#cc3366" }}>Daftar Artikel</h2>
          <div id="listArtikel" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {articlesList.length === 0 ? (
              <div className="artikel-card" style={{ padding: "20px", borderRadius: "15px", border: "1px solid #eee" }}>
                <h3>Belum Ada Artikel</h3>
                <p>Artikel yang disimpan akan tampil di sini.</p>
              </div>
            ) : (
              articlesList.map((item) => (
                <div key={item.id} className="artikel-card" style={{ padding: "20px", borderRadius: "15px", border: "1px solid #eee" }}>
                  <h3 style={{ color: "#ff1493", marginBottom: "10px" }}>{item.title}</h3>
                  {item.image && (
                    <img src={item.image} alt="Gambar Artikel" style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "10px", marginBottom: "10px", display: "block" }} />
                  )}
                  <p>{item.content}</p>
                  <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                    <button onClick={() => editArtikel(item)} style={{ padding: "8px 16px", background: "#cc3366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => hapusArtikel(item.id)} style={{ padding: "8px 16px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Hapus</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
