/**
 * Common skill categories and their associated skills
 */
export const SKILL_CATEGORIES = {
  'programming-languages': [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure', 'erlang'
  ],
  'web-development': [
    'html', 'css', 'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt.js', 'gatsby',
    'webpack', 'vite', 'parcel', 'babel', 'sass', 'less', 'stylus', 'tailwind', 'bootstrap'
  ],
  'backend-development': [
    'node.js', 'express', 'fastify', 'koa', 'django', 'flask', 'spring', 'laravel', 'rails',
    'asp.net', 'gin', 'fiber', 'actix', 'phoenix', 'play', 'ktor'
  ],
  'databases': [
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
    'sqlite', 'oracle', 'sql server', 'mariadb', 'neo4j', 'influxdb', 'couchdb'
  ],
  'cloud-platforms': [
    'aws', 'azure', 'gcp', 'digital ocean', 'heroku', 'vercel', 'netlify', 'firebase',
    'supabase', 'planetscale', 'railway', 'render'
  ],
  'devops': [
    'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform',
    'ansible', 'chef', 'puppet', 'vagrant', 'prometheus', 'grafana', 'elk stack'
  ],
  'mobile-development': [
    'react native', 'flutter', 'ionic', 'xamarin', 'cordova', 'phonegap', 'swift',
    'kotlin', 'objective-c', 'java android'
  ],
  'data-science': [
    'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'opencv',
    'matplotlib', 'seaborn', 'plotly', 'jupyter', 'spark', 'hadoop'
  ],
  'design': [
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'indesign', 'canva',
    'principle', 'framer', 'invision', 'zeplin'
  ],
  'testing': [
    'jest', 'mocha', 'chai', 'cypress', 'selenium', 'playwright', 'puppeteer',
    'jasmine', 'karma', 'enzyme', 'testing library', 'vitest'
  ]
};

/**
 * Normalize skill name for consistency
 * @param skill Skill name
 * @returns Normalized skill name
 */
export const normalizeSkill = (skill: string): string => {
  return skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\b(js|ts|py|rb|go|rs|swift|kt|scala|r|ml|pl|hs|clj|erl)\b/g, (match) => {
      const abbreviations: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'rb': 'ruby',
        'go': 'golang',
        'rs': 'rust',
        'kt': 'kotlin',
        'ml': 'machine learning',
        'pl': 'programming language',
        'hs': 'haskell',
        'clj': 'clojure',
        'erl': 'erlang'
      };
      return abbreviations[match.toLowerCase()] || match;
    });
};

/**
 * Extract skills from text using keyword matching
 * @param text Text to extract skills from
 * @returns Array of found skills
 */
export const extractSkillsFromText = (text: string): string[] => {
  const normalizedText = text.toLowerCase();
  const foundSkills: Set<string> = new Set();
  
  // Flatten all skills from categories
  const allSkills = Object.values(SKILL_CATEGORIES).flat();
  
  // Check for exact matches
  for (const skill of allSkills) {
    const normalizedSkill = normalizeSkill(skill);
    if (normalizedText.includes(normalizedSkill)) {
      foundSkills.add(normalizedSkill);
    }
  }
  
  // Check for partial matches (skills that contain other skills)
  for (const skill of allSkills) {
    const normalizedSkill = normalizeSkill(skill);
    const words = normalizedSkill.split(' ');
    
    if (words.length > 1) {
      // Check if all words of the skill are present in the text
      const allWordsPresent = words.every(word => normalizedText.includes(word));
      if (allWordsPresent) {
        foundSkills.add(normalizedSkill);
      }
    }
  }
  
  return Array.from(foundSkills);
};

/**
 * Calculate skill similarity between two skill arrays
 * @param skills1 First skill array
 * @param skills2 Second skill array
 * @returns Similarity score between 0 and 1
 */
export const calculateSkillSimilarity = (skills1: string[], skills2: string[]): number => {
  if (skills1.length === 0 && skills2.length === 0) return 1;
  if (skills1.length === 0 || skills2.length === 0) return 0;
  
  const normalizedSkills1 = skills1.map(normalizeSkill);
  const normalizedSkills2 = skills2.map(normalizeSkill);
  
  const set1 = new Set(normalizedSkills1);
  const set2 = new Set(normalizedSkills2);
  
  const intersection = new Set([...set1].filter(skill => set2.has(skill)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Get skill category for a given skill
 * @param skill Skill name
 * @returns Category name or null if not found
 */
export const getSkillCategory = (skill: string): string | null => {
  const normalizedSkill = normalizeSkill(skill);
  
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some(s => normalizeSkill(s) === normalizedSkill)) {
      return category;
    }
  }
  
  return null;
};

/**
 * Get related skills for a given skill
 * @param skill Skill name
 * @returns Array of related skills
 */
export const getRelatedSkills = (skill: string): string[] => {
  const category = getSkillCategory(skill);
  if (!category) return [];
  
  const normalizedSkill = normalizeSkill(skill);
  const categorySkills = SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES];
  
  return categorySkills
    .map(s => normalizeSkill(s))
    .filter(s => s !== normalizedSkill);
};

/**
 * Calculate TF-IDF score for skills in job descriptions
 * This is a simplified implementation for skill matching
 */
export const calculateSkillTFIDF = (
  skill: string,
  jobDescription: string,
  allJobDescriptions: string[]
): number => {
  const normalizedSkill = normalizeSkill(skill);
  const normalizedDescription = jobDescription.toLowerCase();
  
  // Term frequency (TF)
  const skillCount = (normalizedDescription.match(new RegExp(normalizedSkill, 'g')) || []).length;
  const totalWords = normalizedDescription.split(/\s+/).length;
  const tf = skillCount / totalWords;
  
  // Document frequency (DF)
  const documentsWithSkill = allJobDescriptions.filter(desc => 
    desc.toLowerCase().includes(normalizedSkill)
  ).length;
  const df = documentsWithSkill / allJobDescriptions.length;
  
  // Inverse document frequency (IDF)
  const idf = Math.log(1 / (df + 1));
  
  return tf * idf;
};

/**
 * Rank skills by relevance for a job
 * @param jobDescription Job description text
 * @param candidateSkills Array of candidate skills
 * @param allJobDescriptions All job descriptions for IDF calculation
 * @returns Array of skills with relevance scores
 */
export const rankSkillsByRelevance = (
  jobDescription: string,
  candidateSkills: string[],
  allJobDescriptions: string[]
): Array<{ skill: string; score: number }> => {
  return candidateSkills
    .map(skill => ({
      skill,
      score: calculateSkillTFIDF(skill, jobDescription, allJobDescriptions)
    }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0);
};
