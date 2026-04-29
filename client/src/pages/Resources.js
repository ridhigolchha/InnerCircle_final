import React from 'react';
import {
  Heart,
  Music,
  Puzzle,
  BookMarked,
  Search,
  Filter,
  PlayCircle,
  Headphones,
  ExternalLink
} from 'lucide-react';

const Resources = () => {
  const resourceSections = [
    {
      id: 'relaxation-guides',
      title: 'Relaxation Guides',
      description: 'Guided breathing, mindfulness scripts, and grounding routines to help you reset.',
      icon: Heart,
      accent: 'bg-rose-100 text-rose-600',
      items: [
        {
          label: 'Guided breathing audio set',
          description: 'Follow immersive breathing sessions curated by Inner Circle mentors.',
          url: 'https://www.youtube.com/watch?v=SEfs5TJZ6Nk'
        },
        {
          label: 'Mindful moments journal prompts',
          description: 'Download prompts that anchor your reflections in calm and gratitude.',
          url: 'https://www.mindful.org/15-mindfulness-journal-prompts-to-keep-you-centered/'
        }
      ]
    },
    {
      id: 'music-therapy',
      title: 'Music Therapy',
      description: 'Curated soundscapes and playlists matched to mood, focus, and relaxation goals.',
      icon: Music,
      accent: 'bg-blue-100 text-blue-600',
      items: [
        {
          label: 'Lo-fi focus sessions',
          description: 'Hand-picked beats to help you stay grounded while you study or create.',
          url: 'https://open.spotify.com/playlist/37i9dQZF1DX2sUQwD7tbmL'
        },
        {
          label: 'Sleep & unwind melodies',
          description: 'Gentle ambient tracks to calm the nervous system before bedtime.',
          url: 'https://www.youtube.com/watch?v=MkNeIUgNPQ8'
        },
        {
          label: 'Confidence boosting affirmations',
          description: 'Daily mantras voiced by therapists to reinforce self-belief.',
          url: 'https://insighttimer.com/insighttimer/playlist/positive-affirmations-for-confidence'
        }
      ]
    },
    {
      id: 'gamified-activities',
      title: 'Gamified Activities',
      description: 'Interactive challenges that build resilience, gratitude, and emotional regulation skills.',
      icon: Puzzle,
      accent: 'bg-violet-100 text-violet-600',
      items: [
        {
          label: 'Zen puzzle flow',
          description: 'Play a calming block puzzle that encourages steady breathing and focus.',
          url: 'https://poki.com/en/g/zen-blocks'
        },
        {
          label: 'Affirmation typing quest',
          description: 'Type uplifting words to guide your character through a mindful adventure.',
          url: 'https://www.typingclub.com/sportal/program-3.game'
        },
        {
          label: 'Gratitude badge builder',
          description: 'Earn digital badges by completing quick gratitude quests and reflection prompts.',
          url: 'https://www.superbetter.com/'
        }
      ]
    },
    {
      id: 'mini-library',
      title: 'Mini Library',
      description: 'Short reads, printable worksheets, and expert-backed toolkits for your mental wellness journey.',
      icon: BookMarked,
      accent: 'bg-emerald-100 text-emerald-600',
      items: [
        {
          label: 'How We Learn — Benedict Carey',
          description: 'Discover science-backed techniques to retain information and build resilience in your studies.',
          url: 'https://www.goodreads.com/book/show/20926087-how-we-learn'
        },
        {
          label: 'Atomic Habits — James Clear',
          description: 'Micro-habits that help you engineer supportive routines for emotional wellbeing.',
          url: 'https://jamesclear.com/atomic-habits'
        },
        {
          label: 'Self-Compassion — Dr. Kristin Neff',
          description: 'Practical exercises to build self-kindness and mindful emotional coping.',
          url: 'https://self-compassion.org/book/'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">
            Discover the right support for every moment inside Inner Circle’s curated wellness hub.
          </p>
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guided practices, playlists, worksheets…"
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button className="btn btn-secondary inline-flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resourceSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} id={section.id} className="card h-full">
              <div className="flex items-start gap-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${section.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item.label} className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="mt-2 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-primary-400"></span>
                        <div>
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700"
                            >
                              {item.label}
                              <ExternalLink className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                          ) : (
                            <span className="font-medium text-gray-700">{item.label}</span>
                          )}
                          {item.description && (
                            <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button className="btn btn-secondary text-xs">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Try now
                    </button>
                    <button className="btn btn-ghost text-xs">
                      <Headphones className="mr-2 h-4 w-4" />
                      Save for later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Resources;
