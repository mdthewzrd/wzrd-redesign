import type { Sandbox } from '@/stores/atoms';

const s: Sandbox = {
  id: 'test',
  name: 'test',
  type: 'git_worktree',
  path: '/test',
  status: 'stopped',
  health: 'healthy',
  createdAt: '2024-01-01',
  lastAccessed: '2024-01-01',
  resourceUsage: {},
  description: 'test'
};
console.log(s);
