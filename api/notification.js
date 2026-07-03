const supabase = require("../lib/supabase");
const webpush = require("web-push");

// Setup default VAPID Keys fallback if not provided in env variables
const publicKey = process.env.VAPID_PUBLIC_KEY || "BE5VVAmT8aIC2J0lRmqdXe1MfaGHYPTID1NscWr64NyxVUitTMW1KaUwdSPhqWSDfOBE-1DKz4xqoc9K8KAClMI";
const privateKey = process.env.VAPID_PRIVATE_KEY || "jho_aATR6nT082vLdJiOIFk1_B7mt-jgP6akMD1l5pg";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:gita@email.com",
  publicKey,
  privateKey
);

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
    const { subscription, title, body, url } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Judul notifikasi tidak boleh kosong" });
    }
    if (!body || body.trim() === "") {
      return res.status(400).json({ error: "Konten/Isi notifikasi tidak boleh kosong" });
    }

    const payload = JSON.stringify({
      title: title.trim(),
      body: body.trim(),
      url: url || "/"
    });

    if (subscription && subscription.endpoint) {
      // Kirim notifikasi secara langsung ke subscription yang dikirimkan
      await webpush.sendNotification(subscription, payload);
      return res.status(200).json({ success: true, message: "Direct notification sent successfully." });
    } else {
      // Ambil seluruh data subscription dari Supabase
      const { data: subs, error } = await supabase
        .from("notification_subscriptions")
        .select("*");

      if (error) {
        throw error;
      }

      const promises = (subs || []).map((sub) => {
        const subObj = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        return webpush.sendNotification(subObj, payload).catch(async (err) => {
          console.error("Gagal mengirim push ke:", sub.endpoint, err.message);
          // Hapus subscription jika statusnya 410 (Gone) atau 404 (Not Found)
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from("notification_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
        });
      });

      await Promise.all(promises);
      return res.status(200).json({ success: true, message: "Notification sent to active subscribers." });
    }
  } catch (err) {
    console.error("Gagal memproses notifikasi:", err);
    return res.status(500).json({ error: "Gagal mengirim notifikasi: " + err.message });
  }
};
