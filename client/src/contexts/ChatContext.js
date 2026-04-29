import React, { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../config/axios';
import toast from 'react-hot-toast';

const ChatContext = createContext();

const initialState = {
  currentSession: null,
  messages: [],
  isTyping: false,
  riskLevel: 'low',
  suggestedInterventions: [],
  mood: 'neutral',
  topics: [],
  emergencyResources: null,
  sessionHistory: [],
  loading: false,
  error: null
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        currentSession: action.payload.sessionId,
        messages: [action.payload.message],
        riskLevel: 'low',
        suggestedInterventions: [],
        mood: 'neutral',
        topics: [],
        emergencyResources: null,
        loading: false,
        error: null
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };
    case 'UPDATE_SESSION_DATA':
      return {
        ...state,
        riskLevel: action.payload.riskLevel || state.riskLevel,
        suggestedInterventions: action.payload.suggestedInterventions || state.suggestedInterventions,
        mood: action.payload.mood || state.mood,
        topics: action.payload.topics || state.topics,
        emergencyResources: action.payload.emergencyResources || state.emergencyResources
      };
    case 'LOAD_SESSION_HISTORY':
      return {
        ...state,
        sessionHistory: action.payload
      };
    case 'END_SESSION':
      return {
        ...state,
        currentSession: null,
        messages: [],
        riskLevel: 'low',
        suggestedInterventions: [],
        mood: 'neutral',
        topics: [],
        emergencyResources: null,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const startSession = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.post('/api/chat/start');
      const { sessionId, message } = response.data.data;
      
      dispatch({
        type: 'START_SESSION',
        payload: { sessionId, message }
      });
      
      return { success: true, sessionId };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start chat session';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const sendMessage = useCallback(async (message) => {
    if (!state.currentSession) {
      toast.error('No active chat session');
      return { success: false };
    }

    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      const response = await api.post('/api/chat/message', {
        sessionId: state.currentSession,
        message
      });

      const { message: assistantMessage, ...sessionData } = response.data.data;
      
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      dispatch({ type: 'UPDATE_SESSION_DATA', payload: sessionData });
      dispatch({ type: 'SET_TYPING', payload: false });

      // Show emergency resources if needed
      if (sessionData.emergencyResources) {
        toast.error('Emergency resources are available. Please seek immediate help if needed.', {
          duration: 8000
        });
      }

      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_TYPING', payload: false });
      const message = error.response?.data?.message || 'Failed to send message';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [state.currentSession]);

  const endSession = useCallback(async (satisfaction = null) => {
    if (!state.currentSession) {
      return { success: false };
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await api.post('/api/chat/end', {
        sessionId: state.currentSession,
        satisfaction
      });

      dispatch({ type: 'END_SESSION' });
      toast.success('Chat session ended successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to end session';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, [state.currentSession]);

  const loadSessionHistory = useCallback(async () => {
    try {
      const response = await api.get('/api/chat/history');
      dispatch({
        type: 'LOAD_SESSION_HISTORY',
        payload: response.data.data.sessions
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load session history';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const getCrisisResources = useCallback(async () => {
    try {
      const response = await api.get('/api/chat/crisis-resources');
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load crisis resources';
      return { success: false, error: message };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    startSession,
    sendMessage,
    endSession,
    loadSessionHistory,
    getCrisisResources,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
