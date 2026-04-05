export async function waitFor<T>(
  callback: () => Promise<T>,
  predicate: (value: T) => boolean,
  timeoutMs = 2_000,
  intervalMs = 25
): Promise<T> {
  const startedAt = Date.now();

  // Poll job-driven flows without sleeping the whole test suite.
  // This keeps external-transfer and reconciliation checks deterministic.
  while (Date.now() - startedAt <= timeoutMs) {
    const value = await callback();

    if (predicate(value)) {
      return value;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms.`);
}
