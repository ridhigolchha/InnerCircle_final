import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  RefreshCw
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

const levelOrder = {
  [riskLevels.NORMAL]: 0,
  [riskLevels.MODERATE]: 1,
  [riskLevels.HIGH]: 2
};

const categorizePhq = (score) => {
  if (score <= 4) return riskLevels.NORMAL;
  if (score >= 15) return riskLevels.HIGH;
  return riskLevels.MODERATE;
};

const categorizeGad = (score) => {
  if (score <= 5) return riskLevels.NORMAL;
  if (score >= 15) return riskLevels.HIGH;
  return riskLevels.MODERATE;
};

const riskPalette = {
  [riskLevels.NORMAL]: {
    badge: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle,
    tone: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  [riskLevels.MODERATE]: {
    badge: 'bg-amber-100 text-amber-700',
    icon: Activity,
    tone: 'text-amber-700',
    border: 'border-amber-200'
  },
  [riskLevels.HIGH]: {
    badge: 'bg-rose-100 text-rose-700',
    icon: AlertTriangle,
    tone: 'text-rose-700',
    border: 'border-rose-200'
  }
};

const Screening = () => {
  const navigate = useNavigate();
  const totalQuestions = phq9Questions.length + gad7Questions.length;

  const [responses, setResponses] = useState({});
  const [view, setView] = useState('form');
  const [result, setResult] = useState(null);

  const answeredCount = Object.keys(responses).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelect = (questionKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const allAnswered = answeredCount === totalQuestions;

  const computeResults = () => {
    const phqScore = phq9Questions.reduce(
      (sum, _question, index) => sum + (responses[`phq-${index}`] ?? 0),
      0
    );
    const gadScore = gad7Questions.reduce(
      (sum, _question, index) => sum + (responses[`gad-${index}`] ?? 0),
      0
    );

    const phqLevel = categorizePhq(phqScore);
    const gadLevel = categorizeGad(gadScore);
    const overallLevel =
      levelOrder[phqLevel] >= levelOrder[gadLevel] ? phqLevel : gadLevel;

    setResult({
      phqScore,
      gadScore,
      phqLevel,
      gadLevel,
      overallLevel
    });
    setView('results');
  };

  const resetForm = () => {
    setResponses({});
    setResult(null);
    setView('form');
  };

  const recommendation = useMemo(() => {
    if (!result) return null;
    switch (result.overallLevel) {
      case riskLevels.HIGH:
        return {
          headline: 'Let’s connect you with live support.',
          body: 'Your responses suggest elevated distress. Please schedule time with a campus counselor or reach out to our peer volunteers right away. We can also notify an on-call responder if you consent.',
          actions: [
            { label: 'Book a counselor', to: '/appointments' },
            { label: 'Message volunteer desk', to: '/forum' }
          ]
        };
      case riskLevels.MODERATE:
        return {
          headline: 'Consider guided practices and regular check-ins.',
          body: 'We recommend combining self-guided tools with light-touch peer support. Try a relaxation practice and book a wellness check-in this week.',
          actions: [
            { label: 'Explore resources', to: '/resources' },
            { label: 'Schedule check-in', to: '/appointments' }
          ]
        };
      default:
        return {
          headline: 'Keep nurturing your routines.',
          body: 'Your scores are within the typical range. Stay connected with your support system and revisit this screening whenever you notice mood shifts.',
          actions: [
            { label: 'Try a calming guide', to: '/resources#relaxation-guides' },
            { label: 'Chat with Inner Circle', to: '/forum' }
          ]
        };
    }
  }, [result]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-heading">Wellness Screening</h1>
          <p className="page-subheading">
            Complete the 16-question PHQ-9 and GAD-7 check-in to understand your current emotional tone. Your responses remain confidential to you unless you choose to share.
          </p>
        </div>
        {view === 'results' ? (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            <RefreshCw className="h-4 w-4" />
            Retake screening
          </button>
        ) : (
          <div className="inline-flex items-center gap-3">
            <span className="text-sm font-semibold text-primary-600">{progress}% complete</span>
            <div className="h-2 w-32 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {view === 'form' && (
        <div className="card space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Section 1 · PHQ-9 (Mood & Energy)
            </p>
            <p className="text-sm text-slate-500">
              Over the last two weeks, how often have you experienced the following?
            </p>
          </div>
          <div className="space-y-4">
            {phq9Questions.map((question, index) => (
              <SurveyQuestion
                key={`phq-${index}`}
                index={index + 1}
                total={phq9Questions.length}
                question={question}
                questionKey={`phq-${index}`}
                value={responses[`phq-${index}`] ?? null}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="card space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Section 2 · GAD-7 (Anxiety & Tension)
            </p>
            <p className="text-sm text-slate-500">
              Over the last two weeks, how often have you felt the following?
            </p>
          </div>
          <div className="space-y-4">
            {gad7Questions.map((question, index) => (
              <SurveyQuestion
                key={`gad-${index}`}
                index={index + 1}
                total={gad7Questions.length}
                question={question}
                questionKey={`gad-${index}`}
                value={responses[`gad-${index}`] ?? null}
                onSelect={handleSelect}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary inline-flex items-center gap-2"
            disabled={!allAnswered}
            onClick={computeResults}
          >
            Review my scores
            <ArrowRight className="h-4 w-4" />
          </button>
          {!allAnswered && (
            <p className="text-xs text-amber-600">
              Please answer all questions to see your personalized summary.
            </p>
          )}
        </div>
      )}

      {view === 'results' && result && (
        <div className="space-y-6">
          <div className={`card border ${riskPalette[result.overallLevel].border} space-y-4`}> 
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${riskPalette[result.overallLevel].badge}`}>
              Overall risk · {result.overallLevel}
            </span>
            <div className="grid gap-4 md:grid-cols-2">
              <ScoreTile
                title="Mood tone (PHQ-9)"
                score={result.phqScore}
                max={27}
                level={result.phqLevel}
              />
              <ScoreTile
                title="Anxiety tone (GAD-7)"
                score={result.gadScore}
                max={21}
                level={result.gadLevel}
              />
            </div>
            {recommendation && (
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${riskPalette[result.overallLevel].tone}`}>
                  {recommendation.headline}
                </h3>
                <p className="text-sm text-slate-600">{recommendation.body}</p>
                <div className="flex flex-wrap gap-3">
                  {recommendation.actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.to)}
                      className="btn btn-secondary inline-flex items-center gap-2 text-xs"
                    >
                      {action.label}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h3 className="text-base font-semibold text-slate-800">What these scores mean</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <strong className="font-semibold text-slate-700">PHQ-9</strong> screens for depressive tone. Scores 0–4 are within expected range, 5–14 suggest moderate strain, and 15+ indicate high distress.
              </li>
              <li>
                <strong className="font-semibold text-slate-700">GAD-7</strong> captures anxiety patterns. Scores 0–5 are typical, 6–14 show moderate tension, and 15+ highlight high anxiety.
              </li>
              <li>
                <strong className="font-semibold text-slate-700">Your data stay local.</strong> We store the alias-only summary in your browser. Share it with clinicians only if you choose.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const SurveyQuestion = ({ index, total, question, questionKey, value, onSelect }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-500">
            Q{index} of {total}
          </p>
          <p className="text-base font-semibold text-gray-900">{question}</p>
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

const ScoreTile = ({ title, score, max, level }) => {
  const palette = riskPalette[level];
  const Icon = palette.icon;
  return (
    <div className={`rounded-2xl border ${palette.border} bg-white/90 p-4 shadow-soft`}> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{score} / {max}</p>
        </div>
        <Icon className={`h-8 w-8 ${palette.tone}`} />
      </div>
      <span className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${palette.badge}`}>
        {level} risk
      </span>
    </div>
  );
};

export default Screening;
