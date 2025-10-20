export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const now = (): number => Date.now();

export const durationSeconds = (start: number, end = Date.now()): number =>
  (end - start) / 1000;
