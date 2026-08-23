import { execSync, spawn } from 'child_process';
import http from 'http';

function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (Date.now() - start > timeoutMs) {
        resolve(false);
        return;
      }
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve(true);
        } else {
          setTimeout(check, 2000);
        }
      });
      req.on('error', () => setTimeout(check, 2000));
      req.setTimeout(3000, () => { req.destroy(); setTimeout(check, 2000); });
    };
    check();
  });
}

async function globalSetup() {
  const projectRoot = process.cwd().replace('/portal', '');

  // Start backend
  console.log('Starting backend on :8030...');
  const backend = spawn('bash', ['-c',
    `cd ${projectRoot} && DISABLE_RATE_LIMIT=1 TB_SECRET_KEY=triangle-black-dev-secret-2026 .venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8030`
  ], { detached: true, stdio: 'ignore' });
  backend.unref();

  // Start portal
  console.log('Starting portal on :3000...');
  const portal = spawn('npx', ['next', 'dev', '-p', '3000'], {
    cwd: `${projectRoot}/portal`,
    detached: true,
    stdio: 'ignore'
  });
  portal.unref();

  // Wait for both
  const backendReady = await waitForServer('http://localhost:8030/api/v1/health/live', 60000);
  const portalReady = await waitForServer('http://localhost:3000', 90000);

  if (!backendReady) console.error('WARNING: Backend did not start in time');
  if (!portalReady) console.error('WARNING: Portal did not start in time');

  console.log(`Backend: ${backendReady ? 'READY' : 'TIMEOUT'}`);
  console.log(`Portal: ${portalReady ? 'READY' : 'TIMEOUT'}`);
}

export default globalSetup;
