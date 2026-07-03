import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function About() {
  const [profile, setProfile] = useState({
    nama: "Gita Wahyuni",
    profesi: "Mahasiswa Informatika",
    deskripsi: "Hi, saya Gita Wahyuni. Saya berusia 19 tahun dan berasal dari Cilacap. Saat ini saya sedang menempuh pendidikan di Universitas Nahdlatul Ulama Al-Ghazali Cilacap prodi Informatika."
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data) setProfile(data);
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    }
  }

  return (
    <div>
      <header className="header">
        <div className="logo">
          <h1>Gita<span>Portfolio</span></h1>
        </div>
        <nav className="navbar">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="#tentang">Tentang</a></li>
            <li><a href="#hobi">Hobi</a></li>
            <li><a href="#Goals">Goals</a></li>
            <li><a href="#Favorit">Favourite</a></li>
            <li><Link to="/contact">Kontak</Link></li>
            <li><Link to="/login">Artikel</Link></li>
          </ul>
        </nav>
      </header>

      <div className="section" id="tentang">
        <h2>Tentang Saya</h2>
        <p id="about-text">
          Saya <strong>{profile.nama}</strong>, berprofesi sebagai <strong>{profile.profesi || "Mahasiswa"}</strong>. {profile.deskripsi}
        </p>
      </div>

      <div className="section" id="hobi">
        <h2>Hobi</h2>
        <ul>
          <li>Menyanyi</li>
          <li>Menonton film</li>
          <li>Ngedit</li>
          <li>Memasak</li>
        </ul>
      </div>

      <div className="section" id="Goals">
        <h2>My Top Goals</h2>
        <ol>
          <li>Mendapat nilai lebih baik</li>
          <li>Konsisten belajar</li>
          <li>Membahagiakan orang tua</li>
        </ol>
      </div>

      <div className="section" id="Favorit">
        <h2>Favourite</h2>
        <table>
          <tbody>
            <tr>
              <th>Kategori</th>
              <th>Favorit</th>
            </tr>
            <tr>
              <td>Makanan</td>
              <td>Dimsum</td>
            </tr>
            <tr>
              <td>Warna</td>
              <td>Biru</td>
            </tr>
            <tr>
              <td>Film</td>
              <td>Komedi</td>
            </tr>
            <tr>
              <td>Minuman</td>
              <td>Jus buah</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
