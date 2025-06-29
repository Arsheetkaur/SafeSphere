// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Mock data for friends
const friends = [
  {
    id: 1,
    name: "Rakshit",
    lat: 51.505,
    lng: -0.09,
    status: "safe",
    lastUpdated: "2023-05-15T10:30:00"
  },
  {
    id: 2,
    name: "Alex",
    lat: 51.51,
    lng: -0.1,
    status: "warning",
    lastUpdated: "2023-05-15T09:45:00"
  },
  {
    id: 3,
    name: "Jordan",
    lat: 51.515,
    lng: -0.09,
    status: "danger",
    lastUpdated: "2023-05-15T08:15:00"
  }
];

// Mock data for important locations
let locations = [
  {
    id: 1,
    name: "Home",
    lat: 51.5,
    lng: -0.09,
    type: "home"
  },
  {
    id: 2,
    name: "Office",
    lat: 51.52,
    lng: -0.11,
    type: "office"
  }
];

// Create icon for markers
function createCustomIcon(iconType) {
  const iconColors = {
    safe: '#2ecc71',
    warning: '#f39c12',
    danger: '#e74c3c',
    home: '#3498db',
    office: '#9b59b6',
    school: '#e67e22',
    other: '#7f8c8d'
  };
  
  const iconHtml = `
    <div style="
      background-color: ${iconColors[iconType]};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    ">
      <i class="fas ${
        iconType === 'home' ? 'fa-home' : 
        iconType === 'office' ? 'fa-building' : 
        iconType === 'school' ? 'fa-school' : 'fa-user'
      }"></i>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

// will add weather api here
const weatherLayer = L.tileLayer(
  `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY`,
  { opacity: 0.7 }
).addTo(map);

// Add friends to the map and sidebar
const friendsList = document.getElementById('friendsList');
const friendMarkers = {};

friends.forEach(friend => {
  // Add marker to map
  const marker = L.marker([friend.lat, friend.lng], {
    icon: createCustomIcon(friend.status === 'safe' ? 'safe' : friend.status === 'warning' ? 'warning' : 'danger')
  }).addTo(map)
    .bindPopup(`
      <h3>${friend.name}</h3>
      <p>Status: <span class="${friend.status}">${friend.status.toUpperCase()}</span></p>
      <p>Last updated: ${new Date(friend.lastUpdated).toLocaleString()}</p>
    `);
  
  friendMarkers[friend.id] = marker;
  
  // Add to friends list
  const friendElement = document.createElement('div');
  friendElement.className = 'friend-item';
  friendElement.innerHTML = `
    <div class="friend-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div class="friend-info">
      <div class="friend-name">${friend.name}</div>
      <div class="friend-status ${friend.status}">
        ${friend.status === 'safe' ? 'Safe' : friend.status === 'warning' ? 'Needs help' : 'In danger!'}
      </div>
    </div>
  `;
  
  friendElement.addEventListener('click', () => {
    map.setView([friend.lat, friend.lng], 15);
    marker.openPopup();
  });
  
  friendsList.appendChild(friendElement);
});

// Add locations to the map and sidebar
const locationsList = document.getElementById('locationsList');
const locationMarkers = {};

function addLocationToMap(location) {
  // Add marker to map
  const marker = L.marker([location.lat, location.lng], {
    icon: createCustomIcon(location.type)
  }).addTo(map)
    .bindPopup(`
      <h3>${location.name}</h3>
      <p>Type: ${location.type}</p>
    `);
  
  locationMarkers[location.id] = marker;
  
  // Add to locations list
  const locationElement = document.createElement('div');
  locationElement.className = 'location-item';
  locationElement.innerHTML = `
    <div class="location-icon">
      <i class="fas ${
        location.type === 'home' ? 'fa-home' : 
        location.type === 'office' ? 'fa-building' : 
        location.type === 'school' ? 'fa-school' : 'fa-map-marker-alt'
      }"></i>
    </div>
    <div class="location-info">
      <div class="location-name">${location.name}</div>
      <div class="location-type">${location.type}</div>
    </div>
  `;
  
  locationElement.addEventListener('click', () => {
    map.setView([location.lat, location.lng], 15);
    marker.openPopup();
  });
  
  locationsList.appendChild(locationElement);
}

// Initialize locations
locations.forEach(location => {
  addLocationToMap(location);
});

// Update safety status
function updateSafetyStatus() {
  const safeCount = friends.filter(f => f.status === 'safe').length;
  const warningCount = friends.filter(f => f.status === 'warning').length;
  const dangerCount = friends.filter(f => f.status === 'danger').length;
  
  const statusIndicator = document.querySelector('.status-indicator');
  const statusDot = statusIndicator.querySelector('.status-dot');
  const statusText = statusIndicator.querySelector('span');
  
  if (dangerCount > 0) {
    statusDot.className = 'status-dot danger';
    statusText.textContent = `${dangerCount} friend(s) in danger!`;
  } else if (warningCount > 0) {
    statusDot.className = 'status-dot warning';
    statusText.textContent = `${warningCount} friend(s) need help`;
  } else {
    statusDot.className = 'status-dot safe';
    statusText.textContent = 'All friends are safe';
  }
}

updateSafetyStatus();

// Modal functionality
const modal = document.getElementById('locationModal');
const addLocationBtn = document.getElementById('addLocationBtn');
const closeBtn = document.querySelector('.close-btn');
const locationForm = document.getElementById('locationForm');
const getLocationBtn = document.getElementById('getLocationBtn');

addLocationBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

getLocationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.getElementById('locationLat').value = position.coords.latitude.toFixed(6);
        document.getElementById('locationLng').value = position.coords.longitude.toFixed(6);
      },
      (error) => {
        alert('Unable to retrieve your location: ' + error.message);
      }
    );
  } else {
    alert('Geolocation is not supported by your browser');
  }
});

locationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const newLocation = {
    id: Date.now(),
    name: document.getElementById('locationName').value,
    type: document.getElementById('locationType').value,
    lat: parseFloat(document.getElementById('locationLat').value),
    lng: parseFloat(document.getElementById('locationLng').value)
  };
  
  locations.push(newLocation);
  addLocationToMap(newLocation);
  
  // Reset form
  locationForm.reset();
  modal.style.display = 'none';
});

// Emergency buttons
document.getElementById('safeBtn').addEventListener('click', () => {
  alert("Your 'I'm Safe' status has been shared with your contacts!");
  // In a real app, this would send a notification to all friends
});

document.getElementById('alertBtn').addEventListener('click', () => {
  if (confirm("Send emergency alert to all your contacts?")) {
    alert("Emergency alert sent to all contacts!");
    // In a real app, this would notify all friends
  }
});

// Layer controls
document.getElementById('weatherLayer').addEventListener('change', (e) => {
  if (e.target.checked) {
    weatherLayer.addTo(map);
  } else {
    weatherLayer.remove();
  }
});

document.getElementById('friendsLayer').addEventListener('change', (e) => {
  Object.values(friendMarkers).forEach(marker => {
    if (e.target.checked) {
      marker.addTo(map);
    } else {
      marker.remove();
    }
  });
});

document.getElementById('locationsLayer').addEventListener('change', (e) => {
  Object.values(locationMarkers).forEach(marker => {
    if (e.target.checked) {
      marker.addTo(map);
    } else {
      marker.remove();
    }
  });
});

// Set user's current location if available
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      map.setView([position.coords.latitude, position.coords.longitude], 13);
    },
    () => {
      console.log('Using default location');
    }
  );
}