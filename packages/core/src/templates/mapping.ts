import type { WuXingMapping } from '../types.js';

export const DEFAULT_MAPPING: WuXingMapping = {
  version: '1.0.0',
  id: 'default',
  name: '默认五行映射',
  description: '程序员活动的五行映射',
  mappings: {
    wood: {
      element: '木',
      themes: ['新功能开发', '架构搭建', '原型设计', '创意实验'],
      lucky: { language: 'JavaScript', tool: 'Vite', activity: '写新代码' },
      unlucky: { activity: '大规模删除代码' },
    },
    fire: {
      element: '火',
      themes: ['性能优化', 'Code Review', '技术分享', '压测调试'],
      lucky: { language: 'Rust', tool: 'Flamegraph', activity: '性能调优' },
      unlucky: { activity: '仓促上线' },
    },
    earth: {
      element: '土',
      themes: ['基础设施', '数据库维护', 'CI/CD', '运维'],
      lucky: { language: 'Go', tool: 'Terraform', activity: '搭建基础设施' },
      unlucky: { activity: '激进迁移' },
    },
    metal: {
      element: '金',
      themes: ['代码重构', '技术选型', '依赖清理', '安全审计'],
      lucky: { language: 'TypeScript', tool: 'SonarQube', activity: '重构优化' },
      unlucky: { activity: '引入大量新依赖' },
    },
    water: {
      element: '水',
      themes: ['学习研究', '文档编写', '探索开源', '技术博客'],
      lucky: { language: 'Elixir', tool: 'Obsidian', activity: '学习新技术' },
      unlucky: { activity: '闭门造车' },
    },
  },
};
