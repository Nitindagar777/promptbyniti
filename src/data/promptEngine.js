/* ============================================================
   PROMPT ENGINE — Core logic for generating structured prompts
   ============================================================ */

import { categories, styles, moods, lightingOptions, cameraAngles } from './promptData';

const getLabel = (list, id) => {
  const item = list.find(i => i.id === id);
  return item ? item.label : id;
};

/* Subject detail expansions by category */
const subjectExpansions = {
  portrait: 'a person, highly detailed face with natural skin texture, expressive eyes, sharp facial features',
  product: 'a product placed on a clean surface, professional studio setup, high-end commercial quality',
  landscape: 'a sweeping natural landscape, vast terrain with atmospheric depth, layered composition',
  tattoo: 'detailed tattoo design on skin, intricate linework, fine ornamental patterns',
  thumbnail: 'eye-catching thumbnail composition, bold text-friendly layout, high contrast focal point',
  'ai-influencer': 'a hyper-realistic AI-generated virtual influencer, flawless features, modern fashion',
  fashion: 'a high-fashion model in designer clothing, editorial pose, couture aesthetic',
  architecture: 'stunning architectural structure, precise geometry, interplay of light and form',
  food: 'beautifully plated gourmet dish, appetizing colors, steam and fresh ingredients visible',
  abstract: 'abstract shapes and flowing forms, complex patterns, non-representational art',
  anime: 'detailed anime character art, large expressive eyes, dynamic manga-inspired composition',
  fantasy: 'an epic fantasy scene, mythical creatures, enchanted atmosphere, magical elements',
};

/* Style keyword expansions */
const styleKeywords = {
  photorealistic: 'ultra-photorealistic, 8K UHD, RAW photo, DSLR quality, Fujifilm XT3',
  cinematic: 'cinematic composition, anamorphic lens, 35mm film grain, directed by Roger Deakins',
  anime: 'anime art style, cel-shaded, vibrant linework, Studio Ghibli inspired',
  'oil-painting': 'oil painting on canvas, visible brushstrokes, rich color layering, museum quality',
  watercolor: 'delicate watercolor painting, soft color bleeds, paper texture visible, artistic',
  'digital-art': 'professional digital illustration, vector-sharp, ArtStation trending, DeviantArt featured',
  '3d-render': '3D rendered, Octane Render, smooth materials, physically based rendering (PBR), C4D',
  'comic-book': 'comic book art style, bold ink outlines, halftone dots, splash page composition',
  'pixel-art': 'pixel art style, 16-bit retro aesthetic, limited color palette, retro gaming',
  surrealism: 'surrealist art, impossible geometry, dreamlike, inspired by Salvador Dalí',
  minimalist: 'minimalist composition, clean negative space, simple shapes, refined elegance',
  'concept-art': 'concept art, environment design, production quality, entertainment industry standard',
  'pop-art': 'pop art style, bold primary colors, Ben-Day dots, Roy Lichtenstein inspired',
  'retro-vintage': 'retro vintage aesthetic, faded colors, nostalgic 70s/80s style, analog warmth',
};

/* Mood atmosphere descriptors */
const moodDescriptors = {
  dark: 'dark moody atmosphere, deep shadows, low key tonality, mysterious ambiance',
  aesthetic: 'aesthetic vibes, Instagram-worthy, visually pleasing color harmony, curated look',
  vibrant: 'vibrant saturated colors, high energy, lively and dynamic, vivid chromatic range',
  dreamy: 'dreamy soft focus, ethereal glow, pastel tones, otherworldly atmosphere',
  elegant: 'elegant and sophisticated, refined luxury, premium aesthetic, timeless beauty',
  grungy: 'grungy raw texture, urban decay, rough edges, industrial grittiness',
  nostalgic: 'nostalgic warm tones, vintage feel, sentimental atmosphere, timeworn beauty',
  futuristic: 'futuristic sci-fi aesthetic, holographic elements, advanced technology, neon-lit',
  serene: 'serene calm atmosphere, peaceful tranquility, zen-like composition, gentle tones',
  intense: 'intense dramatic tension, powerful composition, emotional impact, bold contrast',
  whimsical: 'whimsical playful design, fairy-tale quality, charming and enchanting, lighthearted',
  mysterious: 'mysterious enigmatic mood, hidden details, fog and shadow, intriguing ambiance',
};

/* Lighting descriptors */
const lightingDescriptors = {
  'soft-light': 'soft diffused lighting, gentle shadows, even illumination',
  'golden-hour': 'golden hour sunlight, warm amber tones, long shadows, magic hour',
  neon: 'neon glow lighting, cyberpunk colors, electric blue and pink, fluorescent',
  studio: 'professional studio lighting, three-point setup, controlled highlights',
  dramatic: 'dramatic chiaroscuro, strong directional light, deep contrast',
  backlit: 'backlit silhouette, rim lighting, halo effect, light leak',
  natural: 'natural daylight, true-to-life illumination, open shade',
  volumetric: 'volumetric light rays, god rays, atmospheric haze, light through fog',
  cinematic: 'cinematic lighting, color-graded, film noir shadows, Hollywood quality',
  'rim-light': 'edge rim lighting, glowing outline, separation from background',
  bioluminescent: 'bioluminescent glow, organic light source, deep sea ambiance',
  moonlight: 'soft moonlight, blue-silver tones, nighttime illumination',
};

/* Camera descriptors */
const cameraDescriptors = {
  'close-up': 'close-up shot, tight framing, intimate perspective, f/2.8 shallow DOF',
  'extreme-close-up': 'extreme close-up, macro detail, filling the frame, f/1.4',
  'medium-shot': 'medium shot composition, waist-up framing, natural perspective',
  'wide-shot': 'wide-angle shot, expansive view, environmental context, 24mm lens',
  'birds-eye': "bird's eye view, top-down perspective, overhead composition",
  'worms-eye': "worm's eye view, low angle, looking upward, dramatic perspective",
  'dutch-angle': 'Dutch angle, tilted frame, dynamic tension, off-kilter composition',
  'over-shoulder': 'over-the-shoulder shot, depth layering, foreground framing',
  aerial: 'aerial drone photography, high altitude, sweeping vista, DJI quality',
  macro: 'macro photography, extreme detail, f/16, focus stacking',
};

/* Quality/rendering keywords */
const qualityKeywords = [
  'masterpiece',
  'best quality',
  'highly detailed',
  'sharp focus',
  'intricate details',
  'professional',
  'award-winning',
];

/* Negative prompts by category */
const negativePrompts = {
  default: 'blurry, low quality, watermark, text overlay, cropped, out of frame, duplicate, deformed, disfigured, bad anatomy, bad proportions, extra limbs, mutated hands, poorly drawn face, mutation, jpeg artifacts, ugly, tiling, poorly drawn, oversaturated',
  portrait: 'blurry, low quality, watermark, text, cropped, out of frame, deformed face, bad anatomy, extra fingers, mutated hands, poorly drawn face, asymmetric eyes, distorted features, ugly, disfigured, duplicate, jpeg artifacts',
  anime: 'blurry, low quality, watermark, text, bad anatomy, extra limbs, poorly drawn, deformed, disfigured, realistic photo, 3D render, western style, ugly, duplicate',
  product: 'blurry, low quality, watermark, text, cropped, messy background, cluttered, low resolution, amateur, poorly lit, distorted, cheap-looking, unfocused',
  landscape: 'blurry, low quality, watermark, text, cropped, oversaturated, unrealistic colors, flat composition, boring perspective, duplicate elements, haze artifacts',
  tattoo: 'blurry, low quality, watermark, text, distorted lines, messy details, uneven spacing, smudged, muddy colors, out of focus, poorly drawn',
};

/**
 * Generate a structured prompt from user selections
 */
export function generatePrompt({ category, style, mood, lighting, camera, description, model = 'midjourney' }) {
  const catLabel = getLabel(categories, category);
  const subjectDetail = subjectExpansions[category] || subjectExpansions.portrait;
  const styleKw = styleKeywords[style] || styleKeywords.photorealistic;
  const moodDesc = moodDescriptors[mood] || moodDescriptors.aesthetic;
  const lightDesc = lightingDescriptors[lighting] || lightingDescriptors['soft-light'];
  const cameraDesc = cameraDescriptors[camera] || cameraDescriptors['medium-shot'];
  const quality = qualityKeywords.join(', ');
  const negPrompt = negativePrompts[category] || negativePrompts.default;

  /* Build the main prompt */
  const mainParts = [
    description || `${catLabel} scene`,
    subjectDetail,
    moodDesc,
    lightDesc,
    cameraDesc,
    styleKw,
    quality,
  ];

  let mainPrompt = mainParts.join(', ');

  /* Format for specific AI model */
  if (model === 'midjourney') {
    mainPrompt += ' --ar 16:9 --v 6 --q 2 --s 750';
  } else if (model === 'stable-diffusion') {
    mainPrompt = `(${description || catLabel} scene:1.3), (${subjectDetail}:1.2), ${moodDesc}, ${lightDesc}, ${cameraDesc}, (${styleKw}:1.1), ${quality}, steps: 30, cfg: 7.5`;
  }

  /* Generate variations */
  const variations = generateVariations({ category, style, mood, lighting, camera, description, model });

  /* Build structured output */
  return {
    mainPrompt,
    negativePrompt: negPrompt,
    variations,
    structured: {
      subject: description || `${catLabel} scene`,
      subjectDetails: subjectDetail,
      environment: moodDesc,
      lighting: lightDesc,
      camera: cameraDesc,
      styleKeywords: styleKw,
      renderingQuality: quality,
      negativePrompt: negPrompt,
    },
    model,
    timestamp: Date.now(),
    id: `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

/**
 * Generate 2 variations of the prompt
 */
function generateVariations({ category, style, mood, lighting, camera, description, model }) {
  const moodKeys = Object.keys(moodDescriptors);
  const lightKeys = Object.keys(lightingDescriptors);
  const cameraKeys = Object.keys(cameraDescriptors);

  const altMood1 = moodKeys.filter(m => m !== mood)[Math.floor(Math.random() * (moodKeys.length - 1))];
  const altLight1 = lightKeys.filter(l => l !== lighting)[Math.floor(Math.random() * (lightKeys.length - 1))];
  const altCamera1 = cameraKeys.filter(c => c !== camera)[Math.floor(Math.random() * (cameraKeys.length - 1))];

  const altMood2 = moodKeys.filter(m => m !== mood && m !== altMood1)[Math.floor(Math.random() * (moodKeys.length - 2))];
  const altLight2 = lightKeys.filter(l => l !== lighting && l !== altLight1)[Math.floor(Math.random() * (lightKeys.length - 2))];

  const v1Parts = [
    description || `${getLabel(categories, category)} scene`,
    subjectExpansions[category] || subjectExpansions.portrait,
    moodDescriptors[altMood1] || moodDescriptors.aesthetic,
    lightingDescriptors[altLight1] || lightingDescriptors['soft-light'],
    cameraDescriptors[altCamera1] || cameraDescriptors['medium-shot'],
    styleKeywords[style] || styleKeywords.photorealistic,
    qualityKeywords.join(', '),
  ];

  const v2Parts = [
    description || `${getLabel(categories, category)} scene`,
    subjectExpansions[category] || subjectExpansions.portrait,
    moodDescriptors[altMood2] || moodDescriptors.aesthetic,
    lightingDescriptors[altLight2] || lightingDescriptors['soft-light'],
    cameraDescriptors[camera] || cameraDescriptors['medium-shot'],
    styleKeywords[style] || styleKeywords.photorealistic,
    qualityKeywords.join(', '),
  ];

  let var1 = v1Parts.join(', ');
  let var2 = v2Parts.join(', ');

  if (model === 'midjourney') {
    var1 += ' --ar 16:9 --v 6 --q 2 --s 500';
    var2 += ' --ar 16:9 --v 6 --q 2 --s 1000';
  }

  return [
    { label: 'Variation A', prompt: var1 },
    { label: 'Variation B', prompt: var2 },
  ];
}

/**
 * Optimize/enhance an existing prompt with professional keywords
 */
export function optimizePrompt(rawPrompt) {
  const enhancements = [
    'masterpiece',
    'best quality',
    'highly detailed',
    'sharp focus',
    'professional',
    'award-winning composition',
    '8K resolution',
    'intricate details',
  ];

  const existing = rawPrompt.toLowerCase();
  const toAdd = enhancements.filter(e => !existing.includes(e.toLowerCase()));

  return `${rawPrompt}, ${toAdd.join(', ')}`;
}
