import crypto from 'crypto';

/**
 * Create a fingerprint for job deduplication
 * @param job Job data
 * @returns Fingerprint string
 */
export const createJobFingerprint = (job: {
  title: string;
  company: string;
  locationText: string;
  externalUrl?: string;
}): string => {
  const normalizedTitle = job.title.toLowerCase().trim();
  const normalizedCompany = job.company.toLowerCase().trim();
  const normalizedLocation = job.locationText.toLowerCase().trim();

  // Create a composite string for fingerprinting
  const composite = `${normalizedTitle}|${normalizedCompany}|${normalizedLocation}`;

  // Generate SHA-256 hash
  return crypto.createHash('sha256').update(composite).digest('hex');
};

/**
 * Check if two jobs are duplicates based on similarity
 * @param job1 First job
 * @param job2 Second job
 * @param threshold Similarity threshold (0-1)
 * @returns True if jobs are duplicates
 */
export const areJobsDuplicate = (
  job1: { title: string; company: string; locationText: string },
  job2: { title: string; company: string; locationText: string },
  threshold: number = 0.8
): boolean => {
  const titleSimilarity = calculateStringSimilarity(job1.title, job2.title);
  const companySimilarity = calculateStringSimilarity(job1.company, job2.company);
  const locationSimilarity = calculateStringSimilarity(job1.locationText, job2.locationText);

  // Weighted average similarity
  const overallSimilarity =
    titleSimilarity * 0.5 + companySimilarity * 0.3 + locationSimilarity * 0.2;

  return overallSimilarity >= threshold;
};

/**
 * Calculate string similarity using Jaro-Winkler algorithm
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score between 0 and 1
 */
export const calculateStringSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;

  // Apply Winkler prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
};

/**
 * Remove duplicate jobs from an array
 * @param jobs Array of jobs
 * @param threshold Similarity threshold
 * @returns Array of unique jobs
 */
export const removeDuplicateJobs = <
  T extends { title: string; company: string; locationText: string },
>(
  jobs: T[],
  threshold: number = 0.8
): T[] => {
  const uniqueJobs: T[] = [];

  for (const job of jobs) {
    const isDuplicate = uniqueJobs.some(existingJob =>
      areJobsDuplicate(job, existingJob, threshold)
    );

    if (!isDuplicate) {
      uniqueJobs.push(job);
    }
  }

  return uniqueJobs;
};

/**
 * Group similar jobs together
 * @param jobs Array of jobs
 * @param threshold Similarity threshold
 * @returns Array of job groups
 */
export const groupSimilarJobs = <
  T extends { title: string; company: string; locationText: string },
>(
  jobs: T[],
  threshold: number = 0.8
): T[][] => {
  const groups: T[][] = [];
  const processed = new Set<number>();

  for (let i = 0; i < jobs.length; i++) {
    if (processed.has(i)) continue;

    const group = [jobs[i]];
    processed.add(i);

    for (let j = i + 1; j < jobs.length; j++) {
      if (processed.has(j)) continue;

      if (areJobsDuplicate(jobs[i]!, jobs[j]!, threshold)) {
        group.push(jobs[j]);
        processed.add(j);
      }
    }

    groups.push(group.filter((item): item is T => item !== undefined));
  }

  return groups;
};

/**
 * Create a normalized version of job data for comparison
 * @param job Job data
 * @returns Normalized job data
 */
export const normalizeJobData = (job: {
  title: string;
  company: string;
  locationText: string;
}): { title: string; company: string; locationText: string } => {
  return {
    title: job.title.toLowerCase().trim().replace(/\s+/g, ' '),
    company: job.company.toLowerCase().trim().replace(/\s+/g, ' '),
    locationText: job.locationText.toLowerCase().trim().replace(/\s+/g, ' '),
  };
};
