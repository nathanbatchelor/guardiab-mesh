/**
 * Guardian Mesh - Backend Workers (Agents)
 * =========================================
 * This Node.js worker script runs the AI guardian agents that analyze
 * phone call transcripts for potential scams.
 *
 * Run with: npx ts-node scripts/guardians.ts
 */

import OpenAI from 'openai';

// Initialize OpenAI client configured for OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://guardian-mesh.app',
    'X-Title': 'Guardian Mesh',
  },
});

/**
 * Agent analysis result type
 */
export interface AgentResult {
  isScam: boolean;
  confidence: number;
  reasoning: string;
}

/**
 * Agent A: Gemini Analysis
 * ------------------------
 * Uses Google's Gemini model to analyze transcripts for scam patterns.
 * Focuses on: social engineering tactics, urgency manipulation, identity theft attempts.
 */
export async function runAgentGemini(transcript: string): Promise<AgentResult> {
  console.log('[Agent Gemini] Analyzing transcript...');

  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-pro', // OpenRouter model identifier
      messages: [
        {
          role: 'system',
          content: `You are a scam detection AI. Analyze phone call transcripts for potential scam indicators.
          
          Return a JSON object with:
          - isScam: boolean (true if likely a scam)
          - confidence: number (0-100, how confident you are)
          - reasoning: string (brief explanation of your analysis)
          
          Look for: urgency tactics, authority impersonation, requests for sensitive info, emotional manipulation.`,
        },
        {
          role: 'user',
          content: `Analyze this transcript:\n\n${transcript}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('[Agent Gemini] Error:', error);
  }

  return { isScam: false, confidence: 0, reasoning: 'Analysis failed' };
}

/**
 * Agent B: DeepSeek Analysis
 * --------------------------
 * Uses DeepSeek model to analyze transcripts with focus on linguistic patterns.
 * Focuses on: speech patterns, semantic inconsistencies, typical scam scripts.
 */
export async function runAgentDeepSeek(transcript: string): Promise<AgentResult> {
  console.log('[Agent DeepSeek] Analyzing transcript...');

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat', // OpenRouter model identifier
      messages: [
        {
          role: 'system',
          content: `You are a linguistic analysis AI specialized in detecting scam calls.
          
          Return a JSON object with:
          - isScam: boolean (true if likely a scam)
          - confidence: number (0-100, how confident you are)
          - reasoning: string (brief explanation of your analysis)
          
          Focus on: scripted patterns, semantic inconsistencies, known scam templates, unusual conversation flow.`,
        },
        {
          role: 'user',
          content: `Analyze this transcript:\n\n${transcript}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('[Agent DeepSeek] Error:', error);
  }

  return { isScam: false, confidence: 0, reasoning: 'Analysis failed' };
}

/**
 * Process transcript through all guardian agents
 */
export async function processTranscript(transcript: string): Promise<{
  gemini: AgentResult;
  deepseek: AgentResult;
  isScam: boolean;
  avgConfidence: number;
}> {
  console.log('[Guardians] Processing new transcript...');

  // Run both agents in parallel for faster analysis
  const [geminiResult, deepseekResult] = await Promise.all([
    runAgentGemini(transcript),
    runAgentDeepSeek(transcript),
  ]);

  // Check for consensus on scam detection
  const isScam = geminiResult.isScam || deepseekResult.isScam;
  const avgConfidence = (geminiResult.confidence + deepseekResult.confidence) / 2;

  if (isScam && avgConfidence > 50) {
    console.log('[ALERT] Potential scam detected!');
  }

  return {
    gemini: geminiResult,
    deepseek: deepseekResult,
    isScam,
    avgConfidence,
  };
}

/**
 * Main entry point - Demo mode for testing
 */
async function startGuardians(): Promise<void> {
  console.log('=========================================');
  console.log('   GUARDIAN MESH - AI Security Agents   ');
  console.log('=========================================');
  console.log('');
  console.log('[Guardians] Agents ready:');
  console.log('  → Agent A (Gemini)   - Social engineering detection');
  console.log('  → Agent B (DeepSeek) - Linguistic pattern analysis');
  console.log('');

  // Demo: Test with a sample scam transcript
  const testTranscript = `
    Hello, this is the IRS calling. We have detected suspicious activity 
    on your tax return and there is a warrant out for your arrest. 
    You must pay $5,000 immediately using gift cards or you will be arrested today.
    This is your final warning. Press 1 to speak with an agent now.
  `;

  console.log('[Demo] Testing with sample scam transcript...');
  console.log('');

  const result = await processTranscript(testTranscript);

  console.log('');
  console.log('=== ANALYSIS RESULTS ===');
  console.log('');
  console.log('[Gemini]', JSON.stringify(result.gemini, null, 2));
  console.log('');
  console.log('[DeepSeek]', JSON.stringify(result.deepseek, null, 2));
  console.log('');
  console.log(`[Combined] Is Scam: ${result.isScam}, Avg Confidence: ${result.avgConfidence}%`);
}

// Run the guardian agents
startGuardians();
