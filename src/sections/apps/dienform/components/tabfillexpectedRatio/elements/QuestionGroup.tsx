import { Box, Stack } from '@mui/material';
import { Question, SectionData } from 'api/form';
import React from 'react';
import SectionHeader from './SectionHeader';

interface QuestionGroupProps {
  questions: Question[];
  renderQuestion: (question: Question) => React.ReactNode;
}

interface GroupedQuestions {
  sections: Array<{ sectionData: SectionData | null; questions: Question[] }>;
}

function normalizeSectionData(rawAdditionalData: unknown, question?: any): SectionData | undefined {
  // Handle new format where section data is directly in the question object
  if (question && question.type === 'section') {
    return {
      liIndex: question.additionalData?.itemId || '',
      section_index: String(question.position || 0),
      section_title: question.title || '',
      containerXPath: '',
      headingNormalized: question.title || '',
      section_description: question.description || ''
    };
  }

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

  // REQUIRE explicit section_index to consider this a section.
  // If section_index is missing, treat the question as non-section to avoid showing "Phần 1" incorrectly.
  if (typeof candidate.section_index === 'undefined' || candidate.section_index === null) {
    return undefined;
  }

  const sectionIndex = String(candidate.section_index ?? '').trim();
  if (!sectionIndex) return undefined;

  const sectionTitle = String(candidate.section_title ?? candidate.headingNormalized ?? '').trim();
  const sectionDescription = String(candidate.section_description ?? '').trim();

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
  // Sort all questions by position first
  const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);
  
  // Group questions by sections
  const sections: Array<{ sectionData: SectionData | null, questions: Question[] }> = [];
  let currentSection: SectionData | null = null;
  let currentSectionQuestions: Question[] = [];
  let sectionCounter = 0;

  sortedQuestions.forEach((question) => {
    // Handle section type questions - these become section headers
    if (question.type === 'section') {
      // Save previous section if exists
      if (currentSection || currentSectionQuestions.length > 0) {
        sections.push({
          sectionData: currentSection ? { ...currentSection, displayIndex: sectionCounter } : null,
          questions: currentSectionQuestions
        });
        sectionCounter++;
      }
      
      // Create new section from the section question
      currentSection = {
        liIndex: question.additionalData?.itemId || '',
        section_index: String(question.position || 0),
        section_title: question.title || '',
        containerXPath: '',
        headingNormalized: question.title || '',
        section_description: question.description || ''
      };
      currentSectionQuestions = [];
    } else {
      // Add question to current section (or to no-section group)
      currentSectionQuestions.push(question);
    }
  });

  // Don't forget the last section
  if (currentSection || currentSectionQuestions.length > 0) {
    sections.push({
      sectionData: currentSection ? { ...currentSection, displayIndex: sectionCounter } : null,
      questions: currentSectionQuestions
    });
  }

  return (
    <Stack spacing={4}>
      {sections.map((section, sectionIndex) => (
        <Box key={section.sectionData ? `section-${section.sectionData.section_index}` : `no-section-${sectionIndex}`}>
          {section.sectionData && (
            <SectionHeader sectionData={{ ...section.sectionData, section_index: String(section.sectionData.displayIndex) }} />
          )}
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
            }}
          >
            <Stack spacing={0}>
              {section.questions.map((question, questionIndex) => (
                <Box
                  key={question.id}
                  sx={{
                    backgroundColor: 'white',
                    ...(questionIndex < section.questions.length - 1 && { borderBottom: '1px solid #e0e0e0' })
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
