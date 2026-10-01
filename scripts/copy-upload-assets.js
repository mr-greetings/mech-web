import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(projectRoot, 'uploads');
const destination = path.join(projectRoot, 'dist', 'uploads');

fs.mkdirSync(destination, { recursive: true });
for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
  if (entry.isFile()) {
    fs.copyFileSync(path.join(source, entry.name), path.join(destination, entry.name));
  }
}