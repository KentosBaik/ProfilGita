import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Home() {
  const [profile, setProfile] = useState({
    nama: "Gita Wahyuni",
    profesi: "Mahasiswa Informatika",
    deskripsi: "Hi, saya Gita Wahyuni. Saya berusia 19 tahun dan berasal dari Cilacap. Saat ini saya sedang menempuh pendidikan di Universitas Nahdlatul Ulama Al-Ghazali Cilacap prodi Informatika.",
    foto: "images/fotogita.jpeg"
  });
  const [projects, setProjects] = useState([]);
  const [articles, setArticles] = useState([]);
  const [mapUrl, setMapUrl] = useState("");
  const [statusText, setStatusText] = useState("Status Notifikasi: Memeriksa...");
  const [statusClass, setStatusClass] = useState("status-dot");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [btnText, setBtnText] = useState("Aktifkan Notifikasi");
  const [btnBg, setBtnBg] = useState("#cc3366");
  const [btnSendDisabled, setBtnSendDisabled] = useState(true);

  // States untuk Form Kontak 1 (Hubungi Saya)
  const [contactNamaSimple, setContactNamaSimple] = useState("");
  const [contactEmailSimple, setContactEmailSimple] = useState("");
  const [contactPesanSimple, setContactPesanSimple] = useState("");

  // States untuk Form Kontak 2 (Hubungi Tim Kami)
  const [namaLengkap, setNamaLengkap] = useState("");
  const [emailTim, setEmailTim] = useState("");
  const [telepon, setTelepon] = useState("");
  const [perusahaan, setPerusahaan] = useState("");
  const [jumlahKaryawan, setJumlahKaryawan] = useState("");
  const [layanan, setLayanan] = useState("");
  const [pertanyaan, setPertanyaan] = useState("");

  let swRegistration = null;
  let currentSubscription = null;

  useEffect(() => {
    fetchProfile();
    fetchProjects();
    fetchArticles();
    initPushNotification();
    tampilkanLokasiDanKirimPush();
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

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Gagal memuat projects:", err);
    }
  }

  async function fetchArticles() {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error("Gagal memuat artikel:", err);
    }
  }

  // Geolocation
  function tampilkanLokasiDanKirimPush() {
    if (navigator.geolocation) {
      setStatusClass("status-dot pending");
      setStatusText("Status: Mendeteksi Lokasi...");

      navigator.geolocation.getCurrentPosition(
        async function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setMapUrl(`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`);
          setStatusClass(isSubscribed ? "status-dot active" : "status-dot inactive");
          setStatusText(isSubscribed ? "Status Notifikasi: Aktif" : "Status Notifikasi: Dinonaktifkan");

          const title = "Lokasi Berhasil Dideteksi!";
          const body = `Koordinat Anda: Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`;

          if (isSubscribed && currentSubscription) {
            try {
              await fetch(`/api/notification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscription: currentSubscription,
                  title,
                  body,
                  url: "#lokasi"
                })
              });
            } catch (error) {
              triggerLocalNotification(title, body);
            }
          } else {
            triggerLocalNotification(title, body);
          }
        },
        function (error) {
          setStatusClass(isSubscribed ? "status-dot active" : "status-dot inactive");
          setStatusText(isSubscribed ? "Status Notifikasi: Aktif" : "Status Notifikasi: Dinonaktifkan");
          console.warn("Gagal mendeteksi lokasi atau izin geolocation ditolak.");
        }
      );
    }
  }

  // Helper Base64 to Uint8Array
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Push Notification setup
  async function initPushNotification() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        swRegistration = await navigator.serviceWorker.ready;
        currentSubscription = await swRegistration.pushManager.getSubscription();

        if (currentSubscription) {
          setIsSubscribed(true);
          updateSubscriptionUI(true);
        } else {
          setIsSubscribed(false);
          updateSubscriptionUI(false);
        }
      } catch (error) {
        console.error("Gagal inisialisasi push:", error);
        setStatusClass("status-dot inactive");
        setStatusText("Status: Error/Tidak Didukung");
      }
    } else {
      setStatusClass("status-dot inactive");
      setStatusText("Status: Browser tidak mendukung push");
    }
  }

  function updateSubscriptionUI(subscribed) {
    if (subscribed) {
      setStatusClass("status-dot active");
      setStatusText("Status Notifikasi: Aktif");
      setBtnText("Matikan Notifikasi");
      setBtnBg("#e74c3c");
      setBtnSendDisabled(false);
    } else {
      setStatusClass("status-dot inactive");
      setStatusText("Status Notifikasi: Dinonaktifkan");
      setBtnText("Aktifkan Notifikasi");
      setBtnBg("#cc3366");
      setBtnSendDisabled(true);
    }
  }

  async function subscribeUser() {
    if (isSubscribed) {
      try {
        const sub = await swRegistration.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
        updateSubscriptionUI(false);
        alert("Notifikasi dinonaktifkan.");
      } catch (e) {
        console.error("Gagal unsubscribe:", e);
      }
      return;
    }

    setStatusClass("status-dot pending");
    setStatusText("Status Notifikasi: Meminta izin...");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Izin notifikasi ditolak!");
      updateSubscriptionUI(false);
      return;
    }

    try {
      const response = await fetch(`/api/subscribe`);
      const data = await response.json();
      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

      const sub = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      await fetch(`/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub)
      });

      setIsSubscribed(true);
      updateSubscriptionUI(true);
      alert("Notifikasi berhasil diaktifkan!");
      triggerLocalNotification("Selamat!", "Notifikasi Anda telah aktif dan terhubung dengan server.");
    } catch (error) {
      console.error("Gagal subscribe:", error);
      alert("Gagal terhubung ke Push Server. Menggunakan fallback lokal.");
      setIsSubscribed(true);
      updateSubscriptionUI(true);
      triggerLocalNotification("Notifikasi Aktif (Lokal)", "Notifikasi berjalan dalam mode lokal.");
    }
  }

  function triggerLocalNotification(title, body) {
    if ("serviceWorker" in navigator && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "images/icon-profile1.png",
          badge: "images/icon-profile1.png",
          vibrate: [100, 50, 100],
          data: { url: "./index.html" }
        });
      });
    }
  }

  async function sendTestPush() {
    try {
      const sub = await swRegistration.pushManager.getSubscription();
      if (sub) {
        await fetch(`/api/notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: sub,
            title: "Test Push Notification",
            body: "Halo! Notifikasi ini dikirim dari server menggunakan React + Vercel Serverless.",
            url: "./index.html"
          })
        });
      } else {
        triggerLocalNotification("Test Notifikasi", "Ini adalah test notifikasi lokal.");
      }
    } catch (error) {
      triggerLocalNotification("Test Notifikasi (Lokal)", "Menampilkan notifikasi lokal.");
    }
  }

  // Form submit 1
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

  // Form submit 2
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
      <Header />

      <div className="section" id="Portfolio">
        <div className="text">
          <h1 id="nama">I'm {profile.nama}</h1>
          <p id="profile-desc">{profile.deskripsi}</p>
        </div>
        <div className="image">
          <img src={profile.foto || "images/fotogita.jpeg"} id="profile-img" alt={`Foto ${profile.nama}`} />
        </div>
      </div>

      <div className="section" id="tentang">
        <h2>Tentang Saya</h2>
        <p id="about-desc">
          Saya <strong>{profile.nama}</strong>, berprofesi sebagai <strong>{profile.profesi || "Mahasiswa Informatika"}</strong>. {profile.deskripsi}
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

      <div className="section" id="projects-section">
        <h2>Project Saya</h2>
        <div id="projects-list">
          {projects.length === 0 ? (
            <p>Belum ada project.</p>
          ) : (
            projects.map((item) => (
              <div key={item.id} className="artikel" style={{ marginBottom: "25px", borderLeft: "5px solid #ff69b4" }}>
                <h3 style={{ color: "#ff1493", marginBottom: "10px" }}>{item.nama}</h3>
                {item.gambar && (
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "10px", marginBottom: "10px", display: "block", maxHeight: "250px", objectFit: "cover" }}
                  />
                )}
                <p style={{ marginBottom: "8px" }}>{item.deskripsi}</p>
                <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}><strong>Teknologi:</strong> {item.teknologi}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {item.github && <a href={item.github} target="_blank" rel="noreferrer"><button>GitHub</button></a>}
                  {item.demo && <a href={item.demo} target="_blank" rel="noreferrer"><button style={{ backgroundColor: "#2980b9" }}>Live Demo</button></a>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section" id="notifikasi">
        <h2>Service Worker & Push Notification</h2>
        <p className="subtitle">Aktifkan push notification untuk menerima pembaruan lokasi dan demo notifikasi lainnya.</p>
        <div className="notification-panel">
          <div className="status-box">
            <span className={statusClass}></span>
            <span>{statusText}</span>
          </div>
          <div className="button-group">
            <button id="btnSubscribe" style={{ backgroundColor: btnBg }} onClick={subscribeUser}>{btnText}</button>
            <button id="btnSendTestPush" style={{ backgroundColor: "#34495e" }} onClick={sendTestPush} disabled={btnSendDisabled}>Kirim Test Push Notification</button>
            <button id="btnSendLocationPush" style={{ backgroundColor: "#2980b9" }} onClick={tampilkanLokasiDanKirimPush}>Dapatkan Lokasi & Kirim Push</button>
          </div>
        </div>
      </div>

      <section id="lokasi" className="section">
        <h2>Lokasi Saya Saat Ini</h2>
        <div id="map-container">
          {mapUrl ? (
            <iframe id="mapFrame" src={mapUrl} width="100%" height="400" style={{ border: 0 }} loading="lazy" title="Map Lokasi"></iframe>
          ) : (
            <p>Mendeteksi lokasi...</p>
          )}
        </div>
      </section>

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

      <section id="artikel" className="section">
        <h2>Artikel Saya</h2>
        <div id="article-list">
          {articles.length === 0 ? (
            <p>Belum ada artikel.</p>
          ) : (
            articles.map((item) => (
              <div key={item.id} className="artikel">
                <h3>{item.title}</h3>
                {item.image && (
                  <img src={item.image} alt="Gambar Artikel" style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "10px", marginBottom: "10px", display: "block" }} />
                )}
                <p>{item.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

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
