import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    // Jalankan pengecekan status login di localStorage
    const savedUser = localStorage.getItem("username");
    const savedAvatar = localStorage.getItem("userAvatar");
    
    if (savedUser) {
      setIsLoggedIn(true);
      setUsername(savedUser);
      setAvatar(savedAvatar);
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setAvatar("");
    }
  }, [location]); // Re-run saat pindah rute/page

  function handleLogout() {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      localStorage.removeItem("userAvatar");
      setIsLoggedIn(false);
      alert("Logout berhasil!");
      navigate("/");
    }
  }

  return (
    <header className="header">
      <div className="logo">
        <h1>Gita<span>Portfolio</span></h1>
      </div>
      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          
          {/* Menu navigasi scroll hanya untuk di Homepage */}
          {location.pathname === "/" ? (
            <>
              <li><a href="#tentang">Tentang</a></li>
              <li><a href="#hobi">Hobi</a></li>
              <li><a href="#Goals">Goals</a></li>
              <li><a href="#Favorit">Favourite</a></li>
              <li><a href="#projects-section">Project</a></li>
              <li><a href="#notifikasi">Notifikasi</a></li>
              <li><a href="#lokasi">Lokasi</a></li>
              <li><a href="#contact">Kontak</a></li>
            </>
          ) : (
            <>
              <li><Link to="/about">Tentang</Link></li>
              <li><Link to="/contact">Kontak</Link></li>
            </>
          )}

          {isLoggedIn ? (
            <>
              <li><Link to="/article">CMS Artikel</Link></li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "15px" }}>
                {avatar ? (
                  <img
                    src={avatar}
                    alt={username}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#ffe4ec",
                    color: "#cc3366",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                    border: "2px solid #fff"
                  }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: "14px" }}>{username}</span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginLeft: "5px",
                    transition: "0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#c0392b"}
                  onMouseOut={(e) => e.target.style.background = "#e74c3c"}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login">Login Admin</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}
