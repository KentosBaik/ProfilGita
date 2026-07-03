const apiUrl = "http://localhost:3000/articles";

const form = document.getElementById("formArtikel");
const judul = document.getElementById("judul");
const isi = document.getElementById("isi");
const listArtikel = document.getElementById("listArtikel");
const gambarInput = document.getElementById("gambar");

let editId = null;
let articlesList = [];
let editImage = null;

// Helper untuk convert file gambar ke Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

async function tampilkanArtikel() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  articlesList = data;

  if (data.length === 0) {
    listArtikel.innerHTML = `
      <div class="artikel-card">
        <h3>Belum Ada Artikel</h3>
        <p>Artikel yang disimpan akan tampil di sini.</p>
      </div>
    `;
    return;
  }

  listArtikel.innerHTML = "";

  data.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("artikel-card");

    div.innerHTML = `
      <h3>${item.title}</h3>
      ${item.image ? `<img src="${item.image}" alt="Gambar Artikel" style="max-width:100%; border-radius:10px; margin-top:10px; margin-bottom:10px; display:block;">` : ""}
      <p>${item.content}</p>

      <div style="margin-top:15px; display:flex; gap:10px;">
        <button onclick="editArtikel(${item.id})">
          Edit
        </button>
        <button onclick="hapusArtikel(${item.id})">
          Hapus
        </button>
      </div>
    `;

    listArtikel.appendChild(div);
  });
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (judul.value.trim() === "" || isi.value.trim() === "") {
    alert("Judul dan isi tidak boleh kosong!");
    return;
  }

  const file = gambarInput.files[0];
  let imagePayload = editImage;

  if (file) {
    try {
      imagePayload = await toBase64(file);
    } catch (err) {
      console.error("Gagal membaca file gambar:", err);
    }
  }

  if (editId === null) {

    console.log({
      title: judul.value,
      content: isi.value,
      image: imagePayload
    });

    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: judul.value,
        content: isi.value,
        image: imagePayload
      })
    });

    alert("Artikel berhasil ditambahkan");
  } else {
    await fetch(`${apiUrl}/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: judul.value,
        content: isi.value,
        image: imagePayload
      })
    });

    alert("Artikel berhasil diupdate");
    editId = null;
    editImage = null;
    document.querySelector("#formArtikel button").textContent = "Simpan";
  }

  form.reset();
  tampilkanArtikel();
});

function editArtikel(id) {
  const item = articlesList.find(a => a.id === id);
  if (!item) return;

  editId = id;
  judul.value = item.title;
  isi.value = item.content;
  editImage = item.image;

  document.querySelector("#formArtikel button").textContent = "Update Artikel";
}

async function hapusArtikel(id) {

  if (confirm("Yakin mau hapus artikel ini?")) {

    await fetch(`${apiUrl}/${id}`, {
      method: "DELETE"
    });

    tampilkanArtikel();

  }

}

tampilkanArtikel();

function tampilkanLokasi() {
  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(
      function (position) {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const map = document.getElementById("mapFrame");

        map.src =
          `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

      },

      function (error) {
        alert("Lokasi tidak diizinkan atau tidak dapat diakses.");
      }
    );

  } else {
    alert("Browser tidak mendukung Geolocation.");
  }
}

tampilkanLokasi();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker berhasil'))
      .catch(err => console.log(err));
  });
}
