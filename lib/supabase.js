const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Peringatan: SUPABASE_URL atau SUPABASE_ANON_KEY belum didefinisikan di environment variables.");
}

// Inisialisasi client Supabase
const supabase = createClient(
  supabaseUrl || "https://lffazdmwcpdhhogjylqc.supabase.co",
  supabaseAnonKey || "sb_publishable_doyqMy2iCcEb_YPQcsyoqA_K57m0F8x"
);

module.exports = supabase;
