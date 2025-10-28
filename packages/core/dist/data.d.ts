import type { EarthBranch, HeavenlyStem, PalaceName, Transform } from "./types.js";
export declare const HEAVENLY_STEMS: HeavenlyStem[];
export declare const EARTH_BRANCHES: EarthBranch[];
export declare function getOppositeBranch(branch: EarthBranch): EarthBranch;
export declare function getSanFangSiZheng(branch: EarthBranch): EarthBranch[];
export declare function getBranchIndex(branch: EarthBranch): number;
export declare function getStemIndex(stem: HeavenlyStem): number;
export declare function getBranchByIndex(index: number): EarthBranch;
export declare function getStemByIndex(index: number): HeavenlyStem;
export declare const PALACE_NAMES: PalaceName[];
export declare function getPalaceIndex(palace: PalaceName): number;
export declare function getOppositePalace(palace: PalaceName): PalaceName;
export declare function getPalaceByIndex(index: number): PalaceName;
export declare function getYearTransforms(stem: HeavenlyStem): Record<Transform, string>;
export declare function getTransformStar(stem: HeavenlyStem, transform: Transform): string;
export declare const MAIN_STARS: string[];
export declare function getMainStarBrightness(star: string, branch: EarthBranch): string | undefined;
export declare const LUCKY_STARS: string[];
export declare const UNLUCKY_STARS: string[];
export declare const OTHER_STARS: string[];
export declare function getAssistStarBrightness(star: string, branch: EarthBranch): string | undefined;
export declare function getStarBrightness(star: string, branch: EarthBranch): string | undefined;
export interface StarWithBrightness {
    name: string;
    brightness?: string;
}
export declare function formatStarWithBrightness(star: string, branch: EarthBranch): StarWithBrightness;
