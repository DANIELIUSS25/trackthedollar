// Federal Reserve Districts (first letter of serial number)
export const FED_DISTRICTS: Record<string, { city: string; district: number; state: string; established: number }> = {
  A: { city: "Boston", district: 1, state: "Massachusetts", established: 1914 },
  B: { city: "New York", district: 2, state: "New York", established: 1914 },
  C: { city: "Philadelphia", district: 3, state: "Pennsylvania", established: 1914 },
  D: { city: "Cleveland", district: 4, state: "Ohio", established: 1914 },
  E: { city: "Richmond", district: 5, state: "Virginia", established: 1914 },
  F: { city: "Atlanta", district: 6, state: "Georgia", established: 1914 },
  G: { city: "Chicago", district: 7, state: "Illinois", established: 1914 },
  H: { city: "St. Louis", district: 8, state: "Missouri", established: 1914 },
  I: { city: "Minneapolis", district: 9, state: "Minnesota", established: 1914 },
  J: { city: "Kansas City", district: 10, state: "Missouri", established: 1914 },
  K: { city: "Dallas", district: 11, state: "Texas", established: 1914 },
  L: { city: "San Francisco", district: 12, state: "California", established: 1914 },
};

export type FancyType = {
  name: string;
  rarity: "Common" | "Uncommon" | "Scarce" | "Rare" | "Very Rare" | "Extremely Rare";
  description: string;
  rarityScore: number; // 1-10
};

export type DecodeResult = {
  valid: boolean;
  error?: string;
  districtLetter?: string;
  district?: { city: string; district: number; state: string; established: number };
  digits?: string;
  checkLetter?: string;
  isStar?: boolean;
  fancyTypes?: FancyType[];
  overallRarity?: number; // 1-10
  rarityLabel?: string;
  denomination?: string;
  printedBy?: string; // "Washington DC" or "Fort Worth, TX"
};

const RARITY_LABELS = ["Common", "Common", "Uncommon", "Uncommon", "Scarce", "Scarce", "Rare", "Rare", "Very Rare", "Very Rare", "Extremely Rare"];

export function decodeSerial(raw: string, denomination: string): DecodeResult {
  // Normalize: uppercase, remove spaces/dashes
  const input = raw.toUpperCase().replace(/[\s\-]/g, "");

  // Check for star note (★ or * at end)
  const isStar = input.endsWith("*") || input.endsWith("★");
  const normalized = isStar ? input.slice(0, -1) : input;

  // Format: [A-L][8 digits][A-Z] (11 chars) or [A-L][8 digits] (9 chars for star note input without check letter)
  // Also support FW prefix (Fort Worth): same format, FW printed on face of bill (not in serial)

  if (normalized.length < 9 || normalized.length > 11) {
    return { valid: false, error: "Serial numbers are 10-11 characters (e.g., B12345678C or B12345678A★). Please check and try again." };
  }

  const districtLetter = normalized[0];
  if (!FED_DISTRICTS[districtLetter]) {
    return { valid: false, error: `"${districtLetter}" is not a valid Federal Reserve district letter (A–L).` };
  }

  const digits = normalized.slice(1, 9);
  if (!/^\d{8}$/.test(digits)) {
    return { valid: false, error: "Characters 2–9 must be 8 digits (0–9)." };
  }

  const checkLetter = normalized.length === 10 ? normalized[9] : undefined;

  // Fancy serial analysis
  const fancyTypes = analyzeFancy(digits, isStar);

  // Overall rarity score
  let overallRarity = 1;
  if (isStar) overallRarity = Math.max(overallRarity, 5);
  if (fancyTypes.length > 0) {
    overallRarity = Math.max(overallRarity, ...fancyTypes.map(f => f.rarityScore));
  }
  // Compound rarity if multiple fancy types
  if (fancyTypes.length >= 2) overallRarity = Math.min(10, overallRarity + 1);
  if (isStar && fancyTypes.length >= 1) overallRarity = Math.min(10, overallRarity + 1);

  return {
    valid: true,
    districtLetter,
    district: FED_DISTRICTS[districtLetter],
    digits,
    ...(checkLetter != null && { checkLetter }),
    isStar,
    fancyTypes,
    overallRarity,
    rarityLabel: RARITY_LABELS[overallRarity],
    denomination,
  };
}

function analyzeFancy(digits: string, _isStar: boolean): FancyType[] {
  const types: FancyType[] = [];
  const uniqueDigits = new Set(digits.split(""));
  const num = parseInt(digits, 10);
  const reversed = digits.split("").reverse().join("");

  // Solid (all same digit)
  if (uniqueDigits.size === 1) {
    types.push({ name: "Solid", rarity: "Extremely Rare", rarityScore: 10, description: `All 8 digits are ${digits[0]} — one of the rarest fancy types.` });
    return types; // Solid supersedes everything
  }

  // Seven of a kind
  const counts = digits.split("").reduce((acc: Record<string, number>, d) => { acc[d] = (acc[d] ?? 0) + 1; return acc; }, {});
  const maxCount = Math.max(...Object.values(counts));
  if (maxCount === 7) {
    types.push({ name: "Seven of a Kind", rarity: "Very Rare", rarityScore: 9, description: "Seven of the 8 digits are the same — extremely collectible." });
  }

  // Radar (palindrome)
  if (digits === reversed && uniqueDigits.size > 1) {
    types.push({ name: "Radar", rarity: "Rare", rarityScore: 7, description: "Reads the same forwards and backwards." });
  }

  // Super radar (all but first/last same)
  if (digits[0] === digits[7] && new Set(digits.slice(1, 7).split("")).size === 1 && digits[1] !== digits[0]) {
    types.push({ name: "Super Radar", rarity: "Very Rare", rarityScore: 8, description: "Middle 6 digits are identical, outer 2 match each other." });
  }

  // Repeater (first 4 = last 4)
  if (digits.slice(0, 4) === digits.slice(4)) {
    types.push({ name: "Repeater", rarity: "Scarce", rarityScore: 6, description: "The first 4 digits repeat in the last 4 positions." });
  }

  // Super repeater (pairs repeat: AABBCCDD)
  if (digits[0] === digits[1] && digits[2] === digits[3] && digits[4] === digits[5] && digits[6] === digits[7]) {
    types.push({ name: "Super Repeater", rarity: "Rare", rarityScore: 7, description: "Four repeating digit pairs (e.g., 11223344)." });
  }

  // Double quad (first 4 all same, last 4 all same, different)
  if (new Set(digits.slice(0, 4).split("")).size === 1 && new Set(digits.slice(4).split("")).size === 1 && digits[0] !== digits[4]) {
    types.push({ name: "Double Quad", rarity: "Rare", rarityScore: 7, description: "Four identical digits followed by four different identical digits." });
  }

  // Ladder ascending
  if (digits === "12345678") {
    types.push({ name: "Ascending Ladder", rarity: "Very Rare", rarityScore: 9, description: "Sequential digits 1–2–3–4–5–6–7–8." });
  }
  // Ladder descending
  if (digits === "87654321") {
    types.push({ name: "Descending Ladder", rarity: "Very Rare", rarityScore: 9, description: "Sequential digits 8–7–6–5–4–3–2–1." });
  }

  // Binary (only 2 unique digits)
  if (uniqueDigits.size === 2) {
    types.push({ name: "Binary", rarity: "Scarce", rarityScore: 5, description: `Contains only 2 unique digits (${[...uniqueDigits].join(" and ")}).` });
  }

  // Trinary (only 3 unique digits)
  if (uniqueDigits.size === 3) {
    types.push({ name: "Trinary", rarity: "Uncommon", rarityScore: 3, description: "Contains only 3 unique digits." });
  }

  // Low serial number
  if (num <= 99) {
    types.push({ name: "Low Serial (≤99)", rarity: "Very Rare", rarityScore: 9, description: `Serial #${num} — extremely low serials are highly collectible.` });
  } else if (num <= 999) {
    types.push({ name: "Low Serial (≤999)", rarity: "Rare", rarityScore: 7, description: `Serial #${num} — low serials are sought by collectors.` });
  } else if (num <= 9999) {
    types.push({ name: "Low Serial (≤9999)", rarity: "Scarce", rarityScore: 5, description: `Serial #${num}` });
  }

  // High serial number
  if (num >= 99999999) {
    types.push({ name: "High Serial (max)", rarity: "Extremely Rare", rarityScore: 10, description: "The highest possible serial number — almost never seen." });
  } else if (num >= 99999900) {
    types.push({ name: "High Serial (≥99999900)", rarity: "Very Rare", rarityScore: 8, description: "Near-maximum serial number." });
  }

  // All zeros except one digit (near-solid)
  const zeroCount = digits.split("").filter(d => d === "0").length;
  if (zeroCount === 7) {
    types.push({ name: "Near-Solid Zeros", rarity: "Very Rare", rarityScore: 8, description: "Seven zeros and one other digit." });
  }

  return types;
}
