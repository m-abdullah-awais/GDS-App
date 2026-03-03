const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const targetPath = path.join(projectRoot, 'android', 'app', 'google-services.json');

function parseEnv(content) {
  return content
    .split(/\r?\n/)
    .filter(line => line && !line.trim().startsWith('#'))
    .reduce((acc, line) => {
      const index = line.indexOf('=');
      if (index === -1) return acc;

      const key = line.slice(0, index).trim();
      let value = line.slice(index + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      acc[key] = value;
      return acc;
    }, {});
}

if (!fs.existsSync(envPath)) {
  console.error('[google-services] .env file not found at project root.');
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, 'utf8'));

const required = [
  'FIREBASE_PROJECT_NUMBER',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_ANDROID_MOBILESDK_APP_ID',
  'FIREBASE_ANDROID_API_KEY',
  'FIREBASE_ANDROID_PACKAGE_NAME'
];

const missing = required.filter(key => !env[key]);
if (missing.length > 0) {
  console.error(`[google-services] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const output = {
  project_info: {
    project_number: env.FIREBASE_PROJECT_NUMBER,
    project_id: env.FIREBASE_PROJECT_ID,
    storage_bucket: env.FIREBASE_STORAGE_BUCKET
  },
  client: [
    {
      client_info: {
        mobilesdk_app_id: env.FIREBASE_ANDROID_MOBILESDK_APP_ID,
        android_client_info: {
          package_name: env.FIREBASE_ANDROID_PACKAGE_NAME
        }
      },
      oauth_client: [],
      api_key: [
        {
          current_key: env.FIREBASE_ANDROID_API_KEY
        }
      ],
      services: {
        appinvite_service: {
          other_platform_oauth_client: []
        }
      }
    }
  ],
  configuration_version: '1'
};

fs.writeFileSync(targetPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`[google-services] Generated ${path.relative(projectRoot, targetPath)} from .env`);
