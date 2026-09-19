import { app } from 'electron';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AppData } from '@shared/types';
import { sanitize } from './schema';

const dataFile = (): string => join(app.getPath('userData'), 'expenses.json');

export async function loadData(): Promise<AppData> {
  let text: string;
  try {
    text = await readFile(dataFile(), 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return sanitize({});
    throw err;
  }
  try {
    return sanitize(JSON.parse(text));
  } catch {
    // Unreadable JSON: keep a copy instead of silently overwriting the user's data.
    await rename(dataFile(), join(app.getPath('userData'), `expenses.corrupt-${Date.now()}.json`));
    return sanitize({});
  }
}

let writeQueue: Promise<void> = Promise.resolve();

/** Validates and writes atomically (temp file + rename); writes are serialized. */
export function saveData(raw: unknown): Promise<void> {
  const data = sanitize(raw);
  const target = dataFile();
  const tmp = `${target}.tmp`;
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      await mkdir(app.getPath('userData'), { recursive: true });
      await writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
      await rename(tmp, target);
    });
  return writeQueue;
}
