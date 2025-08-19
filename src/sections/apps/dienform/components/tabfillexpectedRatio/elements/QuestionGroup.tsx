import { Box, Stack } from '@mui/material';
import { Question, SectionData } from 'api/form';
import React from 'react';
import SectionHeader from './SectionHeader';

interface QuestionGroupProps {
  questions: Question[];
  renderQuestion: (question: Question) => React.ReactNode;
}

interface GroupedQuestions {
  sections: Map<string, { sectionData: SectionData; questions: Question[] }>;
  noSectionQuestions: Question[];
}

function normalizeSectionData(rawAdditionalData: unknown): SectionData | undefined {
  if (!rawAdditionalData) return undefined;

  let additional: any = rawAdditionalData;
  if (typeof additional === 'string') {
    try {
      additional = JSON.parse(additional);
    } catch (e) {
      console.warn('QuestionGroup: Failed to parse additionalData string');
      return undefined;
    }
  }

  // Possible shapes: { sectionData: {...} } | { section_data: {...} } | direct fields on root
  const candidate = additional.sectionData || additional.section_data || additional.section || additional;

  if (!candidate) return undefined;

  const hasSectionFields =
    typeof candidate.section_index !== 'undefined' ||
    typeof candidate.section_title !== 'undefined' ||
    typeof candidate.liIndex !== 'undefined';

  if (!hasSectionFields) return undefined;

  const sectionIndex = String(candidate.section_index ?? candidate.liIndex ?? '');
  const sectionTitle = String(candidate.section_title ?? candidate.headingNormalized ?? '').trim();
  const sectionDescription = String(candidate.section_description ?? '').trim();

  if (!sectionIndex && !sectionTitle) return undefined;

  const normalized: SectionData = {
    liIndex: String(candidate.liIndex ?? ''),
    section_index: sectionIndex,
    section_title: sectionTitle,
    containerXPath: String(candidate.containerXPath ?? ''),
    headingNormalized: String(candidate.headingNormalized ?? ''),
    section_description: sectionDescription
  };

  return normalized;
}

export default function QuestionGroup({ questions, renderQuestion }: QuestionGroupProps) {
  // Group questions by section
  const groupedQuestions = questions.reduce<GroupedQuestions>((acc, question) => {
    const sectionData = normalizeSectionData((question as any).additionalData);

    if (sectionData) {
      const key = sectionData.section_index || sectionData.liIndex || '99999';
      // Skip section with index 0
      if (key === '0' || key === '0') {
        acc.noSectionQuestions.push(question);
      } else {
        if (!acc.sections.has(key)) {
          acc.sections.set(key, { sectionData, questions: [] });
        }
        acc.sections.get(key)!.questions.push(question);
      }
    } else {
      acc.noSectionQuestions.push(question);
    }

    return acc;
  }, { sections: new Map(), noSectionQuestions: [] });

  // Sort sections by numeric section_index when possible
  const sortedSections = Array.from(groupedQuestions.sections.entries()).sort(([a], [b]) => {
    const ai = Number.parseInt(a as string, 10);
    const bi = Number.parseInt(b as string, 10);
    if (Number.isNaN(ai) && Number.isNaN(bi)) return (a as string).localeCompare(b as string);
    if (Number.isNaN(ai)) return 1;
    if (Number.isNaN(bi)) return -1;
    return ai - bi;
  });

  return (
    <Stack spacing={4}>
      {/* Non-section questions FIRST, keep original UI (no extra wrapper) */}
      {groupedQuestions.noSectionQuestions.length > 0 && (
        <Stack spacing={4}>
          {groupedQuestions.noSectionQuestions.map((question) => (
            <Box key={question.id}>{renderQuestion(question)}</Box>
          ))}
        </Stack>
      )}

      {/* Sectioned questions */}
      {sortedSections.map(([sectionKey, { sectionData, questions: sectionQuestions }]) => (
        <Box key={sectionKey}>
          <SectionHeader sectionData={sectionData} />
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
            }}
          >
            <Stack spacing={0}>
              {sectionQuestions.map((question, index) => (
                <Box
                  key={question.id}
                  sx={{
                    backgroundColor: 'white',
                    ...(index < sectionQuestions.length - 1 && { borderBottom: '1px solid #e0e0e0' })
                  }}
                >
                  {renderQuestion(question)}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
