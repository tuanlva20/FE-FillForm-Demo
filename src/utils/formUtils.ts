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
      const existing = seen.get(key)!;
      if (existing.questionId === distribution.questionId && 
          existing.optionId === distribution.optionId &&
          existing.rowId === distribution.rowId) {
        // Merge percentages for the same question/option combination
        existing.percentage += distribution.percentage;
        // Keep the first valueString if both have one
        if (!existing.valueString && distribution.valueString) {
          existing.valueString = distribution.valueString;
        }
        // Keep the first positionIndex if both have one
        if (existing.positionIndex === undefined && distribution.positionIndex !== undefined) {
          existing.positionIndex = distribution.positionIndex;
        }
      }
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
  
  // For text questions, include positionIndex and valueString in the key
  if (optionId === null && valueString) {
    return `${questionId}_${optionId}_${rowId || ''}_${positionIndex || 0}_${valueString}`;
  }
  
  // For other question types, use questionId, optionId, and rowId
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
  distributions.forEach(dist => {
    if (!questionGroups.has(dist.questionId)) {
      questionGroups.set(dist.questionId, []);
    }
    questionGroups.get(dist.questionId)!.push(dist);
  });
  
  const result: AnswerDistribution[] = [];
  
  questionGroups.forEach((questionDistributions, questionId) => {
    // Check if this is a text question (has distributions with optionId === null and valueString)
    const textDistributions = questionDistributions.filter(d => d.optionId === null && d.valueString);
    
    if (textDistributions.length > 0) {
      // This is a text question, ensure no duplicates by positionIndex
      const uniqueTextDistributions = new Map<number, AnswerDistribution>();
      
      textDistributions.forEach(dist => {
        const position = dist.positionIndex || 0;
        if (!uniqueTextDistributions.has(position)) {
          uniqueTextDistributions.set(position, dist);
        }
      });
      
      // Add unique text distributions
      result.push(...Array.from(uniqueTextDistributions.values()));
      
      // Add non-text distributions for this question
      const nonTextDistributions = questionDistributions.filter(d => d.optionId !== null || !d.valueString);
      result.push(...nonTextDistributions);
    } else {
      // Not a text question, add all distributions
      result.push(...questionDistributions);
    }
  });
  
  return result;
};
