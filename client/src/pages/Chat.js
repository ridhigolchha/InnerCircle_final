import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Send,
  MessageCircle,
  AlertTriangle,
  Heart,
  Brain,
  Users,
  Phone,
  Star,
  StarOff,
  RotateCcw,
  Shield
} from 'lucide-react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [satisfactionRating, setSatisfactionRating] = useState(0);
  const [satisfactionFeedback, setSatisfactionFeedback] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickPrompts = useMemo(
    () => [
      {
        label: 'I need a calming exercise',
        text: 'Can you share a short breathing exercise to help me calm down?'
      },
      {
        label: 'Feeling overwhelmed',
        text: "I'm feeling overwhelmed with everything right now. Can you help me organize my thoughts?"
      },
      {
        label: 'Motivation boost',
        text: 'Do you have an encouraging message to help me keep going?'
      },
      {
        label: 'Sleep issues',
        text: 'I have trouble sleeping lately. What gentle tips can I try tonight?'
      }
    ],
    []
  );

  const {
    currentSession,
    messages,
    isTyping,
    riskLevel,
    suggestedInterventions,
    mood,
    topics,
    emergencyResources,
    startSession,
    sendMessage,
    endSession,
    loading,
    error
  } = useChat();

  const { user } = useAuth();

  useEffect(() => {
    if (currentSession) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickPrompt = (text) => {
    setMessage(text);
    inputRef.current?.focus();
  };

  const handleStartChat = async () => {
    await startSession();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const messageText = message.trim();
    setMessage('');
    await sendMessage(messageText);
  };

  const handleEndChat = async () => {
    if (currentSession) {
      const satisfaction = satisfactionRating > 0 ? {
        rating: satisfactionRating,
        feedback: satisfactionFeedback
      } : null;
      
      await endSession(satisfaction);
      setShowSatisfaction(false);
      setSatisfactionRating(0);
      setSatisfactionFeedback('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-100 text-rose-600 shadow-rose-400/30';
      case 'high':
        return 'bg-orange-100 text-orange-600 shadow-orange-400/30';
      case 'medium':
        return 'bg-amber-100 text-amber-600 shadow-amber-400/30';
      default:
        return 'bg-emerald-100 text-emerald-600 shadow-emerald-400/30';
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'very-good': return '😊';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'low': return '😔';
      case 'very-low': return '😢';
      default: return '😐';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!currentSession) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-sky-50 via-rose-50 to-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-12 text-center">
          <div className="relative">
            <span className="absolute -top-6 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-primary-200/50 blur-2xl"></span>
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/80 backdrop-blur shadow-lg ring-1 ring-primary-100">
              <MessageCircle className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Your serene space to share and feel heard
            </h1>
            <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg">
              Inner Circle pairs a compassionate AI guide with the calming rituals you know and love. Drop a thought, a feeling, or a worry — we’ll respond gently and guide you toward soothing next steps.
            </p>
          </div>

          <div className="grid w-full gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-left shadow-[0_12px_40px_-30px_rgba(56,118,175,0.6)] backdrop-blur">
              <Heart className="h-8 w-8 text-rose-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Gentle companionship</h3>
              <p className="mt-2 text-sm text-slate-600">We reflect your words with empathy and suggest rituals to soften tough moments.</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-left shadow-[0_12px_40px_-30px_rgba(56,118,175,0.6)] backdrop-blur">
              <Shield className="h-8 w-8 text-sky-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Safe & confidential</h3>
              <p className="mt-2 text-sm text-slate-600">Your reflections stay within your circle. We only surface crisis resources when safety matters most.</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 p-6 text-left shadow-[0_12px_40px_-30px_rgba(56,118,175,0.6)] backdrop-blur">
              <Brain className="h-8 w-8 text-amber-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Thoughtful guidance</h3>
              <p className="mt-2 text-sm text-slate-600">Powered by AI tuned for mental wellbeing, we combine science-backed strategies with human warmth.</p>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="rounded-full border border-primary-100 bg-white/80 px-4 py-2 text-xs font-medium text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartChat}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:-translate-y-0.5 hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  Begin calming chat
                  <MessageCircle className="h-5 w-5" />
                </>
              )}
            </button>

            {emergencyResources && (
              <div className="w-full max-w-3xl rounded-3xl border border-rose-100 bg-rose-50/80 p-5 text-left shadow-sm">
                <div className="flex items-center gap-3 text-rose-700">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Emergency pathways</h3>
                </div>
                <p className="mt-2 text-sm text-rose-700/90">
                  If you feel unsafe or at risk, please connect with these resources immediately:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-rose-800">
                  <li>• National Crisis Hotline: 988</li>
                  <li>• Emergency Services: 911</li>
                  <li>• Text HOME to 741741</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-sky-50 via-rose-50 to-white py-10">
      <div className="mx-auto flex h-[600px] max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_60px_-45px_rgba(15,60,120,0.7)] backdrop-blur">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/40 bg-white/60 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 shadow-inner">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bright Harbor · AI Companion</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Listening now
                </span>
                {mood && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                    Mood pulse {getMoodEmoji(mood)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {riskLevel && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRiskColor(riskLevel)}`}>
                Risk · {riskLevel}
              </span>
            )}
            <button
              onClick={() => setShowSatisfaction(true)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              End Chat
            </button>
          </div>
        </div>

        {/* Session Info */}
        {(topics.length > 0 || suggestedInterventions.length > 0) && (
          <div className="border-b border-white/40 bg-white/60 px-6 py-3 text-sm text-slate-600 backdrop-blur">
            {topics.length > 0 && (
              <div className="mb-2">
                <span className="font-medium text-slate-700">We’re exploring: </span>
                <div className="inline-flex flex-wrap gap-1">
                  {topics.map((topic, index) => (
                    <span key={index} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {suggestedInterventions.length > 0 && (
              <div>
                <span className="font-medium text-slate-700">Suggested rituals: </span>
                <div className="inline-flex flex-wrap gap-1">
                  {suggestedInterventions.map((intervention, index) => (
                    <span key={index} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      {intervention.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-br from-white/70 via-white/40 to-sky-50/70 px-6 py-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow-sm lg:max-w-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 text-white shadow-primary-400/30'
                    : 'bg-white/80 text-slate-800 ring-1 ring-slate-100'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`mt-2 text-xs ${
                  msg.role === 'user' ? 'text-primary-100/90' : 'text-slate-400'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white/80 px-4 py-3 text-slate-600 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary-300"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary-300" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary-300" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Emergency Resources */}
        {emergencyResources && (
          <div className="border-t border-rose-100 bg-rose-50/90 px-6 py-4 text-sm text-rose-700">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-rose-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-600">Emergency resources nearby</h3>
            </div>
            <div className="mt-2 space-y-1 text-rose-700/90">
              <p>If you need immediate help:</p>
              <p>• Crisis Hotline: {emergencyResources.crisisHotline}</p>
              <p>• Emergency Services: {emergencyResources.emergencyServices}</p>
              <p>• Campus Counseling: {emergencyResources.campusCounseling}</p>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-white/40 bg-white/70 px-6 py-4 backdrop-blur">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                onClick={() => handleQuickPrompt(prompt.text)}
                className="rounded-full border border-primary-100 bg-white/80 px-3 py-1 text-xs font-medium text-primary-600 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50"
              >
                {prompt.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner placeholder:text-slate-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-white shadow-lg shadow-primary-400/30 transition hover:-translate-y-0.5 hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Satisfaction Modal */}
      {showSatisfaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/90 p-6 shadow-2xl backdrop-blur">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-slate-900">
                How did this conversation feel?
              </h3>
              <p className="mt-1 text-sm text-slate-500">Your reflections help us keep the space gentle for everyone.</p>
              
              <div className="mt-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSatisfactionRating(rating)}
                      className={`rounded-full p-2 transition ${
                        rating <= satisfactionRating
                          ? 'text-amber-400 drop-shadow'
                          : 'text-slate-300'
                      }`}
                    >
                      <Star className="h-6 w-6" />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-sm text-slate-500">
                  {satisfactionRating === 0 ? 'Tap a star to rate your experience' :
                   satisfactionRating <= 2 ? 'Needs compassion' :
                   satisfactionRating <= 3 ? 'Nice but could improve' :
                   satisfactionRating <= 4 ? 'Helpful and kind' : 'Deeply soothing'}
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700">
                  Additional feedback (optional)
                </label>
                <textarea
                  value={satisfactionFeedback}
                  onChange={(e) => setSatisfactionFeedback(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-700 shadow-inner focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Share your thoughts about the chat experience..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowSatisfaction(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndChat}
                  className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-primary-500"
                >
                  End Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
