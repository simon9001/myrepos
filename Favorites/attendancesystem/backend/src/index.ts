import cluster from 'cluster';
import os from 'os';
import { appConfig } from './config';

const NUM_WORKERS = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`[cluster] Primary ${process.pid} starting ${NUM_WORKERS} workers on port ${appConfig.PORT}`);

  // Track which workers signalled a startup failure via IPC.
  // Those must NOT be restarted — the error is permanent until the port is freed.
  const startupFailed = new Set<number>();

  const fork = () => {
    const w = cluster.fork();

    // Worker sends { type: 'STARTUP_ERROR' } before exiting on a fatal startup problem.
    w.on('message', (msg: { type?: string }) => {
      if (msg?.type === 'STARTUP_ERROR') {
        startupFailed.add(w.id);
      }
    });

    return w;
  };

  for (let i = 0; i < NUM_WORKERS; i++) fork();

  cluster.on('exit', (worker, code, signal) => {
    if (startupFailed.has(worker.id)) {
      startupFailed.delete(worker.id);
      // All workers failed to start → nothing left, exit primary too
      if (cluster.workers && Object.keys(cluster.workers).length === 0) {
        console.error(
          `[cluster] All workers failed to start. ` +
          `Is port ${appConfig.PORT} already in use? ` +
          `Run:  netstat -ano | findstr :${appConfig.PORT}`,
        );
        process.exit(1);
      }
      return; // don't restart this one
    }

    // Normal runtime crash — restart
    console.warn(
      `[cluster] Worker ${worker.process.pid} exited ` +
      `(code=${code}, signal=${signal}). Restarting…`,
    );
    fork();
  });

} else {
  import('./server').then(({ buildServer }) => {
    buildServer()
      .then((app) => app.listen({ port: appConfig.PORT, host: appConfig.HOST }))
      .then(() => {
        console.log(`[worker ${process.pid}] Listening on ${appConfig.HOST}:${appConfig.PORT}`);
      })
      .catch((err: NodeJS.ErrnoException) => {
        // Tell the primary this is a permanent startup failure — don't restart us
        if (process.send) process.send({ type: 'STARTUP_ERROR' });

        if (err.code === 'EADDRINUSE') {
          console.error(
            `[worker ${process.pid}] Port ${appConfig.PORT} is already in use. ` +
            `Stop the other process first.`,
          );
        } else {
          console.error(`[worker ${process.pid}] Startup error:`, err.message);
        }
        process.exit(1);
      });
  });
}
