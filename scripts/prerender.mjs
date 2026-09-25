// Injects the server-rendered app into dist/index.html (run after both vite builds).
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'dist/index.html');

// React warns that layout effects don't run on the server; that is expected here.
const error = console.error;
console.error = (msg, ...rest) => { if (!String(msg).includes('useLayoutEffect')) error(msg, ...rest); };

const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href);
const html = readFileSync(file, 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('dist/index.html has no <!--app-html--> placeholder');
writeFileSync(file, html.replace('<!--app-html-->', render()));
rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log('prerendered dist/index.html');
