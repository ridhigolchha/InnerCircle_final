import React, { useState } from 'react';
import {
  MessageCircle,
  Plus,
  Filter,
  Sparkles,
  Star,
  Clock,
  Phone,
  Video,
  MessageSquare
} from 'lucide-react';

const Forum = () => {
  const volunteerDesk = {
    name: 'Inner Circle Volunteers',
    role: 'Peer Support Desk',
    status: 'Online',
    badges: ['General Support', 'Quick Check-ins']
  };

  const supporterFilters = [
    'All Specializations',
    'Anxiety Support',
    'Grief & Loss',
    'Academic Stress',
    'Identity & Belonging'
  ];

  const peerSupporters = [
    {
      name: 'Sarah Chen',
      role: 'Psychology Senior • Peer Listener',
      status: 'Online',
      specialization: 'Anxiety regulation, Mindful study habits',
      rating: 4.9,
      responseTime: '< 10 mins',
      sessions: 54,
      badges: ['Social Anxiety', 'Burnout Recovery'],
      chatUrl: 'https://www.togetherall.com/en-us/'
    },
    {
      name: 'Marcus Iyer',
      role: 'Clinical Psychology Intern',
      status: 'Online',
      specialization: 'Confidence building, Peer accountability',
      rating: 4.7,
      responseTime: '< 15 mins',
      sessions: 38,
      badges: ['Self-Esteem', 'Habit Formation'],
      chatUrl: 'https://www.7cups.com/listener/'
    },
    {
      name: 'Aisha Rahman',
      role: 'Counseling Psych Student',
      status: 'Away',
      specialization: 'Grief processing, Cultural wellbeing',
      rating: 4.8,
      responseTime: '< 30 mins',
      sessions: 62,
      badges: ['Grief & Loss', 'Identity Support'],
      chatUrl: 'https://www.supportiv.com/'
    },
    {
      name: 'Leo Martinez',
      role: 'Student Wellness Guide',
      status: 'Offline',
      specialization: 'Mindfulness practice, Exam stress',
      rating: 4.6,
      responseTime: '< 1 hr',
      sessions: 47,
      badges: ['Mindfulness', 'Exam Prep'],
      chatUrl: 'https://talklife.co/'
    }
  ];

  const sampleThreadMessages = [
    {
      sender: 'supporter',
      text: 'Hey, thanks for reaching out today! What kind of support would feel most helpful right now?',
      time: '2:24 PM'
    },
    {
      sender: 'student',
      text: "Hi! I’m feeling overwhelmed about exams and would love some grounding tips.",
      time: '2:25 PM'
    },
    {
      sender: 'supporter',
      text: 'Got it. Let’s take a deep breath together. Want to try a 3-2-1 check-in?',
      time: '2:25 PM'
    }
  ];

  const [chatOpen, setChatOpen] = useState(false);
  const [activeSupporter, setActiveSupporter] = useState(volunteerDesk);
  const [chatMessages, setChatMessages] = useState(sampleThreadMessages);
  const [draftMessage, setDraftMessage] = useState('');

  const openChatWith = (supporter) => {
    setActiveSupporter(supporter || volunteerDesk);
    setChatMessages(sampleThreadMessages);
    setDraftMessage('');
    setChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!draftMessage.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      { sender: 'student', text: draftMessage.trim(), time: timestamp },
      {
        sender: 'supporter',
        text: 'Thanks for sharing that. Let’s break it down together—what’s one small win we can go after next?',
        time: timestamp
      }
    ]);
    setDraftMessage('');
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peer Support Lounge</h1>
          <p className="text-gray-600">
            Connect with trained student volunteers for conversations that are empathetic, confidential, and empowering.
          </p>
        </div>
        <a
          className="btn btn-primary"
          href="https://www.typeform.com/templates/t/community-feedback-form/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </a>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
              <Sparkles className="h-3 w-3" />
              Verified student volunteers
            </div>
            <h2 className="mt-3 text-xl font-semibold text-gray-900">Find a supporter who aligns with your needs</h2>
            <p className="text-sm text-gray-600">
              Browse by name, specialization, or availability to match with psychology students trained in peer support.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="btn btn-primary inline-flex items-center justify-center gap-2"
              onClick={() => openChatWith(volunteerDesk)}
            >
              <MessageCircle className="h-4 w-4" />
              Start volunteer chat
            </button>
            <a
              className="btn btn-secondary inline-flex items-center justify-center gap-2"
              href="https://www.togetherall.com/en-us/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Filter className="h-4 w-4" />
              Explore all rooms
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">How peer support works</h2>
            <p className="text-sm text-gray-600">Connect • Talk • Grow together with Inner Circle.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-primary-50/80 p-4 text-center">
              <MessageSquare className="mx-auto h-6 w-6 text-primary-600" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Connect</h3>
              <p className="mt-1 text-xs text-gray-600">Browse and select a peer supporter who matches your needs.</p>
            </div>
            <div className="rounded-xl bg-primary-50/60 p-4 text-center">
              <MessageCircle className="mx-auto h-6 w-6 text-primary-600" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Talk</h3>
              <p className="mt-1 text-xs text-gray-600">Have confidential conversations via chat, voice, or video.</p>
            </div>
            <div className="rounded-xl bg-primary-50/40 p-4 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-primary-600" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Grow</h3>
              <p className="mt-1 text-xs text-gray-600">Receive guidance, grounding routines, and practical coping strategies.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Find your peer supporter</h2>
            <p className="text-sm text-gray-600">Search by name or specialization to connect instantly.</p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by name or topic..."
                className="w-full rounded-xl border border-gray-200 bg-white/80 py-2.5 pl-4 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <select className="rounded-xl border border-gray-200 bg-white/80 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200">
              {supporterFilters.map((filter) => (
                <option key={filter}>{filter}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {peerSupporters.map((supporter) => (
            <div key={supporter.name} className="rounded-2xl border border-primary-100 bg-primary-50/40 p-5 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary-500 text-lg font-semibold">
                      {supporter.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{supporter.name}</h3>
                      <p className="text-xs text-gray-500">{supporter.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{supporter.specialization}</p>
                  <div className="flex flex-wrap gap-2">
                    {supporter.badges.map((badge) => (
                      <span key={badge} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-600">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <span className={`h-2 w-2 rounded-full ${supporter.status === 'Online' ? 'bg-emerald-500' : supporter.status === 'Away' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                    {supporter.status}
                  </span>
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <Star className="h-4 w-4 text-amber-400" />
                    {supporter.rating} rating
                  </span>
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <Clock className="h-4 w-4 text-primary-500" />
                    response {supporter.responseTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    {supporter.sessions} sessions held
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openChatWith(supporter)}
                  className="btn btn-primary text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </button>
                <a
                  href={supporter.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-xs"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
                <a
                  href={supporter.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-xs"
                >
                  <Video className="h-4 w-4" />
                  Video
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Featured live threads</h2>
            <p className="text-sm text-gray-600">Join a student-led topic or explore more peer-led resources.</p>
          </div>
          <a
            className="btn btn-ghost text-sm"
            href="https://www.psychologytoday.com/us/groups"
            target="_blank"
            rel="noopener noreferrer"
          >
            View all spaces
          </a>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              title: 'Mindful Mondays circle',
              host: 'Hosted by Peer Mentor Janae',
              time: 'Live • 38 listeners',
              url: 'https://www.headspace.com/meditation/meditation-for-students'
            },
            {
              title: 'Creative coping studio',
              host: 'Led by Wellness Coach Amir',
              time: 'New posts • 14 replies',
              url: 'https://positivepsychology.com/art-therapy-activities/'
            },
            {
              title: 'Late night check-in lounge',
              host: 'Facilitated by Student Support Team',
              time: 'Open now • Drop in anytime',
              url: 'https://www.nightline.ac.uk/'
            }
          ].map((thread) => (
            <a
              key={thread.title}
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <h3 className="text-sm font-semibold text-gray-900">{thread.title}</h3>
              <p className="text-xs text-gray-600">{thread.host}</p>
              <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-600">
                <MessageCircle className="h-3 w-3" />
                {thread.time}
              </span>
            </a>
          ))}
        </div>
      </div>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-primary-50/60 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{activeSupporter.name}</p>
                <p className="text-xs text-gray-500">{activeSupporter.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-600 shadow-sm"
              >
                Close
              </button>
            </div>
            <div className="space-y-1 border-b border-gray-100 bg-white px-5 py-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                <span className={`h-2 w-2 rounded-full ${activeSupporter.status === 'Offline' ? 'bg-gray-400' : activeSupporter.status === 'Away' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                {activeSupporter.status || 'Online'}
              </span>
              {activeSupporter.badges && (
                <div className="flex flex-wrap gap-2">
                  {activeSupporter.badges.map((badge) => (
                    <span key={badge} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="max-h-96 space-y-3 overflow-y-auto bg-slate-50 px-5 py-4">
              {chatMessages.map((message, idx) => (
                <div key={`${message.time}-${idx}`} className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      message.sender === 'student'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span
                      className={`mt-1 block text-[10px] ${
                        message.sender === 'student' ? 'text-primary-100' : 'text-gray-400'
                      }`}
                    >
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white px-5 py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-inner">
                <textarea
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  onKeyDown={handleDraftKeyDown}
                  rows={2}
                  placeholder="Type a supportive message..."
                  className="flex-1 resize-none border-none text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="btn btn-primary text-xs"
                >
                  Send
                </button>
              </div>
              <p className="mt-2 text-[11px] text-gray-400">This is a demo chat experience to preview volunteer conversations.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
