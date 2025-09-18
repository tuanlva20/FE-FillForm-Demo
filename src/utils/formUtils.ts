import { AnswerDistribution } from 'api/form';

/**
 * Deduplicate answer distributions to prevent duplicate text questions
 * @param distributions - Array of answer distributions
 * @returns Deduplicated array of answer distributions
 */
export const deduplicateAnswerDistributions = (distributions: AnswerDistribution[]): AnswerDistribution[] => {
  const seen = new Map<string, AnswerDistribution>();
  const result: AnswerDistribution[] = [];

  distributions.forEach((distribution) => {
    // Create a unique key for each distribution
    const key = createDistributionKey(distribution);

    if (!seen.has(key)) {
      seen.set(key, distribution);
      result.push(distribution);
    } else {
      // If we have a duplicate, merge the percentages if they're for the same question
      // But only merge if they don't have different valueStrings (which would have different keys)
      const existing = seen.get(key)!;
      if (
        existing.questionId === distribution.questionId &&
        existing.optionId === distribution.optionId &&
        existing.rowId === distribution.rowId &&
        existing.valueString === distribution.valueString
      ) {
        // Merge percentages for the same question/option combination with same valueString
        existing.percentage += distribution.percentage;
        // Keep the first positionIndex if both have one
        if (existing.positionIndex === undefined && distribution.positionIndex !== undefined) {
          existing.positionIndex = distribution.positionIndex;
        }
      }
      // If valueStrings are different, they should have different keys and not reach here
    }
  });

  return result;
};

/**
 * Create a unique key for an answer distribution
 * @param distribution - Answer distribution object
 * @returns Unique key string
 */
const createDistributionKey = (distribution: AnswerDistribution): string => {
  const { questionId, optionId, rowId, positionIndex, valueString } = distribution;

  // For any distribution with valueString (text questions, other options, etc.),
  // include positionIndex and valueString in the key to ensure uniqueness
  if (valueString) {
    return `${questionId}_${optionId}_${rowId || ''}_${positionIndex || 0}_${valueString}`;
  }

  // For other question types without valueString, use questionId, optionId, and rowId
  return `${questionId}_${optionId}_${rowId || ''}`;
};

/**
 * Validate and clean answer distributions for text questions
 * @param distributions - Array of answer distributions
 * @returns Cleaned and validated array
 */
export const validateTextQuestionDistributions = (distributions: AnswerDistribution[]): AnswerDistribution[] => {
  const questionGroups = new Map<string, AnswerDistribution[]>();

  // Group distributions by questionId
  distributions.forEach((dist) => {
    if (!questionGroups.has(dist.questionId)) {
      questionGroups.set(dist.questionId, []);
    }
    questionGroups.get(dist.questionId)!.push(dist);
  });

  const result: AnswerDistribution[] = [];

  questionGroups.forEach((questionDistributions, questionId) => {
    // Check if this is a text question (has distributions with optionId === null and valueString)
    const textDistributions = questionDistributions.filter((d) => d.optionId === null && d.valueString);

    if (textDistributions.length > 0) {
      // This is a text question, ensure no duplicates by positionIndex
      const uniqueTextDistributions = new Map<number, AnswerDistribution>();

      textDistributions.forEach((dist) => {
        const position = dist.positionIndex || 0;
        if (!uniqueTextDistributions.has(position)) {
          uniqueTextDistributions.set(position, dist);
        }
      });

      // Add unique text distributions
      result.push(...Array.from(uniqueTextDistributions.values()));

      // Add non-text distributions for this question
      const nonTextDistributions = questionDistributions.filter((d) => d.optionId !== null || !d.valueString);
      result.push(...nonTextDistributions);
    } else {
      // Not a text question, add all distributions
      result.push(...questionDistributions);
    }
  });

  return result;
};

/**
 * Round percentages to integers while preserving totals per logical group.
 * Rules:
 * - For text questions (optionId === null with valueString): sum to 100 per questionId
 * - For grid questions: sum to 100 per row (questionId + rowId)
 * - For normal options: preserve each option's total (questionId + optionId)
 * - Finally, ensure each question's overall total = 100 by minimal adjustment
 */
export const normalizeDistributionIntegers = (distributions: AnswerDistribution[]): AnswerDistribution[] => {
  if (!Array.isArray(distributions) || distributions.length === 0) return distributions;

  // Helper: largest remainder method
  const adjustToTarget = (
    items: { idx: number; original: number; tie?: number }[],
    targetSum: number
  ) => {
    const floors = items.map((it) => Math.floor(it.original));
    const sumFloor = floors.reduce((a, b) => a + b, 0);
    // pair fractional part with index for stable distribution
    const fracs = items.map((it, i) => ({ i, frac: it.original - Math.floor(it.original), tie: it.tie ?? 0 }));
    let remain = targetSum - sumFloor;
    if (remain > 0) {
      fracs
        .sort((a, b) => (b.frac - a.frac) || (a.tie - b.tie) || (a.i - b.i))
        .slice(0, remain)
        .forEach(({ i }) => floors[i]++);
    } else if (remain < 0) {
      // Need to decrease some by 1: choose smallest fractional parts first
      fracs
        .sort((a, b) => (a.frac - b.frac) || (a.tie - b.tie) || (a.i - b.i))
        .slice(0, Math.abs(remain))
        .forEach(({ i }) => floors[i]--);
    }
    return floors;
  };

  // Work on a copy
  const result = distributions.map((d) => ({ ...d }));

  // 1) Text questions: group by questionId where optionId === null and has valueString
  const textGroups = new Map<string, number[]>();
  const textIndices = new Map<string, number[]>();
  result.forEach((d, idx) => {
    if (d.optionId === null && typeof d.valueString === 'string' && d.valueString.length > 0) {
      const key = d.questionId;
      if (!textGroups.has(key)) {
        textGroups.set(key, []);
        textIndices.set(key, []);
      }
      textGroups.get(key)!.push(d.percentage || 0);
      textIndices.get(key)!.push(idx);
    }
  });
  textGroups.forEach((values, key) => {
    const indices = textIndices.get(key)!;
    const items = values.map((v, i) => ({ idx: i, original: v, tie: i }));
    const rounded = adjustToTarget(items, 100);
    rounded.forEach((v, i) => {
      result[indices[i]].percentage = v;
    });
  });

  // 2) Grid questions: per row sum 100
  const gridGroups = new Map<string, number[]>();
  const gridIndices = new Map<string, number[]>();
  result.forEach((d, idx) => {
    if (d.rowId && d.optionId && d.questionId) {
      const key = `${d.questionId}__${d.rowId}`;
      if (!gridGroups.has(key)) {
        gridGroups.set(key, []);
        gridIndices.set(key, []);
      }
      gridGroups.get(key)!.push(d.percentage || 0);
      gridIndices.get(key)!.push(idx);
    }
  });
  gridGroups.forEach((values, key) => {
    const indices = gridIndices.get(key)!;
    const items = values.map((v, i) => ({ idx: i, original: v, tie: i }));
    const rounded = adjustToTarget(items, 100);
    rounded.forEach((v, i) => {
      result[indices[i]].percentage = v;
    });
  });

  // 3) Normal options: per (questionId + optionId) preserve that option total
  const optionGroups = new Map<string, { idxs: number[]; values: number[] }>();
  result.forEach((d, idx) => {
    // exclude text splits (optionId === null) and grid (has rowId)
    if (d.optionId && !d.rowId) {
      const key = `${d.questionId}__${d.optionId}`;
      if (!optionGroups.has(key)) optionGroups.set(key, { idxs: [], values: [] });
      optionGroups.get(key)!.idxs.push(idx);
      optionGroups.get(key)!.values.push(d.percentage || 0);
    }
  });
  optionGroups.forEach(({ idxs, values }) => {
    const target = Math.round(values.reduce((a, b) => a + b, 0));
    if (idxs.length === 0) return;
    const items = values.map((v, i) => ({ idx: i, original: v, tie: i }));
    const rounded = adjustToTarget(items, target);
    rounded.forEach((v, i) => {
      result[idxs[i]].percentage = v;
    });
  });

  // 4) Ensure each question's overall total = 100 where applicable (non-text, non-grid mixed)
  const questionTotals = new Map<string, { idxs: number[]; originals: number[] }>();
  result.forEach((d, idx) => {
    // Consider entries that belong to choice questions (optionId !== null) OR text entries
    if (d.questionId && ((d.optionId && !d.rowId) || (d.optionId === null && typeof d.valueString === 'string'))) {
      const key = d.questionId;
      if (!questionTotals.has(key)) questionTotals.set(key, { idxs: [], originals: [] });
      questionTotals.get(key)!.idxs.push(idx);
      // Use the original float from the current result (post step 3 we only have ints, but we can approximate with current value)
      // To better respect fractional order, reuse percentage from distributions input if available via mapping; fallback to current int
      questionTotals.get(key)!.originals.push(distributions[idx]?.percentage ?? d.percentage ?? 0);
    }
  });
  questionTotals.forEach(({ idxs, originals }) => {
    if (idxs.length === 0) return;
    const currentSum = idxs.reduce((sum, i) => sum + (result[i].percentage || 0), 0);
    const need = 100 - currentSum;
    if (need === 0) return;
    // Adjust minimally based on largest remainder of originals
    const items = originals.map((v, i) => ({ idx: i, original: v, tie: i }));
    if (need > 0) {
      items
        .sort((a, b) => (b.original - Math.floor(b.original) - (a.original - Math.floor(a.original))) || (a.tie - b.tie))
        .slice(0, need)
        .forEach(({ idx }) => {
          result[idxs[idx]].percentage = (result[idxs[idx]].percentage || 0) + 1;
        });
    } else {
      const take = Math.abs(need);
      items
        .sort((a, b) => (a.original - Math.floor(a.original) - (b.original - Math.floor(b.original))) || (a.tie - b.tie))
        .slice(0, take)
        .forEach(({ idx }) => {
          result[idxs[idx]].percentage = (result[idxs[idx]].percentage || 0) - 1;
        });
    }
  });

  return result;
};
