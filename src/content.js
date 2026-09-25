// Everything a visitor reads lives here. Edit, rebuild, done.
//
// featured: true shows the project as a full showcase; the rest sit behind "More work".
// category: 'games' | 'xr' | 'viz'
// shots:    screenshots, in order. The first one is the cover.
// frame:    how portrait shots are shown on the card: 'phone' | 'card'. Omit for landscape shots.
// palette:  [accent, light, deep] — tints the card and the project sheet.
// live:     'flag-fiesta' renders the animated placeholder phone (for projects without captures).
// scene:    optional; stages a featured project as a full product-shot scene (src/components/Scene.jsx):
//           `words` around the phone, three callout `tags`, `colors` and `decor`. Used for Flag Fiesta.
//           Featured projects without it get the standard split layout, tinted by `palette`.

const all = import.meta.glob('./assets/shots/*.{jpg,png,webp}', { eager: true, import: 'default' });
const pick = (prefix) =>
  Object.keys(all)
    .filter((k) => k.split('/').pop().startsWith(prefix + '-'))
    .sort((a, b) => parseInt(a.match(/-(\d+)\./)[1]) - parseInt(b.match(/-(\d+)\./)[1]))
    .map((k) => all[k]);

export const SITE = {
  name: 'Rafael Vitriago',
  title: 'Level Designer, Environment & Technical Artist',
  email: 'rafaelrivero6240@gmail.com',
  location: 'Jaén, Spain',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rafael-alejandro-vitriago-rivero-1987a914a' },
    { label: 'Behance', href: 'https://www.behance.net/rafaelvitriago' },
    { label: 'Upwork', href: 'https://www.upwork.com/freelancers/~012e7d933c7d25c023' },
  ],
};

export const PROJECTS = [
  {
    id: 'idunn',
    featured: true,
    title: 'Ashes of Idunn',
    subtitle: 'Tales of Fimbulwinter',
    kind: 'Level design',
    category: 'games',
    status: 'Shipped',
    platforms: 'Steam',
    role: 'Level and environment designer, lighting artist, Steam publishing',
    summary: 'A third-person action adventure about the start of the Berserker’s journey after tragedy strikes his village. Developed and published by Mad Viking Games on Steam as a glimpse of the franchise to come.',
    shots: pick('idunn'),
    palette: ['#8FE3A0', '#D6F5DC', '#07130D'],
  },
  {
    id: 'flag-fiesta',
    featured: true,
    title: 'Flag Fiesta',
    kind: 'Mobile game',
    category: 'games',
    status: 'In development',
    platforms: 'iOS and Android',
    role: 'Game design, art and technical art',
    summary: 'A fast, colourful flag quiz for phones. Currently in production.',
    shots: pick('flag'),
    frame: 'phone',
    palette: ['#E0508A', '#FFD1E3', '#0B1828'],
    scene: {
      words: ['Know', 'your', 'world'],
      tags: ['Guess or paint flags', 'Places, people & paintings', 'Geography & history trivia'],
      colors: { base: '#1B3452', deep: '#0B1828', glow: '#C2447C' },
      decor: 'bunting',
    },
  },
  {
    id: 'vr',
    featured: true,
    title: 'Mad Viking Games',
    subtitle: 'VR Experience',
    kind: 'Virtual reality',
    category: 'xr',
    status: 'Shipped',
    platforms: 'Steam',
    role: 'Level and environment designer, lighting artist, Steam publishing',
    summary: 'A short, playable VR experience that puts you inside the Viking lifestyle: explore the mead hall, choose a hero and inhabit the world.',
    shots: pick('vr'),
    palette: ['#FFA24C', '#FFE1C2', '#1A0A04'],
  },
  {
    id: 'sugoi',
    featured: true,
    title: 'Sugoi Fruit Fusion Wonders',
    kind: 'Mobile game',
    category: 'games',
    status: 'Shipped',
    platforms: 'Google Play',
    role: '2D artist, programmer, game and economy designer',
    summary: 'A take on the Suika watermelon mechanic with a twist: merge the fruits and watch the score climb. A two-person project covering art, code and economy design.',
    shots: pick('sugoi'),
    frame: 'phone',
    palette: ['#FFC23D', '#FFF0C8', '#3A1C04'],
  },
  {
    id: 'ar',
    featured: true,
    title: 'Mad Viking Games',
    subtitle: 'AR Experience',
    kind: 'Augmented reality',
    category: 'xr',
    status: 'Shipped',
    platforms: 'App Store and Google Play',
    role: 'Environment designer, lighting artist and optimisation',
    summary: 'An app for viewing the upcoming Mad Viking characters in high quality and placing them in the real world through augmented reality.',
    shots: pick('ar'),
    frame: 'phone',
    palette: ['#5ED3A0', '#DDF7EA', '#062019'],
  },
  {
    id: 'kodex',
    title: 'Kodex',
    kind: 'Level design',
    category: 'games',
    status: 'Client work, Azulon Studios',
    platforms: 'Mobile',
    role: 'Level designer and environment artist',
    summary: 'A mobile 2D platformer where every character has a unique ability. Each environment, from lush forests to ancient ruins and industrial depths, was built to show off those abilities.',
    shots: pick('kodex'),
    palette: ['#3FAF84', '#C8EEDA', '#0D1F2A'],
  },
  {
    id: 'vrtour',
    title: 'Múzeum Andreja Sládkoviča',
    subtitle: 'VR Tour',
    kind: 'Virtual reality',
    category: 'xr',
    status: 'Shipped',
    platforms: 'VR headsets',
    role: 'VR technical artist',
    summary: 'A VR tour of the museum in Krupina, Slovakia, telling the story of the town and especially the tunnels beneath its centre. Built in Unreal Engine with photogrammetry.',
    shots: pick('vrtour'),
    palette: ['#C9A77A', '#EEDCC2', '#1A120B'],
  },
  {
    id: 'char',
    title: 'Character Showcase',
    kind: 'Lighting and rendering',
    category: 'viz',
    status: 'Mad Viking Games',
    platforms: 'Unreal Engine 5 renders',
    role: 'Lighting and environment artist',
    summary: 'Video renders introducing future characters of the Mad Viking universe: the druidess, the shield maiden and the frost sorcerer.',
    shots: pick('char'),
    frame: 'card',
    palette: ['#7C93B8', '#DCE4F0', '#0F1622'],
  },
  {
    id: 'archviz',
    title: 'ArchViz in Unreal Engine 5',
    kind: 'Real-time visualisation',
    category: 'viz',
    status: 'Client work',
    platforms: 'Unreal Engine 5, real time',
    role: 'Lighting and environment artist',
    summary: 'A series of apartments built to run in real time, previewing finished complexes for potential buyers. Balancing Lumen quality against performance was key to the final look.',
    shots: pick('archviz'),
    palette: ['#C8A278', '#EFE3D2', '#231A12'],
  },
  {
    id: 'trailer',
    title: 'Ashes of Idunn',
    subtitle: 'Cinematic Trailer',
    kind: 'Cinematics',
    category: 'viz',
    status: 'Mad Viking Games',
    platforms: 'Trailer',
    role: 'Lighting artist',
    summary: 'The trailer that opened the franchise, from burning villages to the towering troll antagonist.',
    shots: pick('trailer'),
    palette: ['#F07A3A', '#FDD2AE', '#1C0A04'],
  },
];

// Hero slideshow: [project id, shot index].
export const HERO = [
  ['idunn', 0], ['trailer', 1], ['vr', 2], ['vrtour', 2], ['archviz', 0],
];

export const STATS = [
  { value: '5+', label: 'Years in the industry' },
  { value: '9+', label: 'Projects shipped' },
  { value: '3', label: 'Studios worked with' },
  { value: '5.0', label: 'Rating on Upwork' },
];

export const DISCIPLINES = [
  {
    icon: 'level',
    title: 'Level design',
    body: 'Spaces that tell the story through their architecture. Every corridor, vista and light source has a job, from blockout and pacing to the final pass.',
    tools: 'Unreal Engine 5, Unity',
  },
  {
    icon: 'environment',
    title: 'Environment art and lighting',
    body: 'Believable places with a point of view: set dressing, materials, Lumen lighting and cinematics that sell the mood.',
    tools: 'Blender, Maya, Substance, ZBrush',
  },
  {
    icon: 'xr',
    title: 'Technical art, AR and VR',
    body: 'Material pipelines, optimisation and performance budgets, so the art survives a phone GPU, a standalone headset or a PCVR build.',
    tools: 'Unreal Engine 5, Unity, Houdini',
  },
];

export const TOOLS = [
  'Unreal Engine 5', 'Unity', 'Blender', 'Maya', 'Houdini',
  'Substance Painter', 'Substance Designer', 'ZBrush', 'Photoshop',
];

export const EXPERIENCE = [
  { when: 'Now', where: 'Freelance', role: 'Level design and 3D generalist', body: 'Level design, environment art and 3D generalist work for games, ArchViz, VR and AR, for studios and clients worldwide.' },
  { when: 'Previously', where: 'ConeCorp', role: 'Technical artist', body: 'Optimised assets, built material pipelines and kept visual fidelity intact from concept to real-time render.' },
  { when: 'Previously', where: 'Mad Viking Games', role: 'Game designer', body: 'Core member of the design team on Ashes of Idunn: level design, environment art, VR and AR experiences, character showcases and the cinematic trailer.' },
];

export const REVIEWS = {
  score: '5.0',
  jobs: '4 completed jobs on Upwork',
  items: [
    { quote: 'Rafael is an amazing contractor and helped us complete our project on time by matching our requirements. I definitely recommend Rafael to anyone for their work!', project: 'Unreal Engine material creation' },
    { quote: 'Nothing extra to add — it just worked as expected. Even went above and beyond by solving some extra issues with GitHub along the way.', project: 'PCVR in UE5' },
    { quote: 'Delivered exactly what was needed for our VR Backrooms game. Solid Unreal developer who understands the brief and executes cleanly.', project: 'VR Backrooms game' },
    { quote: 'Great work!', project: 'Level designer' },
  ],
};

export const ABOUT = {
  body: [
    'I’m a level designer and environment artist based in Jaén, Spain. I care about game spaces that carry the narrative through their architecture: a well-built level can tell as much of the world as the script does.',
    'Venezuelan, raised in Canada, with years in the United States along the way. I work in English and Spanish, remotely, with teams anywhere.',
  ],
  facts: [
    { label: 'Education', value: 'Master’s in Video Game Creation', sub: 'Universidad de Málaga' },
    { label: '', value: 'B.A. Digital Game Design, Magna Cum Laude', sub: 'Universidad Andrés Bello' },
    { label: 'Languages', value: 'English and Spanish' },
    { label: 'Also', value: 'Pre-production, world-building, ArchViz' },
  ],
};
