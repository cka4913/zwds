import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load JSON data
const stemsBranchesData = JSON.parse(readFileSync(join(__dirname, "data/stems-branches.json"), "utf-8"));
const palaceOrderData = JSON.parse(readFileSync(join(__dirname, "data/palace-order.json"), "utf-8"));
const transformsYearData = JSON.parse(readFileSync(join(__dirname, "data/transforms-year.json"), "utf-8"));
const starsMainData = JSON.parse(readFileSync(join(__dirname, "data/stars-main.json"), "utf-8"));
const starsAssistData = JSON.parse(readFileSync(join(__dirname, "data/stars-assist.json"), "utf-8"));
// ============ Stems & Branches ============
export const HEAVENLY_STEMS = stemsBranchesData.heavenlyStems;
export const EARTH_BRANCHES = stemsBranchesData.earthBranches;
export function getOppositeBranch(branch) {
    return stemsBranchesData.opposites[branch];
}
export function getSanFangSiZheng(branch) {
    return stemsBranchesData.sanFangSiZheng[branch];
}
export function getBranchIndex(branch) {
    return stemsBranchesData.branchToIndex[branch];
}
export function getStemIndex(stem) {
    return stemsBranchesData.stemToIndex[stem];
}
export function getBranchByIndex(index) {
    return EARTH_BRANCHES[index % 12];
}
export function getStemByIndex(index) {
    return HEAVENLY_STEMS[index % 10];
}
// ============ Palaces ============
export const PALACE_NAMES = palaceOrderData.palaceNames;
export function getPalaceIndex(palace) {
    return palaceOrderData.palaceOrder[palace];
}
export function getOppositePalace(palace) {
    if (palace === "身宮")
        return "身宮"; // 身宮沒有對宮概念
    return palaceOrderData.opposites[palace];
}
export function getPalaceByIndex(index) {
    return PALACE_NAMES[index % 12];
}
// ============ Transforms (Four Transformations) ============
export function getYearTransforms(stem) {
    return transformsYearData[stem];
}
export function getTransformStar(stem, transform) {
    const transforms = transformsYearData[stem];
    return transforms[transform];
}
// ============ Main Stars ============
export const MAIN_STARS = starsMainData.stars;
export function getMainStarBrightness(star, branch) {
    const brightness = starsMainData.brightness[star];
    if (!brightness)
        return undefined;
    return brightness[branch];
}
// ============ Assist Stars ============
export const LUCKY_STARS = starsAssistData.luckyStars;
export const UNLUCKY_STARS = starsAssistData.unluckyStars;
export const OTHER_STARS = starsAssistData.otherStars;
export function getAssistStarBrightness(star, branch) {
    const brightness = starsAssistData.brightness[star];
    if (!brightness)
        return undefined;
    return brightness[branch];
}
export function getStarBrightness(star, branch) {
    return getMainStarBrightness(star, branch) ?? getAssistStarBrightness(star, branch);
}
export function formatStarWithBrightness(star, branch) {
    const brightness = getStarBrightness(star, branch);
    return {
        name: star,
        brightness
    };
}
