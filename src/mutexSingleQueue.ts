export default function mutexSingleQueue<
  T extends (...args: any[]) => Promise<any>
>(fn: T): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let running = false;
  let queuedArgs: Parameters<T> | null = null;
  let queuedResolve: ((value: Awaited<ReturnType<T>>) => void) | null = null;
  let queuedReject: ((reason?: any) => void) | null = null;

  async function runner(
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    if (running) {
      // Überschreibe die Warteschlange mit den neuesten Argumenten
      queuedArgs = args;
      return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
        queuedResolve = resolve;
        queuedReject = reject;
      });
    }
    running = true;
    try {
      const result = await fn(...args);
      running = false;
      // Falls etwas in der Warteschlange ist, führe es aus
      if (queuedArgs) {
        const nextArgs = queuedArgs;
        const nextResolve = queuedResolve;
        const nextReject = queuedReject;
        queuedArgs = null;
        queuedResolve = null;
        queuedReject = null;
        runner(...nextArgs).then(nextResolve, nextReject);
      }
      return result;
    } catch (err) {
      running = false;
      if (queuedArgs) {
        const nextArgs = queuedArgs;
        const nextResolve = queuedResolve;
        const nextReject = queuedReject;
        queuedArgs = null;
        queuedResolve = null;
        queuedReject = null;
        runner(...nextArgs).then(nextResolve, nextReject);
      }
      throw err;
    }
  }
  return runner;
}
