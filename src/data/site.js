// Single source for the site's content. Every fact here comes from the
// original pages; edit it here and every page picks it up.

export const profile = {
  name: 'Colin Zhou',
  brand: 'Colin Badminton',
  tagline: 'National Champion & Professional Coach',
  summary:
    "2023 CCAA Men's Singles National Champion, former Sichuan Provincial Team player and senior badminton coach.",
};

export const contact = {
  phoneDisplay: '+1 647 655 6636',
  phoneHref: 'tel:+16476556636',
  email: 'zhoukeyu123456@gmail.com',
  whatsapp: 'https://wa.me/16476556636',
  wechatId: 'ColinZhouzky',
  instagram: 'https://www.instagram.com/zhou.keyu.5',
  youtube: 'https://www.youtube.com/@zhoukeyu9105',
  x: 'https://x.com/Colin_Tesla999T',
};

export const socials = [
  { name: 'YouTube', icon: 'youtube', href: contact.youtube },
  { name: 'Instagram', icon: 'instagram', href: contact.instagram },
  { name: 'WhatsApp', icon: 'whatsapp', href: contact.whatsapp },
  { name: 'X', icon: 'x', href: contact.x },
];

export const competition = [
  {
    icon: 'trophy',
    title: 'CCAA Champion',
    text: "Men's Singles Champion in Canadian Collegiate Athletic Association",
  },
  {
    icon: 'medal',
    title: 'OCAA Champion',
    text: "Men's Singles Champion in Ontario Collegiate Athletic Association",
  },
  {
    icon: 'star',
    title: 'Provincial Team Member',
    text: 'Former Sichuan Provincial Team Player',
  },
  {
    icon: 'medal',
    title: 'Youth Champion',
    text: 'Multiple-time Sichuan Province Youth Badminton Champion',
  },
];

// Headline numbers, as shown on the original Career Statistics panel
export const careerStats = [
  { value: '1st', label: 'CCAA National Ranking' },
  { value: '2023', label: 'National Champion' },
  { value: 'OCAA', label: 'Player of the Year' },
  { value: '10+', label: 'Major Championships' },
];

export const honours = [
  { icon: 'trophy', label: 'CCAA Champion' },
  { icon: 'medal', label: 'OCAA Player of the Year' },
  { icon: 'medal', label: 'China Provincial Champion' },
  { icon: 'star', label: 'Badminton Competitor' },
  { icon: 'whistle', label: 'High Performance Coach' },
];

export const coaching = [
  {
    title: 'Professional Coaching in Canada',
    points: ['Over 5 years of coaching experience', 'Trained 10+ Canadian National level players (U13-U19)'],
  },
  {
    title: 'High-Level Club Coach',
    points: ['Senior coach at provincial badminton clubs'],
  },
  {
    title: 'Olympic Training Experience',
    points: ['Participated in training with multiple Canadian Olympic athletes'],
  },
];

export const teaching = [
  { title: 'Bilingual Instruction', text: 'Professional coaching in both English and Chinese' },
  { title: 'Detailed Analysis', text: 'Thorough analysis of student strengths and areas for improvement' },
  { title: 'Continuous Support', text: 'Post-lesson feedback and development planning' },
];

export const methodology = [
  {
    title: 'Technical Foundation',
    text: 'Mastering proper technique is essential before building speed and power.',
  },
  {
    title: 'Tactical Awareness',
    text: 'Understanding game strategy and developing court awareness and decision-making.',
  },
  {
    title: 'Physical Conditioning',
    text: 'Building the strength, speed, and endurance needed for competitive play.',
  },
  {
    title: 'Mental Toughness',
    text: 'Developing focus, resilience, and competitive mindset for match play.',
  },
];

export const gallery = [
  {
    src: '/media/national-champion.webp',
    width: 933,
    height: 1400,
    title: 'CCAA National Champion',
    text: "2023 Men's Singles National Champion",
  },
  {
    src: '/media/champion-banner.webp',
    width: 1050,
    height: 1400,
    title: 'Championship Banner',
    text: 'CCAA National Championship Victory Celebration',
  },
  {
    src: '/media/frontcourt.webp',
    width: 639,
    height: 960,
    title: 'Match Play',
    text: 'Competitive Match Performance',
  },
  {
    src: '/media/jump-smash.webp',
    width: 1170,
    height: 775,
    title: 'Tournament Action',
    text: 'Jump Smash at National Championships',
  },
  {
    src: '/media/ocaa-awards.webp',
    width: 1400,
    height: 1050,
    title: 'OCAA Awards',
    text: 'Player of the Year & Regional All-Star Awards',
  },
  {
    src: '/media/ocaa-ceremony.webp',
    width: 863,
    height: 1400,
    title: 'OCAA Ceremony',
    text: 'Ontario Colleges Athletic Association Awards',
  },
  {
    src: '/media/coach-poster.webp',
    width: 1050,
    height: 1400,
    title: 'Professional Profile',
    text: 'Senior Badminton Coach & National Champion',
  },
];

const thumb = (name) => `/media/thumbs/${name}.webp`;

// orientation: 'portrait' videos are YouTube Shorts and play in a 9:16 frame
export const highlightVideos = [
  {
    id: '1CkIzrksj0A',
    poster: thumb('colin_national_championships'),
    title: 'National Championships',
    description: 'Final Match Highlights',
    category: 'tournaments',
    orientation: 'landscape',
    featured: true,
  },
  {
    id: 'YVRk2iWuBOw',
    poster: thumb('colin-vs-zeng'),
    title: 'Colin vs Zeng',
    description: 'Match Highlights',
    category: 'matches',
    orientation: 'portrait',
    featured: true,
  },
  {
    id: 'CMH451dTCNk',
    poster: thumb('colin-vs-timthy'),
    title: 'Ontario Provincial Championships',
    description: 'Colin vs Timothy',
    category: 'tournaments',
    orientation: 'landscape',
  },
  {
    id: 'Hu3xOCKEbjw',
    poster: thumb('colin-vs-nando'),
    title: 'Colin vs Nando',
    description: 'Match Highlights',
    category: 'matches',
    orientation: 'landscape',
  },
  {
    id: 'UaDET-_M6js',
    poster: thumb('colin-vs-nando_long'),
    title: 'Colin vs Nando',
    description: 'Match Highlights Long Rallies',
    category: 'matches',
    orientation: 'landscape',
  },
  {
    id: 'WdCB34lKKVk',
    poster: thumb('national-footwork-drills'),
    title: 'National Team Footwork Drills',
    description: '10-minute follow-along, 25 moves x 30 seconds',
    category: 'training',
    orientation: 'portrait',
  },
  {
    id: 'UsTh8U0_ffc',
    poster: thumb('duo-footwork'),
    title: 'Partner Footwork Training',
    description: 'Net drops and four-corner random footwork',
    category: 'training',
    orientation: 'portrait',
  },
  {
    id: 'dI1U_dgleu8',
    poster: thumb('national-footwork-drills-en'),
    title: 'National Team Footwork Drills (English)',
    description: '10-minute follow-along with English captions and chapters',
    category: 'training',
    orientation: 'portrait',
  },
  {
    id: 'tvgGtUctUI0',
    poster: thumb('duo-footwork-en'),
    title: 'Partner Footwork Training (English)',
    description: 'Net drops and random four corners, English captions',
    category: 'training',
    orientation: 'portrait',
  },
  {
    id: 'ngrFS5SLl7I',
    poster: thumb('1v2-cardio'),
    title: '1 vs 2 Conditioning',
    description: 'One player covering the court against two',
    category: 'training',
    orientation: 'landscape',
  },
  {
    id: 'qp2OHq-Xge8',
    poster: thumb('smash-meme'),
    title: 'Just Smash It',
    description: 'Smash highlight',
    category: 'training',
    orientation: 'landscape',
  },
  {
    id: 'laZyef7no78',
    poster: thumb('colin-vs-dimas1'),
    title: 'Training Highlights',
    description: 'Professional Practice Session',
    category: 'training',
    orientation: 'landscape',
  },
  {
    id: 'vRJTBx98Baw',
    poster: thumb('colin-vs-dimas2'),
    title: 'Training Highlights',
    description: 'Match Highlights',
    category: 'training',
    orientation: 'landscape',
  },
  {
    id: 'Tt-EQAx54V0',
    poster: thumb('colinprovincial'),
    title: 'OCAA Highlights',
    description: 'Ontario College Athletic Association Championship',
    category: 'tournaments',
    orientation: 'portrait',
  },
  {
    id: 'IyPrqtoeZDs',
    poster: thumb('colin-vs-tim1'),
    title: 'OCAA Finals',
    description: 'Ontario College Athletic Association Championship',
    category: 'tournaments',
    orientation: 'portrait',
  },
  {
    id: '9JoS7zQrpWo',
    poster: thumb('colin-vs-tim2'),
    title: 'OCAA Finals',
    description: 'Ontario College Athletic Association Championship',
    category: 'tournaments',
    orientation: 'portrait',
  },
  {
    id: 'vc_P6Hc_s0s',
    poster: thumb('colin-vs-tim3'),
    title: 'OCAA Finals',
    description: 'Highlights',
    category: 'tournaments',
    orientation: 'portrait',
  },
];

export const trainingVideos = [
  {
    id: 'jfyaLvh-0Nc',
    poster: thumb('footworks'),
    title: 'Footwork Drills',
    description: 'Essential movement patterns for court coverage',
    orientation: 'landscape',
  },
  {
    id: 'XpX97WJzGpw',
    poster: thumb('colin-vs-mattew1'),
    title: 'Smash Technique',
    description: 'Power and precision in overhead attacks',
    orientation: 'landscape',
  },
  {
    id: 'lWfaT717nis',
    poster: thumb('colin-vs-mj2'),
    title: 'Defensive Skills',
    description: 'Blocking and returning powerful shots',
    orientation: 'landscape',
  },
  {
    id: 'dGH-9FRz5ko',
    poster: thumb('colin-vs-mj3'),
    title: 'Net Play',
    description: 'Control and finesse at the front court',
    orientation: 'landscape',
  },
  {
    id: 'awVeUT3e5v0',
    poster: thumb('colin-vs-mj5'),
    title: 'Fitness Conditioning',
    description: 'Building stamina and strength for badminton',
    orientation: 'landscape',
  },
];

export const videoCategories = [
  { id: 'all', label: 'All videos' },
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'matches', label: 'Matches' },
  { id: 'training', label: 'Training' },
];

/*
 * Structured views of the facts above, used by the redesigned pages.
 * Nothing new is claimed here: every line restates a fact already on the site
 * (competition, careerStats, honours, coaching, gallery captions) or one Colin
 * confirmed (men's singles with the Sichuan Provincial Team).
 */

// Hero credential rail
export const credentials = [
  { value: '2023', label: "CCAA Men's Singles National Champion" },
  { value: 'OCAA', label: "Men's Singles Champion · Player of the Year" },
  { value: 'Sichuan', label: "Former Provincial Team · Men's Singles" },
  { value: '5+ yrs', label: 'Coaching in Canada' },
];

// Career path, from the Sichuan system to Canadian titles and coaching
export const trajectory = [
  {
    step: '01',
    stage: 'Sichuan, China',
    title: 'Youth champion',
    text: 'Multiple-time Sichuan Province Youth Badminton Champion.',
    image: '/media/frontcourt.webp',
    imageAlt: 'Colin Zhou lunging for a shuttle at the front court',
    width: 639,
    height: 960,
  },
  {
    step: '02',
    stage: 'Sichuan Provincial Team',
    title: "Provincial team · men's singles",
    text: "Competed as a men's singles player for the Sichuan Provincial Team, inside China's professional training system.",
    image: '/media/jump-smash.webp',
    imageAlt: 'Colin Zhou mid-air in a jump smash',
    width: 1170,
    height: 775,
  },
  {
    step: '03',
    stage: 'Ontario, Canada',
    title: 'OCAA Champion & Player of the Year',
    text: "Men's Singles Champion in the Ontario Colleges Athletic Association, with Player of the Year and Regional All-Star awards.",
    image: '/media/ocaa-ceremony.webp',
    imageAlt: 'Colin Zhou receiving an award at the OCAA ceremony',
    width: 863,
    height: 1400,
  },
  {
    step: '04',
    stage: 'Canada · 2023',
    title: 'CCAA National Champion',
    text: "2023 Men's Singles National Champion in the Canadian Collegiate Athletic Association, ranked 1st nationally.",
    image: '/media/national-champion.webp',
    imageAlt: 'Colin Zhou with the 2023 CCAA national championship banner',
    width: 933,
    height: 1400,
  },
  {
    step: '05',
    stage: 'Coaching in Canada',
    title: 'Senior coach',
    text: 'Over 5 years of coaching, 10+ Canadian national-level players trained (U13–U19), and training alongside Canadian Olympic athletes.',
    image: '/media/coach-poster.webp',
    imageAlt: 'Colin Zhou, senior badminton coach, holding his championship medal',
    width: 1050,
    height: 1400,
  },
];

// Competition record, shown as a results table
export const record = [
  { event: "CCAA Men's Singles", result: 'National Champion', level: 'National · Canada', year: '2023', top: true },
  { event: 'CCAA National Ranking', result: '1st', level: 'National · Canada', year: '2023' },
  { event: "OCAA Men's Singles", result: 'Champion', level: 'Provincial · Ontario' },
  { event: 'OCAA Awards', result: 'Player of the Year · Regional All-Star', level: 'Provincial · Ontario' },
  { event: 'Sichuan Provincial Team', result: "Men's singles player", level: 'Provincial · China' },
  { event: 'Sichuan Province Youth', result: 'Multiple-time Champion', level: 'Provincial · China' },
];

// Who the coaching is for (from the Training page copy and coaching record)
export const levels = [
  {
    tag: 'Foundations',
    title: 'Beginners',
    text: 'Master the basics with proper technique first, then build speed and power on top of it.',
  },
  {
    tag: 'Competitive juniors',
    title: 'U13–U19 players',
    text: 'The age range of the 10+ Canadian national-level players Colin has trained.',
  },
  {
    tag: 'Performance',
    title: 'Advanced players',
    text: 'Refine your competitive edge: tactics, decision-making and match toughness.',
  },
];

// Technique topics used to tag and filter teaching videos
export const topics = [
  { id: 'all', label: 'All topics' },
  { id: 'footwork', label: 'Footwork' },
  { id: 'attack', label: 'Smash & attack' },
  { id: 'defence', label: 'Defence' },
  { id: 'net', label: 'Net play' },
  { id: 'conditioning', label: 'Conditioning' },
];

const topicById = {
  'jfyaLvh-0Nc': 'footwork',
  XpX97WJzGpw: 'attack',
  lWfaT717nis: 'defence',
  'dGH-9FRz5ko': 'net',
  awVeUT3e5v0: 'conditioning',
  WdCB34lKKVk: 'footwork',
  UsTh8U0_ffc: 'footwork',
  dI1U_dgleu8: 'footwork',
  tvgGtUctUI0: 'footwork',
  ngrFS5SLl7I: 'conditioning',
  'qp2OHq-Xge8': 'attack',
};

export const topicOf = (video) => topicById[video.id];

// Full teaching library: lesson videos plus the drill videos filed under highlights
export const teachingLibrary = [
  ...trainingVideos,
  ...highlightVideos.filter((v) => v.category === 'training' && topicById[v.id]),
];
