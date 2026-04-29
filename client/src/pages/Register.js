import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check
} from 'lucide-react';

const likertOptions = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 }
];

const phq9Questions = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving a lot more than usual',
  'Thoughts that you would be better off dead or of hurting yourself'
];

const gad7Questions = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen'
];

const riskLevels = {
  NORMAL: 'Normal',
  MODERATE: 'Moderate',
  HIGH: 'High'
};

const levelRank = {
  [riskLevels.NORMAL]: 0,
  [riskLevels.MODERATE]: 1,
  [riskLevels.HIGH]: 2
};

const phqRisk = (score) => {
  if (score <= 4) return riskLevels.NORMAL;
  if (score >= 15) return riskLevels.HIGH;
  return riskLevels.MODERATE;
};

const gadRisk = (score) => {
  if (score <= 5) return riskLevels.NORMAL;
  if (score >= 15) return riskLevels.HIGH;
  return riskLevels.MODERATE;
};

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [screeningResponses, setScreeningResponses] = useState({});

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const totalScreeningQuestions = phq9Questions.length + gad7Questions.length;
  const answeredCount = Object.keys(screeningResponses).length;
  const screeningComplete = answeredCount === totalScreeningQuestions;
  const screeningProgress = Math.round((answeredCount / totalScreeningQuestions) * 100);

  const handleScreeningSelect = (questionKey, value) => {
    setScreeningResponses((prev) => ({
      ...prev,
      [questionKey]: value
    }));

    if (errors.screening) {
      setErrors((prev) => ({
        ...prev,
        screening: ''
      }));
    }
  };

  const screeningSummary = useMemo(() => {
    const phqScore = phq9Questions.reduce(
      (sum, _q, index) => sum + (screeningResponses[`phq-${index}`] ?? 0),
      0
    );
    const gadScore = gad7Questions.reduce(
      (sum, _q, index) => sum + (screeningResponses[`gad-${index}`] ?? 0),
      0
    );
    const phqLevel = phqRisk(phqScore);
    const gadLevel = gadRisk(gadScore);
    const overallLevel = levelRank[phqLevel] >= levelRank[gadLevel] ? phqLevel : gadLevel;
    return {
      phqScore,
      gadScore,
      phqLevel,
      gadLevel,
      overallLevel
    };
  }, [screeningResponses]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!screeningComplete) {
      newErrors.screening = 'Please complete the wellness screening to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      if (!registerData.studentId) {
        delete registerData.studentId;
      }
      const result = await register(registerData);
      
      if (result.success) {
        if (screeningComplete) {
          localStorage.setItem(
            `inner-circle-screening-${registerData.email}`,
            JSON.stringify({
              timestamp: new Date().toISOString(),
              phqScore: screeningSummary.phqScore,
              gadScore: screeningSummary.gadScore,
              phqLevel: screeningSummary.phqLevel,
              gadLevel: screeningSummary.gadLevel,
              overallLevel: screeningSummary.overallLevel
            })
          );
        }
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: formData.password.length >= 6 },
    { text: 'Contains letters and numbers', met: /[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Student ID (Optional)
              </label>
              <div className="mt-1">
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              
              {/* Password requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check
                        className={`h-4 w-4 mr-2 ${
                          req.met ? 'text-green-500' : 'text-gray-400'
                        }`}
                      />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>


          <div className="space-y-6">
            <ScreeningSection
              title="PHQ-9 · Mood over the last 2 weeks"
              description="Please indicate how often you have been bothered by the following concerns."
              questions={phq9Questions}
              prefix="phq"
              responses={screeningResponses}
              onSelect={handleScreeningSelect}
            />

            <ScreeningSection
              title="GAD-7 · Anxiety over the last 2 weeks"
              description="Let us know how frequently these experiences have affected you recently."
              questions={gad7Questions}
              prefix="gad"
              responses={screeningResponses}
              onSelect={handleScreeningSelect}
            />

            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Screening progress</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-primary-600">{screeningProgress}%</span>
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-primary-500 transition-all"
                        style={{ width: `${screeningProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Your responses stay private. We use them to personalize recommendations and highlight supportive pathways for you.
                </p>
              </div>

              {screeningComplete && (
                <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4 text-xs text-gray-600">
                  Thank you for completing the check-in. We’ll securely share a summary with our support team so trained staff can tailor guidance and monitor wellbeing trends.
                </div>
              )}
              {errors.screening && (
                <p className="text-xs text-rose-600">{errors.screening}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !screeningComplete}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
            {!screeningComplete && (
              <p className="text-xs text-amber-600 text-center">
                Complete the PHQ-9 and GAD-7 check-in to unlock registration.
              </p>
            )}
          </div>

          <div className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
            .
          </div>
        </form>
      </div>
    </div>
  );
};

const SurveyQuestion = ({ index, total, question, questionKey, value, onSelect }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary-500">
            Question {index} of {total}
          </p>
          <p className="text-sm font-semibold text-gray-900">{question}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {likertOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(questionKey, option.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                value === option.value
                  ? 'border-primary-500 bg-primary-100 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScreeningSection = ({ title, description, questions, prefix, responses, onSelect }) => {
  return (
    <section className="space-y-4 rounded-2xl border border-primary-100 bg-white/95 p-5 shadow-soft">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-primary-700">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <SurveyQuestion
            key={`${prefix}-${index}`}
            index={index + 1}
            total={questions.length}
            question={question}
            questionKey={`${prefix}-${index}`}
            value={responses[`${prefix}-${index}`] ?? null}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
};

export default Register;
