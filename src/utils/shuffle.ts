/** Fisher-Yates karıştırma (sort(() => Math.random() - 0.5) önyargılıdır). Girdiyi değiştirmez. */
export function shuffled<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
