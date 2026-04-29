import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MessageCircle,
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  Heart,
  Brain,
  Shield,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    appointments: 0,
    chatSessions: 0,
    resourcesViewed: 0,
    forumPosts: 0
  });
  const [showMoodCheck, setShowMoodCheck] = useState(false);

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Get immediate mental health support',
      icon: MessageCircle,
      href: '/chat',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Book Appointment',
      description: 'Schedule with a counselor',
      icon: Calendar,
      href: '/appointments',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Browse Resources',
      description: 'Access mental health resources',
      icon: BookOpen,
      href: '/resources',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Join Forum',
      description: 'Connect with peer support',
      icon: Users,
      href: '/forum',
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  const recentActivities = [
    {
      type: 'chat',
      title: 'AI Chat Session',
      description: 'Completed a 15-minute chat session',
      time: '2 hours ago',
      icon: MessageCircle,
      href: '/chat'
    },
    {
      type: 'appointment',
      title: 'Appointment Scheduled',
      description: 'Meeting with Dr. Smith on Friday',
      time: '1 day ago',
      icon: Calendar,
      href: '/appointments'
    },
    {
      type: 'resource',
      title: 'Resource Viewed',
      description: 'Watched "Managing Anxiety" video',
      time: '2 days ago',
      icon: BookOpen,
      href: '/resources'
    }
  ];

  const wellnessTips = [
    {
      title: 'Practice Deep Breathing',
      description: 'Take 5 deep breaths when feeling stressed',
      icon: Heart,
      url: 'https://www.headspace.com/mindfulness/deep-breathing'
    },
    {
      title: 'Stay Connected',
      description: 'Reach out to friends and family regularly',
      icon: Users,
      url: 'https://www.nami.org/Blogs/NAMI-Blog/July-2019/Why-Connecting-with-Others-is-Good-for-Your-Mental-Health'
    },
    {
      title: 'Mindful Moments',
      description: 'Build mindful pauses into your day to reset and refocus.',
      icon: Brain,
      url: 'https://www.mindful.org/mindfulness-how-to-do-it/'
    }
  ];

  const heroPracticeLinks = [
    {
      label: 'Breathing reset • 2 min',
      href: '/resources#relaxation-guides'
    },
    {
      label: 'Mood log • Guided prompts',
      href: '/resources#gamified-activities'
    }
  ];

  useEffect(() => {
    if (user) {
      setShowMoodCheck(true);
    }
  }, [user?.id, user?._id, user?.email]);

  const handleMoodResponse = (isPositive) => {
    setShowMoodCheck(false);
    if (isPositive) {
      navigate('/resources#relaxation-guides');
    } else {
      navigate('/chat');
      setTimeout(() => {
        navigate('/forum');
      }, 200);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {showMoodCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-500">Inner Circle check-in</p>
              <h2 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.alias || 'friend'}!</h2>
              <p className="text-sm text-gray-600">How is your day going right now?</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleMoodResponse(true)}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                I'm feeling okay
              </button>
              <button
                type="button"
                onClick={() => handleMoodResponse(false)}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-soft transition hover:-translate-y-0.5 hover:bg-rose-100"
              >
                Not really
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMoodCheck(false)}
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <section className="card gradient-bg text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-5">
            <span className="section-label bg-white/20 text-white">Inner Circle Dashboard</span>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {user?.alias || 'Inner Circle Member'}!</h1>
            <p className="max-w-xl text-sm text-primary-50">
              How are you feeling today? Take a moment to check-in, explore calming practices, or reach out to your support circle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/chat" className="btn btn-secondary bg-white/95 text-primary-700">
                <MessageCircle className="h-4 w-4" />
                Start mindful chat
              </Link>
              <Link to="/appointments" className="btn btn-ghost text-white">
                <Calendar className="h-4 w-4" />
                Schedule time with a guide
              </Link>
            </div>
          </div>
          <div className="relative isolate overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
            <div className="flex items-start justify-between text-left">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary-100">Mood snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Take a mindful pause</h2>
              </div>
              <Heart className="h-10 w-10 text-primary-100" />
            </div>
            <p className="mt-4 text-sm text-primary-50">
              Try a 2-minute breathing reset or share a reflection with your accountability circle.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-primary-100">
              {heroPracticeLinks.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center transition hover:bg-white/20"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <div>
          <span className="section-label">Quick actions</span>
          <h2 className="page-heading mt-2 text-2xl">Your mindful control center</h2>
          <p className="page-subheading mt-1">Tap into the tools you need in a single click.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="card group h-full bg-white/95"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shadow-soft ${action.color} bg-opacity-90`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className={`h-5 w-5 ${action.textColor} transition-transform duration-200 group-hover:translate-x-1`} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Activity Overview */}
      <section className="space-y-4">
        <div>
          <span className="section-label">Pulse check</span>
          <h2 className="page-heading mt-2 text-2xl">Your current activity</h2>
          <p className="page-subheading mt-1">Stay close to your progress across Inner Circle.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/chat" className="card hover:-translate-y-1 transition-transform">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg bg-blue-100">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.chatSessions}</p>
                <p className="text-sm text-gray-600">Chat Sessions</p>
              </div>
            </div>
          </Link>

          <Link to="/appointments" className="card hover:-translate-y-1 transition-transform">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.appointments}</p>
                <p className="text-sm text-gray-600">Appointments</p>
              </div>
            </div>
          </Link>

          <Link to="/resources" className="card hover:-translate-y-1 transition-transform">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.resourcesViewed}</p>
                <p className="text-sm text-gray-600">Resources Viewed</p>
              </div>
            </div>
          </Link>

          <Link to="/forum" className="card hover:-translate-y-1 transition-transform">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.forumPosts}</p>
                <p className="text-sm text-gray-600">Forum Posts</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <Link
                  key={index}
                  to={activity.href}
                  className="flex items-center rounded-xl border border-transparent px-2 py-1 transition hover:border-primary-100 hover:bg-primary-50/40"
                >
                  <div className="p-2 rounded-lg bg-gray-100 mr-3">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Wellness Tips */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Wellness Tips</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-4">
            {wellnessTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <a
                  key={index}
                  href={tip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start rounded-xl border border-transparent px-2 py-1 transition hover:border-primary-100 hover:bg-primary-50/40"
                >
                  <div className="p-2 rounded-lg bg-green-100 mr-3 mt-1">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                    <p className="text-xs text-gray-600">{tip.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Emergency Resources */}
      <section className="card bg-gradient-to-br from-red-50 via-white to-white border-red-100">
        <div className="flex items-center mb-3">
          <Shield className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-800">Emergency Resources</h3>
        </div>
        <p className="text-sm text-red-700 mb-4">
          If you're experiencing a mental health crisis, please reach out for immediate help.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="tel:988" className="bg-white p-3 rounded-lg transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="font-semibold text-gray-900">Crisis Hotline</p>
            <p className="text-lg text-red-600 font-mono">988</p>
          </a>
          <a href="tel:911" className="bg-white p-3 rounded-lg transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="font-semibold text-gray-900">Emergency</p>
            <p className="text-lg text-red-600 font-mono">911</p>
          </a>
          <a href="sms:741741" className="bg-white p-3 rounded-lg transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="font-semibold text-gray-900">Text Crisis</p>
            <p className="text-sm text-red-600">Text HOME to 741741</p>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
