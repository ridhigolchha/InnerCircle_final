import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../config/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const aliasAdjectives = [
  'Calm',
  'Brave',
  'Radiant',
  'Gentle',
  'Steady',
  'Bright',
  'Harmonious',
  'Grounded',
  'Courageous',
  'Serene',
  'Joyful',
  'Mindful'
];

const aliasNouns = [
  'River',
  'Horizon',
  'Aurora',
  'Harbor',
  'Atlas',
  'Compass',
  'Willow',
  'Echo',
  'Beacon',
  'Haven',
  'Skylark',
  'Meadow'
];

const getAliasForUser = (user) => {
  if (!user) return null;
  const identifier = user._id || user.id || user.email;
  if (!identifier) return null;

  const storageKey = `inner-circle-alias-${identifier}`;
  let alias = localStorage.getItem(storageKey);

  if (!alias) {
    const adjective = aliasAdjectives[Math.floor(Math.random() * aliasAdjectives.length)];
    const noun = aliasNouns[Math.floor(Math.random() * aliasNouns.length)];
    alias = `${adjective} ${noun}`;
    localStorage.setItem(storageKey, alias);
  }

  return alias;
};

const withAlias = (user) => {
  if (!user) return user;
  const alias = getAliasForUser(user);
  return {
    ...user,
    alias,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : null
  };
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: withAlias(action.payload.user),
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await api.get('/api/auth/profile');
          const user = withAlias(response.data.data.user);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              token: state.token
            }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: withAlias(user), token }
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/register', userData);

      const { user, token } = response.data.data;
      const userWithAlias = withAlias(user);

      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userWithAlias, token }
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data.user
      });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
