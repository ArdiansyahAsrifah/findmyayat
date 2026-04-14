import { Situation } from "@/types";

export const situations: Situation[] = [
  // 😰 Pressure & Anxiety
  {
    id: "1",
    slug: "overthinking",
    title: "Overthinking",
    description: "Your mind won’t stop racing, constant anxiety",
    emoji: "😰",
    category: "Pressure & Anxiety",
    searchQuery: "anxiety worry trust Allah peace of mind",
  },
  {
    id: "2",
    slug: "fear-of-failure",
    title: "Fear of Failure",
    description: "Want to try but afraid of disappointing results",
    emoji: "😨",
    category: "Pressure & Anxiety",
    searchQuery: "fear failure courage trust Allah outcome",
  },
  {
    id: "3",
    slug: "heavy-stress",
    title: "Heavy Stress",
    description: "The burden feels too heavy to carry",
    emoji: "😩",
    category: "Pressure & Anxiety",
    searchQuery: "hardship burden relief Allah does not burden beyond capacity",
  },

  // 💔 Relationships
  {
    id: "4",
    slug: "hurt-by-others",
    title: "Hurt by Others",
    description: "Being treated unfairly by someone",
    emoji: "💔",
    category: "Relationships",
    searchQuery: "oppression injustice patience forgiveness Allah sees",
  },
  {
    id: "5",
    slug: "family-conflict",
    title: "Family Conflict",
    description: "Things are not going well in the family",
    emoji: "👨‍👩‍👧",
    category: "Relationships",
    searchQuery: "family ties kindness parents reconciliation",
  },
  {
    id: "6",
    slug: "heartbreak",
    title: "Heartbreak",
    description: "Losing someone you deeply love",
    emoji: "🥀",
    category: "Relationships",
    searchQuery: "heartbreak loss love healing Allah comfort",
  },

  // 📉 Career & Study
  {
    id: "7",
    slug: "failed-exam",
    title: "Failed an Exam",
    description: "Your test results didn’t meet expectations",
    emoji: "📉",
    category: "Career & Study",
    searchQuery: "failure perseverance try again effort Allah plan",
  },
  {
    id: "8",
    slug: "thinking-of-resigning",
    title: "Thinking of Resigning",
    description: "Confused whether to stay or leave your job",
    emoji: "💼",
    category: "Career & Study",
    searchQuery: "decision making tawakkul rizq seeking better",
  },
  {
    id: "9",
    slug: "struggling-to-find-job",
    title: "Struggling to Find a Job",
    description: "You’ve tried, but no results yet",
    emoji: "🔍",
    category: "Career & Study",
    searchQuery: "rizq provision sustenance effort tawakkul patience",
  },

  // 🏥 Health & Loss
  {
    id: "10",
    slug: "sick-parents",
    title: "Parents Are Sick",
    description: "Seeing your parents in a weak condition",
    emoji: "🏥",
    category: "Health & Loss",
    searchQuery: "parents illness dua healing mercy compassion",
  },
  {
    id: "11",
    slug: "losing-loved-one",
    title: "Losing a Loved One",
    description: "Grieving the loss of someone dear",
    emoji: "🕊️",
    category: "Health & Loss",
    searchQuery: "death grief loss inna lillahi patience afterlife",
  },

  // 🙏 Spiritual
  {
    id: "12",
    slug: "feeling-distant-from-allah",
    title: "Feeling Distant from Allah",
    description: "Faith feels weak, worship feels empty",
    emoji: "🌙",
    category: "Spiritual",
    searchQuery: "repentance return to Allah closeness dhikr heart",
  },
  {
    id: "13",
    slug: "want-to-repent",
    title: "Want to Repent",
    description: "Want to start a better chapter in life",
    emoji: "🤲",
    category: "Spiritual",
    searchQuery: "repentance tawbah forgiveness mercy Allah accepts",
  },
  {
    id: "14",
    slug: "feeling-grateful",
    title: "Feeling Grateful",
    description: "Want to express gratitude today",
    emoji: "✨",
    category: "Spiritual",
    searchQuery: "gratitude shukr blessings alhamdulillah thankful",
  },

  // 💰 Financial
  {
    id: "15",
    slug: "financial-problems",
    title: "Financial Problems",
    description: "Facing financial difficulties",
    emoji: "💸",
    category: "Financial",
    searchQuery: "poverty financial difficulty rizq Allah provides test",
  },
  {
    id: "16",
    slug: "starting-a-business",
    title: "Starting a Business",
    description: "Have a dream but need courage to begin",
    emoji: "🚀",
    category: "Financial",
    searchQuery: "effort striving halal provision courage start",
  },
];

export const categories = [
  "Pressure & Anxiety",
  "Relationships",
  "Career & Study",
  "Health & Loss",
  "Spiritual",
  "Financial",
];


// 🔥 ADD THIS (IMPORTANT FIX)
const slugMap: Record<string, string> = {
  "takut-gagal": "fear-of-failure",
  "stress-berat": "heavy-stress",
  "disakiti-orang": "hurt-by-others",
  "konflik-keluarga": "family-conflict",
  "gagal-ujian": "failed-exam",
  "mau-resign": "thinking-of-resigning",
  "susah-dapat-kerja": "struggling-to-find-job",
  "orang-tua-sakit": "sick-parents",
  "kehilangan-orang-tercinta": "losing-loved-one",
  "merasa-jauh-dari-allah": "feeling-distant-from-allah",
  "mau-tobat": "want-to-repent",
  "bersyukur": "feeling-grateful",
  "masalah-finansial": "financial-problems",
  "mau-mulai-bisnis": "starting-a-business",
};

export const getSituationBySlug = (slug: string): Situation | undefined => {
  const normalizedSlug = slugMap[slug] || slug;
  return situations.find((s) => s.slug === normalizedSlug);
};

export const getSituationsByCategory = (category: string): Situation[] => {
  return situations.filter((s) => s.category === category);
};