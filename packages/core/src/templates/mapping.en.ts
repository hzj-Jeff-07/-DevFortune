import type { WuXingMapping } from '../types.js';

/** English Five-Elements mapping — same structure and lucky picks as the zh-CN set */
export const DEFAULT_MAPPING_EN: WuXingMapping = {
  version: '1.0.0',
  id: 'default-en',
  name: 'Default Five Elements mapping',
  description: 'Five Elements mapped to programmer activities',
  mappings: {
    wood: {
      element: 'Wood',
      themes: ['Building new features', 'Setting up architecture', 'Prototyping', 'Creative experiments'],
      lucky: { language: 'JavaScript', tool: 'Vite', activity: 'Writing new code' },
      unlucky: { activity: 'Mass-deleting code' },
    },
    fire: {
      element: 'Fire',
      themes: ['Performance tuning', 'Code review', 'Tech talks', 'Load testing & debugging'],
      lucky: { language: 'Rust', tool: 'Flamegraph', activity: 'Performance optimization' },
      unlucky: { activity: 'Rushing a release' },
    },
    earth: {
      element: 'Earth',
      themes: ['Infrastructure work', 'Database maintenance', 'CI/CD', 'Operations'],
      lucky: { language: 'Go', tool: 'Terraform', activity: 'Building infrastructure' },
      unlucky: { activity: 'Aggressive migrations' },
    },
    metal: {
      element: 'Metal',
      themes: ['Refactoring', 'Tech selection', 'Dependency cleanup', 'Security audits'],
      lucky: { language: 'TypeScript', tool: 'SonarQube', activity: 'Refactoring & polishing' },
      unlucky: { activity: 'Piling on new dependencies' },
    },
    water: {
      element: 'Water',
      themes: ['Learning & research', 'Writing docs', 'Exploring open source', 'Tech blogging'],
      lucky: { language: 'Elixir', tool: 'Obsidian', activity: 'Learning new tech' },
      unlucky: { activity: 'Building in isolation' },
    },
  },
};
