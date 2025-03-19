interface Config {
  isDevelopment: boolean;
  isProduction: boolean;
  database: {
    url: string;
  };
  auth: {
    url: string;
    secret: string;
  };
  api: {
    url: string;
  };
  features: {
    logging: boolean;
    debug: boolean;
  };
}

const config: Config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  auth: {
    url: process.env.NEXTAUTH_URL || '',
    secret: process.env.NEXTAUTH_SECRET || '',
  },
  api: {
    url: process.env.API_URL || '',
  },
  features: {
    logging: process.env.ENABLE_LOGGING === 'true',
    debug: process.env.ENABLE_DEBUG === 'true',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'API_URL',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config; 