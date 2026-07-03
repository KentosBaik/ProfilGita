import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRegister() {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);

  // Login states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // Register states
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [photoPayload, setPhotoPayload] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");

  // Helper untuk convert file gambar ke Base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await toBase64(file);
        setPhotoPayload(base64);
      } catch (err) {
        console.error("Gagal membaca file foto:", err);
      }
    }
  }

  // Submit Handler untuk Register
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegisterMessage("");

    if (registerUsername.trim() === "" || registerPassword.trim() === "") {
      setRegisterMessage("<span class='error'>Username dan Password wajib diisi!</span>");
      return;
    }

    try {
      // Panggil API /api/register yang meng-update profile table Supabase
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: registerUsername.trim(),
          password: registerPassword.trim(),
          photo: photoPayload
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal melakukan pendaftaran.");
      }

      // Simpan credentials ke localStorage untuk autentikasi client-side CMS
      localStorage.setItem("username", registerUsername.trim());
      localStorage.setItem("password", registerPassword.trim());

      setRegisterMessage("<span class='success'>Akun berhasil dibuat! Mengalihkan ke login...</span>");

      // Reset form
      setRegisterUsername("");
      setRegisterPassword("");
      setPhotoPayload(null);

      // Redirect ke login view setelah 1.5 detik
      setTimeout(() => {
        setIsLoginView(true);
        setRegisterMessage("");
      }, 1500);

    } catch (err) {
      setRegisterMessage(`<span class='error'>Error: ${err.message}</span>`);
    }
  }

  // Submit Handler untuk Login
  function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginMessage("");

    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");

    if (loginUsername.trim() === savedUsername && loginPassword.trim() === savedPassword) {
      alert("Login berhasil!");
      navigate("/article");
    } else {
      setLoginMessage("<span class='error'>Username atau password salah!</span>");
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg,#ffe4ec,#ffd6e7)" }}>
      <div className="container" style={{ width: "380px", background: "white", padding: "35px", borderRadius: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
        
        {isLoginView ? (
          <form id="loginForm" onSubmit={handleLoginSubmit}>
            <h1 style={{ textAlign: "center", color: "#cc3366", marginBottom: "25px" }}>Login</h1>

            <div className="input-box" style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "10px", outline: "none" }}
              />
            </div>

            <div className="input-box" style={{ marginBottom: "15px" }}>
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "10px", outline: "none" }}
              />
            </div>

            <button type="submit" style={{ width: "100%", padding: "12px", background: "#cc3366", color: "white", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer" }}>
              Login
            </button>

            <p className="switch" style={{ textAlign: "center", marginTop: "15px" }}>
              Belum punya akun?{" "}
              <a onClick={() => setIsLoginView(false)} style={{ color: "#cc3366", fontWeight: "bold", cursor: "pointer" }}>Daftar</a>
            </p>

            <p id="loginMessage" style={{ textAlign: "center", marginTop: "10px" }} dangerouslySetInnerHTML={{ __html: loginMessage }}></p>
          </form>
        ) : (
          <form id="registerForm" onSubmit={handleRegisterSubmit}>
            <h1 style={{ textAlign: "center", color: "#cc3366", marginBottom: "25px" }}>Daftar Akun</h1>

            <div className="input-box" style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Buat Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
                style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "10px", outline: "none" }}
              />
            </div>

            <div className="input-box" style={{ marginBottom: "15px" }}>
              <input
                type="password"
                placeholder="Buat Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "10px", outline: "none" }}
              />
            </div>

            {/* Upload Foto saat pendaftaran */}
            <div className="input-box" style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "5px", fontSize: "14px", color: "#555" }}>Upload Foto Profil:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "10px", background: "#fff" }}
              />
            </div>

            <button type="submit" style={{ width: "100%", padding: "12px", background: "#cc3366", color: "white", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer" }}>
              Daftar
            </button>

            <p className="switch" style={{ textAlign: "center", marginTop: "15px" }}>
              Sudah punya akun?{" "}
              <a onClick={() => setIsLoginView(true)} style={{ color: "#cc3366", fontWeight: "bold", cursor: "pointer" }}>Login</a>
            </p>

            <p id="registerMessage" style={{ textAlign: "center", marginTop: "10px" }} dangerouslySetInnerHTML={{ __html: registerMessage }}></p>
          </form>
        )}

      </div>
    </div>
  );
}
