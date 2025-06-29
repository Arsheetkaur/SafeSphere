// SafeSphere Frontend Application
import * as api from './api.js';

class SafeSphereApp {
  constructor() {
    this.map = null;
    this.currentUser = null;
    this.friends = [];
    this.locations = [];
    this.weatherData = null;
    this.friendRequests = [];
    this.alerts = [];
    this.markers = {
      friends: new Map(),
      locations: new Map(),
      weather: null
    };
    
    this.init();
  }

  async init() {
    try {
      this.showLoading(true);
      
      // Check authentication first
      if (!api.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
      }
      
      // Get current user profile
      await this.loadCurrentUser();
      
      // Initialize map
      this.initMap();
      
      // Check backend health
      await this.checkBackendHealth();
      
      // Initialize event listeners
      this.initEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Start periodic updates
      this.startPeriodicUpdates();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      if (error.message.includes('Not authenticated')) {
        window.location.href = 'login.html';
        return;
      }
      this.showError('Failed to initialize application. Please check your connection.');
    } finally {
      this.showLoading(false);
    }
  }

  async loadCurrentUser() {
    try {
      this.currentUser = await api.getProfile();
      this.updateUserInfo();
    } catch (error) {
      console.error('Failed to load user profile:', error);
      throw error;
    }
  }

  updateUserInfo() {
    // Update header with user info
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
      <span>Welcome, ${this.currentUser.name}</span>
      <button id="logoutBtn" class="btn btn-secondary">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    `;
    
    // Add to header actions
    const headerActions = document.querySelector('.header-actions');
    headerActions.appendChild(userInfo);
    
    // Add logout event listener
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
  }

  async handleLogout() {
    try {
      await api.logout();
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway
      window.location.href = 'login.html';
    }
  }

  initMap() {
    // Initialize Leaflet map
    this.map = L.map('map').setView([40.7128, -74.0060], 10);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 12);
          this.loadWeatherData(latitude, longitude);
          
          // Update user's location
          this.updateUserLocation(latitude, longitude);
        },
        (error) => {
          console.warn('Could not get current location:', error);
          // Use default location
          this.loadWeatherData(40.7128, -74.0060);
        }
      );
    }
  }

  async updateUserLocation(lat, lon) {
    try {
      await api.updateProfile({
        latitude: lat,
        longitude: lon
      });
    } catch (error) {
      console.error('Failed to update user location:', error);
    }
  }

  async checkBackendHealth() {
    try {
      await api.checkHealth();
      console.log('Backend is healthy');
    } catch (error) {
      throw new Error('Backend is not responding');
    }
  }

  initEventListeners() {
    // Modal controls
    document.getElementById('addFriendBtn').addEventListener('click', () => this.showModal('friendModal'));
    document.getElementById('addLocationBtn').addEventListener('click', () => this.showModal('locationModal'));
    
    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.hideModal(e.target.closest('.modal')));
    });
    
    // Cancel buttons
    document.getElementById('cancelFriendBtn').addEventListener('click', () => this.hideModal('friendModal'));
    document.getElementById('cancelLocationBtn').addEventListener('click', () => this.hideModal('locationModal'));
    
    // Form submissions
    document.getElementById('friendForm').addEventListener('submit', (e) => this.handleAddFriend(e));
    document.getElementById('locationForm').addEventListener('submit', (e) => this.handleAddLocation(e));
    
    // Emergency buttons
    document.getElementById('safeBtn').addEventListener('click', () => this.markUserSafe());
    document.getElementById('alertBtn').addEventListener('click', () => this.sendAlert());
    
    // Map layer controls
    document.getElementById('weatherLayer').addEventListener('change', (e) => this.toggleWeatherLayer(e.target.checked));
    document.getElementById('friendsLayer').addEventListener('change', (e) => this.toggleFriendsLayer(e.target.checked));
    document.getElementById('locationsLayer').addEventListener('change', (e) => this.toggleLocationsLayer(e.target.checked));
    
    // Get current location button
    document.getElementById('getLocationBtn').addEventListener('click', () => this.getCurrentLocation());
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.hideModal(e.target);
      }
    });
  }

  async loadInitialData() {
    try {
      // Load friends
      await this.loadFriends();
      
      // Load friend requests
      await this.loadFriendRequests();
      
      // Load locations
      await this.loadLocations();
      
      // Load alerts
      await this.loadAlerts();
      
      // Update safety status
      this.updateSafetyStatus();
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.showError('Failed to load data from server.');
    }
  }

  async loadFriends() {
    try {
      this.friends = await api.getFriends();
      this.renderFriendsList();
      this.updateFriendsMarkers();
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  }

  async loadFriendRequests() {
    try {
      this.friendRequests = await api.getFriendRequests();
      console.log('Loaded friend requests:', this.friendRequests);
      this.renderFriendRequests();
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  }

  async loadLocations() {
    try {
      this.locations = await api.getLocations();
      this.renderLocationsList();
      this.updateLocationMarkers();
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  }

  async loadAlerts() {
    try {
      this.alerts = await api.getAlerts();
      this.renderAlerts();
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }

  async loadWeatherData(lat, lon) {
    try {
      console.log('Loading weather data for:', lat, lon);
      this.weatherData = await api.getWeatherData(lat, lon);
      console.log('Weather data received:', this.weatherData);
      this.renderWeatherCard();
      this.updateWeatherMarker(lat, lon);
    } catch (error) {
      console.error('Failed to load weather data:', error);
      this.renderWeatherCard({ error: true });
    }
  }

  renderFriendsList() {
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';

    if (this.friends.length === 0) {
      friendsList.innerHTML = '<p style="opacity: 0.7; text-align: center;">No friends added yet</p>';
      return;
    }

    this.friends.forEach(friend => {
      const friendItem = document.createElement('div');
      friendItem.className = 'friend-item';
      friendItem.innerHTML = `
        <div class="friend-avatar">
          ${friend.name.charAt(0).toUpperCase()}
        </div>
        <div class="friend-info">
          <div class="friend-name">${friend.name}</div>
          <div class="friend-status ${friend.status || 'safe'}">${friend.status || 'Safe'}</div>
        </div>
        <div class="friend-actions">
          <button class="btn btn-secondary" onclick="app.viewFriendProfile(${friend.id})">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      `;
      friendsList.appendChild(friendItem);
    });
  }

  renderFriendRequests() {
    console.log('Rendering friend requests:', this.friendRequests);
    // Add friend requests section to sidebar if there are pending requests
    if (this.friendRequests.length > 0) {
      let requestsSection = document.querySelector('.friend-requests-section');
      if (!requestsSection) {
        requestsSection = document.createElement('section');
        requestsSection.className = 'friend-requests-section';
        requestsSection.innerHTML = '<h3><i class="fas fa-user-plus"></i> Friend Requests</h3><div class="friend-requests-list"></div>';
        document.querySelector('.sidebar').insertBefore(requestsSection, document.querySelector('.friends-section'));
      }
      
      const requestsList = requestsSection.querySelector('.friend-requests-list');
      requestsList.innerHTML = '';
      
      this.friendRequests.forEach(request => {
        console.log('Rendering request:', request);
        const requestItem = document.createElement('div');
        requestItem.className = 'friend-request-item';
        requestItem.innerHTML = `
          <div class="friend-avatar">
            ${request.from_user.name.charAt(0).toUpperCase()}
          </div>
          <div class="friend-info">
            <div class="friend-name">${request.from_user.name}</div>
            <div class="friend-email">${request.from_user.email}</div>
          </div>
          <div class="request-actions">
            <button class="btn btn-primary" onclick="app.acceptFriendRequest(${request.id})">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-secondary" onclick="app.rejectFriendRequest(${request.id})">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
        requestsList.appendChild(requestItem);
      });
    } else {
      // Remove requests section if no pending requests
      const requestsSection = document.querySelector('.friend-requests-section');
      if (requestsSection) {
        requestsSection.remove();
      }
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      console.log('Accepting friend request:', requestId);
      await api.respondToFriendRequest(requestId, 'accept');
      this.showSuccess('Friend request accepted!');
      await this.loadFriendRequests();
      await this.loadFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      this.showError(`Failed to accept friend request: ${error.message}`);
    }
  }

  async rejectFriendRequest(requestId) {
    try {
      console.log('Rejecting friend request:', requestId);
      await api.respondToFriendRequest(requestId, 'reject');
      this.showSuccess('Friend request rejected.');
      await this.loadFriendRequests();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      this.showError(`Failed to reject friend request: ${error.message}`);
    }
  }

  renderLocationsList() {
    const locationsList = document.getElementById('locationsList');
    locationsList.innerHTML = '';

    if (this.locations.length === 0) {
      locationsList.innerHTML = '<p style="opacity: 0.7; text-align: center;">No locations added yet</p>';
      return;
    }

    this.locations.forEach(location => {
      const locationItem = document.createElement('div');
      locationItem.className = 'location-item';
      locationItem.innerHTML = `
        <div class="location-icon">
          <i class="fas fa-${this.getLocationIcon(location.type)}"></i>
        </div>
        <div class="location-info">
          <div class="location-name">${location.name}</div>
          <div class="location-type">${location.type}</div>
        </div>
      `;
      
      locationItem.addEventListener('click', () => {
        this.map.setView([location.latitude, location.longitude], 15);
      });
      
      locationsList.appendChild(locationItem);
    });
  }

  renderAlerts() {
    // Add alerts section to sidebar if there are alerts
    if (this.alerts.length > 0) {
      let alertsSection = document.querySelector('.alerts-section');
      if (!alertsSection) {
        alertsSection = document.createElement('section');
        alertsSection.className = 'alerts-section';
        alertsSection.innerHTML = '<h3><i class="fas fa-exclamation-triangle"></i> Recent Alerts</h3><div class="alerts-list"></div>';
        document.querySelector('.sidebar').insertBefore(alertsSection, document.querySelector('.safety-status'));
      }
      
      const alertsList = alertsSection.querySelector('.alerts-list');
      alertsList.innerHTML = '';
      
      // Show only recent alerts (last 5)
      const recentAlerts = this.alerts.slice(-5);
      
      recentAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
          <div class="alert-icon">
            <i class="fas fa-${alert.type === 'emergency_alert' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
          </div>
          <div class="alert-info">
            <div class="alert-message">${alert.message}</div>
            <div class="alert-time">${new Date(alert.created_at).toLocaleString()}</div>
          </div>
        `;
        alertsList.appendChild(alertItem);
      });
    } else {
      // Remove alerts section if no alerts
      const alertsSection = document.querySelector('.alerts-section');
      if (alertsSection) {
        alertsSection.remove();
      }
    }
  }

  renderWeatherCard() {
    const weatherCard = document.getElementById('weatherCard');
    console.log('Rendering weather card with data:', this.weatherData);
    
    if (!this.weatherData || this.weatherData.error) {
      console.log('No weather data or error, showing unavailable message');
      weatherCard.innerHTML = `
        <div style="text-align: center; opacity: 0.7;">
          <i class="fas fa-cloud-slash" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
          <p>Weather data unavailable</p>
        </div>
      `;
      return;
    }

    const weather = this.weatherData;
    
    // Handle both backend format and OpenWeatherMap format
    const temp = weather.temperature || (weather.main && weather.main.temp);
    const humidity = weather.humidity || (weather.main && weather.main.humidity);
    const pressure = weather.pressure || (weather.main && weather.main.pressure);
    const windSpeed = weather.wind_speed || (weather.wind && weather.wind.speed);
    const description = weather.description || (weather.weather && weather.weather[0] && weather.weather[0].description);
    const condition = weather.description || (weather.weather && weather.weather[0] && weather.weather[0].main);
    
    console.log('Weather data processed:', { temp, humidity, pressure, windSpeed, description, condition });
    
    weatherCard.innerHTML = `
      <div class="weather-info">
        <div class="weather-icon">
          <i class="fas fa-${this.getWeatherIcon(condition)}"></i>
        </div>
        <div class="weather-temp">${Math.round(temp)}°C</div>
      </div>
      <div class="weather-details">
        <div>Humidity: ${humidity}%</div>
        <div>Wind: ${windSpeed} m/s</div>
        <div>Pressure: ${pressure} hPa</div>
        <div>Condition: ${description}</div>
      </div>
    `;
  }

  updateFriendsMarkers() {
    // Clear existing friend markers
    this.markers.friends.forEach(marker => marker.remove());
    this.markers.friends.clear();

    // Add new friend markers
    this.friends.forEach(friend => {
      if (friend.latitude && friend.longitude) {
        const marker = L.marker([friend.latitude, friend.longitude], {
          icon: L.divIcon({
            className: 'friend-marker',
            html: `<div style="background: #4CAF50; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${friend.name.charAt(0)}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        }).addTo(this.map);

        marker.bindPopup(`
          <h3>${friend.name}</h3>
          <p>Status: <span style="color: #4CAF50;">${friend.status || 'Safe'}</span></p>
          <p>Email: ${friend.email}</p>
          <button onclick="app.viewFriendProfile(${friend.id})" class="btn btn-primary">View Profile</button>
        `);

        this.markers.friends.set(friend.id, marker);
      }
    });
  }

  updateLocationMarkers() {
    // Clear existing location markers
    this.markers.locations.forEach(marker => marker.remove());
    this.markers.locations.clear();

    // Add new location markers
    this.locations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude], {
        icon: L.divIcon({
          className: 'location-marker',
          html: `<div style="background: #2196F3; color: white; border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-${this.getLocationIcon(location.type)}"></i></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(this.map);

      marker.bindPopup(`
        <h3>${location.name}</h3>
        <p>Type: ${location.type}</p>
        <p>Coordinates: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
      `);

      this.markers.locations.set(location.id, marker);
    });
  }

  updateWeatherMarker(lat, lon) {
    // Remove existing weather marker
    if (this.markers.weather) {
      this.markers.weather.remove();
    }

    // Add weather marker
    this.markers.weather = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'weather-marker',
        html: `<div style="background: #FFD700; color: #333; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;"><i class="fas fa-cloud-sun"></i></div>`,
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5]
      })
    }).addTo(this.map);

    if (this.weatherData) {
      // Handle both backend format and OpenWeatherMap format
      const temp = this.weatherData.temperature || (this.weatherData.main && this.weatherData.main.temp);
      const description = this.weatherData.description || (this.weatherData.weather && this.weatherData.weather[0] && this.weatherData.weather[0].description);
      const humidity = this.weatherData.humidity || (this.weatherData.main && this.weatherData.main.humidity);
      
      this.markers.weather.bindPopup(`
        <h3>Current Weather</h3>
        <p>Temperature: ${Math.round(temp)}°C</p>
        <p>Condition: ${description}</p>
        <p>Humidity: ${humidity}%</p>
      `);
    }
  }

  updateSafetyStatus() {
    const safeCount = this.friends.filter(f => f.status === 'safe' || !f.status).length;
    const alertCount = this.friends.filter(f => f.status === 'alert' || f.status === 'danger').length;
    
    document.getElementById('safeCount').textContent = safeCount;
    document.getElementById('alertCount').textContent = alertCount;
    
    const statusIndicator = document.querySelector('.status-indicator');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('span');
    
    if (alertCount > 0) {
      statusDot.className = 'status-dot alert';
      statusText.textContent = `${alertCount} friend(s) need attention`;
    } else {
      statusDot.className = 'status-dot safe';
      statusText.textContent = 'All friends are safe';
    }
  }

  async handleAddFriend(e) {
    e.preventDefault();
    
    const friendEmail = document.getElementById('friendEmail').value;
    
    if (!friendEmail) {
      this.showError('Please enter a friend\'s email address');
      return;
    }

    try {
      this.showLoading(true);
      await api.sendFriendRequest(friendEmail);
      this.hideModal('friendModal');
      e.target.reset();
      await this.loadFriendRequests();
      this.showSuccess('Friend request sent successfully!');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      this.showError(error.message || 'Failed to send friend request. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  async handleAddLocation(e) {
    e.preventDefault();
    
    const locationData = {
      name: document.getElementById('locationName').value,
      type: document.getElementById('locationType').value,
      latitude: parseFloat(document.getElementById('locationLat').value),
      longitude: parseFloat(document.getElementById('locationLng').value)
    };

    try {
      this.showLoading(true);
      await api.createLocation(locationData);
      this.hideModal('locationModal');
      e.target.reset();
      await this.loadLocations();
      this.showSuccess('Location added successfully!');
    } catch (error) {
      console.error('Failed to add location:', error);
      this.showError('Failed to add location. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  async markUserSafe() {
    try {
      this.showLoading(true);
      await api.markUserSafe(this.currentUser.id);
      this.showSuccess('Safety status updated!');
      await this.loadFriends();
    } catch (error) {
      console.error('Failed to mark user safe:', error);
      this.showError('Failed to update safety status.');
    } finally {
      this.showLoading(false);
    }
  }

  async sendAlert() {
    try {
      this.showLoading(true);
      await api.sendEmergencyAlert(this.currentUser.id);
      this.showSuccess('Emergency alert sent to all contacts!');
      await this.loadFriends();
      await this.loadAlerts();
    } catch (error) {
      console.error('Failed to send alert:', error);
      this.showError('Failed to send alert.');
    } finally {
      this.showLoading(false);
    }
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          document.getElementById('locationLat').value = latitude.toFixed(6);
          document.getElementById('locationLng').value = longitude.toFixed(6);
        },
        (error) => {
          console.warn('Could not get current location:', error);
          this.showError('Could not get current location. Please enter coordinates manually.');
        }
      );
    } else {
      this.showError('Geolocation is not supported by this browser.');
    }
  }

  viewFriendProfile(friendId) {
    // In a real app, this would open a friend's profile modal
    const friend = this.friends.find(f => f.id === friendId);
    if (friend) {
      this.showNotification(`Viewing ${friend.name}'s profile`, 'info');
    }
  }

  getLocationIcon(type) {
    const icons = {
      home: 'home',
      office: 'building',
      school: 'graduation-cap',
      hospital: 'hospital',
      other: 'map-marker-alt'
    };
    return icons[type] || 'map-marker-alt';
  }

  getWeatherIcon(condition) {
    if (!condition) return 'cloud';
    
    // Convert description to condition for icon mapping
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return 'sun';
    } else if (conditionLower.includes('cloud')) {
      return 'cloud';
    } else if (conditionLower.includes('rain')) {
      return 'cloud-rain';
    } else if (conditionLower.includes('snow')) {
      return 'snowflake';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return 'bolt';
    } else if (conditionLower.includes('drizzle')) {
      return 'cloud-drizzle';
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) {
      return 'smog';
    } else if (conditionLower.includes('wind')) {
      return 'wind';
    }
    
    // Fallback to original mapping for OpenWeatherMap format
    const icons = {
      Clear: 'sun',
      Clouds: 'cloud',
      Rain: 'cloud-rain',
      Snow: 'snowflake',
      Thunderstorm: 'bolt',
      Drizzle: 'cloud-drizzle',
      Mist: 'smog',
      Smoke: 'smog',
      Haze: 'smog',
      Dust: 'smog',
      Fog: 'smog',
      Sand: 'smog',
      Ash: 'smog',
      Squall: 'wind',
      Tornado: 'wind'
    };
    return icons[condition] || 'cloud';
  }

  toggleWeatherLayer(show) {
    if (this.markers.weather) {
      if (show) {
        this.markers.weather.addTo(this.map);
      } else {
        this.markers.weather.remove();
      }
    }
  }

  toggleFriendsLayer(show) {
    this.markers.friends.forEach(marker => {
      if (show) {
        marker.addTo(this.map);
      } else {
        marker.remove();
      }
    });
  }

  toggleLocationsLayer(show) {
    this.markers.locations.forEach(marker => {
      if (show) {
        marker.addTo(this.map);
      } else {
        marker.remove();
      }
    });
  }

  showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
  }

  hideModal(modal) {
    if (typeof modal === 'string') {
      document.getElementById(modal).style.display = 'none';
    } else {
      modal.style.display = 'none';
    }
  }

  showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'block' : 'none';
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 4000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  startPeriodicUpdates() {
    // Update data every 30 seconds
    setInterval(async () => {
      try {
        await this.loadFriends();
        await this.loadFriendRequests();
        await this.loadLocations();
        await this.loadAlerts();
        this.updateSafetyStatus();
      } catch (error) {
        console.error('Periodic update failed:', error);
      }
    }, 30000);
  }
}

// Initialize the application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new SafeSphereApp();
  // Make app globally accessible for friend request buttons
  window.app = app;
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .friend-request-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.5rem;
  }
  
  .request-actions {
    display: flex;
    gap: 0.25rem;
  }
  
  .request-actions .btn {
    padding: 0.5rem;
    min-width: auto;
  }
  
  .alert-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(244, 67, 54, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(244, 67, 54, 0.3);
    margin-bottom: 0.5rem;
  }
  
  .alert-icon {
    color: #f44336;
    font-size: 1.2rem;
  }
  
  .alert-time {
    font-size: 0.8rem;
    opacity: 0.7;
  }
  
  .friend-actions {
    display: flex;
    gap: 0.25rem;
  }
  
  .friend-actions .btn {
    padding: 0.5rem;
    min-width: auto;
  }
`;
document.head.appendChild(style);