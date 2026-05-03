/**
 * Maps a user's free-text story to the most relevant situation slug.
 * Uses a scoring system — semua rules dicek, slug dengan total score
 * tertinggi yang menang. Lebih akurat dari first-match-wins.
 */

export type SituationSlug =
  | "overthinking"
  | "fear-of-failure"
  | "heavy-stress"
  | "hurt-by-others"
  | "family-conflict"
  | "heartbreak"
  | "failed-exam"
  | "thinking-of-resigning"
  | "struggling-to-find-job"
  | "sick-parents"
  | "losing-loved-one"
  | "feeling-distant-from-allah"
  | "want-to-repent"
  | "feeling-grateful"
  | "financial-problems"
  | "starting-a-business";

interface Rule {
  pattern: RegExp;
  slug: SituationSlug;
  weight: number; // bobot — keyword spesifik dapat weight lebih tinggi
}

const RULES: Rule[] = [
  // ─── Gratitude ───────────────────────────────────────────
  {
    pattern:
      /\b(grateful|gratitude|thankful|blessed|alhamdulillah|blessings|thank (you|god|allah)|syukur|bersyukur|nikmat|rezeki lancar|happy today|feeling good|content)\b/i,
    slug: "feeling-grateful",
    weight: 3,
  },

  // ─── Repentance ──────────────────────────────────────────
  {
    pattern:
      /\b(repent|repentance|taubat|tobat|sin|sinful|guilt|guilty|regret|ashamed|shame|start (over|fresh|again)|turn back (to allah|to god)|dosa|mau berubah|ingin lebih baik|bertobat|istighfar)\b/i,
    slug: "want-to-repent",
    weight: 3,
  },

  // ─── Distant from faith ──────────────────────────────────
  {
    pattern:
      /\b(far from (allah|god|faith|islam)|distant (from allah|from god)|weak (faith|iman)|don'?t feel (close|connected)|lost (faith|connection)|empty (inside|spiritually)|not (praying|worshipping)|jauh dari allah|iman lemah|malas ibadah|tidak sholat|lupa allah|lalai)\b/i,
    slug: "feeling-distant-from-allah",
    weight: 3,
  },

  // ─── Death / loss ─────────────────────────────────────────
  {
    pattern:
      /\b(died|passed away|death|funeral|losing (someone|a loved|my (mom|dad|father|mother|brother|sister|friend|husband|wife))|grief|mourning|miss (him|her|them) so much|meninggal|wafat|kehilangan|berduka|ditinggal pergi|almarhum|almarhumah)\b/i,
    slug: "losing-loved-one",
    weight: 4,
  },

  // ─── Parent sick ──────────────────────────────────────────
  {
    pattern:
      /\b((my )?(mom|dad|mother|father|parent|parents|orang tua|ayah|ibu|mama|papa|bapak) (is |are |lagi |sedang )?(sick|ill|hospital|diagnosed|cancer|disease|not well|sakit|opname|dirawat|masuk rs|masuk rumah sakit))\b/i,
    slug: "sick-parents",
    weight: 4,
  },

  // ─── Family conflict ──────────────────────────────────────
  {
    pattern:
      /\b(family (fight|conflict|problem|argument|issue)|fight with (my )?(mom|dad|parents|sibling|brother|sister)|toxic family|family (not talking|silent treatment)|berantem sama (orang tua|keluarga|ayah|ibu|kakak|adik)|konflik keluarga|rumah tangga berantakan|hubungan keluarga)\b/i,
    slug: "family-conflict",
    weight: 3,
  },

  // ─── Heartbreak ───────────────────────────────────────────
  {
    pattern:
      /\b(heartbreak|heartbroken|break ?up|broke up|ex (boyfriend|girlfriend|husband|wife)|divorce|she left|he left|rejected (by|from) (her|him)|unrequited love|can'?t get over|putus|ditinggal (pacar|kekasih)|patah hati|galau|move on|sakit hati)\b/i,
    slug: "heartbreak",
    weight: 3,
  },

  // ─── Hurt by others ───────────────────────────────────────
  {
    pattern:
      /\b(betrayed|backstabbed|lied to|cheated (on|by)|unfair(ly)?|injustice|treated (badly|unfairly|like dirt)|people (hurt|use|take advantage)|fake friends?|toxic (friend|person|people)|dikhianati|dizalimi|diperlakukan tidak adil|teman palsu|ditipu|dibohongi)\b/i,
    slug: "hurt-by-others",
    weight: 3,
  },

  // ─── Financial ────────────────────────────────────────────
  {
    pattern:
      /\b(debt|broke|no money|financial(ly)? (difficult|struggling|crisis|problem)|can'?t (afford|pay|make ends meet)|loan|bankrupt|poor|utang|bokek|tidak punya uang|masalah keuangan|susah bayar|kekurangan uang|tagihan|cicilan|kepepet)\b/i,
    slug: "financial-problems",
    weight: 3,
  },

  // ─── Starting a business ──────────────────────────────────
  {
    pattern:
      /\b(start (a )?business|build (a )?business|entrepreneur|startup|my (own )?business|side hustle|launch (a )?product|want to (sell|build|create) something|mau bisnis|mulai usaha|buka usaha|jualan|wirausaha|modal usaha)\b/i,
    slug: "starting-a-business",
    weight: 3,
  },

  // ─── Struggling to find job ───────────────────────────────
  {
    pattern:
      /\b(can'?t find (a )?(job|work)|no job|unemployed|job hunting|applying (for jobs?|everywhere)|rejected (from jobs?|every application)|nobody (hires?|calls back)|months? (without|no) (job|work|income)|susah cari kerja|tidak dapat kerja|nganggur|jobless|lamaran ditolak|belum dapat kerja)\b/i,
    slug: "struggling-to-find-job",
    weight: 3,
  },

  // ─── Thinking of resigning ────────────────────────────────
  {
    pattern:
      /\b(resign|quit (my )?(job|work)|leave (my )?(job|work|company)|should I (stay|leave|quit)|toxic (workplace|boss|office|coworker)|hate (my )?(job|work|office)|mau resign|mau keluar kerja|bosen kerja|capek kerja|atasan toxic|lingkungan kerja toxic)\b/i,
    slug: "thinking-of-resigning",
    weight: 3,
  },

  // ─── Failed exam ──────────────────────────────────────────
  {
    pattern:
      /\b(fail(ed)? (the |my )?(exam|test|quiz|class|course|subject|uni|university|college)|bad (grade|score|result)|didn'?t pass|not (passing|accepted)|flunk(ed)?|gagal ujian|tidak lulus|nilai jelek|remedial|tidak naik kelas|ditolak (kampus|universitas))\b/i,
    slug: "failed-exam",
    weight: 3,
  },

  // ─── Overthinking ─────────────────────────────────────────
  {
    pattern:
      /\b(overthink(ing)?|can'?t stop thinking|mind (won'?t stop|racing|keeps going)|anxious|anxiety|panic attack|worried (all the time|constantly|too much)|what if everything goes wrong|overthinking|pikiran tidak tenang|kepikiran terus|tidak bisa tidur karena pikiran|susah tidur|was-was)\b/i,
    slug: "overthinking",
    weight: 2,
  },

  // ─── Fear of failure ──────────────────────────────────────
  {
    pattern:
      /\b(scared (to try|of failing|of (the )?result)|afraid (to fail|to try|of (the )?outcome)|what if I fail|fear of failure|too scared|don'?t dare|takut gagal|takut mencoba|tidak berani|ragu-ragu|tidak yakin diri)\b/i,
    slug: "fear-of-failure",
    weight: 2,
  },

  // ─── Heavy stress (spesifik) ──────────────────────────────
  {
    pattern:
      /\b(overwhelm(ed)?|too much (pressure|stress|to handle|going on)|can'?t (cope|handle|take it anymore|breathe)|breaking (down|point)|everything (is too much|falling apart)|burnout|burned out|tekanan berat|beban berat|tidak kuat lagi|mau menyerah|sudah tidak sanggup)\b/i,
    slug: "heavy-stress",
    weight: 2,
  },

  // ─── General sadness (broad catch-all — weight rendah) ────
  {
    pattern:
      /\b(sad|unhappy|depress(ed|ion)?|hopeless|miserable|feel(ing)? (so )?(bad|terrible|awful|horrible|lost|empty|broken|alone|numb|worthless)|sedih|putus asa|tidak bahagia|merasa sendiri|kesepian|hampa)\b/i,
    slug: "heavy-stress",
    weight: 1,
  },

  // ─── General failure (broad catch-all — weight rendah) ────
  {
    pattern:
      /\b(fail(ed)?|failure|messed up|screwed up|made a mistake|big mistake|ruined (everything|it)|disappointed (everyone|myself|them)|gagal|kecewa|mengecewakan|salah langkah)\b/i,
    slug: "failed-exam",
    weight: 1,
  },
];

const DEFAULT_SLUG: SituationSlug = "heavy-stress";

export function extractSituationSlug(story: string): SituationSlug {
  const scores: Partial<Record<SituationSlug, number>> = {};

  for (const { pattern, slug, weight } of RULES) {
    // Hitung jumlah match (bukan hanya true/false)
    const matches = story.match(new RegExp(pattern.source, "gi"));
    if (matches) {
      scores[slug] = (scores[slug] || 0) + matches.length * weight;
    }
  }

  // Kalau tidak ada match sama sekali → default
  if (Object.keys(scores).length === 0) return DEFAULT_SLUG;

  // Return slug dengan score tertinggi
  const best = Object.entries(scores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  return best[0] as SituationSlug;
}