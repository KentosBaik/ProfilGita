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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ publicKey });
  } else if (req.method === "POST") {
    try {
      const subscription = req.body;

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: "Subscription tidak valid" });
      }

      // Ekstrak keys dari object subscription browser
      const p256dh = subscription.keys ? subscription.keys.p256dh : "";
      const auth = subscription.keys ? subscription.keys.auth : "";

      // Simpan ke Supabase menggunakan upsert untuk menghindari duplikasi endpoint
      const { error } = await supabase
        .from("notification_subscriptions")
        .upsert(
          {
            endpoint: subscription.endpoint,
            p256dh: p256dh,
            auth: auth
          },
          { onConflict: "endpoint" }
        );

      if (error) {
        throw error;
      }

      return res.status(201).json({ message: "Subscription saved successfully" });
    } catch (err) {
      console.error("Gagal menyimpan subscription ke Supabase:", err);
      return res.status(500).json({ error: "Gagal menyimpan subscription: " + err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};
