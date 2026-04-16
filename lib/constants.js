export const COLUMNS = [
  { id: 'inbox', title: 'Inbox', color: '#0d9488', icon: 'Inbox' },
  { id: 'indexed', title: 'Index', color: '#7c3aed', icon: 'BookOpen' },
  { id: 'inspect', title: 'Inspect', color: '#d97706', icon: 'Search' },
  { id: 'implement', title: 'Implement', color: '#ea580c', icon: 'Rocket' },
  { id: 'done', title: 'Done', color: '#16a34a', icon: 'CheckCircle' },
];

export const SOURCE_ICONS = {
  text: 'Type',
  voice: 'Mic',
  image: 'Image',
  link: 'Link',
  manual: 'FileText',
};

export const SENTIMENT_COLORS = {
  positive: 'text-green-500',
  neutral: 'text-slate-400',
  negative: 'text-red-400',
};

export const SOURCE_LABELS = {
  text: 'Text',
  voice: 'Voice Note',
  image: 'Image',
  link: 'Link',
  manual: 'Manual',
};

export const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', color: 'bg-green-100 text-green-700' },
  neutral: { label: 'Neutral', color: 'bg-slate-100 text-slate-600' },
  negative: { label: 'Negative', color: 'bg-red-100 text-red-700' },
};
