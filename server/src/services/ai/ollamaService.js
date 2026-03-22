import { Ollama } from 'ollama';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { interviewPrompts } from './prompts.js';

class OllamaService {
    constructor() {
        this.ollama = null;
        this.modelName = config.ollama.model || 'llama3.2';
        this.chatSessions = new Map(); // Store conversation history per session
        this.initialize();
    }

    initialize() {
        try {
            this.ollama = new Ollama({ host: config.ollama.baseUrl || 'http://localhost:11434' });
            logger.info(`✅ Ollama AI service initialized targeting model: ${this.modelName}`);
            
            // Warm up the model in the background
            this.preloadModel();
        } catch (error) {
            logger.error('Failed to initialize Ollama:', error);
        }
    }

    /**
     * Preloads the model into memory so the first request is fast
     */
    async preloadModel() {
        if (!this.ollama) return;
        try {
            logger.info(`⏳ Preloading Ollama model '${this.modelName}' into memory... This might take a moment.`);
            await this.ollama.chat({
                model: this.modelName,
                messages: [{ role: 'system', content: 'warmup' }],
                keep_alive: -1 // Keep model loaded in memory indefinitely
            });
            logger.info(`✅ Ollama model '${this.modelName}' successfully preloaded and is ready.`);
        } catch (error) {
            logger.warn(`Failed to preload Ollama model: ${error.message}`);
        }
    }

    /**
     * Create or get an interview chat session (stores conversation history)
     */
    getOrCreateSession(sessionId, context) {
        if (this.chatSessions.has(sessionId)) {
            return this.chatSessions.get(sessionId);
        }

        const systemPrompt = this.buildSystemPrompt(context);

        // Initialize session with system prompt in history
        const session = {
            context,
            history: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'assistant',
                    content: '{"type":"system","content":"I understand my role as an AI interviewer. I am ready to conduct the interview based on the specified parameters. I will adapt my questions based on the candidate\'s responses and provide constructive feedback."}'
                }
            ]
        };

        this.chatSessions.set(sessionId, session);
        return session;
    }

    /**
     * Send a message in an existing chat session
     */
    async sendChatMessage(sessionId, message) {
        let session = this.chatSessions.get(sessionId);

        // Auto-create session if it doesn't exist (e.g., after server restart)
        if (!session) {
            logger.warn(`Session ${sessionId} not found, creating temporary session`);
            session = {
                sessionId,
                history: [],
                context: {},
                createdAt: new Date()
            };
            this.chatSessions.set(sessionId, session);
        }

        // CREATE STATELESS MESSAGE ARRAY: 
        // Only System Prompts + Current Question! 
        // This completely prevents context window bloat and speeds up generation 10x
        const messagesToSend = [
            ...(session.history.slice(0, 2)), // The 2 initial system prompts
            { role: 'user', content: message }
        ];

        try {
            const response = await this.ollama.chat({
                model: this.modelName,
                messages: messagesToSend,
                format: 'json',
                keep_alive: -1,
                options: {
                    temperature: this.getTemperatureForPersonality(session.context?.personality || 'professional'),
                    num_ctx: 2048, // Limit context size to save memory and speed up processing
                    num_predict: 800 // Limit token generation length
                }
            });

            return response.message.content;
        } catch (error) {
            logger.error(`sendChatMessage failed for session ${sessionId}:`, error.message);
            throw error;
        }
    }

    /**
     * Build system prompt based on interview context
     */
    buildSystemPrompt(context) {
        const { interviewType, personality, difficulty, targetCompany, targetRole, userProfile } = context;

        const basePrompt = interviewPrompts.system[personality] || interviewPrompts.system.professional;
        const typePrompt = interviewPrompts.types[interviewType] || interviewPrompts.types.technical;

        return `${basePrompt}

INTERVIEW CONFIGURATION:
- Type: ${interviewType.toUpperCase()} Interview
- Difficulty Level: ${difficulty}
- Target Company: ${targetCompany || 'General'}
- Target Role: ${targetRole || 'Software Engineer'}
- Candidate Experience: ${userProfile?.experience || 0} years
- Candidate Skills: ${userProfile?.skills?.join(', ') || 'Not specified'}

${typePrompt}

IMPORTANT GUIDELINES:
1. Dynamically adjust question difficulty based on candidate performance
2. If the candidate answers well, increase complexity
3. If the candidate struggles, provide hints or simplify
4. Generate relevant follow-up questions
5. Be ${personality === 'strict' ? 'rigorous and challenging' : personality === 'friendly' ? 'supportive and encouraging' : 'professional and balanced'}
6. Evaluate answers strictly but fairly
7. BE EXTREMELY CONCISE. Use maximum 1-2 sentences for questions.

RESPONSE FORMAT:
Always respond in strictly valid JSON format with the following structure:
{
  "type": "question|feedback|follow_up|summary",
  "content": "Your response text",
  "difficulty": "easy|medium|hard|expert",
  "expectedTopics": ["topic1", "topic2"],
  "hints": ["hint1", "hint2"],
  "adjustDifficulty": "increase|decrease|maintain"
}
Ensure there is NO markdown around the JSON block.`;
    }

    /**
     * Generate the next interview question
     */
    async generateQuestion(sessionId, context, previousResponses = []) {
        if (!this.ollama) {
            throw new Error('Ollama AI not initialized.');
        }

        this.getOrCreateSession(sessionId, context);

        let prompt = `Generate the next interview question.

Current State:
- Questions asked: ${previousResponses.length}
- Current difficulty: ${context.difficulty}
- Topics covered: ${this.extractTopics(previousResponses)}

${previousResponses.length > 0 ? `
Previous Performance:
${this.summarizePreviousResponses(previousResponses)}
` : 'This is the first question. Start with an appropriate opening question.'}

Generate a ${context.difficulty} difficulty question for a ${context.interviewType} interview.
Focus on topics not yet covered.
Respond strictly in JSON format.`;

        const text = await this.sendChatMessage(sessionId, prompt);
        return this.parseAIResponse(text);
    }

    /**
     * Evaluate a candidate's answer
     */
    async evaluateAnswer(sessionId, question, answer, voiceAnalysis = null) {
        if (!this.ollama) {
            throw new Error('Ollama AI not initialized.');
        }

        const evaluationPrompt = `Evaluate this interview response:

QUESTION: ${question.questionText || question}
DIFFICULTY: ${question.difficulty || 'medium'}
EXPECTED TOPICS: ${question.expectedTopics?.join(', ') || 'General understanding'}

CANDIDATE'S ANSWER: ${answer}

${voiceAnalysis ? `
VOICE ANALYSIS:
- Confidence Score: ${voiceAnalysis.confidence}%
- Hesitation Count: ${voiceAnalysis.hesitationCount}
- Filler Words: ${voiceAnalysis.fillerWords?.map(f => `${f.word}(${f.count})`).join(', ') || 'None'}
- Clarity Score: ${voiceAnalysis.clarityScore}%
- Words per Minute: ${voiceAnalysis.wordsPerMinute}
` : ''}

CRITICAL: Be EXTREMELY concise! Provide max 5-10 words per feedback/suggestion field to ensure lightning-fast generation.
Provide a comprehensive evaluation strictly in JSON format matching this schema:
{
  "scores": {
    "correctness": { "score": 85, "feedback": "explanation" },
    "reasoning": { "score": 80, "feedback": "explanation" },
    "communication": { "score": 90, "feedback": "explanation" },
    "structure": { "score": 70, "feedback": "explanation" },
    "confidence": { "score": 95, "feedback": "explanation" }
  },
  "overall": 84,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "keyTopicsCovered": ["topic1"],
  "keyTopicsMissed": ["topic2"],
  "shouldGenerateFollowUp": true,
  "followUpQuestion": "optional follow-up question",
  "adjustDifficulty": "increase|decrease|maintain"
}`;

        let text;
        if (this.chatSessions.has(sessionId)) {
            text = await this.sendChatMessage(sessionId, evaluationPrompt);
        } else {
            const response = await this.ollama.chat({
                model: this.modelName,
                messages: [{ role: 'user', content: evaluationPrompt }],
                format: 'json',
                keep_alive: -1,
                options: { num_ctx: 2048, num_predict: 800 }
            });
            text = response.message.content;
        }

        return this.parseAIResponse(text);
    }

    /**
     * Generate a follow-up question based on the answer
     */
    async generateFollowUp(sessionId, previousQuestion, answer, evaluation) {
        try {
            if (!this.ollama) return null;

            const followUpPrompt = `Based on the candidate's answer, generate a relevant follow-up question.

PREVIOUS QUESTION: ${previousQuestion}
ANSWER: ${answer}
EVALUATION SUMMARY: Overall score ${evaluation.overall || 70}%
TOPICS MISSED: ${evaluation.keyTopicsMissed?.join(', ') || 'None'}

Generate a follow-up that:
1. Probes deeper into the topic if the answer was good
2. Clarifies misunderstandings if there were gaps
3. Explores related concepts
4. Maintains appropriate difficulty

CRITICAL: Keep the question extremely short and direct to ensure fast generation!
Respond strictly in JSON format containing ONLY a "question" field like: {"question": "your question here"}`;

            let text;
            if (this.chatSessions.has(sessionId)) {
                text = await this.sendChatMessage(sessionId, followUpPrompt);
            } else {
                const response = await this.ollama.chat({
                    model: this.modelName,
                    messages: [{ role: 'user', content: followUpPrompt }],
                    format: 'json',
                    keep_alive: -1,
                    options: { num_ctx: 2048, num_predict: 800 }
                });
                text = response.message.content;
            }

            return this.parseAIResponse(text);
        } catch (error) {
            logger.error('Error generating follow-up:', error);
            return null;
        }
    }

    /**
     * Generate comprehensive interview summary and improvement plan
     */
    async generateInterviewSummary(sessionId, interviewData) {
        if (!this.ollama) {
            throw new Error('Ollama AI not initialized.');
        }

        const summaryPrompt = `Generate a comprehensive interview summary and improvement plan.

INTERVIEW DATA:
- Type: ${interviewData.interviewType}
- Total Questions: ${interviewData.totalQuestions}
- Duration: ${interviewData.duration} minutes
- Overall Score: ${interviewData.overallScores?.overall || 0}%

SCORE BREAKDOWN:
- Correctness: ${interviewData.overallScores?.correctness || 0}%
- Reasoning: ${interviewData.overallScores?.reasoning || 0}%
- Communication: ${interviewData.overallScores?.communication || 0}%
- Structure: ${interviewData.overallScores?.structure || 0}%
- Confidence: ${interviewData.overallScores?.confidence || 0}%

DIFFICULTY PROGRESSION:
${interviewData.difficultyProgression?.map(d => `Q${d.questionIndex + 1}: ${d.difficulty} (${d.score}%)`).join('\n') || 'Not available'}

RESPONSES SUMMARY:
${interviewData.responses?.map((r, i) => `
Q${i + 1}: ${r.question?.questionText?.substring(0, 100)}...
Score: ${r.scores?.overall || 0}% | Strengths: ${r.aiAnalysis?.strengths?.join(', ') || 'N/A'}
`).join('\n') || 'No responses available'}

Generate a detailed summary strictly in JSON format matching this schema:
{
  "overallAssessment": "2-3 sentence summary of the candidate's performance",
  "performanceLevel": "excellent|good|average|needs-improvement",
  "strengthAreas": ["area1", "area2", "area3"],
  "weaknessAreas": ["area1", "area2", "area3"],
  "detailedFeedback": {
    "technicalSkills": "feedback",
    "problemSolving": "feedback",
    "communication": "feedback",
    "confidence": "feedback"
  },
  "improvementPlan": {
    "summary": "personalized improvement summary",
    "focusAreas": ["area1", "area2"],
    "shortTermGoals": ["goal1", "goal2"],
    "longTermGoals": ["goal1", "goal2"],
    "recommendedPractice": [
      {
        "topic": "topic name",
        "priority": "high|medium|low",
        "suggestedQuestions": ["question1", "question2", "question3"],
        "estimatedTime": "X hours"
      }
    ],
    "resources": [
      {
        "title": "resource name",
        "type": "book|video|course|article",
        "description": "why this resource helps"
      }
    ]
  },
  "readinessScore": 85,
  "recommendedNextSteps": ["step1", "step2", "step3"]
}`;

        let text;
        if (this.chatSessions.has(sessionId)) {
            text = await this.sendChatMessage(sessionId, summaryPrompt);
        } else {
            const response = await this.ollama.chat({
                model: this.modelName,
                messages: [{ role: 'user', content: summaryPrompt }],
                format: 'json',
                keep_alive: -1,
                options: { num_ctx: 2048, num_predict: 1500 }
            });
            text = response.message.content;
        }

        // Clean up session after summary
        this.chatSessions.delete(sessionId);

        return this.parseAIResponse(text);
    }

    /**
     * Get temperature based on interviewer personality
     */
    getTemperatureForPersonality(personality) {
        const temperatures = {
            strict: 0.3,
            friendly: 0.7,
            professional: 0.5
        };
        return temperatures[personality] || 0.5;
    }

    /**
     * Extract topics from previous responses
     */
    extractTopics(responses) {
        const topics = new Set();
        responses.forEach(r => {
            r.aiAnalysis?.keyTopicsCovered?.forEach(t => topics.add(t));
        });
        return Array.from(topics).join(', ') || 'None yet';
    }

    /**
     * Summarize previous responses for context
     */
    summarizePreviousResponses(responses) {
        return responses.slice(-3).map((r, i) => {
            return `Q${i + 1}: Score ${r.scores?.overall || 0}% - ${r.scores?.correctness?.feedback?.substring(0, 100) || 'No feedback'}`;
        }).join('\n');
    }

    /**
     * Parse AI response, handling JSON in markdown blocks
     */
    parseAIResponse(text) {
        try {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1].trim());
            }

            // Try to parse as direct JSON
            const cleanText = text.trim();
            if (cleanText.startsWith('{') || cleanText.startsWith('[')) {
                return JSON.parse(cleanText);
            }

            // Return as content if not JSON
            return { content: text, type: 'text' };
        } catch (error) {
            logger.warn('Failed to parse AI response as JSON:', error.message);
            logger.debug('Raw AI response:', text);
            return { content: text, type: 'text' };
        }
    }

    /**
     * Clear a specific session
     */
    clearSession(sessionId) {
        this.chatSessions.delete(sessionId);
    }

    /**
     * Clear all sessions (for cleanup)
     */
    clearAllSessions() {
        this.chatSessions.clear();
    }
}

// Singleton instance
const ollamaService = new OllamaService();

export default ollamaService;
