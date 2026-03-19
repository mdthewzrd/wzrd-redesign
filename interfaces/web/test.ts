import type { Sandbox } from '@/stores/atoms';
import type { Sandbox as LibSandbox } from '@/lib/sandboxes';

declare const s1: Sandbox;
declare const s2: LibSandbox;

const test1: Sandbox = s2;
const test2: LibSandbox = s1;
