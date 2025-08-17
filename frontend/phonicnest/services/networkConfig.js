// Network Configuration Helper
// This file helps manage different API URLs for different environments

const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  LOCAL_NETWORK: 'local_network',
};

// Get your computer's IP address for local network testing
const getLocalIP = () => {
  // You can find your IP address by running 'ipconfig' in Windows Command Prompt
  // Look for "IPv4 Address" under your active network adapter
  return '10.7.40.30'; // Your actual IP address
};

// Configuration for different environments
const config = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    API_BASE_URL: 'http://10.7.40.30:8000',
    TIMEOUT: 30000,
  },
  [ENVIRONMENTS.LOCAL_NETWORK]: {
    API_BASE_URL: `http://${getLocalIP()}:8000`,
    TIMEOUT: 30000,
  },
  [ENVIRONMENTS.PRODUCTION]: {
    API_BASE_URL: 'https://your-production-domain.com', // Replace with your production URL
    TIMEOUT: 30000,
  },
};

// Current environment - change this as needed
const CURRENT_ENVIRONMENT = ENVIRONMENTS.LOCAL_NETWORK;

// Export the current configuration
export const currentConfig = config[CURRENT_ENVIRONMENT];

// Helper function to get configuration for a specific environment
export const getConfig = (environment = CURRENT_ENVIRONMENT) => {
  return config[environment] || config[ENVIRONMENTS.DEVELOPMENT];
};

// Helper function to switch environment
export const switchEnvironment = (environment) => {
  if (config[environment]) {
    console.log(`Switching to ${environment} environment`);
    return config[environment];
  }
  console.warn(`Environment ${environment} not found, using development`);
  return config[ENVIRONMENTS.DEVELOPMENT];
};

export default currentConfig;
