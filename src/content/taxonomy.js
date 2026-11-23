// Content taxonomy shared by the site, the import pipeline and the content
// checks. Add a category here only when no existing one fits: the AI import
// step must pick from this list first.

export const categories = [
  { id: 'fundamentals', en: 'Badminton Fundamentals', zh: '羽毛球基础' },
  { id: 'technical-training', en: 'Technical Training', zh: '技术训练' },
  { id: 'footwork-movement', en: 'Footwork & Movement', zh: '步法与移动' },
  { id: 'tactical-analysis', en: 'Tactical Analysis', zh: '战术分析' },
  { id: 'match-analysis', en: 'Match Analysis', zh: '比赛复盘' },
  { id: 'singles-strategy', en: 'Singles Strategy', zh: '单打策略' },
  { id: 'doubles-strategy', en: 'Doubles Strategy', zh: '双打策略' },
  { id: 'training-drills', en: 'Training Drills', zh: '训练方法' },
  { id: 'coaching-insights', en: 'Coaching Insights', zh: '教练心得' },
  { id: 'professional-competition', en: 'Professional Competition', zh: '赛事集锦' },
];

// Topic collections. A collection only shows on the site once it holds at
// least `minVideos` published videos, so thin topics stay hidden.
export const collections = [
  {
    id: 'footwork-guide',
    en: 'Complete Footwork Guide',
    zh: '步法完全指南',
    blurb: 'Movement patterns and the conditioning that keeps them sharp late in a match.',
    minVideos: 2,
  },
  {
    id: 'backcourt-attack-defence',
    en: 'Backcourt Attack & Defence',
    zh: '后场攻防',
    blurb: 'Generate power from the rear court, then absorb it when the shuttle comes back.',
    minVideos: 2,
  },
  {
    id: 'advanced-receiving',
    en: 'Advanced Receiving Techniques',
    zh: '进阶接发球',
    blurb: 'Reading the serve and taking the first attacking touch.',
    minVideos: 2,
  },
  {
    id: 'singles-tactical-system',
    en: 'Singles Tactical System',
    zh: '单打战术体系',
    blurb: 'How rallies are built and won in singles.',
    minVideos: 2,
  },
  {
    id: 'match-analysis-collection',
    en: 'Match Analysis Collection',
    zh: '比赛复盘合集',
    blurb: 'Full matches broken down rally by rally.',
    minVideos: 2,
  },
];

export const levels = {
  all: { en: 'All levels', zh: '全阶段' },
  beginner: { en: 'Beginner', zh: '入门' },
  intermediate: { en: 'Intermediate', zh: '进阶' },
  advanced: { en: 'Advanced', zh: '高阶' },
};

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
export const collectionById = Object.fromEntries(collections.map((c) => [c.id, c]));
