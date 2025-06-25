import { extractAndScore } from '../extract_and_score';
import fs from 'fs/promises';
import path from 'path';

// Mock the OpenAI client
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  scores: [8, 7, 9],
                  feedback: 'Good evidence provided',
                  overall: 8
                })
              }
            }
          ]
        })
      }
    }
  }))
}));

// Mock the database
jest.mock('~/server/db', () => ({
  db: {
    evidence: {
      create: jest.fn().mockResolvedValue({ id: 1 })
    }
  }
}));

describe('extractAndScore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle empty file paths gracefully', async () => {
    const result = await extractAndScore([], []);
    expect(result).toBeDefined();
  });

  it('should handle unsupported file types', async () => {
    const result = await extractAndScore(['test.txt'], ['Question 1']);
    expect(result).toBeDefined();
  });

  it('should process valid questions array', async () => {
    const questions = ['Question 1', 'Question 2', 'Question 3'];
    const result = await extractAndScore([], questions);
    expect(result).toBeDefined();
  });
}); 