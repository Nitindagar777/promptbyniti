/* ============================================================
   PROMPT DATA — Categories, Styles, Templates, etc.
   ============================================================ */

export const categories = [
  // --- CORE & DEFAULTS ---
  { id: 'default', label: 'Default', emoji: '✨', desc: 'Standard AI generation' },
  { id: 'none', label: 'None', emoji: '⚪', desc: 'No specific category' },

  // --- PORTRAIT & CHARACTERS ---
  { id: 'portrait', label: 'Portrait', emoji: '👤', desc: 'People, faces, character art' },
  { id: 'group', label: 'Group', emoji: '👥', desc: 'Couples, groups, crowds' },
  { id: 'expression', label: 'Expression', emoji: '😊', desc: 'Specific facial expressions' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '🧑🤝🧑', desc: 'Candid, real-life scenes' },
  { id: 'ai-influencer', label: 'AI Influencer', emoji: '🤖', desc: 'Virtual influencer content' },
  { id: 'baby', label: 'Baby', emoji: '👶', desc: 'Infants and kids' },
  { id: 'old-age', label: 'Old Age', emoji: '🧓', desc: 'Elderly portraits' },
  { id: 'character', label: 'Character', emoji: '🧑🎤', desc: 'Original characters' },
  { id: 'sci-fi-char', label: 'Sci-Fi Character', emoji: '🧑🚀', desc: 'Futuristic beings' },
  { id: 'fantasy-char', label: 'Fantasy Character', emoji: '🧙', desc: 'Magical beings' },
  { id: 'horror-char', label: 'Horror Character', emoji: '🧛', desc: 'Scary monsters' },
  { id: 'cosplay', label: 'Cosplay', emoji: '🧑🎭', desc: 'Costume play' },
  { id: 'headshot', label: 'Professional Headshot', emoji: '👔', desc: 'Business profile photos' },
  { id: 'selfie', label: 'Selfie', emoji: '📸', desc: 'Causal mobile camera look' },

  // --- FASHION & BEAUTY ---
  { id: 'fashion', label: 'Fashion', emoji: '👗', desc: 'Clothing, editorial looks' },
  { id: 'streetwear', label: 'Streetwear', emoji: '👕', desc: 'Urban fashion' },
  { id: 'luxury-fashion', label: 'Luxury Fashion', emoji: '👠', desc: 'High-end branding' },
  { id: 'beauty', label: 'Beauty', emoji: '💄', desc: 'Cosmetic shots' },
  { id: 'hairstyle', label: 'Hairstyle', emoji: '💇', desc: 'Hair design and color' },
  { id: 'makeup', label: 'Makeup', emoji: '💅', desc: 'Detailed makeup art' },
  { id: 'outfit-design', label: 'Outfit Design', emoji: '🧥', desc: 'Apparel concepts' },

  // --- BUSINESS & PRODUCT ---
  { id: 'product', label: 'Product', emoji: '📦', desc: 'Ads, packaging, merchandise' },
  { id: 'e-commerce', label: 'E-commerce', emoji: '🛍️', desc: 'Catalog photography' },
  { id: 'advertisement', label: 'Advertisement', emoji: '📢', desc: 'Marketing creative' },
  { id: 'branding', label: 'Branding', emoji: '🏷️', desc: 'Logo and identity' },
  { id: 'marketing', label: 'Marketing', emoji: '📊', desc: 'Business visuals' },
  { id: 'social-media', label: 'Social Media Post', emoji: '🎯', desc: 'IG, FB, X content' },
  { id: 'thumbnail', label: 'Thumbnail', emoji: '🖼️', desc: 'YouTube clickbait' },
  { id: 'app-ui', label: 'App UI', emoji: '📱', desc: 'Mobile app screens' },
  { id: 'website-ui', label: 'Website UI', emoji: '💻', desc: 'Web design layouts' },
  { id: 'poster', label: 'Poster', emoji: '📰', desc: 'Graphic posters' },
  { id: 'book-cover', label: 'Book Cover', emoji: '📘', desc: 'Novel and book art' },
  { id: 'movie-poster', label: 'Movie Poster', emoji: '🎬', desc: 'Cinematic key art' },

  // --- LANDSCAPE & NATURE ---
  { id: 'landscape', label: 'Landscape', emoji: '🏔️', desc: 'Nature scenery' },
  { id: 'sunset', label: 'Sunset', emoji: '🌅', desc: 'Evening golden light' },
  { id: 'sunrise', label: 'Sunrise', emoji: '🌄', desc: 'Morning first light' },
  { id: 'cityscape', label: 'Cityscape', emoji: '🌃', desc: 'City skylines' },
  { id: 'urban', label: 'Urban', emoji: '🏙️', desc: 'Street scenes' },
  { id: 'night-city', label: 'Night City', emoji: '🌆', desc: 'Neon city vibes' },
  { id: 'space', label: 'Space', emoji: '🌌', desc: 'Galaxies and stars' },
  { id: 'nature', label: 'Nature', emoji: '🌍', desc: 'General nature' },
  { id: 'forest', label: 'Forest', emoji: '🌳', desc: 'Woods and greenery' },
  { id: 'tropical', label: 'Tropical', emoji: '🌴', desc: 'Beaches and palms' },
  { id: 'desert', label: 'Desert', emoji: '🏜️', desc: 'Sand and dunes' },
  { id: 'mountains', label: 'Mountains', emoji: '🏔️', desc: 'Peaks and valleys' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', desc: 'Seas and water' },
  { id: 'snow', label: 'Snow', emoji: '❄️', desc: 'Winter landscapes' },
  { id: 'volcano', label: 'Volcano', emoji: '🌋', desc: 'Lava and eruptions' },

  // --- ARCHITECTURE ---
  { id: 'architecture', label: 'Architecture', emoji: '🏛️', desc: 'Building design' },
  { id: 'interior-design', label: 'Interior Design', emoji: '🏠', desc: 'Room aesthetics' },
  { id: 'exterior-design', label: 'Exterior Design', emoji: '🏢', desc: 'Building faces' },
  { id: 'building-concept', label: 'Building Concept', emoji: '🏗️', desc: 'Modern structures' },
  { id: 'historical', label: 'Historical', emoji: '🏰', desc: 'Castles and ruins' },
  { id: 'futuristic-arch', label: 'Futuristic Architecture', emoji: '🏯', desc: 'Sci-fi buildings' },

  // --- FOOD & DRINK ---
  { id: 'food', label: 'Food', emoji: '🍕', desc: 'Culinary shots' },
  { id: 'fast-food', label: 'Fast Food', emoji: '🍔', desc: 'Burgers and more' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰', desc: 'Sweets and cakes' },
  { id: 'drinks', label: 'Drinks', emoji: '🍹', desc: 'Cocktails and juices' },
  { id: 'coffee-art', label: 'Coffee Art', emoji: '☕', desc: 'Latte art' },
  { id: 'fine-dining', label: 'Fine Dining', emoji: '🍽️', desc: 'Gourmet plating' },

  // --- ART & STYLE ---
  { id: 'tattoo', label: 'Tattoo', emoji: '🎨', desc: 'Ink designs' },
  { id: 'illustration', label: 'Illustration', emoji: '🖌️', desc: 'Drawing and art' },
  { id: 'digital-art', label: 'Digital Art', emoji: '🧑🎨', desc: 'CGI and tablet art' },
  { id: 'painting', label: 'Painting', emoji: '🖼️', desc: 'Canvas styles' },
  { id: 'line-art', label: 'Line Art', emoji: '🧵', desc: 'Minimalist lines' },
  { id: 'sketch', label: 'Sketch', emoji: '🪄', desc: 'Hand-drawn looks' },
  { id: '3d-render', label: '3D Render', emoji: '🧱', desc: 'Octane, C4D looks' },
  { id: 'isometric', label: 'Isometric', emoji: '🧊', desc: '3D perspective art' },

  // --- ABSTRACT ---
  { id: 'abstract', label: 'Abstract', emoji: '🌀', desc: 'Non-representational' },
  { id: 'colorful', label: 'Colorful', emoji: '🌈', desc: 'Vibrant colors' },
  { id: 'geometric', label: 'Geometric', emoji: '🔳', desc: 'Shapes and patterns' },
  { id: 'surreal', label: 'Surreal', emoji: '🧠', desc: 'Dream-like logic' },
  { id: 'psychedelic', label: 'Psychedelic', emoji: '🫧', desc: 'Trippy visuals' },
  { id: 'minimalist', label: 'Minimalist', emoji: '✨', desc: 'Simple and clean' },

  // --- POP CULTURE ---
  { id: 'anime', label: 'Anime', emoji: '⛩️', desc: 'Japanese animation' },
  { id: 'game-art', label: 'Game Art', emoji: '🎮', desc: 'Concept art for games' },
  { id: 'pixel-art', label: 'Pixel Art', emoji: '🕹️', desc: '8-bit / 16-bit looks' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🧸', desc: 'Animated characters' },
  { id: 'comic', label: 'Comic', emoji: '📺', desc: 'Comic book styles' },
  { id: 'superhero', label: 'Superhero', emoji: '🦸', desc: 'Heroic characters' },
  { id: 'fantasy-world', label: 'Fantasy', emoji: '🐉', desc: 'Magic and dragons' },
  { id: 'mythology', label: 'Mythology', emoji: '🧝', desc: 'Gods and legends' },

  // --- VEHICLES ---
  { id: 'vehicles', label: 'Vehicles', emoji: '🚗', desc: 'General transport' },
  { id: 'cars', label: 'Cars', emoji: '🚘', desc: 'Modern cars' },
  { id: 'sports-cars', label: 'Sports Cars', emoji: '🏎️', desc: 'High performance' },
  { id: 'spaceships', label: 'Spaceships', emoji: '🚀', desc: 'Interstellar crafts' },
  { id: 'aircraft', label: 'Aircraft', emoji: '✈️', desc: 'Planes and drones' },
  { id: 'ships', label: 'Ships', emoji: '🚢', desc: 'Boats and vessels' },

  // --- WILDLIFE ---
  { id: 'animals', label: 'Animals', emoji: '🐶', desc: 'General animals' },
  { id: 'pets', label: 'Pets', emoji: '🐱', desc: 'Dogs and cats' },
  { id: 'wildlife', label: 'Wildlife', emoji: '🐅', desc: 'Nature predators' },
  { id: 'creatures', label: 'Creatures', emoji: '🐉', desc: 'Mythical animals' },
  { id: 'underwater', label: 'Underwater Life', emoji: '🐠', desc: 'Fish and reefs' },

  // --- ACTION & DRAMA ---
  { id: 'action', label: 'Action', emoji: '⚔️', desc: 'High energy scenes' },
  { id: 'explosion', label: 'Explosion', emoji: '💥', desc: 'FX and smoke' },
  { id: 'war', label: 'War', emoji: '🔫', desc: 'Battlefield scenes' },
  { id: 'medieval', label: 'Medieval', emoji: '🛡️', desc: 'Knights and swords' },
  { id: 'apocalypse', label: 'Apocalypse', emoji: '🧟', desc: 'Post-apocalyptic' },

  // --- EMOTIONS ---
  { id: 'emotions', label: 'Emotions', emoji: '🎭', desc: 'Human feelings' },
  { id: 'sad', label: 'Sad', emoji: '💔', desc: 'Sorrowful scenes' },
  { id: 'love', label: 'Love', emoji: '❤️', desc: 'Romantic visuals' },
  { id: 'angry', label: 'Angry', emoji: '😡', desc: 'Rage and fury' },
  { id: 'funny', label: 'Funny', emoji: '😂', desc: 'Humorous art' },
  { id: 'celebration-em', label: 'Celebration', emoji: '🎉', desc: 'Happy moments' },

  // --- SCI & EDU ---
  { id: 'education', label: 'Education', emoji: '🎓', desc: 'Schools and learning' },
  { id: 'infographic', label: 'Infographic', emoji: '📚', desc: 'Data and charts' },
  { id: 'data-viz', label: 'Data Visualization', emoji: '📊', desc: 'Technical graphs' },
  { id: 'science', label: 'Science', emoji: '🧪', desc: 'Lab and experiments' },
  { id: 'medical', label: 'Medical', emoji: '🧬', desc: 'Healthcare and anatomy' },

  // --- MUSIC ---
  { id: 'music', label: 'Music', emoji: '🎧', desc: 'Musical instruments' },
  { id: 'concert', label: 'Concert', emoji: '🎤', desc: 'Live performances' },
  { id: 'band', label: 'Band', emoji: '🎸', desc: 'Group musicians' },
  { id: 'album-cover', label: 'Album Cover', emoji: '💿', desc: 'CD and vinyl art' },

  // --- FILM ---
  { id: 'cinematic-film', label: 'Cinematic', emoji: '🎥', desc: 'Movie style' },
  { id: 'film-still', label: 'Film Still', emoji: '🎞️', desc: 'Captured scene' },
  { id: 'documentary', label: 'Documentary', emoji: '📽️', desc: 'Realistic storytelling' },
  { id: 'scene-design', label: 'Scene Design', emoji: '🎬', desc: 'Production art' },

  // --- TRAVEL ---
  { id: 'travel', label: 'Travel', emoji: '🧳', desc: 'Vacation and tourism' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️', desc: 'Exploring the unknown' },
  { id: 'camping', label: 'Camping', emoji: '🏕️', desc: 'Outdoor life' },
  { id: 'exploration', label: 'Exploration', emoji: '🚶', desc: 'Journeying' },

  // --- WELLNESS ---
  { id: 'wellness', label: 'Wellness', emoji: '🧘', desc: 'Yoga and meditation' },
  { id: 'fitness', label: 'Fitness', emoji: '🏋️', desc: 'Gym and workouts' },
  { id: 'mental-health', label: 'Mental Health', emoji: '🧠', desc: 'Mind and focus' },
  { id: 'spa', label: 'Spa', emoji: '🛀', desc: 'Relaxation' },

  // --- FESTIVAL ---
  { id: 'festival', label: 'Festival', emoji: '🎁', desc: 'Events and parties' },
  { id: 'christmas', label: 'Christmas', emoji: '🎄', desc: 'Holiday spirit' },
  { id: 'halloween', label: 'Halloween', emoji: '🎃', desc: 'Spooky season' },
  { id: 'diwali', label: 'Diwali', emoji: '🪔', desc: 'Festival of lights' },
  { id: 'celebration', label: 'Celebration', emoji: '🎆', desc: 'Fireworks and fun' },

  // --- FUTURISTIC ---
  { id: 'futuristic-world', label: 'Futuristic', emoji: '🛸', desc: 'Next-gen themes' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🤖', desc: 'Hi-tech low-life' },
  { id: 'metaverse', label: 'Metaverse', emoji: '🌐', desc: 'Digital reality' },
  { id: 'ai-world', label: 'AI Generated World', emoji: '🧬', desc: 'Artificial horizons' },
];

export const styles = [
  { id: 'default', label: 'Default' },
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'anime', label: 'Anime' },
  { id: 'manga', label: 'Manga' },
  { id: 'oil-painting', label: 'Oil Painting' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'acrylic-painting', label: 'Acrylic' },
  { id: 'digital-art', label: 'Digital Art' },
  { id: '3d-render', label: '3D Render' },
  { id: 'isometric', label: 'Isometric' },
  { id: 'low-poly', label: 'Low Poly' },
  { id: 'comic-book', label: 'Comic Book' },
  { id: 'pixel-art', label: 'Pixel Art' },
  { id: 'surrealism', label: 'Surrealism' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'concept-art', label: 'Concept Art' },
  { id: 'pop-art', label: 'Pop Art' },
  { id: 'retro', label: 'Retro' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'futuristic', label: 'Futuristic' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'steampunk', label: 'Steampunk' },
  { id: 'fantasy-art', label: 'Fantasy Art' },
  { id: 'dark-fantasy', label: 'Dark Fantasy' },
  { id: 'abstract-style', label: 'Abstract' },
  { id: 'impressionism', label: 'Impressionism' },
  { id: 'expressionism', label: 'Expressionism' },
  { id: 'realism', label: 'Realism' },
  { id: 'hyperrealism', label: 'Hyperrealism' },
  { id: 'sketch', label: 'Sketch' },
  { id: 'line-art', label: 'Line Art' },
  { id: 'ink-drawing', label: 'Ink Drawing' },
  { id: 'charcoal-drawing', label: 'Charcoal' },
  { id: 'pastel-art', label: 'Pastel Art' },
  { id: 'graffiti', label: 'Graffiti' },
  { id: 'street-art', label: 'Street Art' },
  { id: 'vaporwave', label: 'Vaporwave' },
  { id: 'synthwave', label: 'Synthwave' },
  { id: 'neon-glow-style', label: 'Neon Glow' },
  { id: 'flat-design', label: 'Flat Design' },
  { id: 'vector-art', label: 'Vector Art' },
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'caricature', label: 'Caricature' },
  { id: 'chibi', label: 'Chibi' },
  { id: 'ukiyo-e', label: 'Ukiyo-e' },
  { id: 'baroque', label: 'Baroque' },
  { id: 'renaissance', label: 'Renaissance' },
  { id: 'gothic-art', label: 'Gothic Art' },
  { id: 'art-nouveau', label: 'Art Nouveau' },
  { id: 'art-deco', label: 'Art Deco' },
  { id: 'bauhaus', label: 'Bauhaus' },
  { id: 'cubism', label: 'Cubism' },
  { id: 'dadaism', label: 'Dadaism' },
  { id: 'psychedelic-style', label: 'Psychedelic Art' },
  { id: 'glitch-art', label: 'Glitch Art' },
  { id: 'collage-art', label: 'Collage Art' },
  { id: 'matte-painting', label: 'Matte Painting' },
  { id: 'photomontage', label: 'Photomontage' },
  { id: 'claymation', label: 'Claymation Style' },
  { id: 'origami', label: 'Origami Style' },
  { id: 'paper-cut', label: 'Paper Cut Style' },
  { id: 'fantasy-illustration', label: 'Fantasy Illustration' },
];

export const moods = [
  { id: 'default', label: 'Default' },
  { id: 'aesthetic', label: 'Aesthetic' },
  { id: 'dark-moody', label: 'Dark & Moody' },
  { id: 'vibrant-colorful', label: 'Vibrant & Colorful' },
  { id: 'dreamy', label: 'Dreamy' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'grungy', label: 'Grungy' },
  { id: 'raw', label: 'Raw' },
  { id: 'nostalgic', label: 'Nostalgic' },
  { id: 'futuristic', label: 'Futuristic' },
  { id: 'serene', label: 'Serene' },
  { id: 'calm', label: 'Calm' },
  { id: 'intense', label: 'Intense' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'whimsical', label: 'Whimsical' },
  { id: 'mysterious', label: 'Mysterious' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'soft', label: 'Soft' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'warm', label: 'Warm' },
  { id: 'cold', label: 'Cold' },
  { id: 'melancholic', label: 'Melancholic' },
  { id: 'emotional', label: 'Emotional' },
  { id: 'peaceful', label: 'Peaceful' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'playful', label: 'Playful' },
  { id: 'dark-fantasy', label: 'Dark Fantasy' },
  { id: 'eerie', label: 'Eerie' },
  { id: 'suspenseful', label: 'Suspenseful' },
  { id: 'tense', label: 'Tense' },
  { id: 'epic', label: 'Epic' },
  { id: 'majestic', label: 'Majestic' },
  { id: 'luxurious', label: 'Luxurious' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'clean', label: 'Clean' },
  { id: 'chaotic', label: 'Chaotic' },
  { id: 'gritty', label: 'Gritty' },
  { id: 'cinematic-mood', label: 'Cinematic' },
  { id: 'hopeful', label: 'Hopeful' },
  { id: 'uplifting', label: 'Uplifting' },
  { id: 'inspirational', label: 'Inspirational' },
  { id: 'sad', label: 'Sad' },
  { id: 'happy', label: 'Happy' },
  { id: 'joyful', label: 'Joyful' },
  { id: 'angry', label: 'Angry' },
  { id: 'aggressive', label: 'Aggressive' },
  { id: 'lonely', label: 'Lonely' },
  { id: 'magical', label: 'Magical' },
  { id: 'ethereal', label: 'Ethereal' },
];

export const lightingOptions = [
  { id: 'default', label: 'Default' },
  { id: 'soft-light', label: 'Soft Light' },
  { id: 'hard-light', label: 'Hard Light' },
  { id: 'golden-hour', label: 'Golden Hour' },
  { id: 'blue-hour', label: 'Blue Hour' },
  { id: 'neon-glow', label: 'Neon Glow' },
  { id: 'studio-lighting', label: 'Studio Lighting' },
  { id: 'chiaroscuro', label: 'Chiaroscuro' },
  { id: 'backlit', label: 'Backlit' },
  { id: 'silhouette', label: 'Silhouette' },
  { id: 'natural-light', label: 'Natural Light' },
  { id: 'volumetric-light', label: 'Volumetric Lighting' },
  { id: 'god-rays', label: 'God Rays' },
  { id: 'cinematic-lighting', label: 'Cinematic Lighting' },
  { id: 'rim-light', label: 'Rim Light' },
  { id: 'bioluminescent', label: 'Bioluminescent' },
  { id: 'moonlight', label: 'Moonlight' },
  { id: 'sunlight', label: 'Sunlight' },
  { id: 'hdr-lighting', label: 'HDR Lighting' },
  { id: 'low-key', label: 'Low Key Lighting' },
  { id: 'high-key', label: 'High Key Lighting' },
  { id: 'ambient', label: 'Ambient Lighting' },
  { id: 'diffused', label: 'Diffused Light' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'top-light', label: 'Top Light' },
  { id: 'side-light', label: 'Side Lighting' },
  { id: 'underlighting', label: 'Underlighting' },
  { id: 'edge-light', label: 'Edge Lighting' },
  { id: 'glow-light', label: 'Glow Lighting' },
  { id: 'fluorescent', label: 'Fluorescent' },
  { id: 'tungsten', label: 'Tungsten' },
  { id: 'candlelight', label: 'Candlelight' },
  { id: 'firelight', label: 'Firelight' },
  { id: 'laser-light', label: 'Laser Lighting' },
  { id: 'holographic-light', label: 'Holographic' },
  { id: 'colored-gel', label: 'Colored Gel' },
  { id: 'flash', label: 'Flash Lighting' },
  { id: 'strobe', label: 'Strobe Lighting' },
  { id: 'overcast', label: 'Overcast' },
];

export const cameraAngles = [
  { id: 'default', label: 'Default' },
  { id: 'close-up', label: 'Close-Up' },
  { id: 'extreme-close-up', label: 'Extreme Close-Up' },
  { id: 'medium-shot', label: 'Medium Shot' },
  { id: 'medium-close-up', label: 'Medium Close-Up' },
  { id: 'medium-long-shot', label: 'Medium Long Shot' },
  { id: 'wide-shot', label: 'Wide Shot' },
  { id: 'extreme-wide-shot', label: 'Extreme Wide Shot' },
  { id: 'long-shot', label: 'Long Shot' },
  { id: 'full-shot', label: 'Full Shot' },
  { id: 'cowboy-shot', label: 'Cowboy Shot' },
  { id: 'birds-eye', label: "Bird's Eye View" },
  { id: 'worms-eye', label: "Worm's Eye View" },
  { id: 'high-angle', label: 'High Angle' },
  { id: 'low-angle', label: 'Low Angle' },
  { id: 'eye-level', label: 'Eye Level' },
  { id: 'dutch-angle', label: 'Dutch Angle' },
  { id: 'over-shoulder', label: 'Over the Shoulder' },
  { id: 'pov', label: 'POV' },
  { id: 'aerial', label: 'Aerial View' },
  { id: 'drone', label: 'Drone Shot' },
  { id: 'macro', label: 'Macro Shot' },
  { id: 'establishing', label: 'Establishing Shot' },
  { id: 'tracking', label: 'Tracking Shot' },
  { id: 'dolly', label: 'Dolly Shot' },
  { id: 'crane', label: 'Crane Shot' },
  { id: 'tilt', label: 'Tilt Shot' },
  { id: 'pan', label: 'Pan Shot' },
  { id: 'zoom', label: 'Zoom Shot' },
  { id: 'static', label: 'Static Shot' },
  { id: 'handheld', label: 'Handheld Shot' },
  { id: 'first-person', label: 'First Person' },
  { id: 'third-person', label: 'Third Person' },
];

export const lensSettings = [
  { id: 'default', label: 'Default' },
  { id: '35mm-lens', label: '35mm lens' },
  { id: '50mm-lens', label: '50mm lens' },
  { id: '85mm-lens', label: '85mm lens' },
  { id: '24mm-wide', label: '24mm wide-angle' },
  { id: '14mm-ultra-wide', label: '14mm ultra wide' },
  { id: '70-200mm-telephoto', label: '70-200mm telephoto' },
  { id: 'macro-lens', label: 'Macro lens' },
  { id: 'fisheye-lens', label: 'Fisheye lens' },
  { id: 'tilt-shift-lens', label: 'Tilt-shift lens' },
  { id: 'prime-lens', label: 'Prime lens' },
  { id: 'zoom-lens', label: 'Zoom lens' },
  { id: 'portrait-lens', label: 'Portrait lens' },
  { id: 'cinematic-lens', label: 'Cinematic lens' },
  { id: 'anamorphic-lens', label: 'Anamorphic lens' },
  { id: 'dslr-camera', label: 'DSLR camera' },
  { id: 'mirrorless-camera', label: 'Mirrorless camera' },
  { id: 'film-camera', label: 'Film camera' },
  { id: 'polaroid-camera', label: 'Polaroid camera' },
  { id: 'imax-camera', label: 'IMAX camera' },
  { id: 'depth-of-field', label: 'Depth of field' },
  { id: 'shallow-dof', label: 'Shallow depth of field' },
  { id: 'deep-dof', label: 'Deep depth of field' },
  { id: 'bokeh-effect', label: 'Bokeh effect' },
  { id: 'creamy-bokeh', label: 'Creamy bokeh' },
  { id: 'motion-blur', label: 'Motion blur' },
  { id: 'long-exposure', label: 'Long exposure' },
  { id: 'fast-shutter', label: 'Fast shutter speed' },
  { id: 'slow-shutter', label: 'Slow shutter speed' },
  { id: 'aperture-f1-2', label: 'Aperture f/1.2' },
  { id: 'aperture-f1-8', label: 'Aperture f/1.8' },
  { id: 'aperture-f2-8', label: 'Aperture f/2.8' },
  { id: 'aperture-f4', label: 'Aperture f/4' },
  { id: 'aperture-f8', label: 'Aperture f/8' },
  { id: 'iso-100', label: 'ISO 100' },
  { id: 'iso-400', label: 'ISO 400' },
  { id: 'iso-800', label: 'ISO 800' },
  { id: 'hdr-capture', label: 'HDR capture' },
  { id: 'focus-stacking', label: 'Focus stacking' },
  { id: 'rack-focus', label: 'Rack focus' },
  { id: 'soft-focus', label: 'Soft focus' },
  { id: 'sharp-focus', label: 'Sharp focus' },
];

export const compositions = [
  { id: 'default', label: 'Default' },
  { id: 'rule-of-thirds', label: 'Rule of thirds' },
  { id: 'centered', label: 'Centered composition' },
  { id: 'symmetrical', label: 'Symmetrical composition' },
  { id: 'asymmetrical', label: 'Asymmetrical composition' },
  { id: 'leading-lines', label: 'Leading lines' },
  { id: 'framing', label: 'Framing composition' },
  { id: 'foreground-focus', label: 'Foreground focus' },
  { id: 'background-blur', label: 'Background blur' },
  { id: 'depth-comp', label: 'Depth composition' },
  { id: 'layered-comp', label: 'Layered composition' },
  { id: 'minimal-comp', label: 'Minimal composition' },
  { id: 'balanced-comp', label: 'Balanced composition' },
  { id: 'dynamic-comp', label: 'Dynamic composition' },
  { id: 'diagonal-comp', label: 'Diagonal composition' },
  { id: 'golden-ratio', label: 'Golden ratio' },
  { id: 'spiral-comp', label: 'Spiral composition' },
  { id: 'wide-framing', label: 'Wide framing' },
  { id: 'tight-framing', label: 'Tight framing' },
  { id: 'negative-space', label: 'Negative space' },
  { id: 'fill-frame', label: 'Fill the frame' },
  { id: 'off-center', label: 'Off-center subject' },
  { id: 'silhouette-comp', label: 'Silhouette composition' },
  { id: 'reflection-comp', label: 'Reflection composition' },
  { id: 'mirror-comp', label: 'Mirror composition' },
  { id: 'top-down-comp', label: 'Top-down composition' },
  { id: 'close-framing', label: 'Close framing' },
  { id: 'environmental-comp', label: 'Environmental composition' },
];

export const colorPalettes = [
  { id: 'default', label: 'Default' },
  { id: 'warm', label: 'Warm tones' },
  { id: 'cool', label: 'Cool tones' },
  { id: 'neutral', label: 'Neutral tones' },
  { id: 'monochrome', label: 'Monochrome' },
  { id: 'bw', label: 'Black and white' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'pastel', label: 'Pastel colors' },
  { id: 'neon', label: 'Neon palette' },
  { id: 'vibrant', label: 'Vibrant colors' },
  { id: 'muted', label: 'Muted colors' },
  { id: 'earth', label: 'Earth tones' },
  { id: 'jewel', label: 'Jewel tones' },
  { id: 'high-contrast', label: 'High contrast colors' },
  { id: 'low-contrast', label: 'Low contrast palette' },
  { id: 'analogous', label: 'Analogous colors' },
  { id: 'complementary', label: 'Complementary colors' },
  { id: 'triadic', label: 'Triadic colors' },
  { id: 'split-complementary', label: 'Split-complementary' },
  { id: 'gradient', label: 'Gradient palette' },
  { id: 'sunset', label: 'Sunset palette' },
  { id: 'sunrise', label: 'Sunrise palette' },
  { id: 'ocean', label: 'Ocean palette' },
  { id: 'forest', label: 'Forest palette' },
  { id: 'autumn', label: 'Autumn palette' },
  { id: 'winter', label: 'Winter palette' },
  { id: 'spring', label: 'Spring palette' },
  { id: 'summer', label: 'Summer palette' },
  { id: 'metallic', label: 'Metallic colors' },
  { id: 'gold', label: 'Gold tones' },
  { id: 'silver', label: 'Silver tones' },
  { id: 'bronze', label: 'Bronze tones' },
  { id: 'iridescent', label: 'Iridescent colors' },
  { id: 'holographic', label: 'Holographic palette' },
  { id: 'candy', label: 'Candy colors' },
  { id: 'dusty', label: 'Dusty palette' },
  { id: 'vintage-faded', label: 'Vintage faded colors' },
  { id: 'retro', label: 'Retro palette' },
  { id: 'cyberpunk', label: 'Cyberpunk palette' },
  { id: 'synthwave', label: 'Synthwave palette' },
  { id: 'vaporwave', label: 'Vaporwave palette' },
  { id: 'dark-palette', label: 'Dark palette' },
  { id: 'light-palette', label: 'Light palette' },
  { id: 'soft-pastel-gradient', label: 'Soft pastel gradient' },
  { id: 'bold-primary', label: 'Bold primary colors' },
];

export const qualityTags = [
  { id: 'default', label: 'Default' },
  { id: 'ultra-detailed', label: 'Ultra detailed' },
  { id: 'highly-detailed', label: 'Highly detailed' },
  { id: 'hyper-detailed', label: 'Hyper detailed' },
  { id: '4k', label: '4K resolution' },
  { id: '8k', label: '8K resolution' },
  { id: '16k', label: '16K resolution' },
  { id: 'high-res', label: 'High resolution' },
  { id: 'super-res', label: 'Super resolution' },
  { id: 'hdr', label: 'HDR quality' },
  { id: 'photorealistic-detail', label: 'Photorealistic detail' },
  { id: 'hyperrealistic', label: 'Hyperrealistic' },
  { id: 'sharp-focus', label: 'Sharp focus' },
  { id: 'crisp-details', label: 'Crisp details' },
  { id: 'fine-textures', label: 'Fine textures' },
  { id: 'intricate-details', label: 'Intricate details' },
  { id: 'clean-rendering', label: 'Clean rendering' },
  { id: 'smooth-finish', label: 'Smooth finish' },
  { id: 'professional-quality', label: 'Professional quality' },
  { id: 'studio-quality', label: 'Studio quality' },
  { id: 'masterpiece', label: 'Masterpiece' },
  { id: 'best-quality', label: 'Best quality' },
  { id: 'high-definition', label: 'High definition' },
  { id: 'ultra-hd', label: 'Ultra HD' },
  { id: 'cinematic-quality', label: 'Cinematic quality' },
  { id: 'noise-free', label: 'Noise-free' },
  { id: 'grain-free', label: 'Grain-free' },
  { id: 'hdr-range', label: 'High dynamic range' },
  { id: 'detailed-skin', label: 'Detailed skin texture' },
  { id: 'realistic-lighting', label: 'Realistic lighting detail' },
  { id: 'perfect-comp', label: 'Perfect composition' },
  { id: 'depth-rich', label: 'Depth rich' },
  { id: 'ultra-sharp', label: 'Ultra sharp edges' },
  { id: 'clean-lines', label: 'Clean lines' },
  { id: 'polished-look', label: 'Polished look' },
];

export const renderingEngines = [
  { id: 'default', label: 'Default' },
  { id: 'unreal', label: 'Unreal Engine' },
  { id: 'unreal5', label: 'Unreal Engine 5' },
  { id: 'octane', label: 'Octane Render' },
  { id: 'redshift', label: 'Redshift Render' },
  { id: 'blender', label: 'Blender Render' },
  { id: 'cycles', label: 'Cycles Render' },
  { id: 'eevee', label: 'Eevee Render' },
  { id: 'vray', label: 'V-Ray Render' },
  { id: 'arnold', label: 'Arnold Render' },
  { id: 'c4d', label: 'Cinema 4D Render' },
  { id: 'maya', label: 'Maya Render' },
  { id: 'houdini', label: 'Houdini Render' },
  { id: 'keyshot', label: 'KeyShot Render' },
  { id: 'lumion', label: 'Lumion Render' },
  { id: 'daz3d', label: 'Daz3D Render' },
  { id: 'zbrush', label: 'ZBrush Render' },
  { id: 'substance', label: 'Substance Painter' },
  { id: 'photographic', label: 'Photographic rendering' },
  { id: 'ray-tracing', label: 'Ray tracing' },
  { id: 'global-illumination', label: 'Global illumination' },
  { id: 'path-tracing', label: 'Path tracing' },
  { id: 'pbr', label: 'Physically based rendering (PBR)' },
  { id: 'real-time', label: 'Real-time rendering' },
  { id: 'cgi', label: 'CGI rendering' },
  { id: 'vfx', label: 'VFX rendering' },
  { id: 'game-engine', label: 'Game engine render' },
  { id: 'high-end-3d', label: 'High-end 3D render' },
  { id: 'studio-render', label: 'Studio render' },
];

export const motionActions = [
  { id: 'default', label: 'Default' },
  { id: 'standing', label: 'Standing' },
  { id: 'sitting', label: 'Sitting' },
  { id: 'walking', label: 'Walking' },
  { id: 'running', label: 'Running' },
  { id: 'jumping', label: 'Jumping' },
  { id: 'dancing', label: 'Dancing' },
  { id: 'posing', label: 'Posing' },
  { id: 'looking-at-camera', label: 'Looking at camera' },
  { id: 'looking-away', label: 'Looking away' },
  { id: 'over-shoulder', label: 'Over shoulder look' },
  { id: 'smiling', label: 'Smiling' },
  { id: 'laughing', label: 'Laughing' },
  { id: 'crying', label: 'Crying' },
  { id: 'serious', label: 'Serious expression' },
  { id: 'confident', label: 'Confident pose' },
  { id: 'relaxed', label: 'Relaxed pose' },
  { id: 'leaning', label: 'Leaning' },
  { id: 'crossing-arms', label: 'Crossing arms' },
  { id: 'hands-in-pocket', label: 'Hands in pocket' },
  { id: 'holding-object', label: 'Holding object' },
  { id: 'using-phone', label: 'Using phone' },
  { id: 'typing', label: 'Using keyboard' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'fighting', label: 'Fighting stance' },
  { id: 'action', label: 'Action pose' },
  { id: 'mid-air', label: 'Mid-air pose' },
  { id: 'turning-head', label: 'Turning head' },
  { id: 'hair-flowing', label: 'Hair flowing' },
  { id: 'wind-blowing', label: 'Wind blowing' },
  { id: 'slow-motion', label: 'Slow motion movement' },
  { id: 'cinematic-motion', label: 'Cinematic motion' },
  { id: 'dynamic-pose', label: 'Dynamic pose' },
  { id: 'hero-pose', label: 'Hero pose' },
  { id: 'power-stance', label: 'Power stance' },
  { id: 'kneeling', label: 'Kneeling' },
  { id: 'lying-down', label: 'Lying down' },
  { id: 'stretching', label: 'Stretching' },
  { id: 'reaching-out', label: 'Reaching out' },
  { id: 'hugging', label: 'Hugging' },
  { id: 'kissing', label: 'Kissing' },
  { id: 'talking', label: 'Talking' },
  { id: 'shouting', label: 'Shouting' },
];

export const aiModels = [
  // --- IMAGE MODELS ---
  { id: 'gemini-image', label: 'Google Gemini', icon: '♊', type: 'image' },
  { id: 'midjourney', label: 'Midjourney', icon: '🎨', type: 'image' },
  { id: 'stable-diffusion', label: 'Stable Diffusion', icon: '🖥️', type: 'image' },
  { id: 'flux-1', label: 'FLUX.1 Schnell', icon: '⚡', type: 'image' },
  { id: 'flux', label: 'FLUX.1 Schnell', icon: '⚡', type: 'image' },
  { id: 'leonardo-ai', label: 'Leonardo AI', icon: '🦁', type: 'image' },
  { id: 'ideogram', label: 'Ideogram', icon: '🔡', type: 'image' },
  { id: 'playground-ai', label: 'Playground AI', icon: '🎡', type: 'image' },
  { id: 'recraft', label: 'Recraft', icon: '🛠️', type: 'image' },
  { id: 'krea-ai', label: 'Krea AI', icon: '🧠', type: 'image' },
  { id: 'firefly', label: 'Adobe Firefly', icon: '🔥', type: 'image' },
  { id: 'meta-ai', label: 'Meta AI', icon: '♾️', type: 'image' },
  { id: 'google-imagen', label: 'Google Imagen', icon: '🔍', type: 'image' },
  { id: 'canva', label: 'Canva Magic', icon: '🪄', type: 'image' },
  { id: 'bluewillow', label: 'BlueWillow', icon: '🌿', type: 'image' },
  { id: 'nightcafe', label: 'NightCafe', icon: '🌃', type: 'image' },
  { id: 'starryai', label: 'StarryAI', icon: '🌌', type: 'image' },
  { id: 'imagineart', label: 'ImagineArt', icon: '💭', type: 'image' },

  // --- VIDEO MODELS ---
  { id: 'sora', label: 'OpenAI Sora', icon: '🎥', type: 'video', premium: false },
  { id: 'kling-ai', label: 'KLING AI', icon: '🎬', type: 'video', premium: false },
  { id: 'hailuo-ai', label: 'Hailuo AI', icon: '🐚', type: 'video', premium: false },
  { id: 'runway-ml', label: 'Runway ML', icon: '🛣️', type: 'video', premium: false },
  { id: 'pika', label: 'Pika Labs', icon: '🐭', type: 'video', premium: false },
  { id: 'luma-ai', label: 'Luma AI', icon: '🔦', type: 'video', premium: false },
  { id: 'genmo', label: 'Genmo', icon: '🌋', type: 'video', premium: false },
  { id: 'kaiber', label: 'Kaiber', icon: '🧬', type: 'video', premium: false },
  { id: 'veo', label: 'Google Veo', icon: '👁️', type: 'video', premium: false },
  { id: 'wan', label: 'Wan AI', icon: '☁️', type: 'video', premium: false },

  // --- CHAT / LLM MODELS ---
  { id: 'chatgpt', label: 'ChatGPT / GPT-4', icon: '💬', type: 'chat' },
  { id: 'claude', label: 'Claude 3.5', icon: '📝', type: 'chat' },
  { id: 'gemini', label: 'Google Gemini', icon: '♊', type: 'chat' },
  { id: 'llama', label: 'Meta Llama 3', icon: '🦙', type: 'chat' },
  { id: 'deepseek', label: 'DeepSeek', icon: '🐋', type: 'chat' },
  { id: 'grok', label: 'xAI Grok', icon: '🇽', type: 'chat' },
  { id: 'mistral', label: 'Mistral AI', icon: '🌬️', type: 'chat' },
  { id: 'qwen', label: 'Qwen', icon: '🎎', type: 'chat' },

  // --- TOOLS ---
  { id: 'comfyui', label: 'ComfyUI', icon: '🧱', type: 'tool' },
  { id: 'automatic1111', label: 'A1111', icon: '⚙️', type: 'tool' },
  { id: 'invoke-ai', label: 'InvokeAI', icon: '🪄', type: 'tool' },
];

export const promptTemplates = [
  {
    id: 'instagram-model',
    title: 'Instagram Model',
    emoji: '📸',
    category: 'ai-influencer',
    thumbnail: '/assets/store/instagram-model.png',
    samples: [
      '/assets/store/instagram-model.png',
      'https://images.unsplash.com/photo-1524504281769-c270e17621f3?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Create stunning Instagram-worthy portraits',
    config: {
      category: 'portrait',
      style: 'photorealistic',
      mood: 'aesthetic',
      lighting: 'golden-hour',
      camera: 'medium-shot',
      description: 'Beautiful young woman in fashionable outfit, urban background, Instagram aesthetic',
    },
    premium: false,
  },
  {
    id: 'product-ad',
    title: 'Product Ad Shot',
    emoji: '🛍️',
    category: 'product',
    thumbnail: '/assets/store/product-ad.png',
    samples: [
      '/assets/store/product-ad.png',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Professional product photography for ads',
    config: {
      category: 'product',
      style: 'photorealistic',
      mood: 'elegant',
      lighting: 'studio',
      camera: 'close-up',
      description: 'Luxury product on minimal surface with dramatic studio lighting',
    },
    premium: false,
  },
  {
    id: 'tattoo-design',
    title: 'Tattoo Design',
    emoji: '🖋️',
    category: 'tattoo',
    thumbnail: '/assets/store/tattoo-design.png',
    samples: [
      '/assets/store/tattoo-design.png',
      'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1562725227-7cd508e6c76e?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Unique tattoo concepts and designs',
    config: {
      category: 'tattoo',
      style: 'digital-art',
      mood: 'dark',
      lighting: 'dramatic',
      camera: 'close-up',
      description: 'Intricate tribal dragon tattoo with flowing curves and fine line detail',
    },
    premium: false,
  },
  {
    id: 'yt-thumbnail',
    title: 'YouTube Thumbnail',
    emoji: '🎬',
    category: 'thumbnail',
    description: 'Eye-catching thumbnails that drive clicks',
    config: {
      category: 'thumbnail',
      style: 'digital-art',
      mood: 'vibrant',
      lighting: 'neon',
      camera: 'close-up',
      description: 'Shocked person face with explosive background, bold colors, YouTube thumbnail style',
    },
    premium: false,
  },
  {
    id: 'ai-virtual-influencer',
    title: 'AI Influencer',
    emoji: '🤖',
    category: 'ai-influencer',
    description: 'Create an AI virtual influencer persona',
    config: {
      category: 'ai-influencer',
      style: 'photorealistic',
      mood: 'futuristic',
      lighting: 'neon',
      camera: 'medium-shot',
      description: 'Futuristic AI virtual influencer, stunning features, cyberpunk fashion, city backdrop',
    },
    premium: false,
  },
  {
    id: 'fantasy-scene',
    title: 'Fantasy World',
    emoji: '🐉',
    category: 'fantasy',
    thumbnail: '/assets/store/fantasy-world.png',
    samples: [
      '/assets/store/fantasy-world.png',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Epic fantasy landscapes and characters',
    config: {
      category: 'fantasy',
      style: 'concept-art',
      mood: 'intense',
      lighting: 'volumetric',
      camera: 'wide-shot',
      description: 'Epic dragon flying over a vast mountain kingdom, cinematic fantasy landscape',
    },
    premium: false,
  },
  {
    id: 'anime-character',
    title: 'Anime Character',
    emoji: '⛩️',
    category: 'anime',
    thumbnail: '/assets/store/anime-character.png',
    samples: [
      '/assets/store/anime-character.png',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Beautiful anime-style character art',
    config: {
      category: 'anime',
      style: 'anime',
      mood: 'aesthetic',
      lighting: 'soft-light',
      camera: 'close-up',
      description: 'Kawaii anime girl with pastel hair, cherry blossom background, detailed eyes',
    },
    premium: false,
  },
  {
    id: 'fashion-editorial',
    title: 'Fashion Editorial',
    emoji: '👗',
    category: 'fashion',
    description: 'High-fashion editorial photography',
    config: {
      category: 'fashion',
      style: 'cinematic',
      mood: 'elegant',
      lighting: 'rim-light',
      camera: 'medium-shot',
      description: 'High fashion model in avant-garde outfit, editorial pose, magazine cover quality',
    },
    premium: false,
  },
];

export const pricingPlans = [
  {
    id: 'starter',
    name: '<span class="text-green">Starter</span>',
    price: 2,
    credits: 3,
    period: 'one-time',
    description: 'Perfect to <span class="text-green">explore & get started</span>',
    features: [
      '<span class="text-green">3</span> Complete Prompt Packs (3 Tokens)',
      'Full pack: title, description & prompts',
      'Public prompt library access',
      'Basic styles & moods',
      'Standard AI format support',
      'Unlock <span class="text-orange">1</span> social verification in the post',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pro',
    name: '<span class="text-cyan">Creator</span>',
    price: 10,
    credits: 20,
    period: 'one-time',
    description: 'Best for <span class="text-cyan">creators & freelancers</span>',
    features: [
      '<span class="text-cyan">20</span> Complete Prompt Packs (20 Tokens)',
      'Full pack: title, description, prompts, samples',
      '<span class="text-purple">Private</span> prompt mode',
      'All styles & moods unlocked',
      'Multi-AI format support (MJ, SD, etc.)',
      '<span class="text-orange">Prompt optimization</span> engine',
      'Save & organize prompts',
      'Unlock <span class="text-orange">2</span> social verifications in the post',
    ],
    cta: 'Get Packs',
    popular: true,
  },
  {
    id: 'unlimited',
    name: '<span class="text-purple">Studio</span>',
    price: 29,
    credits: 70,
    period: 'one-time',
    description: 'For <span class="text-purple">power users & professionals</span>',
    features: [
      '<span class="text-purple">70</span> Complete Prompt Packs (70 Tokens)',
      '<span class="text-cyan">Advanced</span> high-quality generation',
      'Character consistency support',
      '<span class="text-pink">Video + image</span> prompt support',
      'Batch prompt generation',
      'API access (future-ready)',
      'Priority support',
      '<span class="text-orange">Early access</span> to new features',
      'Unlock <span class="text-orange">3</span> social verifications in the post',
    ],
    cta: 'Get Packs',
    popular: false,
  },
];

/* --- RANDOM SAMPLES FOR GENERATOR --- */
export const subjectDetailsSamples = [
  "intricate tattoos, glowing eyes, battle scars",
  "wearing a sleek futuristic armor suit, neon accents",
  "holding a glowing magical staff, flowing silk robes",
  "covered in stardust, ethereal presence, levitating",
  "steampunk goggles, mechanical arm, leather duster",
  "adorned with delicate floral crowns and vines",
  "cybernetic implants, glowing circuitry on skin",
  "wearing elegant Victorian era clothing with a modern twist",
  "draped in heavy velvet, holding an ancient grimoire",
  "face half-hidden by a traditional kitsune mask",
  "made entirely of flowing liquid gold, hyper-detailed",
  "wearing a heavy astronaut suit with a shattered visor",
  "dressed in tactical urban techwear, holding dual katanas",
  "translucent skin revealing glowing energy veins beneath",
  "adorned with massive mechanical wings and a halo of light",
  "dressed in ancient Egyptian royal garb made of dark matter",
  "covered in intricate tribal war paint, tribal bone jewelry",
  "wearing a glowing holographic jacket, cyberpunk fashion",
  "holding an umbrella made of glowing lotus petals"
];

export const environmentSamples = [
  "in a dense bioluminescent forest at midnight",
  "standing on the edge of a crumbling skyscraper",
  "inside a bustling interstellar marketplace",
  "surrounded by floating islands and waterfalls",
  "in a neon-drenched cyberpunk alleyway",
  "within a grand, forgotten library filled with floating books",
  "in a serene Zen garden during a light snowfall",
  "on a barren alien planet with twin suns",
  "deep inside a crystalline cave system",
  "in an abandoned gothic cathedral overgrown with dark vines",
  "inside a massive rotating space station overlooking Earth",
  "on a train moving through a surreal, cloud-filled void",
  "in a busy retro-futuristic diner with robot waitresses",
  "on an ancient battlefield littered with colossal, rusted swords",
  "inside a cozy, magical potion shop cluttered with glowing vials",
  "in a sprawling underwater city enclosed in a glass dome",
  "on a quiet, foggy bridge over a dark, mysterious river",
  "inside a glitching, digital matrix with cascading green code",
  "on a mountaintop temple surrounded by swirling auroras"
];

export const negativePromptSamples = [
  "ugly, deformed, poorly drawn, extra limbs, low resolution",
  "blurry, out of focus, distorted, watermark, signature",
  "cartoon, illustration, 3d render, artificial, synthetic",
  "overexposed, underexposed, bad lighting, noisy, grainy",
  "text, font, writing, letters, logo",
  "missing fingers, mutated hands, anatomical nonsense",
  "flat colors, dull, boring, simple background",
  "bad anatomy, bad proportions, disfigured, poorly drawn face",
  "cloned face, cropped, worst quality, low quality, jpeg artifacts",
  "mutation, deformed, blurry, bad anatomy, bad proportions",
  "extra limbs, cloned face, disfigured, gross proportions",
  "malformed limbs, missing arms, missing legs, extra arms",
  "fused fingers, too many fingers, long neck, bad hands"
];

export const modelParameterSamples = [
  "--ar 16:9 --v 6.0 --stylize 250",
  "--ar 2:3 --niji 6 --style raw",
  "CFG: 7, Steps: 30, Sampler: Euler a",
  "--ar 21:9 --v 6.0 --chaos 10",
  "CFG: 4.5, Steps: 40, Sampler: DPM++ 2M Karras",
  "--ar 1:1 --v 5.2 --stylize 500",
  "--ar 3:4 --v 6.0 --weird 50",
  "--ar 16:9 --v 6.0 --stylize 100 --chaos 25",
  "CFG: 8, Steps: 50, Sampler: DPM++ SDE Karras, Seed: 42",
  "--ar 9:16 --niji 6 --stylize 300",
  "--ar 4:5 --v 6.0 --style raw --weird 250",
  "CFG: 6, Steps: 20, Sampler: DDIM",
  "--ar 3:2 --v 5.2 --stylize 1000"
];

export const randomDescriptions = [
  "Ethereal Portrait + Transparent Skin + Internal Galaxy + Cinematic Lighting + Hyperrealism + Museum Art + 8K",
  "Surreal Beauty + Glass Anatomy + Liquid Gold Veins + Luxury Editorial + Ultra Detail + Masterpiece",
  "Fine Art Portrait + Marble Cracks + Living Statue + Soft God Rays + Renaissance + Photorealistic",
  "Elegant Woman + Butterfly Veins + Bioluminescence + Dark Background + Fine Art + Ultra HD",
  "Royal Queen + Black Crown + Golden Tears + Baroque Style + Dramatic Shadows + 8K",
  "Surreal Horror + Floating Eyes + Endless Fog + Symbolic Art + High Contrast + Hyperrealism",
  "Dark Fantasy + Broken Halo + Black Wings + Volumetric Lighting + Cinematic + 8K",
  "Psychological Horror + Mirror Dimension + Impossible Geometry + Moody Lighting + Masterpiece",
  "Gothic Cathedral + Human Roots + Fog Atmosphere + Unreal Engine + Hyper Detailed",
  "Dreamcore Horror + Empty Throne + Cosmic Eclipse + Fine Art Photography + Ultra Realistic",
  "Haute Couture + Liquid Gold Dress + Fashion Editorial + Studio Lighting + Vogue Style + 8K",
  "Luxury Portrait + Diamond Skeleton + Crystal Skin + Black Background + Hyperrealistic",
  "Avant-Garde Fashion + Floating Silk + High Jewelry + Editorial Photography + Cinematic Lighting",
  "Runway Fashion + Metallic Fabric + Luxury Makeup + High Contrast + Award Winning Photography",
  "Luxury Beauty + Pearl Skin + Golden Reflection + Soft Studio Lighting + Masterpiece",
  "Impossible Architecture + Floating Castle + Waterfalls + Volumetric Clouds + Cinematic + 8K",
  "Ancient Temple + Cosmic Sky + Giant Moon + Atmospheric Perspective + Hyperrealism",
  "Walking Cathedral + Ocean Landscape + Fantasy Realism + Epic Scale + Ultra Detail",
  "Brutalist Architecture + Endless Staircase + Fog + Minimalism + Photorealism",
  "Crystal Palace + Aurora Sky + Reflection Lake + Unreal Engine + Cinematic",
  "Bioluminescent Forest + Giant Mushrooms + Fog Rays + Fantasy Realism + Ultra Detailed",
  "Frozen Waterfall + Aurora Borealis + Mountain Landscape + Epic Scale + 8K",
  "Cherry Blossom Storm + Japanese Temple + Sunrise Mist + Fine Art + Hyperrealism",
  "Alien Jungle + Neon Plants + Floating Rocks + Atmospheric Lighting + Cinematic",
  "Ancient Tree + Crystal Roots + Magical Glow + Fantasy Landscape + Masterpiece",
  "Hypercar Concept + Liquid Chrome + Rain Reflection + Neon City + Ray Tracing + 8K",
  "Retro Supercar + Tokyo Streets + Night Rain + Cinematic Photography + Unreal Engine",
  "Luxury Yacht + Golden Sunset + Ocean Reflection + Editorial Photography + Hyperrealism",
  "Cyber Motorcycle + Neon Fog + Wet Asphalt + Volumetric Lighting + Masterpiece",
  "Stealth Hypercar + Desert Highway + Golden Hour + Ultra Photorealistic",
  "Cosmic Goddess + Nebula Hair + Star Crown + Celestial Glow + Hyperrealism + 8K",
  "Astronaut + Black Hole + Gravitational Lens + Space Art + Cinematic + Masterpiece",
  "Planetary Rings + Crystal Mountains + Alien Ocean + Epic Landscape + Ultra Detail",
  "Celestial Throne + Solar Eclipse + Divine Light + Fine Art + Photorealistic",
  "Galaxy Cathedral + Infinite Universe + Floating Islands + Unreal Engine + Hyperrealism",
  "Conceptual Art + Human Geometry + Impossible Anatomy + Minimalism + Fine Art + 8K",
  "Fluid Sculpture + Liquid Metal + High Contrast + Luxury Design + Hyperrealistic",
  "Paper Cut Art + Layered Depth + Soft Shadows + Premium Illustration + Ultra Detail",
  "Glass Sculpture + Light Refraction + Clean Background + Museum Quality + Masterpiece",
  "Ink Explosion + Abstract Portrait + Dynamic Motion + High Detail + Fine Art",
  "Glass Human + Internal Ocean + Fine Art Photography + Soft God Rays + Hyperrealism + Museum Quality + 8K",
  "Living Statue + Marble Cracks + Luxury Editorial + Dramatic Lighting + Ultra Detailed + Masterpiece",
  "Floating Cathedral + Cosmic Sky + Atmospheric Perspective + Cinematic + Unreal Engine + 8K",
  "Surreal Human Anatomy + Impossible Biology + Emotional Symbolism + Museum Installation + Hyper Realism",
  "Dreamcore + Infinite Staircase + Soft Fog + Cinematic Perspective + Fine Art Photography",
  "Celestial Goddess + Cosmic Hair + Galaxy Dust + Divine Lighting + Ultra Detailed",
  "Ancient Temple + Giant Sleeping Titan + Atmospheric Mist + Epic Scale + Matte Painting",
  "Floating Islands + Waterfall Sky + Golden Sunrise + Fantasy Landscape + Unreal Engine",
  "Dark Angel + Broken Halo + Black Feathers + Volumetric God Rays + Renaissance Realism",
  "Glass Human + Internal Ocean + Transparent Skin + Blue Bioluminescence + Photorealistic",
  "Living Marble Statue + Cracked Stone + Human Flesh + Luxury Editorial + Masterpiece",
  "Human Forest + Moss Skin + Giant Trees + Nature Fusion + Fantasy Realism",
  "Mechanical Heart + Exposed Anatomy + Brass Gears + Steampunk Luxury + Ultra Detail",
  "Moon Priestess + Silver Veil + Lunar Glow + Mystic Atmosphere + Fine Art Portrait",
  "Crystal Cave + Giant Dragon Skeleton + Blue Luminescence + Epic Fantasy + Cinematic Lighting",
  "Abandoned Cathedral + Floating Candles + Dust Particles + Gothic Architecture + Dark Fantasy",
  "Ocean Giant + Tiny Sailboat + Impossible Scale + Dramatic Clouds + Hyper Realism",
  "Cyber Samurai + Holographic Armor + Rainy Tokyo + Neon Reflection + Cinematic Photography",
  "Floating Whale + Sky Ocean + Cloud Waves + Magical Realism + Dream Illustration",
  "Human Face + Blooming Flowers + Botanical Anatomy + Luxury Beauty Shot + Soft Lighting",
  "Golden Deer + Crystal Antlers + Enchanted Forest + Morning Fog + Fantasy Photography",
  "Ice Queen + Frozen Crown + Snow Particles + Pale Blue Lighting + Hyper Detailed",
  "Shadow Creature + White Eyes + Minimal Darkness + Psychological Horror + Cinematic Contrast",
  "Phoenix Empress + Molten Feathers + Volcanic Sky + Fire Particles + Epic Fantasy",
  "Floating Library + Infinite Books + Magic Dust + Warm Light Rays + Concept Art",
  "Black Hole Portal + Ancient Castle + Cosmic Storm + Cinematic Scale + Unreal Engine",
  "Butterfly Dress + Floral Explosion + Fashion Editorial + Luxury Photography + Soft Bloom",
  "Glass Butterfly + Prism Refractions + Rainbow Light + Macro Photography + Hyper Realism",
  "Desert Kingdom + Giant Sand Whale + Golden Storm + Cinematic Landscape + Matte Painting",
  "Alien Garden + Bioluminescent Plants + Neon Flora + Exotic Atmosphere + Ultra Detailed",
  "Clockwork City + Giant Gears + Victorian Architecture + Steam Fog + Steampunk Masterpiece",
  "Ghost Bride + White Roses + Foggy Forest + Gothic Romance + Cinematic Portrait",
  "Floating Castle + Aurora Sky + Moonlight Clouds + Fantasy Kingdom + Epic Environment"
];

export const generateRandomSurprise = () => {
  return randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
};

export const textCategories = {
  "AI AGENTS": {
    color: "#a855f7",
    icon: "bot",
    items: [
      {
        name: "Customer Support Agents",
        template: `You are a customer support AI agent for {{brand_name}}, a company in the {{industry}} industry.

Your job is to:
- Greet customers warmly and identify their issue
- Resolve queries about orders, refunds, billing, accounts, and FAQs
- Escalate unresolved issues to a human agent politely
- Maintain a {{tone}} tone throughout every interaction
- Never make up information — say "Let me check that for you" if unsure

Always end with: "Is there anything else I can help you with today?"`
      },
      {
        name: "Research Agents",
        template: `You are an expert AI research agent specializing in {{research_topic}}.

Your task is to:
- Gather and analyze the most relevant and up-to-date information on {{research_topic}}
- Perform a {{depth}} level investigation
- Identify key trends, statistics, expert opinions, and gaps
- Present findings in {{output_format}} format
- Highlight 3–5 actionable insights at the end

Be factual, structured, and cite sources where possible.`
      },
      {
        name: "Coding Agents",
        template: `You are a senior AI coding agent expert in {{language}}.

Your task: {{coding_task}}

Rules:
- Write {{experience_level}} level code
- Output: {{output_type}}
- Include inline comments explaining key logic
- Follow best practices: clean code, proper naming, modular structure
- If debugging: identify the bug first, explain why it occurs, then fix it
- If building: plan the structure first, then write the full code`
      },
      {
        name: "Automation Agents",
        template: `You are an expert AI automation agent working with {{platform}}.

Automation Goal: {{automation_goal}}
Trigger: {{trigger_type}}

Your task:
- Map out the full automation flow step-by-step
- Identify: Trigger → Action → Condition → Output
- List all tools, APIs, or integrations needed
- Write the automation logic or workflow blueprint
- Flag any potential failure points and how to handle them`
      },
      {
        name: "Marketing Agents",
        template: `You are an expert AI marketing agent for {{product_or_brand}}.

Target Audience: {{target_audience}}
Goal: {{marketing_goal}}
Channel: {{channel}}

Your task:
- Build a complete marketing strategy for {{channel}}
- Write compelling copy tailored to {{target_audience}}
- Create a campaign structure: Hook → Value Prop → CTA
- Suggest 5 content ideas aligned with {{marketing_goal}}
- Provide KPIs to measure campaign success`
      },
      {
        name: "Sales Agents",
        template: `You are an expert AI sales agent selling {{product_name}}.

Current Stage: {{sales_stage}}
Buyer Persona: {{buyer_persona}}

Your task:
- Execute the {{sales_stage}} stage perfectly
- Identify the buyer's pain points and map them to {{product_name}} benefits
- Handle objections with the Feel-Felt-Found method
- Use consultative selling — never hard sell
- End every interaction with a clear next step or CTA`
      },
      {
        name: "Personal Assistant Agents",
        template: `You are a highly efficient AI personal assistant for a {{user_role}}.

Today's Priority: {{priority_task}}

Your responsibilities:
- Help plan, organize, and execute daily tasks efficiently
- Draft emails, messages, and responses in the user's voice
- Summarize long documents, meetings, or threads quickly
- Suggest time blocks and task prioritization based on urgency
- Proactively flag conflicts, deadlines, or missing steps`
      },
      {
        name: "Multi-Agent Systems",
        template: `Design a multi-agent AI system to achieve: {{system_goal}}

System uses {{agent_count}} specialized agents with {{coordination_style}} coordination.

For each agent define:
- Agent Name & Role
- Input it receives
- Task it performs
- Output it produces
- Who it passes output to

Then write the full orchestration flow from Agent 1 → Final Output.
Include: error handling between agents and a quality-check agent at the end.`
      },
      {
        name: "Workflow Agents",
        template: `You are an expert AI workflow agent tasked with optimizing: {{workflow_name}}

Team Size: {{team_size}}
Output Needed: {{output_type}}

Your task:
- Map the current workflow end-to-end (As-Is)
- Identify bottlenecks, redundancies, and manual steps
- Design the optimized workflow (To-Be)
- Assign roles/tools to each step based on {{team_size}}
- Deliver the final {{output_type}} ready for implementation`
      }
    ]
  },
  "CODE": {
    color: "#3b82f6",
    icon: "code",
    items: [
      {
        name: "Web Development",
        template: `You are a senior web developer expert in {{tech_stack}}.

Project: {{project_type}}
Code Style: {{code_style}}
Output: {{output_type}}

Your task:
- Plan the component/page structure first
- Write clean, modular, responsive code
- Follow {{tech_stack}} best practices
- Include comments on all key sections
- Make it mobile-first and accessible (WCAG basic)
- If full-stack: separate frontend and backend clearly`
      },
      {
        name: "App Development",
        template: `You are a senior mobile/app developer expert in {{platform}}.

App: {{app_idea}}
Core Feature: {{feature_focus}}
Code Style: {{code_style}}

Your task:
- Define the app screen flow first (Screen 1 → Screen 2 → ...)
- Build the {{feature_focus}} with full working code
- Include navigation, state management, and API calls if needed
- Handle loading, error, and empty states
- Follow {{platform}} design guidelines (Material / Cupertino / Custom)`
      },
      {
        name: "Game Development",
        template: `You are an expert game developer using {{engine}}.

Game: {{game_idea}}
Type: {{game_type}}
Feature to Build: {{feature_focus}}

Your task:
- Define the core game loop first (Start → Play → Win/Lose → Restart)
- Build {{feature_focus}} with complete working code
- Include: player input handling, collision detection, scoring system
- Add game states: Menu / Playing / Paused / Game Over
- Comment every system clearly for easy modification`
      },
      {
        name: "API Development",
        template: `You are a senior backend engineer building a {{api_type}} API using {{backend_stack}}.

API Purpose: {{api_purpose}}
Authentication: {{auth_type}}

Your task:
- Define all endpoints/resolvers with method, route, input, output
- Write complete working code for every endpoint
- Implement {{auth_type}} authentication middleware
- Add input validation, error handling, and proper HTTP status codes
- Include API documentation comments (OpenAPI/Swagger style)
- Add rate limiting and security headers`
      },
      {
        name: "Database & SQL",
        template: `You are a senior database architect expert in {{db_type}}.

Task: {{db_task}}
Output Needed: {{output_type}}

Your task:
- Analyze the data requirements for {{db_task}}
- Design normalized schema / data model (3NF minimum for SQL)
- Write the complete {{output_type}} with proper data types
- Add indexes on all frequently queried columns
- Include foreign keys, constraints, and cascade rules
- For queries: show execution plan awareness and optimization notes`
      },
      {
        name: "Debugging",
        template: `You are an expert debugging engineer for {{language}}.

Code / Bug Description: {{buggy_code}}
Error Message: {{error_message}}

Your debugging process:
STEP 1 — IDENTIFY: What exactly is wrong and where
STEP 2 — EXPLAIN: Why this bug occurs (root cause)
STEP 3 — FIX: Write the corrected code with changes highlighted
STEP 4 — VERIFY: Explain how to test the fix
STEP 5 — PREVENT: What to do to avoid this bug in future

Never just fix silently — always explain every change made.`
      },
      {
        name: "Automation Scripts",
        template: `You are an expert automation engineer writing a {{language}} script.

Task to Automate: {{automation_task}}
Trigger: {{trigger_type}}

Your task:
- Break the automation into clear logical steps first
- Write the complete working {{language}} script
- Add logging for every major action (success + failure)
- Include error handling with retry logic where needed
- Add config variables at the top (easy to customize)
- Comment each section explaining what it does and why`
      },
      {
        name: "DevOps",
        template: `You are a senior DevOps engineer expert in {{tool_stack}}.

Task: {{devops_task}}
Environment: {{environment}}

Your task:
- Plan the infrastructure/pipeline architecture first
- Write all configuration files completely (no placeholders)
- Include environment-specific variables using .env / secrets
- Add health checks, rollback strategy, and monitoring hooks
- Document every config block with inline comments
- Include deployment steps in order (Step 1 → Step 2 → ...)`
      },
      {
        name: "Security",
        template: `You are a senior application security engineer.

Task: {{security_task}}
Target: {{target_type}}
Focus: {{severity_focus}}

Your task:
- Audit the {{target_type}} against {{severity_focus}} standards
- List all vulnerabilities found with severity (Critical / High / Medium / Low)
- For each vulnerability:
  → What it is
  → How it can be exploited
  → Exact fix with secure code example
- Write the hardened, secure version of the code/config
- Provide a security checklist at the end`
      }
    ]
  },
  "WRITING": {
    color: "#f59e0b",
    icon: "pen-tool",
    items: [
      {
        name: "Blog Writing",
        template: `You are an expert blog writer creating content for {{target_audience}}.

Topic: {{blog_topic}}
Tone: {{tone}}
Length: {{word_count}}

Your task:
- Write a magnetic headline (primary) + 2 alternate headline options
- Open with a hook that grabs attention in the first 2 sentences
- Structure: Hook → Problem → Solution → Examples → Takeaways → CTA
- Use H2 and H3 subheadings every 200–300 words
- Write in {{tone}} tone throughout — never switch style mid-article
- End with 1 clear CTA aligned to the reader's next step`
      },
      {
        name: "Copywriting",
        template: `You are a world-class direct-response copywriter.

Product/Service: {{product_or_service}}
Audience: {{target_audience}}
Copy Type: {{copy_type}}
Framework: {{framework}}

Your task:
- Apply {{framework}} structure strictly throughout
- Lead with the customer's biggest pain point or desire — not the product
- Write a headline + 2 alternate headlines
- Use power words, emotional triggers, and specificity
- Include social proof placeholder: [TESTIMONIAL], [STAT], [GUARANTEE]
- End with an urgency-driven CTA
- No fluff — every sentence must earn its place`
      },
      {
        name: "SEO Writing",
        template: `You are an expert SEO content writer and strategist.

Primary Keyword: {{primary_keyword}}
Secondary Keywords: {{secondary_keywords}}
Content Type: {{content_type}}
Target Length: {{word_count}}

Your task:
- Write fully optimized {{content_type}} targeting "{{primary_keyword}}"
- Include primary keyword in: Title, H1, first 100 words, 1 H2, meta description
- Naturally use secondary keywords {{secondary_keywords}} throughout
- Use semantic SEO — include LSI keywords and related entities
- Structure with proper H1 → H2 → H3 hierarchy
- Add FAQ section at the end (5 questions using PAA-style queries)
- Write meta title (60 chars) + meta description (155 chars)
- Include internal linking placeholders: [LINK TO: related article]`
      },
      {
        name: "Script Writing",
        template: `You are a professional scriptwriter specializing in {{script_type}}.

Topic: {{script_topic}}
Duration: {{duration}}
Tone: {{tone}}

Your task:
- Open with a pattern-interrupt hook in the first 3 seconds
- Structure: Hook → Setup → Main Content → Payoff → CTA
- Write in natural spoken language — not essay style
- Add [PAUSE], [EMPHASIS], [B-ROLL: description] stage directions
- Pace content for {{duration}} (approx 130 words per minute)
- End with a retention CTA (subscribe / follow / click / share)`
      },
      {
        name: "Email Writing",
        template: `You are an expert email copywriter.

Purpose: {{email_purpose}}
Email Type: {{email_type}}
Recipient: {{recipient}}
Tone: {{tone}}

Your task:
- Write 3 subject line options (curiosity / benefit / question style)
- Open with a personalization hook — not "I hope this email finds you well"
- Keep paragraphs to 2–3 lines max (mobile-first reading)
- One clear point per email — no information overload
- Include exactly ONE CTA — specific and low-friction
- Add a P.S. line with a secondary hook or urgency trigger`
      },
      {
        name: "Ebook Writing",
        template: `You are an expert ebook writer and content strategist.

Topic: {{ebook_topic}}
Reader: {{target_audience}}
Goal: {{ebook_goal}}

Your task:
- Write a full ebook outline: Title → Subtitle → Introduction → 5–8 Chapters → Conclusion
- For each chapter provide:
  → Chapter title + hook sentence
  → 3–5 key points covered
  → 1 exercise / action step / case study
  → Chapter summary (3 bullet points)
- Write the Introduction and Chapter 1 in full
- Tone: authoritative but accessible — written for {{target_audience}}`
      },
      {
        name: "Technical Writing",
        template: `You are a senior technical writer with engineering expertise.

Topic: {{document_topic}}
Document Type: {{doc_type}}
Audience Level: {{audience_level}}

Your task:
- Structure the document with: Overview → Prerequisites → Step-by-Step Content → Examples → Troubleshooting → Reference
- Write in clear, precise language matched to {{audience_level}}
- Use active voice, present tense, and imperative mood for instructions
- Include: code blocks, tables, numbered steps, and callout boxes
- Add a "Quick Reference" summary table at the end
- Every instruction must be testable — reader can follow and verify`
      },
      {
        name: "Resume Writing",
        template: `You are a professional resume writer and career coach.

Target Role: {{job_role}}
Experience Level: {{experience_level}}
Industry: {{industry}}
Output: {{output_type}}

Your task:
- Write a complete {{output_type}} optimized for ATS and human recruiters
- Resume structure: Summary → Skills → Experience → Education → Certifications
- Use strong action verbs: Led, Built, Increased, Reduced, Launched, Optimized
- Quantify every achievement: "Increased sales by 40%" not "Improved sales"
- Tailor all content specifically for {{job_role}} in {{industry}}
- Include 10 ATS keywords relevant to {{job_role}} naturally woven in`
      }
    ]
  },
  "MARKETING": {
    color: "#ec4899",
    icon: "megaphone",
    items: [
      {
        name: "Social Media Marketing",
        template: `You are an expert social media strategist for {{platform}}.

Brand: {{brand_or_product}}
Goal: {{goal}}
Content Type: {{content_type}}

Your task:
- Define the brand's social media positioning in 2 lines
- Create 10 content ideas tailored to {{platform}} algorithm
- Write 5 ready-to-post captions with hooks, body, and CTA
- Include hashtag strategy: 5 niche + 5 mid + 3 broad hashtags
- Suggest posting frequency and best times for {{platform}}
- Add 3 engagement tactics to boost reach organically
- Structure each post: Hook (line 1) → Value → CTA → Hashtags`
      },
      {
        name: "SEO",
        template: `You are a senior SEO strategist with 10+ years of experience.

Website/Niche: {{website_or_niche}}
Goal: {{seo_goal}}
Target Keyword: {{target_keyword}}
Competition: {{competition_level}}

Your task:
- Perform a keyword cluster analysis for "{{target_keyword}}"
- Identify: 1 pillar keyword + 5 cluster keywords + 10 long-tail keywords
- Map search intent for each keyword (Informational / Transactional / Navigational)
- Build a content strategy: which pages to create, in what order
- Write full on-page SEO checklist for the target page
- Suggest 5 link-building strategies for {{competition_level}} competition
- Include 3 quick-win optimizations that can improve rankings in 30 days`
      },
      {
        name: "Email Marketing",
        template: `You are an expert email marketing strategist for {{brand_or_product}}.

Campaign Type: {{campaign_type}}
Audience: {{audience_segment}}
Sequence Length: {{sequence_length}}

Your task:
- Map the full {{campaign_type}} sequence flow:
  Email # → Send Day → Subject Line → Preview Text → Goal → CTA
- Write each email fully:
  → 3 subject line options (curiosity / benefit / urgency)
  → Preview text (90 chars)
  → Opening hook (not "Hope this email finds you well")
  → Body content (value-first, short paragraphs)
  → Single CTA (button text + destination)
  → P.S. line
- Include open rate + click rate benchmark for each email type`
      },
      {
        name: "Paid Advertising",
        template: `You are a performance marketing expert specializing in {{ad_platform}}.

Product/Offer: {{product_or_offer}}
Objective: {{campaign_objective}}
Budget: {{budget}}

Your task:
- Define campaign structure: Campaign → Ad Set → Ad level breakdown
- Audience targeting: demographics, interests, behaviors, lookalikes
- Write 3 complete ad variations (A/B/C test):
  → Primary text (hook + value + CTA)
  → Headline (5 words max, benefit-driven)
  → Description line
  → CTA button recommendation
- Creative brief: describe the ideal image/video for each ad
- Budget allocation strategy across ad sets
- Key metrics to track + target benchmarks (CTR, CPC, ROAS, CPL)`
      },
      {
        name: "Branding",
        template: `You are a world-class brand strategist and identity designer.

Brand: {{brand_name}}
Industry: {{industry}}
Output: {{branding_output}}

Your task:
- Define brand positioning: What it is, Who it's for, Why it's different
- Build brand archetype: (Hero / Sage / Creator / Outlaw / Explorer / etc.)
- Write brand personality: 5 traits with DO and DON'T examples for each
- Create messaging framework:
  → Brand tagline (3 options)
  → Brand mission statement (1 sentence)
  → Brand vision statement (1 sentence)
  → Elevator pitch (30 seconds spoken)
  → Value proposition (1 sentence)
- Define brand voice: tone, vocabulary, communication style
- Visual identity brief: color psychology, typography mood, imagery style`
      },
      {
        name: "Sales Funnels",
        template: `You are a conversion funnel strategist and direct-response copywriter.

Product/Offer: {{product_or_offer}}
Funnel Type: {{funnel_type}}
Traffic Source: {{traffic_source}}
Price Point: {{price_point}}

Your task:
- Map the complete funnel step-by-step:
  Step # → Page/Touchpoint → Goal → Copy Direction → CTA
- Write copy for each funnel stage:
  → Ad/Entry hook
  → Landing page headline + subheadline + CTA
  → Thank you page
  → Email sequence (3 emails minimum)
  → Sales page core sections
  → Upsell offer (1 OTO)
- Include conversion benchmarks per stage
- Add trust elements: testimonials, guarantees, scarcity placement`
      },
      {
        name: "Lead Generation",
        template: `You are an expert lead generation strategist.

Business: {{business_type}}
Method: {{lead_gen_method}}
Ideal Lead: {{target_lead}}

Your task:
- Define the ideal customer profile (ICP) for {{target_lead}}
- Design the lead generation asset for {{lead_gen_method}}:
  → Asset title + description
  → Why this ideal lead would want it
  → Opt-in page headline + 3 bullet benefits + CTA
- Write the lead capture form (fields: name, email + 1 qualifying question max)
- Build the lead qualification framework: 5 questions to score lead quality
- Create the post-capture nurture plan: first 3 touchpoints after opt-in
- Include 3 lead gen campaign ideas using {{lead_gen_method}}`
      },
      {
        name: "Viral Marketing",
        template: `You are a viral growth marketing strategist.

Brand/Campaign: {{brand_or_campaign}}
Viral Mechanism: {{viral_mechanism}}
Platform: {{platform}}

Your task:
- Identify the core viral trigger: (Social Currency / Triggers / Emotion / Public / Practical Value / Stories)
- Design the complete {{viral_mechanism}} campaign:
  → Campaign concept + hook
  → How the viral loop works (Step 1 → Share → Step 2 → Reward → Step 3 → Spread)
  → Entry mechanic (how people participate)
  → Share mechanic (why they'll share it)
  → Reward mechanic (what they get for sharing)
- Write the campaign launch copy: announcement post + 3 follow-up posts
- Define success metrics: target reach, shares, participation rate
- Include 3 amplification tactics to seed the campaign initially`
      }
    ]
  },
  "BUSINESS": {
    color: "#10b981",
    icon: "briefcase",
    items: [
      {
        name: "Startup Ideas",
        template: `You are a serial entrepreneur and startup idea validator.

Skill/Interest: {{interest_or_skill}}
Market Type: {{market_type}}
Starting Budget: {{budget_range}}

Your task:
- Generate 5 startup ideas in {{interest_or_skill}} space for {{market_type}}
- For each idea provide:
  → Problem it solves (1 sentence — must be a real pain)
  → Target customer (hyper-specific profile)
  → Solution summary (how it works in 2 lines)
  → Revenue model (how it makes money)
  → Unfair advantage (why you can win)
  → Validation method (how to test in 2 weeks with {{budget_range}})
  → Risk level: Low / Medium / High
- Rank all 5 by: Feasibility + Market Size + Competition Level
- Deep-dive the #1 ranked idea with full breakdown`
      },
      {
        name: "Business Plans",
        template: `You are a seasoned business plan writer and startup advisor.

Business: {{business_name}}
Plan Purpose: {{plan_purpose}}
Stage: {{business_stage}}

Your task:
Write a complete business plan with these sections:

1. EXECUTIVE SUMMARY (1 page)
   → Business concept, problem, solution, market size, ask/goal

2. PROBLEM & SOLUTION
   → Pain point evidence + unique solution + value proposition

3. MARKET ANALYSIS
   → TAM / SAM / SOM breakdown + target customer profile

4. BUSINESS MODEL
   → Revenue streams + pricing strategy + unit economics

5. GO-TO-MARKET STRATEGY
   → Customer acquisition channels + launch plan + milestones

6. FINANCIAL PROJECTIONS
   → 3-year revenue forecast + key cost drivers + break-even point

7. TEAM SECTION
   → Founding team strengths + key hires needed

8. RISKS & MITIGATION
   → Top 3 risks with mitigation strategies`
      },
      {
        name: "Market Research",
        template: `You are a senior market research analyst.

Market/Industry: {{market_or_industry}}
Research Goal: {{research_goal}}
Output Format: {{output_format}}

Your task:
- Market Overview: size, growth rate (CAGR), key segments
- Customer Analysis:
  → 3 detailed buyer personas with demographics, psychographics, pain points
  → Jobs-to-be-done framework for primary persona
- Trend Analysis: 5 macro trends shaping this market (next 3–5 years)
- Competitive Landscape: market structure (fragmented/consolidated) + key players
- Opportunity Gaps: 3 underserved segments or unmet needs
- Market Entry Recommendation: best entry point with rationale
- Data Sources: cite what types of sources would validate each finding`
      },
      {
        name: "Competitor Analysis",
        template: `You are a strategic business analyst specializing in competitive intelligence.

Your Business: {{your_business}}
Competitors: {{competitors}}
Focus: {{analysis_focus}}

Your task:
- Build a competitor comparison matrix:
  [Feature / Price / Target Market / Positioning / Strengths / Weaknesses]
- For each competitor analyze:
  → Positioning statement (how they describe themselves)
  → Target customer (who they're really selling to)
  → Pricing model + price points
  → Top 3 strengths (what they do better)
  → Top 3 weaknesses (where they fall short)
  → Marketing channels they dominate
  → Customer sentiment (common praise + common complaints)
- Identify: your 3 biggest competitive advantages vs all competitors
- Recommend: 1 positioning strategy to win against all competitors`
      },
      {
        name: "Finance",
        template: `You are a CFO-level financial strategist and analyst.

Task: {{finance_task}}
Business Type: {{business_type}}
Output: {{output_type}}

Your task:
- Build the complete {{output_type}} for a {{business_type}}
- Structure:
  → Key assumptions (list every assumption made)
  → Revenue model breakdown (streams, pricing, volume)
  → Cost structure (fixed vs variable costs)
  → Monthly projections: Month 1 → Month 12
  → Key financial metrics: MRR / ARR / Gross Margin / CAC / LTV / Burn Rate
  → Break-even point: month and revenue amount
  → 3 scenarios: Conservative / Base / Optimistic
- Explain each number in plain English below the model
- Flag: top 3 financial risks and how to mitigate them`
      },
      {
        name: "Ecommerce",
        template: `You are a 7-figure ecommerce expert and growth strategist.

Store/Product: {{store_or_product}}
Platform: {{ecommerce_platform}}
Goal: {{ecommerce_goal}}
Model: {{business_model}}

Your task:
- Diagnose the current state and identify the #1 priority for {{ecommerce_goal}}
- Deliver a complete action plan:

  IF Product Research:
  → 5 winning product criteria + 3 product ideas with validation data

  IF Store Setup:
  → Store structure, pages needed, conversion elements checklist

  IF Conversion Optimization:
  → CRO audit: homepage → product page → cart → checkout
  → 10 specific changes ranked by impact

  IF Marketing:
  → Channel mix: paid + organic + email + influencer allocation

  IF Scaling:
  → Systems, team, automation, and capital allocation plan

  IF Retention:
  → Post-purchase flow, loyalty program, LTV maximization plan`
      },
      {
        name: "Entrepreneurship",
        template: `You are a world-class entrepreneur mentor, advisor, and strategist.

Challenge/Topic: {{entrepreneur_challenge}}
Stage: {{business_stage}}
Output: {{output_type}}

Your task:
- Diagnose the real problem behind "{{entrepreneur_challenge}}" — not just surface level
- Deliver {{output_type}} tailored to {{business_stage}}:

  Structure your response as:
  → The Real Problem (reframe their challenge)
  → The Principle (the key insight that solves it)
  → The Framework (step-by-step approach)
  → The Action (what to do in the next 24 hours)
  → The Pitfall (the #1 mistake to avoid)
  → The Example (a real-world pattern or analogy)

- Be direct, specific, and actionable — no generic advice
- Speak as a mentor who has built businesses, not as a consultant`
      }
    ]
  },
  "RESEARCH": {
    color: "#06b6d4",
    icon: "microscope",
    items: [
      {
        name: "Deep Research",
        template: `You are a world-class research analyst with expertise across 
multiple disciplines.

Topic: {{research_topic}}
Depth: {{research_depth}}
Format: {{output_format}}

Your task:
- Layer 1 — FOUNDATION: Core facts, definitions, and context
- Layer 2 — DEPTH: Key mechanisms, causes, evidence, and data
- Layer 3 — COMPLEXITY: Conflicting views, nuances, and debates
- Layer 4 — EXPERT LEVEL: Cutting-edge findings, future implications
- Layer 5 — SYNTHESIS: Your integrated analysis and key conclusions

For each layer include:
→ Key findings (bullet points)
→ Supporting evidence or data points
→ Source type recommendations
→ Confidence level: High / Medium / Needs Verification

End with:
→ 5 Key Takeaways
→ 3 Open Questions still unanswered
→ 5 recommended sources to explore further`
      },
      {
        name: "Academic Research",
        template: `You are a senior academic researcher and scholarly writing expert.

Topic/Question: {{research_topic}}
Level: {{academic_level}}
Type: {{research_type}}
Citation Style: {{citation_style}}

Your task:
- Formulate a precise research question (if not provided)
- Build complete {{research_type}} structure:

  IF Literature Review:
  → Thematic organization of existing research
  → Research gaps identified
  → Synthesis of conflicting findings

  IF Thesis Outline:
  → Chapter structure with word count allocation
  → Research questions per chapter
  → Methodology justification

  IF Research Proposal:
  → Background → Problem Statement → Objectives →
    Methodology → Timeline → Expected Contributions

  IF Methodology Design:
  → Research paradigm (positivist/interpretivist/critical)
  → Methods (qualitative/quantitative/mixed)
  → Data collection + analysis approach
  → Validity and reliability measures

- Format all citations as {{citation_style}} placeholders
- Include academic vocabulary appropriate for {{academic_level}}`
      },
      {
        name: "Summarization",
        template: `You are an expert content analyst and professional summarizer.

Content: {{content_to_summarize}}
Summary Type: {{summary_type}}
Length: {{summary_length}}

Your task:
- Read and fully understand the content before summarizing
- Identify: main argument, key evidence, important conclusions
- Deliver {{summary_type}} in {{summary_length}} format:

  Structure:
  → Core Topic (1 sentence — what this is about)
  → Main Argument / Purpose (what it claims or aims to do)
  → Key Points (3–7 most important ideas)
  → Supporting Evidence (data, examples, quotes that matter)
  → Conclusions / Outcomes (what was found or decided)
  → Relevance / So What? (why this matters)

- Preserve all critical numbers, dates, names, and findings
- Never add interpretation not present in the original
- Flag if any section was unclear or ambiguous in source`
      },
      {
        name: "Data Analysis",
        template: `You are a senior data analyst and business intelligence expert.

Data/Topic: {{data_or_topic}}
Analysis Type: {{analysis_type}}
Tool: {{tool}}
Output: {{output_type}}

Your task:
STEP 1 — DATA UNDERSTANDING
→ Define variables, data types, and expected distributions
→ Identify potential data quality issues (nulls, outliers, bias)

STEP 2 — ANALYSIS EXECUTION
→ Apply {{analysis_type}} methodology
→ Calculate key metrics and statistical measures
→ Identify patterns, correlations, and anomalies

STEP 3 — INSIGHT GENERATION
→ Translate findings into plain-English business insights
→ Rank insights by impact: High / Medium / Low
→ Connect each insight to a business decision or action

STEP 4 — OUTPUT DELIVERY
→ Deliver {{output_type}} with all findings structured
→ Include: visualization recommendations per insight
→ Write executive summary of top 3 findings`
      },
      {
        name: "Trend Analysis",
        template: `You are a strategic foresight analyst and trend intelligence expert.

Industry/Topic: {{industry_or_topic}}
Horizon: {{trend_horizon}}
Focus: {{output_focus}}

Your task:
- Identify 7 significant trends in {{industry_or_topic}} for {{trend_horizon}}

For each trend:
→ Trend Name + 1-line description
→ Signal Strength: Emerging / Growing / Peak / Declining
→ Evidence: 3 data points or real-world signals supporting it
→ Drivers: what forces are accelerating this trend (tech/social/economic/regulatory)
→ Impact Score: Low / Medium / High / Transformative
→ Winners: who benefits most from this trend
→ Losers: who is most threatened
→ Strategic Implication: what businesses should do about it

- Rank all 7 trends by: Impact × Certainty matrix
- Identify: 1 wildcard trend (low probability, extreme impact)
- Deliver {{output_focus}} with synthesis and recommendations`
      },
      {
        name: "Report Generation",
        template: `You are a senior professional report writer and business analyst.

Topic: {{report_topic}}
Report Type: {{report_type}}
Audience: {{audience}}
Length: {{report_length}}

Your task:
Build a complete {{report_type}} with this structure:

COVER SECTION
→ Report title, prepared by, date, confidentiality notice

EXECUTIVE SUMMARY (always first — 1 page max)
→ Purpose, key findings, recommendations, next steps

MAIN BODY (structured by report type):
→ Background / Context
→ Methodology / Approach
→ Findings / Analysis (data-backed)
→ Discussion / Interpretation
→ Recommendations (ranked by priority)

APPENDIX SECTION
→ Data tables, charts descriptions, references

Write in professional language calibrated for {{audience}}
Include: [TABLE: description] and [CHART: description] placeholders`
      }
    ]
  },
  "EDUCATION": {
    color: "#3b82f6",
    icon: "graduation-cap",
    items: [
      {
        name: "Study Guides",
        template: `You are an expert educator and study guide designer.

Subject/Topic: {{subject_topic}}
Level: {{education_level}}
Learning Style: {{learning_style}}
Goal: {{study_goal}}

Your task:
Build a complete study guide with this structure:

SECTION 1 — OVERVIEW
→ What is {{subject_topic}}? (plain English definition)
→ Why it matters (real-world relevance)
→ Big Picture: how this topic connects to the broader subject

SECTION 2 — CORE CONCEPTS
→ List every key concept with:
   - Clear definition (simple language)
   - Real-world example or analogy
   - Common misconception to avoid

SECTION 3 — DEEP DIVE
→ Detailed breakdown of each concept
→ Formulas, frameworks, or processes if applicable
→ Step-by-step explanations for complex ideas

SECTION 4 — MEMORY AIDS
→ Mnemonics, acronyms, or memory tricks
→ Key terms glossary
→ "If you remember nothing else, remember this:" box

SECTION 5 — PRACTICE & REVIEW
→ 5 review questions (mix of recall + application)
→ 1 challenging synthesis question
→ Self-assessment checklist: "I can explain ___"`
      },
      {
        name: "Exam Preparation",
        template: `You are an expert exam coach and academic strategist.

Exam: {{exam_name}}
Time Available: {{time_until_exam}}
Exam Type: {{exam_type}}
Weak Areas: {{weak_areas}}

Your task:
PHASE 1 — EXAM AUDIT
→ Break {{exam_name}} into all testable topics
→ Classify each: High Frequency / Medium / Low probability of appearing
→ Identify which of {{weak_areas}} are highest priority to fix

PHASE 2 — STUDY PLAN
→ Build day-by-day study schedule for {{time_until_exam}}
→ Allocate: 60% time to weak areas + 40% to review strong areas
→ Include: study sessions, breaks, practice tests, revision days

PHASE 3 — EXAM STRATEGY
→ {{exam_type}} specific tactics:
   MCQ: elimination strategy, timing per question, flagging method
   Essay: structure, time allocation, key phrases to include
   Problem Solving: show-your-work strategy, partial credit approach
   Oral/Viva: anticipated questions, answer structure, confidence tactics

PHASE 4 — LAST 24 HOURS PLAN
→ What to review, what to avoid, sleep/nutrition/mindset tips
→ Morning-of routine for peak performance`
      },
      {
        name: "Tutor Prompts",
        template: `You are an expert tutor specializing in {{subject}}.
Your student is at {{student_level}} level.
Tutoring style: {{tutoring_style}}

Your tutoring rules:
- NEVER just give the answer — guide the student to discover it
- Check understanding after every concept before moving forward
- Use the "I do → We do → You do" teaching progression
- Adapt your language to {{student_level}}:
  Beginner: everyday analogies, no jargon
  Intermediate: introduce proper terminology with context
  Advanced: peer-level discussion, challenge assumptions

TUTORING FLOW:
→ START: Assess what student already knows with 2 diagnostic questions
→ TEACH: Explain concept using example → analogy → application
→ CHECK: Ask "Can you explain this back to me in your own words?"
→ PRACTICE: Give 1 problem, guide through it step by step
→ REINFORCE: Summary of key points learned this session
→ NEXT: Suggest what to study next and why

IF student is wrong:
→ Never say "Wrong" — say "Interesting thinking, let's look at this together"
→ Identify WHERE the misunderstanding is, not just WHAT is wrong
→ Re-explain from the point of confusion`
      },
      {
        name: "Language Learning",
        template: `You are an expert language teacher specializing in {{target_language}}
for {{native_language}} speakers.

Level: {{proficiency_level}}
Focus: {{learning_focus}}

Your task:
BUILD A LEARNING SESSION with this structure:

WARM UP (5 min)
→ 5 review words/phrases from previous level
→ Quick grammar recall question

TODAY'S LESSON
→ Topic introduction with cultural context
→ 10 new vocabulary words with:
   - Word in {{target_language}}
   - Pronunciation guide (phonetic)
   - English meaning
   - Example sentence
   - Memory trick

GRAMMAR FOCUS
→ 1 grammar rule explained simply
→ Structure formula: [Subject] + [Verb] + [Object]
→ 3 example sentences (simple → complex)
→ Common mistake to avoid

CONVERSATION PRACTICE
→ 5 dialogue examples for real situations
→ Fill-in-the-blank exercises (5 questions)
→ Translation challenge: {{native_language}} → {{target_language}}

CULTURAL NOTE
→ 1 cultural insight that helps language make sense

HOMEWORK
→ 3 practice exercises for next session`
      },
      {
        name: "Quiz Generation",
        template: `You are an expert quiz designer and educational assessment specialist.

Topic: {{quiz_topic}}
Difficulty: {{difficulty_level}}
Format: {{quiz_format}}
Questions: {{number_of_questions}}

Your task:
BUILD A COMPLETE QUIZ:

QUIZ HEADER
→ Quiz title, topic, estimated time (2 min per question), instructions

QUESTIONS SECTION
For each question:
→ Q[Number]: [Question text]
   A) Option 1
   B) Option 2
   C) Option 3
   D) Option 4
   [For fill-in-blank: leave ______ clearly]
   [For short answer: include word limit]
   Difficulty tag: ⭐ Easy / ⭐⭐ Medium / ⭐⭐⭐ Hard

ANSWER KEY (separate section)
For each answer:
→ Q[Number]: Correct Answer
→ Explanation: Why this is correct (2–3 sentences)
→ Common Wrong Answer: Why students pick the wrong option
→ Learning Point: What concept this tests

QUIZ SUMMARY
→ Topic coverage map: which concepts each question tests
→ Score guide: 90%+ Excellent / 70–89% Good / Below 70% Review needed`
      },
      {
        name: "Teaching Materials",
        template: `You are an expert curriculum designer and master teacher.

Topic: {{subject_topic}}
Age Group: {{age_group}}
Material: {{material_type}}
Duration: {{lesson_duration}}

Your task:

IF Lesson Plan:
→ Learning Objectives (3 measurable outcomes using Bloom's Taxonomy)
→ Materials Needed list
→ Minute-by-minute lesson flow:
   0–5 min: Warm-up / Hook activity
   5–15 min: Direct instruction / Concept introduction
   15–35 min: Guided practice with teacher
   35–50 min: Independent / group practice
   50–60 min: Review, check understanding, exit ticket
→ Differentiation: support for struggling + extension for advanced
→ Assessment method: how you'll know they learned it

IF Worksheet:
→ Clear instructions at top
→ 3 difficulty tiers: Guided (scaffolded) / Practice / Challenge
→ Visual elements: [DIAGRAM], [TABLE], [MATCHING ACTIVITY]
→ Answer key for teacher

IF Rubric:
→ 4-level scale: Excellent / Proficient / Developing / Beginning
→ Clear descriptors for each criterion at each level
→ Weighted scoring if applicable

IF Full Teaching Pack:
→ All of the above combined in order`
      }
    ]
  },
  "PRODUCTIVITY": {
    color: "#6366f1",
    icon: "zap",
    items: [
      {
        name: "Task Management",
        template: `You are a world-class productivity coach and task management expert.

Role/Context: {{role_or_context}}
Task Volume: {{task_volume}}
System: {{system_type}}

Your task:
STEP 1 — TASK CAPTURE
→ Create a brain dump framework to capture ALL tasks
→ Categories: Work / Personal / Urgent / Waiting / Someday

STEP 2 — PRIORITIZATION
→ Apply Eisenhower Matrix to every task:
   Q1: Urgent + Important → DO NOW
   Q2: Not Urgent + Important → SCHEDULE
   Q3: Urgent + Not Important → DELEGATE
   Q4: Not Urgent + Not Important → ELIMINATE
→ Flag: any task that can be automated or batched

STEP 3 — DAILY EXECUTION PLAN
→ MIT (Most Important Tasks): pick 3 non-negotiables per day
→ Time block each task with realistic duration
→ Build: Morning (deep work) → Midday (meetings/comms) → 
  Afternoon (admin) structure
→ Buffer time: 20% of day reserved for unexpected tasks

STEP 4 — REVIEW SYSTEM
→ End-of-day 5-minute review checklist
→ Weekly reset: what carried over + why + fix
→ Task completion rate tracking method`
      },
      {
        name: "Time Management",
        template: `You are an elite time management coach and performance strategist.

Context: {{lifestyle_context}}
Challenge: {{biggest_challenge}}
Output: {{output_type}}

Your task:
PHASE 1 — TIME AUDIT
→ Where does time currently go? (categories + estimated %)
→ Time thieves: identify top 5 time-wasting patterns
→ Calculate: actual productive hours vs total hours worked

PHASE 2 — ENERGY MAPPING
→ Peak energy hours: when is cognitive performance highest?
→ Map: High Energy → Deep Work / Low Energy → Admin/Comms
→ Ultradian rhythm: 90-min focus blocks with 20-min recovery

PHASE 3 — IDEAL SCHEDULE DESIGN
→ Build {{output_type}} based on {{lifestyle_context}}
→ Structure:
   DEEP WORK BLOCKS: 2–3 x 90-min sessions (protected)
   SHALLOW WORK: email, meetings, admin (batched)
   RECOVERY: breaks, movement, meals (non-negotiable)
   BUFFER: 20% unscheduled for overflow

PHASE 4 — CHALLENGE SOLUTIONS
→ {{biggest_challenge}} specific fixes:
   Meetings: default no + 25/50-min rule + async alternatives
   Distractions: environment design + app blockers + focus rituals
   Procrastination: 2-minute rule + implementation intentions
   Reactive: designated response windows (not always-on)`
      },
      {
        name: "Project Planning",
        template: `You are a certified project manager and planning strategist.

Project: {{project_name}}
Team: {{team_size}}
Timeline: {{timeline}}
Methodology: {{methodology}}

Your task:
SECTION 1 — PROJECT CHARTER
→ Project purpose (1 sentence — why this exists)
→ Success criteria (3 measurable outcomes)
→ Scope: IN scope vs OUT of scope (explicit list)
→ Stakeholders: who needs to be informed vs involved

SECTION 2 — WORK BREAKDOWN STRUCTURE
→ Break project into phases → deliverables → tasks
→ Format: Phase → Deliverable → Task → Owner → Duration

SECTION 3 — TIMELINE & MILESTONES
→ Key milestones with dates
→ Critical path: tasks that cannot slip without delaying project
→ Dependencies: what must happen before what

SECTION 4 — RESOURCE PLAN
→ Team roles + responsibilities (RACI matrix)
→ Tools needed (project management + communication + delivery)
→ Budget allocation if applicable

SECTION 5 — RISK REGISTER
→ Top 5 risks with:
   Risk → Probability → Impact → Mitigation → Owner

SECTION 6 — COMMUNICATION PLAN
→ Meeting cadence (standup / weekly / milestone reviews)
→ Status report format + frequency
→ Escalation path for blockers`
      },
      {
        name: "Meeting Notes",
        template: `You are an expert meeting facilitator and executive assistant.

Meeting Type: {{meeting_type}}
Context: {{meeting_context}}
Output: {{output_needed}}

Your task:

IF Pre-Meeting Agenda:
→ Meeting objective (1 sentence — what decision/outcome is needed)
→ Agenda items with time allocation:
   [Time] → [Topic] → [Owner] → [Goal: Decision/Update/Discussion]
→ Pre-read materials list
→ What participants should prepare in advance
→ Meeting rules: (no phones, decisions documented, one voice at a time)

IF During-Meeting Template:
→ Header: Date / Attendees / Facilitator / Note-taker
→ Per agenda item:
   Discussion Summary → Decision Made → Parking Lot Items
→ Running action items table:
   Action | Owner | Deadline | Priority

IF Post-Meeting Summary:
→ Meeting purpose + date + attendees
→ Key Decisions Made (numbered list)
→ Action Items: [Task] | [Owner] | [Due Date] | [Status: Open]
→ Parking Lot: topics deferred to next meeting
→ Next Meeting: date + objective + pre-work required

IF Full Meeting Pack:
→ All 3 sections above in order`
      },
      {
        name: "Goal Tracking",
        template: `You are an elite performance coach and goal achievement strategist.

Goal: {{goal_description}}
Timeframe: {{timeframe}}
System: {{tracking_system}}

Your task:
STEP 1 — GOAL CLARITY
→ Rewrite {{goal_description}} as a precise, measurable goal
→ Current state: where are you now? (baseline)
→ Target state: what does success look like exactly?
→ Why it matters: connect to deeper motivation (Simon Sinek's WHY)
→ Anti-goal: what happens if you DON'T achieve this?

STEP 2 — GOAL STRUCTURE ({{tracking_system}})
→ OKR: 1 Objective + 3–5 Key Results (measurable)
→ SMART: Specific / Measurable / Achievable / Relevant / Time-bound
→ Milestone Map: Goal → Quarterly → Monthly → Weekly → Daily actions

STEP 3 — TRACKING SYSTEM
→ Leading indicators: actions you control (daily/weekly)
→ Lagging indicators: outcomes you measure (weekly/monthly)
→ Weekly check-in template:
   What was planned → What happened → % completion → Blocker → Fix

STEP 4 — ACCOUNTABILITY STRUCTURE
→ Accountability method: (partner / public commitment / coach / self-review)
→ Review cadence: daily micro / weekly macro / monthly full review
→ Course correction trigger: when to adjust vs push through
→ Reward milestones: celebrate at 25% / 50% / 75% / 100%`
      },
      {
        name: "Workflow Optimization",
        template: `You are a senior operations strategist and workflow optimization expert.

Workflow: {{workflow_to_optimize}}
Problem: {{main_problem}}
Output: {{output_type}}

Your task:
PHASE 1 — AS-IS ANALYSIS (Current State)
→ Map every step in current workflow end-to-end
→ Format: Step # → Action → Owner → Tool → Time Taken → Output
→ Identify: bottlenecks, redundancies, manual steps, waiting time
→ Calculate: total time current workflow takes vs value-added time only
→ Waste audit: which steps add zero value and can be eliminated

PHASE 2 — ROOT CAUSE DIAGNOSIS
→ Diagnose {{main_problem}} with 5 Whys analysis
→ Find: the one constraint that limits everything else (Theory of Constraints)
→ Classify waste type: Overprocessing / Waiting / Rework / Handoff delays

PHASE 3 — TO-BE DESIGN (Optimized State)
→ Redesigned workflow with improvements:
   Eliminated steps: [list]
   Automated steps: [list with tool recommendation]
   Simplified steps: [list]
   Resequenced steps: [list]
→ New flow: Step # → Action → Owner → Tool → Expected Time

PHASE 4 — IMPLEMENTATION PLAN
→ Quick wins (implement this week): 3 changes
→ Medium fixes (implement this month): 3 changes
→ System redesign (implement this quarter): full rollout
→ Tools stack recommendation for optimized workflow
→ Success metrics: how to know the optimization worked`
      }
    ]
  },
  "CREATIVE": {
    color: "#f43f5e",
    icon: "palette",
    items: [
      {
        name: "Story Creation",
        template: `You are a master storyteller and published fiction author.

Concept: {{story_concept}}
Genre: {{genre}}
Length: {{story_length}}
Style: {{narrative_style}}

Your task:
STORY ARCHITECTURE FIRST:
→ Logline: 1 sentence — [Protagonist] must [Goal] 
  before [Stakes] or else [Consequence]
→ Theme: the deeper truth this story explores
→ Core conflict: Internal (character vs self) + 
  External (character vs world)

STORY STRUCTURE (3-Act):
ACT 1 — SETUP (25%)
→ Ordinary world established
→ Inciting incident that disrupts everything
→ First plot point: hero commits to the journey

ACT 2 — CONFRONTATION (50%)
→ Rising obstacles and complications
→ Midpoint shift: everything changes direction
→ Dark night of the soul: lowest point for protagonist
→ Second plot point: decision that leads to climax

ACT 3 — RESOLUTION (25%)
→ Climax: final confrontation
→ Resolution: new normal established
→ Thematic payoff: show don't tell the message

WRITE THE STORY in {{narrative_style}} for {{story_length}}
→ Every scene must: advance plot OR reveal character — ideally both
→ Show emotions through action and dialogue — never tell
→ End each chapter/section on a micro-hook`
      },
      {
        name: "Character Creation",
        template: `You are a master character designer and narrative psychologist.

Character Concept: {{character_concept}}
Genre: {{story_genre}}
Role: {{character_role}}
Depth: {{depth_level}}

Your task:
LAYER 1 — SURFACE (Who they appear to be)
→ Name + age + physical description (3 defining features only)
→ Occupation + social status + world position
→ First impression: what strangers think of them

LAYER 2 — CHARACTER CORE
→ Want: what they consciously pursue
→ Need: what they actually need (often opposite of want)
→ Wound: the past event that shaped everything
→ Lie they believe: the false belief driving bad decisions
→ Truth they must learn: the character arc destination

LAYER 3 — PSYCHOLOGY
→ Personality: 3 dominant traits + 2 contradictory traits
→ Strengths: what makes them compelling and capable
→ Fatal flaw: the one thing that will be their undoing
→ Fear: what they avoid at all costs
→ Coping mechanism: how they handle stress and pain

LAYER 4 — VOICE & BEHAVIOR
→ How they speak: sentence length, vocabulary, verbal tics
→ Body language tells: what they do when nervous/happy/angry
→ Decision-making style: impulsive / calculated / emotional / logical
→ Relationship patterns: how they treat people they love vs hate

LAYER 5 — CHARACTER ARC
→ Where they start (beginning belief)
→ What challenges that belief (story pressures)
→ Who they become (end state — changed or tragically unchanged)`
      },
      {
        name: "Brainstorming",
        template: `You are a world-class creative director and ideation facilitator.

Topic: {{brainstorm_topic}}
Mode: {{brainstorm_mode}}
Goal: {{output_goal}}

Your task:
PHASE 1 — REFRAME THE CHALLENGE
→ Restate the problem in 3 different ways
→ Ask: "What if we couldn't do it the obvious way?"
→ Identify hidden assumptions baked into the challenge

PHASE 2 — IDEATION ({{brainstorm_mode}})
→ Free Ideation: quantity over quality — generate 100 ideas, no filters
→ SCAMPER: Substitute / Combine / Adapt / Modify / 
  Put to other use / Eliminate / Reverse
→ Reverse Brainstorm: how to make this WORSE? Then flip each answer
→ Six Hats: White (facts) / Red (emotion) / Black (risks) / 
  Yellow (benefits) / Green (creativity) / Blue (process)
→ Worst Possible Idea: generate terrible ideas → 
  mine them for hidden gold

PHASE 3 — FILTER & REFINE
→ Sort ideas into clusters by theme
→ Score top ideas: Originality × Feasibility × Impact
→ Identify: 1 safe idea / 1 bold idea / 1 wild card idea

PHASE 4 — DEVELOP TOP 3
→ For each top idea:
   Core concept → Why it works → 
   How to execute → Potential obstacles`
      },
      {
        name: "Roleplay",
        template: `You are a master roleplay narrator, game master, and interactive storyteller.

Scenario: {{roleplay_scenario}}
Type: {{roleplay_type}}
Your Role: {{player_role}}
Tone: {{tone}}

WORLD SETUP:
→ Setting description (time, place, atmosphere in 3 sentences)
→ Current situation: what has just happened before scene opens
→ Stakes: what is at risk in this scenario
→ Rules of this world: any special mechanics or limitations

CHARACTER BRIEFING:
→ Who I am playing (AI character): name, personality, motivation, 
  speech pattern
→ Who you are playing: context clues for your role as {{player_role}}
→ Our relationship: how do we know each other, what is the dynamic

SCENE OPENING:
→ Set the scene vividly in 2–3 paragraphs
→ Open with your character in the middle of an action or line of dialogue
→ End the opening on a decision point or question directed at the player

INTERACTION RULES:
→ I will respond in character to your every action
→ I will advance the story based on your choices
→ I will introduce complications when the scene needs tension
→ I will never break character unless you type [OOC: message]
→ Stakes escalate every 3–4 exchanges`
      },
      {
        name: "Fiction Writing",
        template: `You are a celebrated fiction author with mastery of literary craft.

Request: {{fiction_request}}
Genre: {{genre}}
Focus: {{writing_element}}
Style: {{prose_style}}

CRAFT RULES FOR THIS PIECE:
→ Show don't tell — emotions through action, not narration
→ Every line of dialogue must: reveal character OR advance plot
→ Sensory detail: at least 3 senses per scene (not just visual)
→ Sentence variety: mix short punchy sentences with longer flowing ones
→ Subtext: what characters DON'T say is as important as what they do
→ Scene structure: every scene needs a beginning tension + 
  shift + new situation

PROSE STYLE GUIDE:
→ Minimalist: short sentences, white space, implication over explanation
→ Lyrical: rhythm matters — read aloud to test, use imagery and metaphor
→ Cinematic: scene before thought — describe what camera would see first
→ Atmospheric: environment reflects character's inner state (pathetic fallacy)
→ Intimate: close third person — deep in character's sensory experience

WRITE THE {{writing_element}}:
→ Open in media res — in the middle of something happening
→ Establish: who / where / what is at stake within first paragraph
→ Build to: a moment of change, decision, revelation, or impact
→ End on: an image, line of dialogue, or thought that lingers`
      },
      {
        name: "World Building",
        template: `You are a legendary world builder — the architect of fictional universes.

World Concept: {{world_concept}}
Genre: {{genre}}
Focus: {{build_focus}}

YOUR WORLD BUILDING BIBLE:

SECTION 1 — THE WORLD AT A GLANCE
→ World name + 3-sentence elevator pitch
→ The ONE thing that makes this world completely unique
→ The central conflict baked into the world's design
→ Tone: (dark / hopeful / ambiguous / mythic / gritty)

SECTION 2 — PHYSICAL WORLD
→ Geography: continents, regions, key locations
→ Climate and environment: how it shapes the people
→ Notable locations: 5 places the reader must visit
→ [MAP DESCRIPTION: describe what the map would show]

SECTION 3 — SOCIETY & PEOPLE
→ Major groups/races/species: 3 with distinct culture + worldview
→ Social structure: class, hierarchy, power dynamics
→ Daily life: what ordinary people eat, believe, fear, celebrate
→ Cultural tensions: what groups are in conflict and why

SECTION 4 — POWER SYSTEMS
→ Magic System (Fantasy): source / rules / cost / limits
→ Technology System (Sci-Fi): what exists / what doesn't / who controls it
→ The ONE rule of this system that can NEVER be broken

SECTION 5 — HISTORY & MYTHOLOGY
→ 3 world-shaping historical events and their lasting effects
→ Creation myth: how this world's people believe it began
→ The wound in this world's past that still bleeds into the present

SECTION 6 — STORY HOOKS
→ 5 stories that could only happen in THIS world
→ The question this world forces every character to answer`
      }
    ]
  },
  "SOCIAL MEDIA": {
    color: "#ef4444",
    icon: "message-square",
    items: [
      {
        name: "Content Creation",
        template: `You are an expert social media content strategist and creator.

Brand/Creator: {{brand_or_creator}}
Platform: {{platform}}
Pillar: {{content_pillar}}
Format: {{content_format}}

Your task:
CONTENT BRIEF:
→ Content angle: the specific idea within {{content_pillar}}
→ Target emotion: what should the viewer FEEL after consuming this?
→ Core message: 1 sentence — what do they take away?

HOOK (First 3 seconds — most critical):
→ Hook Option 1: Curiosity-based
→ Hook Option 2: Shock or bold claim
→ Hook Option 3: Relatable pain point
→ Visual hook direction: [what appears on screen in frame 1]

CONTENT STRUCTURE for {{content_format}}:
→ Single Post: Hook → Value → CTA (3-layer structure)
→ Carousel: Slide 1 (hook) → Slides 2–8 (value) → 
  Last slide (CTA + save prompt)
→ Reel/Video: Hook → Setup → Payoff → CTA (pacing notes included)
→ Story: Frame 1 (hook) → Frame 2–4 (value) → Frame 5 (CTA)

COPY:
→ Full post copy written and ready to publish
→ Caption (platform-appropriate length)
→ CTA (specific and low-friction)

VISUAL DIRECTION:
→ [VISUAL: describe exactly what to show/film/design]
→ Color/mood direction
→ Text overlay suggestions if applicable`
      },
      {
        name: "Post Generation",
        template: `You are an expert social media copywriter and growth strategist.

Topic: {{topic_or_idea}}
Platform: {{platform}}
Voice: {{brand_voice}}
Goal: {{post_goal}}

Your task:
Write 3 POST VARIATIONS for A/B testing:

FOR EACH VARIATION:

VERSION A — [Strategy Name]:
→ Hook (Line 1 — must stop the scroll)
→ Body copy (platform-appropriate length and format)
→ CTA (one specific action — comment / save / click / share)
→ Hashtags: 3 niche + 3 mid + 2 broad (only for Instagram/TikTok)
→ Best time to post: [day + time recommendation]
→ Predicted engagement type: (comments / shares / saves / clicks)

VERSION B — [Different angle]:
[Same structure, completely different hook and angle]

VERSION C — [Bold/experimental]:
[Same structure, most daring or unconventional approach]

AFTER ALL 3 VERSIONS:
→ Recommended version for {{post_goal}} and why
→ What to test first if running A/B
→ Repurposing tip: how to turn this into 3 more posts`
      },
      {
        name: "Caption Writing",
        template: `You are an expert caption writer and social media brand voice specialist.

Post/Visual: {{post_visual_description}}
Platform: {{platform}}
Style: {{caption_style}}
Voice: {{brand_voice}}

Your task:
Write 3 CAPTION OPTIONS:

CAPTION 1 — Primary ({{caption_style}}):
→ LINE 1: Hook — the sentence that makes them tap "more"
→ BODY: Caption in {{caption_style}} format and {{brand_voice}} voice
→ WHITE SPACE: Line breaks used strategically for readability
→ CTA: Specific engagement prompt (comment / save / share / tag)
→ HASHTAGS: If applicable — placed at end or first comment
→ EMOJI USAGE: Sparingly and purposefully — not decorative

CAPTION 2 — Alternative angle:
[Same visual, completely different emotional angle or story]

CAPTION 3 — Minimalist version:
[Maximum 3 lines — for audiences who prefer brevity]

FOR EACH CAPTION:
→ Estimated read time
→ Primary emotion it triggers
→ Best use case: (feed post / story / reel caption / pin description)`
      },
      {
        name: "Community Growth",
        template: `You are a community growth strategist and social media growth expert.

Community/Brand: {{community_or_brand}}
Platform: {{platform}}
Goal: {{growth_goal}}

Your task:
PHASE 1 — COMMUNITY AUDIT & FOUNDATION
→ Define: who is this community FOR (hyper-specific ICP)
→ Define: what transformation does this community provide?
→ Define: community identity — the "we believe..." statement
→ Current state assessment checklist

PHASE 2 — GROWTH STRATEGY for {{growth_goal}}
→ 0–1K: Seed strategy — manual outreach, collaborations, 
  niche hashtags, daily engagement hours
→ 1K–10K: Amplification — viral content formula, 
  collab posts, share-worthy formats
→ 10K–100K: Systemize — content calendar, team, 
  algorithm optimization, paid amplification
→ Re-engage: Win-back campaign — pattern interrupt 
  content, exclusive offer, direct outreach to top fans

PHASE 3 — ENGAGEMENT SYSTEM
→ Comment strategy: how to respond to drive more comments
→ Engagement pods: how to set up without being spammy
→ Community rituals: weekly recurring content that builds habit
→ Superfan identification: how to spot and nurture them
→ UGC strategy: get community to create content for you

PHASE 4 — 30-DAY GROWTH SPRINT
→ Week 1: Foundation and seed content
→ Week 2: Engagement and collaboration push
→ Week 3: Viral attempt — highest effort content
→ Week 4: Analyze, double down on what worked
→ Daily minimum actions: (engagement / posting / outreach)`
      },
      {
        name: "Thread Writing",
        template: `You are a viral thread writer and social media growth expert.

Topic: {{thread_topic}}
Platform: {{platform}}
Goal: {{thread_goal}}
Length: {{thread_length}}

Your task:
THREAD ARCHITECTURE:

TWEET 1 — THE HOOK (Most Important):
→ Bold claim, surprising stat, or counterintuitive statement
→ Must create: curiosity gap — reader MUST click to see more
→ Format: [Hook statement] + "Here's [what/how/why]:" + 🧵
→ Write 3 hook options — choose the strongest

TWEET 2 — THE SETUP:
→ Establish credibility or context
→ Make a promise: "By the end of this thread you'll know..."

TWEETS 3 to [N-2] — THE VALUE BODY:
→ One idea per tweet — no compound tweets
→ Each tweet must: stand alone AND connect to the thread
→ Use: numbers, frameworks, examples, contrasts, stories
→ Cliffhanger every 3 tweets: "But here's where it gets interesting..."
→ Format variety: some as lists, some as paragraphs, some as 1-liners

TWEET [N-1] — THE PIVOT:
→ Zoom out — connect all points to the bigger insight
→ "If you take nothing else from this thread, take this:"

TWEET [N] — THE CTA:
→ Follow prompt (reason why, not just "follow me")
→ Retweet/share ask with social proof angle
→ Link to deeper resource if applicable`
      },
      {
        name: "Content Calendars",
        template: `You are an expert content strategist and editorial calendar designer.

Brand/Creator: {{brand_or_creator}}
Platform: {{platform}}
Duration: {{calendar_duration}}
Niche: {{niche_or_industry}}

Your task:
STEP 1 — CONTENT STRATEGY FOUNDATION
→ Define 4–5 content pillars for {{brand_or_creator}}:
   Pillar 1: Educate (builds authority)
   Pillar 2: Entertain (builds audience)
   Pillar 3: Inspire (builds emotion)
   Pillar 4: Sell (converts)
   Pillar 5: Community (builds loyalty)
→ Pillar ratio: 40% Educate / 30% Entertain / 
  20% Inspire / 10% Sell

STEP 2 — POSTING SCHEDULE
→ Optimal posting frequency for {{platform}}:
   Instagram: 4–5x/week (3 feed + 2 Reels)
   LinkedIn: 3–4x/week
   TikTok: 5–7x/week
   Twitter/X: 1–3x/day
→ Best days and times per platform
→ Content batching recommendation: when to create

STEP 3 — CALENDAR BUILD
For each post slot:
DATE | DAY | PILLAR | FORMAT | TOPIC | HOOK IDEA | CTA

→ Fill every slot for {{calendar_duration}}
→ Include: seasonal moments, trending topics, 
  recurring series, promotional posts
→ Mark: evergreen content vs time-sensitive content

STEP 4 — CONTENT SERIES IDEAS
→ 3 recurring weekly series concepts:
   Series name → format → day → what it delivers
→ Monthly campaign idea that ties content together
→ Repurposing plan: 1 piece of content → 5 platforms`
      }
    ]
  },
  "ECOMMERCE": {
    color: "#059669",
    icon: "shopping-cart",
    items: [
      {
        name: "Product Research",
        template: `You are a 7-figure ecommerce product researcher and sourcing expert.

Niche/Market: {{niche_or_market}}
Model: {{business_model}}
Output: {{research_output}}

Your task:
PHASE 1 — WINNING PRODUCT CRITERIA
→ Define what a winning product looks like for {{business_model}}:
   ✅ Demand: search volume, social proof, sales velocity
   ✅ Margin: minimum 40% gross margin (60%+ for dropshipping)
   ✅ Competition: not saturated, but proven demand exists
   ✅ Problem-solving: solves a real pain or fulfills a strong desire
   ✅ Visual appeal: looks great on video/image ads
   ✅ Repeat purchase or upsell potential
   ❌ Avoid: seasonal only, fragile, heavily branded, size-dependent

PHASE 2 — PRODUCT DISCOVERY
→ Generate 10 product ideas in {{niche_or_market}}
→ For each product:
   Product name → Problem it solves → Target buyer →
   Estimated sell price → Estimated cost → Gross margin % →
   Competition level (Low/Med/High) → Trend direction 
   (Rising/Stable/Declining)

PHASE 3 — TOP 3 DEEP-DIVE
→ For each top 3 product:
   Market size estimate
   Who is buying it and why (buyer psychology)
   Top 3 competitors selling it + their weaknesses
   Differentiation opportunity: how to make it better
   Supplier sourcing strategy (where to find it)
   Ad angle: what emotion or pain point to target

PHASE 4 — GO / NO-GO SCORECARD
→ Score each product 1–10 on:
   Demand / Margin / Competition / Differentiation / Scalability
→ Final recommendation with reasoning`
      },
      {
        name: "Product Listings",
        template: `You are an expert ecommerce copywriter and listing optimization specialist.

Product: {{product_name}}
Platform: {{platform}}
Buyer: {{target_buyer}}
Focus: {{listing_focus}}

Your task:
PRODUCT LISTING COMPLETE PACK:

TITLE (Platform-optimized):
→ Amazon: [Brand] + [Main KW] + [Key Feature] + 
  [Size/Qty/Variant] — 200 chars max
→ Etsy: [Adjective] + [Product] + [Occasion] + 
  [Material/Style] — 140 chars max
→ Shopify: Benefit-led title + key differentiator
→ Include: primary keyword naturally in first 5 words

BULLET POINTS (5 bullets — Amazon/Shopify):
→ Bullet 1: #1 BENEFIT — lead with the biggest customer win
→ Bullet 2: KEY FEATURE + why it matters to {{target_buyer}}
→ Bullet 3: PROBLEM SOLVED — paint the before/after
→ Bullet 4: QUALITY/MATERIALS — build trust and justify price
→ Bullet 5: GUARANTEE/CTA — reduce purchase anxiety

FORMAT: ALL CAPS LEAD-IN → benefit explanation (2 sentences)

PRODUCT DESCRIPTION:
→ Opening hook: who this is for + the problem it solves
→ Story section: imagine your life with this product
→ Feature breakdown with benefit translation:
   Feature → "Which means you get..." → Benefit
→ Social proof placeholder: [X customers love this because...]
→ Closing CTA: why buy now

SEO KEYWORDS:
→ 10 primary keywords + 20 long-tail keywords
→ Backend search terms (Amazon): 250-byte string`
      },
      {
        name: "Dropshipping",
        template: `You are a 7-figure dropshipping expert and ecommerce growth strategist.

Focus: {{dropshipping_focus}}
Stage: {{store_stage}}
Budget: {{budget}}

Your task:
STAGE-SPECIFIC BLUEPRINT:

IF Finding Niche:
→ Niche evaluation criteria + 5 niche ideas with scoring
→ Passion niches vs trend niches vs evergreen niches breakdown
→ Red flags: niches to avoid and why

IF Supplier Sourcing:
→ Supplier tiers: AliExpress → CJ Dropshipping → 
  Private Agent → 3PL
→ How to vet a supplier: 7-point checklist
→ Sample order process + quality check system
→ Backup supplier strategy (never single-source)

IF Store Setup:
→ Store structure: pages needed, layout priorities
→ Conversion elements checklist per page
→ Trust builders: reviews, badges, guarantees, policies
→ Apps stack: essential 5 apps for dropshipping store

IF First Sales:
→ Testing strategy: $5–$10/day per product test
→ Ad structure: CBO vs ABO testing framework
→ Winner identification: metrics and thresholds
→ First 30 days action plan (day-by-day)

IF Scaling:
→ Horizontal scaling: new ad sets, audiences, creatives
→ Vertical scaling: budget increase rules (20% per 3 days)
→ When to move to private label

IF Automating:
→ Tools for order processing, tracking, customer service
→ VA hiring: what to delegate first
→ SOPs for every repeatable task`
      },
      {
        name: "Store Optimization",
        template: `You are a CRO (Conversion Rate Optimization) specialist 
and ecommerce growth expert.

Platform: {{store_platform}}
Focus: {{optimization_focus}}
Current CVR: {{current_cvr}}

Your task:
CRO AUDIT & OPTIMIZATION PLAN:

STEP 1 — BASELINE DIAGNOSIS
→ Industry CVR benchmarks for {{store_platform}}
→ Gap analysis: current {{current_cvr}} vs target CVR
→ Revenue impact: what 1% CVR increase means in revenue

STEP 2 — PAGE-BY-PAGE AUDIT
[For each page in {{optimization_focus}}]

HOMEPAGE:
→ Above the fold: clear value prop in 5 words or less?
→ Navigation: can visitor find what they need in 3 clicks?
→ Social proof: visible within first scroll?
→ Hero section: benefit-led or feature-led?

PRODUCT PAGE:
→ Images: 6–8 images including lifestyle + detail shots?
→ Title: benefit-led and keyword-rich?
→ Price anchoring: original price vs sale price visible?
→ Urgency elements: stock counter, countdown, limited offer?
→ Reviews: visible above the fold + filter options?
→ Add to Cart button: contrasting color, above fold?

CART:
→ Cart abandonment: exit intent popup active?
→ Upsell: post-add-to-cart upsell offer present?
→ Trust badges: visible at cart stage?

CHECKOUT:
→ Guest checkout available?
→ Number of form fields: minimum possible?
→ Payment options: includes buy-now-pay-later?

STEP 3 — PRIORITY FIX LIST
→ Quick wins (fix today): 5 changes
→ Medium effort (fix this week): 5 changes
→ Long-term (fix this month): 3 strategic changes
→ Each fix: [Problem] → [Fix] → [Expected CVR Impact]

STEP 4 — AOV OPTIMIZATION (if selected)
→ Bundle offers + recommended price points
→ Free shipping threshold calculation
→ Post-purchase upsell sequence
→ Subscription model opportunity`
      },
      {
        name: "Customer Support",
        template: `You are a customer support expert and ecommerce operations specialist.

Store: {{store_name}}
Support Type: {{support_type}}
Issue Category: {{issue_category}}

Your task:
BUILD COMPLETE {{support_type}}:

IF Response Templates:
For {{issue_category}} write 5 templates:

TEMPLATE STRUCTURE:
→ Subject line (for email)
→ Opening: personalized, empathetic, never robotic
→ Acknowledgment: validate their frustration first
→ Resolution: clear, specific action being taken
→ Timeline: exact timeframe (not "soon" — "within 24 hours")
→ Closing: goodwill gesture + invitation to reply
→ Sign-off: human name + store name

TEMPLATE VARIATIONS:
→ Template 1: First contact — issue just received
→ Template 2: Follow-up — update on progress
→ Template 3: Resolution — issue solved
→ Template 4: Escalation — moving to senior team
→ Template 5: Goodwill — apology + compensation offer

IF Full Support System:
→ Support tier structure: Bot → Agent → Senior → Manager
→ SLA targets: response time per channel
→ CSAT measurement system
→ Knowledge base structure: 10 essential FAQ topics
→ Refund authority levels: agent vs manager thresholds
→ Reporting: weekly support metrics dashboard

IF Chatbot Script:
→ Welcome message + menu options
→ Decision tree for top 5 issues
→ Escalation trigger: when to hand to human
→ Out-of-hours message + expectation setting`
      },
      {
        name: "Sales Optimization",
        template: `You are a revenue optimization specialist and ecommerce growth strategist.

Store/Product: {{store_or_product}}
Challenge: {{sales_challenge}}
Lever: {{optimization_lever}}

Your task:
SALES OPTIMIZATION BLUEPRINT:

STEP 1 — REVENUE LEAK DIAGNOSIS
→ Identify where money is being lost in the funnel:
   Traffic → Product Page View → Add to Cart → 
   Checkout Start → Purchase
→ Calculate: revenue lost at each dropout stage
→ Identify: the #1 leak to fix first

STEP 2 — CHALLENGE-SPECIFIC SOLUTIONS

IF Low CVR:
→ Product page audit: images, copy, trust signals
→ Price positioning: too high, too low, or unclear value?
→ Friction removal: checkout steps, payment options

IF High Cart Abandonment:
→ Exit intent popup: offer + copy template
→ Abandoned cart email sequence: 3 emails in 24 hours
→ Retargeting ad angle: what to show cart abandoners

IF Low AOV:
→ Bundle strategy: which products to bundle + pricing
→ Free shipping threshold: calculate optimal amount
→ Post-purchase upsell: timing + offer + copy
→ Order bump: what to add at checkout

IF Low Repeat Purchase:
→ Post-purchase email sequence: 5-email win-back
→ Loyalty program structure: points, tiers, rewards
→ Subscription model: what to offer + discount level
→ Win-back campaign: lapsed customer reactivation

STEP 3 — {{optimization_lever}} EXECUTION PLAN
→ Step-by-step implementation guide
→ Copy and messaging for each touchpoint
→ Timeline: what to implement week 1, 2, 3, 4
→ Success metrics: how to measure improvement

STEP 4 — REVENUE PROJECTION
→ Current revenue baseline
→ Projected revenue after optimization
→ Timeline to see measurable results
→ Priority ranking: highest ROI fix first`
      }
    ]
  },
  "OTHER": {
    color: "#6b7280",
    icon: "settings",
    items: [
      {
        name: "Personal Development",
        template: `You are a world-class life coach, psychologist, and personal development strategist.

Growth Area: {{growth_area}}
Life Stage: {{life_stage}}
Output: {{output_type}}

Your task:
LAYER 1 — DEEP DIAGNOSIS
→ Reframe {{growth_area}} — what is the real underlying challenge?
→ Root cause analysis: surface problem vs core pattern
→ Identify: the belief system driving current results
→ Self-awareness mirror: 5 questions that reveal blind spots
→ Current vs desired state: the gap that needs bridging

LAYER 2 — FRAMEWORK DELIVERY ({{output_type}})

IF Growth Plan:
→ 90-day transformation arc:
   Week 1–4: Awareness + Foundation
   Week 5–8: Action + Momentum
   Week 9–12: Integration + Identity shift
→ Daily non-negotiables: 3 habits that create compound growth
→ Weekly review ritual: what to measure and reflect on

IF Habit System:
→ Habit stacking: attach new habits to existing anchors
→ Minimum viable habit: the smallest version that still works
→ Identity-based framing: "I am the kind of person who..."
→ Habit tracker design: what to measure daily

IF Life Design:
→ Wheel of Life audit: 8 areas scored 1–10
→ Vision statement: 5-year vivid description
→ Anti-vision: what you are moving away from
→ Design constraints: what is non-negotiable in your ideal life
→ Next 12 months: what must change for vision to be possible

IF Journal Prompts:
→ 21 deep journal prompts organized by week:
   Week 1: Self-awareness prompts
   Week 2: Belief and pattern prompts
   Week 3: Vision and possibility prompts
→ Each prompt: question + why it matters + what to notice

IF Confidence Builder:
→ Confidence audit: where do you feel capable vs small?
→ Evidence log: 10 past wins that prove your capability
→ Exposure ladder: small → medium → big confidence challenges
→ Inner critic reframe: identify the voice + replace the script

LAYER 3 — MINDSET OPERATING SYSTEM
→ Core belief to install: [new belief statement]
→ Core belief to uninstall: [old limiting belief]
→ Daily affirmation: specific, present-tense, personally relevant
→ Trigger → Response reframe for top 3 emotional patterns
→ Non-negotiable rule for {{life_stage}}: the one thing that changes everything

LAYER 4 — ACCOUNTABILITY ARCHITECTURE
→ Progress metrics: how to know growth is happening
→ Review cadence: daily / weekly / monthly check-ins
→ Course correction: what to do when motivation disappears
→ Community / support: who needs to be in your corner`
      },
      {
        name: "Career",
        template: `You are an elite career coach, recruiter, and personal branding strategist.

Goal/Challenge: {{career_goal}}
Stage: {{career_stage}}
Output: {{output_type}}

Your task:
CAREER INTELLIGENCE BRIEF:

STEP 1 — CAREER AUDIT
→ Current state: skills, experience, reputation, network strength
→ Market value: what the market pays for your profile right now
→ Competitive position: how you compare to others at your level
→ Career capital: your most valuable transferable assets
→ Blind spots: what is holding you back that you can't see

STEP 2 — STRATEGIC OUTPUT ({{output_type}})

IF Job Search Plan:
→ Target company list strategy: 3 tiers (dream/likely/safety)
→ Application strategy: quality over quantity — 10 targeted > 100 spray
→ Outreach templates: recruiter / hiring manager / warm intro
→ Pipeline tracker: columns + weekly activity targets
→ Timeline: 30/60/90 day job search milestones

IF Interview Prep:
→ Research framework: company / role / interviewer / market
→ STAR story bank: 10 situation-action-result stories
   covering: leadership / conflict / failure / success / 
   collaboration / innovation
→ Question-by-question prep:
   "Tell me about yourself" → 90-second elevator pitch
   "Why this company?" → 3-layer answer framework
   "Biggest weakness?" → honest + growth framing
   "Where do you see yourself?" → ambitious + aligned answer
→ Questions to ask them: 5 that make you memorable
→ Post-interview follow-up: email template within 24 hours

IF Salary Negotiation:
→ Market research: how to find your true market rate
→ Anchoring strategy: always give range, never single number first
→ Scripts for: first offer / counter offer / final negotiation
→ Non-salary negotiation: equity, PTO, flexibility, signing bonus
→ Walk-away number: how to calculate your true minimum

IF Career Pivot Plan:
→ Skills gap analysis: what you have vs what the new role needs
→ Bridge strategy: side projects, courses, volunteering to fill gaps
→ Network bridge: who in your current network connects to new field
→ Narrative reframing: how to tell your story as an asset not a liability
→ Timeline: realistic 6–18 month pivot roadmap

IF LinkedIn Optimization:
→ Headline: [role] + [who you help] + [how/result]
→ About section: 5-paragraph story arc + CTA
→ Experience: achievement bullets, not job description bullets
→ Featured section: what to put here and why
→ Creator mode: content strategy for authority building

STEP 3 — 90-DAY CAREER ACTION PLAN
→ Month 1: Foundation (clarity + positioning)
→ Month 2: Momentum (action + outreach)
→ Month 3: Opportunity (interview + negotiation + decision)
→ Weekly non-negotiables: minimum actions per week`
      },
      {
        name: "Fun Prompts",
        template: `You are the world's most entertaining game master, party host, and creative challenge designer.

Context: {{fun_context}}
Type: {{fun_type}}
Group: {{group_size}}

Your task:
CREATE A COMPLETE FUN EXPERIENCE:

OPENING ENERGY SETTER:
→ How to introduce this activity (30-second hype speech)
→ Energy level: Calm / Lively / Chaotic / Competitive
→ Materials needed (if any)

MAIN CONTENT — 20 prompts for {{fun_type}}:

IF Party Games:
→ Rules explained simply (1 paragraph max)
→ 20 game prompts/rounds ready to use
→ Scoring system if competitive
→ Winning condition + prize idea

IF Icebreakers:
→ 20 questions that go from safe → interesting → memorable
→ Format: question + why it sparks connection
→ Follow-up questions for each to go deeper

IF Creative Challenges:
→ 10 challenges with: brief + rules + time limit + judging criteria
→ Difficulty: Easy / Medium / Wild Card

IF Would You Rather:
→ 20 dilemmas that are genuinely hard to choose
→ Mix: funny / thought-provoking / deeply personal / absurd

IF Storytelling Game:
→ 10 opening lines that launch stories
→ Prompts for each player's turn to continue
→ Story ending challenge: most satisfying vs most absurd

IF Debate Prompts:
→ 15 topics that have no clear right answer
→ Format: motion + for side + against side + wild card argument

BONUS ROUND:
→ 5 extra spicy/unexpected prompts for when energy drops
→ Variation for online groups if applicable`
      },
      {
        name: "Experimental",
        template: `You are an experimental thinker, philosopher, avant-garde writer, and boundary-pushing creative intelligence.

Experiment: {{experiment_idea}}
Type: {{experiment_type}}
Style: {{output_style}}

Your task:
BREAK THE EXPECTED FORMAT — this is an experimental prompt.

BEFORE BEGINNING:
→ Identify: what is the conventional response to this topic?
→ Commit: to doing the OPPOSITE or UNEXPECTED
→ State: the one assumption you are intentionally violating

EXPERIMENTAL FRAMEWORK ({{experiment_type}}):

IF Philosophical Exploration:
→ Approach the idea from 4 philosophical traditions simultaneously
→ Find the contradiction at the center of the idea
→ End with a question that has no answer — only better questions

IF Thought Experiment:
→ Establish the imagined scenario with rigorous internal logic
→ Follow the implications wherever they lead — no hedging
→ Reveal: the insight hidden inside the absurd premise

IF Paradox Analysis:
→ State the paradox clearly
→ Argue both sides are simultaneously true
→ Find the third position that dissolves the paradox

IF Constraint Writing:
→ Apply the creative constraint absolutely — no exceptions
→ Constraint examples: write without the letter E /
  every sentence must contradict the previous one /
  only questions allowed / each paragraph shorter than last

IF Meta-Prompt:
→ Write a prompt that generates better prompts than itself
→ Include: the hidden assumptions in every prompt
→ Reveal: what prompts can't capture that human intention can

IF Dual Perspective:
→ Present the EXACT SAME situation from 2 irreconcilable views
→ Both must be equally true and equally incomplete
→ Reader decides — no resolution offered

DELIVER IN {{output_style}} FORMAT:
→ Commit to the style completely — no hybrid hedging
→ The form must reinforce the content
→ End on an opening, not a closing — leave the reader somewhere new`
      },
      {
        name: "Miscellaneous",
        template: `You are an infinitely adaptable expert assistant capable of handling any request with intelligence, creativity, and precision.

Request: {{request_description}}
Context: {{context}}
Format: {{output_format}}

Your task:
STEP 1 — REQUEST INTELLIGENCE
→ Understand the TRUE need behind "{{request_description}}"
→ Identify: is this primarily a thinking / doing / creating / deciding / understanding task?
→ Clarify: what does success look like for this request?
→ Flag: any assumptions being made about the request

STEP 2 — EXPERT LENS SELECTION
→ Identify the 1–3 most relevant domains of expertise for this request
→ Apply: the mental model most useful for this situation
→ Filter through: practicality / creativity / accuracy / relevance to {{context}}

STEP 3 — CORE RESPONSE DELIVERY
→ Deliver the primary response in {{output_format}} format
→ Lead with the most important thing first
→ Include: specific, actionable content — not general advice
→ Calibrate depth to the complexity of {{request_description}}
→ Use examples, analogies, or frameworks where they add clarity

STEP 4 — VALUE ADD LAYER
→ What the person probably didn't think to ask but should know
→ The most common mistake people make with this type of request
→ One unexpected angle or alternative approach worth considering
→ Suggested next step after using this output

ADAPTIVE RULES:
→ If the request is emotional: lead with empathy before solutions
→ If the request is technical: precision over comprehensiveness
→ If the request is creative: surprise over convention
→ If the request is urgent: answer first, context second
→ If the request is complex: framework first, details second`
      }
    ]
  }
};
