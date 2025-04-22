// Configuration for LocalLift
const API_CONFIG = {
  baseUrl: "https://locallift-production.up.railway.app",
  apiVersion: "v1",
  timeout: 10000
};

// API status check function
function checkApiStatus() {
  console.log("Checking API status at: " + API_CONFIG.baseUrl);
  // In a real app, we would make an actual API call here
  return true;
}
