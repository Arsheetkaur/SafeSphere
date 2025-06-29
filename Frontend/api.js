// API Configuration for SafeSphere Frontend
const API_BASE_URL = 'http://localhost:5000';

// Store session token
let sessionToken = localStorage.getItem('sessionToken');

// API Functions
async function apiCall(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authorization header if session token exists
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call failed:', error);
    throw error;
  }
}

// Authentication API functions
export async function register(userData) {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  // Store session token
  sessionToken = response.session_token;
  localStorage.setItem('sessionToken', sessionToken);
  
  return response;
}

export async function login(credentials) {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  // Store session token
  sessionToken = response.session_token;
  localStorage.setItem('sessionToken', sessionToken);
  
  return response;
}

export async function logout() {
  try {
    await apiCall('/auth/logout', {
      method: 'POST'
    });
  } finally {
    // Clear session token regardless of API response
    sessionToken = null;
    localStorage.removeItem('sessionToken');
  }
}

export function isAuthenticated() {
  return !!sessionToken;
}

export function getSessionToken() {
  return sessionToken;
}

// User API functions
export async function createUser(userData) {
  return await apiCall('/users/', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function getUsers() {
  return await apiCall('/users/');
}

export async function getUser(userId) {
  return await apiCall(`/users/${userId}`);
}

export async function getProfile() {
  return await apiCall('/users/profile');
}

export async function updateProfile(profileData) {
  return await apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}

// Friend request API functions
export async function sendFriendRequest(friendEmail) {
  return await apiCall('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ friend_email: friendEmail })
  });
}

export async function getFriendRequests() {
  return await apiCall('/friends/requests');
}

export async function respondToFriendRequest(requestId, action) {
  return await apiCall(`/friends/request/${requestId}/${action}`, {
    method: 'POST'
  });
}

// Location API functions
export async function createLocation(locationData) {
  return await apiCall('/locations/', {
    method: 'POST',
    body: JSON.stringify(locationData)
  });
}

export async function getLocations() {
  return await apiCall('/locations/');
}

export async function getUserLocations(userId) {
  return await apiCall(`/locations/user/${userId}`);
}

// Friend API functions
export async function addFriend(connectionData) {
  return await apiCall('/friends/', {
    method: 'POST',
    body: JSON.stringify(connectionData)
  });
}

export async function getFriends() {
  return await apiCall('/friends/');
}

export async function getFriendsByUserId(userId) {
  return await apiCall(`/friends/${userId}`);
}

// Weather API functions
export async function getWeatherData(lat, lon) {
  return await apiCall(`/weather/${lat}/${lon}`);
}

export async function getWeatherRadar(lat, lon) {
  return await apiCall(`/weather/radar/${lat}/${lon}`);
}

// Disaster API functions
export async function getDisasterData(lat, lon, radius = 100.0) {
  return await apiCall(`/disasters/${lat}/${lon}?radius=${radius}`);
}

// Enhanced Emergency API functions
export async function markUserSafe(userId) {
  return await apiCall(`/emergency/safe/${userId}`, {
    method: 'POST'
  });
}

export async function sendEmergencyAlert(userId) {
  return await apiCall(`/emergency/alert/${userId}`, {
    method: 'POST'
  });
}

export async function markUserDanger(userId) {
  return await apiCall(`/emergency/danger/${userId}`, {
    method: 'POST'
  });
}

export async function getSafetyStatus(userId) {
  return await apiCall(`/emergency/status/${userId}`);
}

export async function getAlerts() {
  return await apiCall('/emergency/alerts');
}

// Health check
export async function checkHealth() {
  return await apiCall('/health');
} 