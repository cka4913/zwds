import type { EarthBranch, HeavenlyStem, PalaceName, Transform } from "./types.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON data
const stemsBranchesData = JSON.parse(
  readFileSync(join(__dirname, "data/stems-branches.json"), "utf-8")
);
const palaceOrderData = JSON.parse(
  readFileSync(join(__dirname, "data/palace-order.json"), "utf-8")
);
const transformsYearData = JSON.parse(
  readFileSync(join(__dirname, "data/transforms-year.json"), "utf-8")
);
const starsMainData = JSON.parse(
  readFileSync(join(__dirname, "data/stars-main.json"), "utf-8")
);
const starsAssistData = JSON.parse(
  readFileSync(join(__dirname, "data/stars-assist.json"), "utf-8")
);

// ============ Stems & Branches ============
export const HEAVENLY_STEMS = stemsBranchesData.heavenlyStems as HeavenlyStem[];
export const EARTH_BRANCHES = stemsBranchesData.earthBranches as EarthBranch[];

export function getOppositeBranch(branch: EarthBranch): EarthBranch {
  return stemsBranchesData.opposites[branch] as EarthBranch;
}

export function getSanFangSiZheng(branch: EarthBranch): EarthBranch[] {
  return stemsBranchesData.sanFangSiZheng[branch] as EarthBranch[];
}

export function getBranchIndex(branch: EarthBranch): number {
  return stemsBranchesData.branchToIndex[branch];
}

export function getStemIndex(stem: HeavenlyStem): number {
  return stemsBranchesData.stemToIndex[stem];
}

export function getBranchByIndex(index: number): EarthBranch {
  return EARTH_BRANCHES[index % 12];
}

export function getStemByIndex(index: number): HeavenlyStem {
  return HEAVENLY_STEMS[index % 10];
}

// ============ Palaces ============
export const PALACE_NAMES = palaceOrderData.palaceNames as PalaceName[];

export function getPalaceIndex(palace: PalaceName): number {
  return palaceOrderData.palaceOrder[palace];
}

export function getOppositePalace(palace: PalaceName): PalaceName {
  if (palace === "身宮") return "身宮"; // 身宮沒有對宮概念
  return palaceOrderData.opposites[palace] as PalaceName;
}

export function getPalaceByIndex(index: number): PalaceName {
  return PALACE_NAMES[index % 12];
}

// ============ Transforms (Four Transformations) ============
export function getYearTransforms(stem: HeavenlyStem): Record<Transform, string> {
  return transformsYearData[stem] as Record<Transform, string>;
}

export function getTransformStar(stem: HeavenlyStem, transform: Transform): string {
  const transforms = transformsYearData[stem] as Record<Transform, string>;
  return transforms[transform];
}

// ============ Main Stars ============
export const MAIN_STARS = starsMainData.stars as string[];

export function getMainStarBrightness(star: string, branch: EarthBranch): string | undefined {
  const brightness = starsMainData.brightness[star];
  if (!brightness) return undefined;
  return brightness[branch];
}

// ============ Assist Stars ============
export const LUCKY_STARS = starsAssistData.luckyStars as string[];
export const UNLUCKY_STARS = starsAssistData.unluckyStars as string[];
export const OTHER_STARS = starsAssistData.otherStars as string[];

export function getAssistStarBrightness(star: string, branch: EarthBranch): string | undefined {
  const brightness = starsAssistData.brightness[star];
  if (!brightness) return undefined;
  return brightness[branch];
}

export function getStarBrightness(star: string, branch: EarthBranch): string | undefined {
  return getMainStarBrightness(star, branch) ?? getAssistStarBrightness(star, branch);
}

// ============ Helper: Get all stars in a branch with brightness ============
export interface StarWithBrightness {
  name: string;
  brightness?: string;
}

export function formatStarWithBrightness(star: string, branch: EarthBranch): StarWithBrightness {
  const brightness = getStarBrightness(star, branch);
  return {
    name: star,
    brightness
  };
}
