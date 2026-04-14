import { Situation } from "@/types";

export const situations: Situation[] = [
  // 😰 Tekanan & Kecemasan
  {
    id: "1",
    slug: "overthinking",
    title: "Lagi Overthinking",
    description: "Pikiran nggak bisa berhenti, cemas terus",
    emoji: "😰",
    category: "Tekanan & Kecemasan",
    searchQuery: "anxiety worry trust Allah peace of mind",
  },
  {
    id: "2",
    slug: "takut-gagal",
    title: "Takut Gagal",
    description: "Mau coba tapi takut hasilnya mengecewakan",
    emoji: "😨",
    category: "Tekanan & Kecemasan",
    searchQuery: "fear failure courage trust Allah outcome",
  },
  {
    id: "3",
    slug: "stress-berat",
    title: "Stress Berat",
    description: "Beban terasa terlalu berat untuk ditanggung",
    emoji: "😩",
    category: "Tekanan & Kecemasan",
    searchQuery: "hardship burden relief Allah does not burden beyond capacity",
  },

  // 💔 Hubungan
  {
    id: "4",
    slug: "disakiti-orang",
    title: "Disakiti Orang",
    description: "Diperlakukan tidak adil oleh orang lain",
    emoji: "💔",
    category: "Hubungan",
    searchQuery: "oppression injustice patience forgiveness Allah sees",
  },
  {
    id: "5",
    slug: "konflik-keluarga",
    title: "Konflik Keluarga",
    description: "Hubungan keluarga sedang tidak baik",
    emoji: "👨‍👩‍👧",
    category: "Hubungan",
    searchQuery: "family ties kindness parents reconciliation",
  },
  {
    id: "6",
    slug: "patah-hati",
    title: "Patah Hati",
    description: "Kehilangan seseorang yang dicintai",
    emoji: "🥀",
    category: "Hubungan",
    searchQuery: "heartbreak loss love healing Allah comfort",
  },

  // 📉 Karir & Studi
  {
    id: "7",
    slug: "gagal-ujian",
    title: "Habis Gagal Ujian",
    description: "Hasil ujian atau test tidak sesuai harapan",
    emoji: "📉",
    category: "Karir & Studi",
    searchQuery: "failure perseverance try again effort Allah plan",
  },
  {
    id: "8",
    slug: "mau-resign",
    title: "Mau Resign Kerja",
    description: "Bingung antara bertahan atau pergi",
    emoji: "💼",
    category: "Karir & Studi",
    searchQuery: "decision making tawakkul rizq seeking better",
  },
  {
    id: "9",
    slug: "susah-dapat-kerja",
    title: "Susah Dapat Kerja",
    description: "Sudah berusaha tapi belum ada hasil",
    emoji: "🔍",
    category: "Karir & Studi",
    searchQuery: "rizq provision sustenance effort tawakkul patience",
  },

  // 🏥 Kesehatan & Kehilangan
  {
    id: "10",
    slug: "orang-tua-sakit",
    title: "Orang Tua Sakit",
    description: "Melihat orang tua dalam kondisi lemah",
    emoji: "🏥",
    category: "Kesehatan & Kehilangan",
    searchQuery: "parents illness dua healing mercy compassion",
  },
  {
    id: "11",
    slug: "kehilangan-orang-tercinta",
    title: "Kehilangan Orang Tercinta",
    description: "Berduka atas kepergian seseorang",
    emoji: "🕊️",
    category: "Kesehatan & Kehilangan",
    searchQuery: "death grief loss inna lillahi patience afterlife",
  },

  // 🙏 Spiritual
  {
    id: "12",
    slug: "merasa-jauh-dari-allah",
    title: "Merasa Jauh dari Allah",
    description: "Iman terasa lemah, ibadah tidak khusyuk",
    emoji: "🌙",
    category: "Spiritual",
    searchQuery: "repentance return to Allah closeness dhikr heart",
  },
  {
    id: "13",
    slug: "mau-tobat",
    title: "Mau Tobat",
    description: "Ingin memulai lembaran baru yang lebih baik",
    emoji: "🤲",
    category: "Spiritual",
    searchQuery: "repentance tawbah forgiveness mercy Allah accepts",
  },
  {
    id: "14",
    slug: "bersyukur",
    title: "Lagi Bersyukur",
    description: "Ingin mengungkapkan rasa syukur hari ini",
    emoji: "✨",
    category: "Spiritual",
    searchQuery: "gratitude shukr blessings alhamdulillah thankful",
  },

  // 💰 Finansial
  {
    id: "15",
    slug: "masalah-finansial",
    title: "Masalah Finansial",
    description: "Sedang dalam kesulitan keuangan",
    emoji: "💸",
    category: "Finansial",
    searchQuery: "poverty financial difficulty rizq Allah provides test",
  },
  {
    id: "16",
    slug: "mau-mulai-bisnis",
    title: "Mau Mulai Bisnis",
    description: "Punya mimpi tapi butuh keberanian",
    emoji: "🚀",
    category: "Finansial",
    searchQuery: "effort striving halal provision courage start",
  },
];

export const categories = [
  "Tekanan & Kecemasan",
  "Hubungan",
  "Karir & Studi",
  "Kesehatan & Kehilangan",
  "Spiritual",
  "Finansial",
];

export const getSituationBySlug = (slug: string): Situation | undefined => {
  return situations.find((s) => s.slug === slug);
};

export const getSituationsByCategory = (category: string): Situation[] => {
  return situations.filter((s) => s.category === category);
};