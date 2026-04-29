const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async generateResponse(messages, userContext = {}) {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your-api-key')) {
        return this.getFallbackResponse(messages);
      }

      const systemPrompt = this.buildSystemPrompt(userContext);
      
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt
      });

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage([{ text: lastMessage.content }]);
      const response = result.response;
      
      return {
        content: response.text(),
        usage: { total_tokens: 0 }, // Using mock usage since genai SDK usage tracking varies
        finishReason: 'stop'
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse(messages);
    }
  }

  getFallbackResponse(messages) {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content?.toLowerCase() || '';

    // Simple keyword-based responses for demo purposes
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
      return {
        content: "Hello! I'm here to provide emotional support. How are you feeling today? You can share what's on your mind, and I'll do my best to help.",
        usage: { total_tokens: 0 },
        finishReason: 'stop'
      };
    }
    
    if (userMessage.includes('sad') || userMessage.includes('depressed')) {
      return {
        content: "I understand you're feeling sad. That's completely normal, and it's brave of you to reach out. Here are some things that might help:\n\n1. Take deep breaths - inhale for 4 counts, hold for 4, exhale for 4\n2. Try to get some fresh air or sunlight\n3. Consider talking to a trusted friend or family member\n4. Remember that feelings are temporary\n\nWould you like to talk more about what's making you feel this way?",
        usage: { total_tokens: 0 },
        finishReason: 'stop'
      };
    }
    
    if (userMessage.includes('anxious') || userMessage.includes('anxiety') || userMessage.includes('worried')) {
      return {
        content: "I hear that you're feeling anxious. Anxiety can be overwhelming, but there are ways to manage it:\n\n1. Try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste\n2. Practice box breathing: inhale for 4, hold for 4, exhale for 4, hold for 4\n3. Focus on what you can control right now\n4. Consider scheduling an appointment with a counselor\n\nWhat specific worries are on your mind?",
        usage: { total_tokens: 0 },
        finishReason: 'stop'
      };
    }
    
    if (userMessage.includes('stress') || userMessage.includes('stressed')) {
      return {
        content: "Stress is a common experience, especially for students. Here are some strategies that might help:\n\n1. Break large tasks into smaller, manageable steps\n2. Take regular breaks - even 5 minutes can help\n3. Practice mindfulness or meditation\n4. Make sure you're getting enough sleep\n5. Don't hesitate to ask for help from professors or counselors\n\nWhat's causing you the most stress right now?",
        usage: { total_tokens: 0 },
        finishReason: 'stop'
      };
    }
    
    if (userMessage.includes('help') || userMessage.includes('support')) {
      return {
        content: "I'm here to support you! Here are some ways I can help:\n\n1. Provide coping strategies for anxiety, depression, or stress\n2. Help you find resources and techniques\n3. Guide you to professional help when needed\n4. Offer a listening ear and emotional support\n\nYou can also:\n- Book an appointment with a counselor\n- Browse our resource library\n- Connect with peer support in our forum\n\nWhat would be most helpful for you right now?",
        usage: { total_tokens: 0 },
        finishReason: 'stop'
      };
    }
    
    // Default response
    return {
      content: "Thank you for sharing that with me. I'm here to listen and support you. Could you tell me more about how you're feeling or what's on your mind? I can help you with coping strategies, resources, or guide you to professional help if needed.",
      usage: { total_tokens: 0 },
      finishReason: 'stop'
    };
  }

  buildSystemPrompt(userContext) {
    return `You are a compassionate AI mental health assistant designed to provide immediate emotional support and coping strategies to students. Your role is to:

1. Provide empathetic, non-judgmental support
2. Offer practical coping strategies and techniques
3. Identify when professional help is needed
4. Maintain confidentiality and safety

Guidelines:
- Always prioritize user safety
- Use warm, supportive language
- Provide specific, actionable advice
- Never diagnose mental health conditions
- Encourage professional help when appropriate
- Respect cultural and personal differences

Safety Protocols:
- If user mentions self-harm, suicide, or violence, immediately suggest emergency resources
- For severe mental health concerns, recommend professional counseling
- Always validate feelings while encouraging positive coping strategies

Available Resources:
- Breathing exercises
- Grounding techniques
- Mindfulness practices
- Crisis hotlines
- Campus counseling services

User Context: ${JSON.stringify(userContext)}

Remember: You are not a replacement for professional mental health care, but a supportive first step.`;
  }

  async analyzeRiskLevel(messages) {
    try {
      const riskPrompt = `Analyze the following conversation for mental health risk indicators. Rate the risk level as: low, medium, high, or critical.

Look for indicators of:
- Suicidal thoughts or ideation
- Self-harm intentions
- Substance abuse
- Violence towards others
- Severe depression or anxiety
- Isolation or hopelessness

Conversation: ${JSON.stringify(messages)}

Respond only with a valid JSON object matching the requested schema. Do not use markdown code blocks, just raw JSON.
Respond with: {"riskLevel": "low/medium/high/critical", "indicators": ["list", "of", "key", "indicators"], "recommendations": ["immediate", "actions"]}`;

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(riskPrompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Risk analysis error:', error);
      return {
        riskLevel: 'medium',
        indicators: ['Unable to analyze'],
        recommendations: ['Monitor conversation closely']
      };
    }
  }

  async suggestInterventions(userMessage, context) {
    try {
      const interventionPrompt = `Based on the user's message and context, suggest appropriate mental health interventions.

User Message: "${userMessage}"
Context: ${JSON.stringify(context)}

Suggest interventions from these categories:
- breathing-exercise: For anxiety or panic
- grounding-technique: For dissociation or overwhelm
- positive-affirmation: For low self-esteem
- resource-suggestion: For specific concerns
- professional-referral: For serious issues

Respond only with a valid JSON object matching the requested schema. Do not use markdown code blocks, just raw JSON.
Respond with: {"interventions": [{"type": "breathing-exercise", "description": "Brief description", "priority": "high/medium/low"}]}`;

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(interventionPrompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Intervention suggestion error:', error);
      return { interventions: [] };
    }
  }

  async extractTopics(messages) {
    try {
      const topicPrompt = `Extract the main mental health topics discussed in this conversation. Return as a JSON array of topic strings.

Topics might include: anxiety, depression, stress, relationships, academic pressure, family issues, self-esteem, sleep, eating, substance use, etc.

Conversation: ${JSON.stringify(messages)}

Respond only with a valid JSON array. Do not use markdown code blocks, just raw JSON.
Respond with: ["topic1", "topic2", "topic3"]`;

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(topicPrompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Topic extraction error:', error);
      return [];
    }
  }

  async assessMood(messages) {
    try {
      const moodPrompt = `Assess the user's current mood based on their messages. Rate as: very-low, low, neutral, good, or very-good.

Consider:
- Emotional tone
- Energy level
- Hopefulness
- Engagement level
- Stress indicators

Messages: ${JSON.stringify(messages)}

Respond only with a valid JSON object. Do not use markdown code blocks, just raw JSON.
Respond with: {"mood": "very-low/low/neutral/good/very-good", "confidence": 0.85, "reasoning": "Brief explanation"}`;

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(moodPrompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Mood assessment error:', error);
      return { mood: 'neutral', confidence: 0.5, reasoning: 'Unable to assess' };
    }
  }
}

module.exports = new GeminiService();
