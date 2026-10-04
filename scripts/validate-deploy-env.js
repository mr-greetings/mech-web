const isVercelBuild = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);

if (!isVercelBuild) process.exit(0);

const apiBase = process.env.VITE_API_BASE_URL?.trim();
if (!apiBase) {
  console.error('Vercel build blocked: set VITE_API_BASE_URL to your deployed Render API URL ending in /api, then redeploy.');
  process.exit(1);
}

let parsedApiBase;
try {
  parsedApiBase = new URL(apiBase);
} catch {
  console.error('Vercel build blocked: VITE_API_BASE_URL must be a complete HTTPS URL ending in /api.');
  process.exit(1);
}

if (parsedApiBase.protocol !== 'https:' || parsedApiBase.pathname.replace(/\/+$/, '') !== '/api') {
  console.error('Vercel build blocked: VITE_API_BASE_URL must use HTTPS and end exactly in /api, for example https://your-service.onrender.com/api.');
  process.exit(1);
}
