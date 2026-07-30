/**
 * MODEL PROMPT DATA — Separate from normal promptData.js
 * Contains model-specific surprise-me prompts for premium model generation.
 * These are ONLY used when the Model Auto Loop is active.
 */

export const MODEL_SURPRISE_PROMPTS = [
  "blonde model + extremely large full breasts + tight orange crop top + deep cleavage + standing mirror selfie + luxury bathroom + wet hair look + bold seductive eyes + sharp details + 4k",
  "brunette model + massive bust + tiny black spaghetti strap top + plunging neckline + sitting on edge of bed + dim bedroom lighting + glossy lips + confident sexy expression + photorealistic + 4k",
  "redhead model + huge cleavage + tight beige ribbed tank top + deep v-cut + leaning against wall selfie + modern apartment hallway + soft side lighting + highly attractive face + bold look + ultra realistic + 4k",
  "asian model + extremely large breasts + tight red micro crop top + deep cleavage + sitting cross-legged on floor + indoor plant corner + natural window light + seductive half-smile + sharp skin texture + 4k",
  "latina model + massive bust + tiny white tube top + deep cleavage + standing outdoor selfie + city balcony at sunset + wind-blown hair + bold attractive expression + high detail + 4k",
  "blonde model + huge full breasts + tight pink halter top + plunging neckline + sitting on beach chair + sunny tropical beach + ocean background + glamorous wet-look skin + sexy confident pose + 4k",
  "brunette model + extremely large breasts + tiny green low-cut tank + deep cleavage + leaning on car door selfie + parked luxury car + golden hour light + bold seductive gaze + photorealistic + 4k",
  "asian model + massive cleavage + tight black mesh crop top + deep neckline + kneeling on bed + soft bedroom lighting + messy hair + highly attractive face + sexy bold look + ultra detailed + 4k",
  "redhead model + huge bust + tiny cream off-shoulder top + deep cleavage + sitting on cafe chair + outdoor cafe terrace + natural daylight + glossy lips + confident attractive expression + 4k",
  "blonde model + extremely large full breasts + tight blue sports crop top + deep cleavage + standing gym selfie + modern gym background + post-workout glow + bold sexy eyes + sharp focus + 4k",
  "latina model + massive bust + tiny yellow strappy top + plunging neckline + sitting on windowsill + bright apartment window + soft morning light + seductive half-lidded eyes + photorealistic + 4k",
  "brunette model + huge cleavage + tight purple bodysuit top + deep v-cut + standing against brick wall + urban street background + evening light + bold attractive face + ultra realistic + 4k",
  "asian model + extremely large breasts + tiny white lace crop top + deep cleavage + lying on stomach on bed + soft bedroom lighting + looking up at camera + sexy confident expression + 4k",
  "blonde model + massive bust + tight black low-cut tank + deep cleavage + sitting on rooftop ledge + city skyline background + golden sunset light + glamorous makeup + bold seductive look + 4k",
  "redhead model + huge full breasts + tiny olive green crop top + plunging neckline + standing in doorway selfie + modern home interior + soft indoor light + highly attractive face + sexy bold pose + 4k"
];

/**
 * Generate a random model-specific surprise prompt.
 * Completely separate from the normal generateRandomSurprise() function.
 */
export const generateModelSurprise = () => {
  return MODEL_SURPRISE_PROMPTS[Math.floor(Math.random() * MODEL_SURPRISE_PROMPTS.length)];
};
