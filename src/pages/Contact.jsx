import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [contactNamaSimple, setContactNamaSimple] = useState("");
  const [contactEmailSimple, setContactEmailSimple] = useState("");
  const [contactPesanSimple, setContactPesanSimple] = useState("");

  const [namaLengkap, setNamaLengkap] = useState("");
  const [emailTim, setEmailTim] = useState("");
  const [telepon, setTelepon] = useState("");
  const [perusahaan, setPerusahaan] = useState("");
  const [jumlahKaryawan, setJumlahKaryawan] = useState("");
  const [layanan, setLayanan] = useState("");
  const [pertanyaan, setPertanyaan] = useState("");

  async function handleContactSaya(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: contactNamaSimple,
          email: contactEmailSimple,
          pesan: contactPesanSimple
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Pesan berhasil dikirim!");
        setContactNamaSimple("");
        setContactEmailSimple("");
        setContactPesanSimple("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Gagal mengirim pesan.");
    }
  }

  async function handleContactTim(e) {
    e.preventDefault();
    const pesan = `Nomor Telepon: ${telepon || "-"}\nNama Perusahaan: ${perusahaan || "-"}\nJumlah Karyawan: ${jumlahKaryawan || "-"}\nLayanan yang Dibutuhkan: ${layanan || "-"}\nPertanyaan: ${pertanyaan || "-"}`;

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: namaLengkap,
          email: emailTim,
          pesan
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Pesan berhasil dikirim ke tim!");
        setNamaLengkap("");
        setEmailTim("");
        setTelepon("");
        setPerusahaan("");
        setJumlahKaryawan("");
        setLayanan("");
        setPertanyaan("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Gagal mengirim pesan tim.");
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
            <li><Link to="/about">Tentang</Link></li>
            <li><Link to="/about#hobi">Hobi</Link></li>
            <li><Link to="/about#Goals">Goals</Link></li>
            <li><Link to="/about#Favorit">Favourite</Link></li>
            <li><a href="#contact">Kontak</a></li>
            <li><Link to="/login">Artikel</Link></li>
          </ul>
        </nav>
      </header>

      <div className="section" id="Kontak">
        <h2>Hubungi Saya</h2>
        <form id="formHubungiSaya" onSubmit={handleContactSaya}>
          <div className="form-group">
            <input type="text" placeholder="Masukkan nama" value={contactNamaSimple} onChange={e => setContactNamaSimple(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="email" placeholder="Masukkan email" value={contactEmailSimple} onChange={e => setContactEmailSimple(e.target.value)} required />
          </div>
          <div className="form-group">
            <textarea placeholder="Masukkan pesan..." value={contactPesanSimple} onChange={e => setContactPesanSimple(e.target.value)} required></textarea>
          </div>
          <button type="submit">Kirim</button>
        </form>
      </div>

      <div className="section contact-box" id="contact">
        <h2>Hubungi Tim Kami</h2>
        <p className="subtitle">Isi form berikut dan kami akan menghubungi Anda dalam 24 jam</p>
        <form className="contact-form" id="formHubungiTim" onSubmit={handleContactTim}>
          <div className="form-group">
            <label htmlFor="namaLengkap">Nama Lengkap</label>
            <input type="text" id="namaLengkap" placeholder="Contoh: Gita Wahyuni" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="emailTim">Email</label>
            <input type="email" id="emailTim" placeholder="Contoh: gita@email.com" value={emailTim} onChange={e => setEmailTim(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="telepon">Nomor Telepon</label>
            <input type="text" id="telepon" placeholder="Contoh: +62 80000000000" value={telepon} onChange={e => setTelepon(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="perusahaan">Nama Perusahaan</label>
              <input type="text" id="perusahaan" placeholder="Contoh: PT Gita maju jaya" value={perusahaan} onChange={e => setPerusahaan(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="jumlahKaryawan">Jumlah Karyawan</label>
              <select id="jumlahKaryawan" value={jumlahKaryawan} onChange={e => setJumlahKaryawan(e.target.value)}>
                <option value="">Pilih jumlah</option>
                <option value="1-10">1-10</option>
                <option value="10-50">10-50</option>
                <option value="50+">50+</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="layanan">Layanan yang Dibutuhkan</label>
            <select id="layanan" value={layanan} onChange={e => setLayanan(e.target.value)}>
              <option value="">Pilih layanan</option>
              <option value="Website">Website</option>
              <option value="Aplikasi Mobile">Aplikasi Mobile</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pertanyaan">Pertanyaan</label>
            <textarea id="pertanyaan" placeholder="Tulis pertanyaan Anda" value={pertanyaan} onChange={e => setPertanyaan(e.target.value)}></textarea>
          </div>
          <button type="submit" className="submit-btn">Kirim</button>
        </form>
      </div>
    </div>
  );
}
