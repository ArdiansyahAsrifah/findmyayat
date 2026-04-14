/**
 * Maps a user's free-text story to the most relevant situation slug.
 * Instead of sending the story as a raw search query (which gives random
 * results because api.quran.com search is keyword-based, not semantic),
 * we detect the emotional core of the story and route it to a curated
 * situation — each of which already has a proven searchQuery in situations.ts.
 */

export type SituationSlug =
  | "overthinking"
  | "takut-gagal"
  | "stress-berat"
  | "disakiti-orang"
  | "konflik-keluarga"
  | "patah-hati"
  | "gagal-ujian"
  | "mau-resign"
  | "susah-dapat-kerja"
  | "orang-tua-sakit"
  | "kehilangan-orang-tercinta"
  | "merasa-jauh-dari-allah"
  | "mau-tobat"
  | "bersyukur"
  | "masalah-finansial"
  | "mau-mulai-bisnis";

interface Rule {
  pattern: RegExp;
  slug: SituationSlug;
}

const RULES: Rule[] = [
  // Gratitude — check early so it doesn't fall into negative patterns
  {
    pattern: /\b(grateful|gratitude|thankful|blessed|alhamdulillah|blessings|thank (you|god|allah))\b/i,
    slug: "bersyukur",
  },

  // Repentance / wanting to change
  {
    pattern: /\b(repent|repentance|taubat|tobat|sin|sinful|guilt|guilty|regret|ashamed|shame|start (over|fresh|again)|turn back (to allah|to god))\b/i,
    slug: "mau-tobat",
  },

  // Distant from faith
  {
    pattern: /\b(far from (allah|god|faith|islam)|distant (from allah|from god)|weak (faith|iman)|don'?t feel (close|connected)|lost (faith|connection)|empty (inside|spiritually)|not (praying|worshipping))\b/i,
    slug: "merasa-jauh-dari-allah",
  },

  // Death / loss of someone
  {
    pattern: /\b(died|passed away|death|funeral|losing (someone|a loved|my (mom|dad|father|mother|brother|sister|friend|husband|wife))|grief|mourning|miss (him|her|them) so much)\b/i,
    slug: "kehilangan-orang-tercinta",
  },

  // Parent / family member sick
  {
    pattern: /\b((my )?(mom|dad|mother|father|parent|parents) (is |are )?(sick|ill|hospital|diagnosed|cancer|disease|not well))\b/i,
    slug: "orang-tua-sakit",
  },

  // Family conflict
  {
    pattern: /\b(family (fight|conflict|problem|argument|issue)|fight with (my )?(mom|dad|parents|sibling|brother|sister)|toxic family|family (not talking|silent treatment))\b/i,
    slug: "konflik-keluarga",
  },

  // Heartbreak / relationship loss
  {
    pattern: /\b(heartbreak|heartbroken|break ?up|broke up|ex (boyfriend|girlfriend|husband|wife)|divorce|she left|he left|rejected (by|from) (her|him)|unrequited love|can'?t get over)\b/i,
    slug: "patah-hati",
  },

  // Hurt by someone / injustice
  {
    pattern: /\b(betrayed|backstabbed|lied to|cheated (on|by)|unfair(ly)?|injustice|treated (badly|unfairly|like dirt)|people (hurt|use|take advantage)|fake friends?|toxic (friend|person|people))\b/i,
    slug: "disakiti-orang",
  },

  // Financial problems
  {
    pattern: /\b(debt|broke|no money|financial(ly)? (difficult|struggling|crisis|problem)|can'?t (afford|pay|make ends meet)|loan|bankrupt|poor)\b/i,
    slug: "masalah-finansial",
  },

  // Starting a business
  {
    pattern: /\b(start (a )?business|build (a )?business|entrepreneur|startup|my (own )?business|side hustle|launch (a )?product|want to (sell|build|create) something)\b/i,
    slug: "mau-mulai-bisnis",
  },

  // Hard to find work
  {
    pattern: /\b(can'?t find (a )?(job|work)|no job|unemployed|job hunting|applying (for jobs?|everywhere)|rejected (from jobs?|every application)|nobody (hires?|calls back)|months? (without|no) (job|work|income))\b/i,
    slug: "susah-dapat-kerja",
  },

  // Considering resign
  {
    pattern: /\b(resign|quit (my )?(job|work)|leave (my )?(job|work|company)|should I (stay|leave|quit)|toxic (workplace|boss|office|coworker)|hate (my )?(job|work|office))\b/i,
    slug: "mau-resign",
  },

  // Failed exam / academic failure
  {
    pattern: /\b(fail(ed)? (the |my )?(exam|test|quiz|class|course|subject|uni|university|college)|bad (grade|score|result)|didn'?t pass|not (passing|accepted)|flunk(ed)?)\b/i,
    slug: "gagal-ujian",
  },

  // Anxiety & overthinking
  {
    pattern: /\b(overthink(ing)?|can'?t stop thinking|mind (won'?t stop|racing|keeps going)|anxious|anxiety|panic attack|worried (all the time|constantly|too much)|what if everything goes wrong)\b/i,
    slug: "overthinking",
  },

  // Fear of failure
  {
    pattern: /\b(scared (to try|of failing|of (the )?result)|afraid (to fail|to try|of (the )?outcome)|what if I fail|fear of failure|too scared|don'?t dare)\b/i,
    slug: "takut-gagal",
  },

  // Heavy stress / overwhelm
  {
    pattern: /\b(overwhelm(ed)?|too much (pressure|stress|to handle|going on)|can'?t (cope|handle|take it anymore|breathe)|breaking (down|point)|everything (is too much|falling apart)|burnout|burned out)\b/i,
    slug: "stress-berat",
  },

  // General sadness / failure (broad catch-all negatives)
  {
    pattern: /\b(sad|unhappy|depress(ed|ion)?|hopeless|miserable|feel(ing)? (so )?(bad|terrible|awful|horrible|lost|empty|broken|alone|numb|worthless))\b/i,
    slug: "stress-berat",
  },

  // General failure at work/life
  {
    pattern: /\b(fail(ed)?|failure|messed up|screwed up|made a mistake|big mistake|ruined (everything|it)|disappointed (everyone|myself|them))\b/i,
    slug: "gagal-ujian",
  },
];

const DEFAULT_SLUG: SituationSlug = "stress-berat";

export function extractSituationSlug(story: string): SituationSlug {
  for (const { pattern, slug } of RULES) {
    if (pattern.test(story)) return slug;
  }
  return DEFAULT_SLUG;
}