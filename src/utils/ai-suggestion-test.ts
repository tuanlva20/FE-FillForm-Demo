// Test file để kiểm tra logic polling cho AI suggestion
// File này có thể được sử dụng để test các trường hợp khác nhau

import { pollAISuggestionStatus } from 'api/ai-suggestion';

// Mock data cho testing
export const mockQueuedResponse = {
  status: 'QUEUED',
  requestId: 'test-request-id-123',
  message: 'AI suggestion request added to queue',
  estimatedWaitTime: 30,
  priority: 5
};

export const mockProcessingResponse = {
  status: 'PROCESSING',
  requestId: 'test-request-id-123',
  message: 'AI suggestion is being processed',
  estimatedWaitTime: 15,
  priority: 5
};

export const mockCompletedResponse = {
  status: 'COMPLETED',
  requestId: 'test-request-id-123',
  content: {
    formId: 'test-form-id',
    formTitle: 'Test Form',
    sampleCount: 2,
    questionAnswerAttributes: [
      {
        questionId: 'question1',
        questionTitle: 'What is your age?',
        questionType: 'RADIO',
        isRequired: true,
        optionDistributions: [
          {
            optionId: 'option1',
            optionText: '18-25',
            optionValue: '18-25',
            percentage: 60,
            sampleValues: ['18-25', '18-25'],
            description: null
          }
        ],
        sampleAnswers: ['18-25', '18-25'],
        description: null
      }
    ],
    generatedAt: '2024-01-20T10:30:00',
    requestId: 'test-request-id-123'
  }
};

export const mockFailedResponse = {
  status: 'FAILED',
  requestId: 'test-request-id-123',
  error: 'AI service temporarily unavailable'
};

// Test function để simulate polling
export const testPollingLogic = async (requestId: string) => {
  console.log('Testing polling logic for requestId:', requestId);
  
  try {
    const response = await pollAISuggestionStatus(requestId);
    console.log('Polling response:', response);
    
    switch (response.status) {
      case 'QUEUED':
        console.log('Request is queued, estimated wait time:', response.estimatedWaitTime);
        return { shouldContinue: true, message: 'Request queued' };
        
      case 'PROCESSING':
        console.log('Request is being processed');
        return { shouldContinue: true, message: 'Request processing' };
        
      case 'COMPLETED':
        console.log('Request completed successfully');
        return { shouldContinue: false, message: 'Request completed', data: response.content };
        
      case 'FAILED':
        console.log('Request failed:', response.error);
        return { shouldContinue: false, message: 'Request failed', error: response.error };
        
      default:
        console.log('Unknown status:', response.status);
        return { shouldContinue: false, message: 'Unknown status' };
    }
  } catch (error) {
    console.error('Polling error:', error);
    return { shouldContinue: false, message: 'Polling error', error };
  }
};

// Test scenarios
export const testScenarios = {
  // Scenario 1: Request queued then completed
  async testQueuedToCompleted() {
    console.log('=== Test Scenario: Queued to Completed ===');
    
    // Simulate queued response
    const queuedResult = await testPollingLogic('queued-request');
    console.log('Queued result:', queuedResult);
    
    // Simulate completed response
    const completedResult = await testPollingLogic('completed-request');
    console.log('Completed result:', completedResult);
  },
  
  // Scenario 2: Request failed
  async testFailedRequest() {
    console.log('=== Test Scenario: Failed Request ===');
    
    const failedResult = await testPollingLogic('failed-request');
    console.log('Failed result:', failedResult);
  },
  
  // Scenario 3: Network error
  async testNetworkError() {
    console.log('=== Test Scenario: Network Error ===');
    
    try {
      await testPollingLogic('invalid-request');
    } catch (error) {
      console.log('Network error caught:', error);
    }
  }
};

// Export test data
export const testData = {
  mockQueuedResponse,
  mockProcessingResponse,
  mockCompletedResponse,
  mockFailedResponse
};
