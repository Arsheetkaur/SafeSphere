from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os
import requests
from dotenv import load_dotenv
import hashlib
import secrets

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get API key from environment
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "demo_key")

# Mock data storage (in-memory for demo)
users = []
locations = []
friends = []
friend_requests = []
alerts = []
sessions = {}  # Store user sessions

@app.route('/')
def root():
    return jsonify({"message": "SafeSphere API is running! 🛡️"})

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "safesphere-backend"})

# Authentication endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    user_data = request.get_json()
    
    # Check if user already exists
    for user in users:
        if user["email"] == user_data.get("email"):
            return jsonify({"error": "User already exists"}), 400
    
    user_id = len(users) + 1
    password_hash = hashlib.sha256(user_data.get("password", "").encode()).hexdigest()
    
    new_user = {
        "id": user_id,
        "name": user_data.get("name", "Unknown"),
        "email": user_data.get("email", "unknown@example.com"),
        "phone": user_data.get("phone"),
        "password_hash": password_hash,
        "is_safe": True,
        "status": "safe",  # safe, alert, danger
        "last_safe_update": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "latitude": user_data.get("latitude"),
        "longitude": user_data.get("longitude")
    }
    users.append(new_user)
    
    # Create session
    session_token = secrets.token_urlsafe(32)
    sessions[session_token] = user_id
    
    return jsonify({
        "user": {k: v for k, v in new_user.items() if k != "password_hash"},
        "session_token": session_token
    }), 201

@app.route('/auth/login', methods=['POST'])
def login():
    user_data = request.get_json()
    email = user_data.get("email")
    password = user_data.get("password")
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    for user in users:
        if user["email"] == email and user["password_hash"] == password_hash:
            # Create session
            session_token = secrets.token_urlsafe(32)
            sessions[session_token] = user["id"]
            
            return jsonify({
                "user": {k: v for k, v in user.items() if k != "password_hash"},
                "session_token": session_token
            })
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/auth/logout', methods=['POST'])
def logout():
    session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if session_token in sessions:
        del sessions[session_token]
    return jsonify({"message": "Logged out successfully"})

def get_current_user():
    """Helper function to get current user from session"""
    session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = sessions.get(session_token)
    if user_id:
        for user in users:
            if user["id"] == user_id:
                return user
    return None

# User endpoints
@app.route('/users/', methods=['POST'])
def create_user():
    user_data = request.get_json()
    user_id = len(users) + 1
    new_user = {
        "id": user_id,
        "name": user_data.get("name", "Unknown"),
        "email": user_data.get("email", "unknown@example.com"),
        "phone": user_data.get("phone"),
        "is_safe": True,
        "status": "safe",
        "last_safe_update": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "latitude": user_data.get("latitude"),
        "longitude": user_data.get("longitude")
    }
    users.append(new_user)
    return jsonify(new_user), 201

@app.route('/users/', methods=['GET'])
def get_users():
    return jsonify(users)

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    for user in users:
        if user["id"] == user_id:
            return jsonify({k: v for k, v in user.items() if k != "password_hash"})
    return jsonify({"error": "User not found"}), 404

@app.route('/users/profile', methods=['GET'])
def get_profile():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    return jsonify({k: v for k, v in current_user.items() if k != "password_hash"})

@app.route('/users/profile', methods=['PUT'])
def update_profile():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    user_data = request.get_json()
    
    # Update user data
    current_user["name"] = user_data.get("name", current_user["name"])
    current_user["phone"] = user_data.get("phone", current_user["phone"])
    current_user["latitude"] = user_data.get("latitude", current_user["latitude"])
    current_user["longitude"] = user_data.get("longitude", current_user["longitude"])
    
    return jsonify({k: v for k, v in current_user.items() if k != "password_hash"})

# Friend request endpoints
@app.route('/friends/request', methods=['POST'])
def send_friend_request():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    request_data = request.get_json()
    friend_email = request_data.get("friend_email")
    
    # Find friend by email
    friend = None
    for user in users:
        if user["email"] == friend_email:
            friend = user
            break
    
    if not friend:
        return jsonify({"error": "User not found"}), 404
    
    if friend["id"] == current_user["id"]:
        return jsonify({"error": "Cannot add yourself as friend"}), 400
    
    # Check if request already exists
    for req in friend_requests:
        if (req["from_user_id"] == current_user["id"] and 
            req["to_user_id"] == friend["id"] and 
            req["status"] == "pending"):
            return jsonify({"error": "Friend request already sent"}), 400
    
    request_id = len(friend_requests) + 1
    new_request = {
        "id": request_id,
        "from_user_id": current_user["id"],
        "to_user_id": friend["id"],
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    friend_requests.append(new_request)
    
    return jsonify({"message": "Friend request sent successfully"}), 201

@app.route('/friends/requests', methods=['GET'])
def get_friend_requests():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    user_requests = []
    for req in friend_requests:
        if req["to_user_id"] == current_user["id"] and req["status"] == "pending":
            # Get sender info
            for user in users:
                if user["id"] == req["from_user_id"]:
                    user_requests.append({
                        "id": req["id"],
                        "from_user": {k: v for k, v in user.items() if k != "password_hash"},
                        "status": req["status"],
                        "created_at": req["created_at"]
                    })
                    break
    
    return jsonify(user_requests)

@app.route('/friends/request/<int:request_id>/<action>', methods=['POST'])
def respond_to_friend_request(request_id, action):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    # Find the request
    request_obj = None
    for req in friend_requests:
        if req["id"] == request_id and req["to_user_id"] == current_user["id"]:
            request_obj = req
            break
    
    if not request_obj:
        return jsonify({"error": "Friend request not found"}), 404
    
    if action == "accept":
        request_obj["status"] = "accepted"
        # Create friend connection
        connection_id = len(friends) + 1
        new_connection = {
            "id": connection_id,
            "user_id": request_obj["from_user_id"],
            "friend_id": request_obj["to_user_id"],
            "status": "accepted",
            "created_at": datetime.utcnow().isoformat()
        }
        friends.append(new_connection)
        
        return jsonify({"message": "Friend request accepted"})
    
    elif action == "reject":
        request_obj["status"] = "rejected"
        return jsonify({"message": "Friend request rejected"})
    
    else:
        return jsonify({"error": "Invalid action"}), 400

# Location endpoints
@app.route('/locations/', methods=['POST'])
def create_location():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    location_data = request.get_json()
    location_id = len(locations) + 1
    new_location = {
        "id": location_id,
        "user_id": current_user["id"],
        "name": location_data.get("name", "Unknown"),
        "latitude": location_data.get("latitude", 0.0),
        "longitude": location_data.get("longitude", 0.0),
        "type": location_data.get("type", "other"),
        "created_at": datetime.utcnow().isoformat()
    }
    locations.append(new_location)
    return jsonify(new_location), 201

@app.route('/locations/', methods=['GET'])
def get_locations():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    user_locations = [loc for loc in locations if loc["user_id"] == current_user["id"]]
    return jsonify(user_locations)

@app.route('/locations/user/<int:user_id>', methods=['GET'])
def get_user_locations(user_id):
    user_locations = [loc for loc in locations if loc["user_id"] == user_id]
    return jsonify(user_locations)

# Friend connection endpoints
@app.route('/friends/', methods=['POST'])
def add_friend():
    connection_data = request.get_json()
    connection_id = len(friends) + 1
    new_connection = {
        "id": connection_id,
        "user_id": connection_data.get("user_id"),
        "friend_id": connection_data.get("friend_id"),
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    friends.append(new_connection)
    return jsonify({"message": "Friend connection created", "status": "pending"}), 201

@app.route('/friends/', methods=['GET'])
def get_friends():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    user_friends = []
    for connection in friends:
        if connection["user_id"] == current_user["id"] and connection["status"] == "accepted":
            for user in users:
                if user["id"] == connection["friend_id"]:
                    user_friends.append({k: v for k, v in user.items() if k != "password_hash"})
                    break
    return jsonify(user_friends)

@app.route('/friends/<int:user_id>', methods=['GET'])
def get_friends_by_id(user_id):
    user_friends = []
    for connection in friends:
        if connection["user_id"] == user_id and connection["status"] == "accepted":
            for user in users:
                if user["id"] == connection["friend_id"]:
                    user_friends.append({k: v for k, v in user.items() if k != "password_hash"})
                    break
    return jsonify(user_friends)

# Weather and disaster data endpoints
@app.route('/weather/<lat>/<lon>', methods=['GET'])
def get_weather_data(lat, lon):
    try:
        # Convert to float
        lat_float = float(lat)
        lon_float = float(lon)
        
        # Try to get real weather data from OpenWeatherMap
        if OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != "demo_key":
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": lat_float,
                "lon": lon_float,
                "appid": OPENWEATHER_API_KEY,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            weather_data = {
                "latitude": lat_float,
                "longitude": lon_float,
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "wind_speed": data["wind"]["speed"],
                "wind_direction": data["wind"]["deg"],
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
                "timestamp": datetime.utcnow().isoformat(),
                "source": "OpenWeatherMap"
            }
            return jsonify(weather_data)
        else:
            # Fallback to mock data if no API key
            weather_data = {
                "latitude": lat_float,
                "longitude": lon_float,
                "temperature": 22.5,
                "humidity": 65.0,
                "pressure": 1013.25,
                "wind_speed": 5.2,
                "wind_direction": 180.0,
                "description": "Partly cloudy",
                "icon": "02d",
                "timestamp": datetime.utcnow().isoformat(),
                "source": "Mock Data (No API Key)"
            }
            return jsonify(weather_data)
            
    except ValueError:
        return jsonify({"error": "Invalid coordinates"}), 400
    except Exception as e:
        # Return mock data if API fails
        weather_data = {
            "latitude": float(lat),
            "longitude": float(lon),
            "temperature": 22.5,
            "humidity": 65.0,
            "pressure": 1013.25,
            "wind_speed": 5.2,
            "wind_direction": 180.0,
            "description": "Partly cloudy",
            "icon": "02d",
            "timestamp": datetime.utcnow().isoformat(),
            "source": f"Mock Data (API Error: {str(e)})"
        }
        return jsonify(weather_data)

@app.route('/disasters/<lat>/<lon>', methods=['GET'])
def get_disaster_data(lat, lon):
    try:
        lat_float = float(lat)
        lon_float = float(lon)
        radius = request.args.get('radius', 100.0, type=float)
        
        # Mock disaster data
        disaster_data = [
            {
                "id": "mock_earthquake_1",
                "type": "earthquake",
                "title": "Minor Earthquake",
                "description": "Minor seismic activity detected",
                "latitude": lat_float + 0.01,
                "longitude": lon_float + 0.01,
                "magnitude": 3.2,
                "radius": radius,
                "timestamp": datetime.utcnow().isoformat(),
                "severity": "low"
            },
            {
                "id": "mock_flood_1",
                "type": "flood",
                "title": "Flood Warning",
                "description": "Heavy rainfall causing flooding",
                "latitude": lat_float - 0.01,
                "longitude": lon_float - 0.01,
                "radius": radius,
                "timestamp": datetime.utcnow().isoformat(),
                "severity": "medium"
            }
        ]
        return jsonify(disaster_data)
    except ValueError:
        return jsonify({"error": "Invalid coordinates"}), 400

@app.route('/weather/radar/<lat>/<lon>', methods=['GET'])
def get_weather_radar(lat, lon):
    try:
        lat_float = float(lat)
        lon_float = float(lon)
        
        # Mock radar data
        radar_data = {
            "latitude": lat_float,
            "longitude": lon_float,
            "radar_url": f"https://tile.openweathermap.org/map/precipitation_new/10/512/512.png?appid={OPENWEATHER_API_KEY}",
            "timestamp": datetime.utcnow().isoformat()
        }
        return jsonify(radar_data)
    except ValueError:
        return jsonify({"error": "Invalid coordinates"}), 400

# Enhanced Emergency endpoints
@app.route('/emergency/safe/<int:user_id>', methods=['POST'])
def mark_safe(user_id):
    current_user = get_current_user()
    if not current_user or current_user["id"] != user_id:
        return jsonify({"error": "Not authorized"}), 401
    
    current_user["is_safe"] = True
    current_user["status"] = "safe"
    current_user["last_safe_update"] = datetime.utcnow().isoformat()
    
    # Notify friends
    notify_friends(user_id, "safe")
    
    return jsonify({"message": "Safety status updated", "status": "safe"})

@app.route('/emergency/alert/<int:user_id>', methods=['POST'])
def send_emergency_alert(user_id):
    current_user = get_current_user()
    if not current_user or current_user["id"] != user_id:
        return jsonify({"error": "Not authorized"}), 401
    
    current_user["is_safe"] = False
    current_user["status"] = "alert"
    current_user["last_safe_update"] = datetime.utcnow().isoformat()
    
    # Create alert
    alert_id = len(alerts) + 1
    new_alert = {
        "id": alert_id,
        "user_id": user_id,
        "type": "emergency_alert",
        "message": "Emergency alert sent",
        "created_at": datetime.utcnow().isoformat()
    }
    alerts.append(new_alert)
    
    # Notify friends
    notify_friends(user_id, "alert")
    
    return jsonify({"message": "Emergency alert sent to all contacts", "status": "alert"})

@app.route('/emergency/danger/<int:user_id>', methods=['POST'])
def mark_danger(user_id):
    current_user = get_current_user()
    if not current_user or current_user["id"] != user_id:
        return jsonify({"error": "Not authorized"}), 401
    
    current_user["is_safe"] = False
    current_user["status"] = "danger"
    current_user["last_safe_update"] = datetime.utcnow().isoformat()
    
    # Create alert
    alert_id = len(alerts) + 1
    new_alert = {
        "id": alert_id,
        "user_id": user_id,
        "type": "danger_alert",
        "message": "User marked as in danger",
        "created_at": datetime.utcnow().isoformat()
    }
    alerts.append(new_alert)
    
    # Notify friends
    notify_friends(user_id, "danger")
    
    return jsonify({"message": "Danger status updated", "status": "danger"})

@app.route('/emergency/status/<int:user_id>', methods=['GET'])
def get_safety_status(user_id):
    for user in users:
        if user["id"] == user_id:
            return jsonify({
                "user_id": user_id,
                "is_safe": user["is_safe"],
                "status": user["status"],
                "last_update": user["last_safe_update"]
            })
    return jsonify({"error": "User not found"}), 404

@app.route('/emergency/alerts', methods=['GET'])
def get_alerts():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    # Get alerts for current user and their friends
    user_alerts = []
    for alert in alerts:
        if alert["user_id"] == current_user["id"]:
            user_alerts.append(alert)
        else:
            # Check if alert is from a friend
            for connection in friends:
                if (connection["user_id"] == current_user["id"] and 
                    connection["friend_id"] == alert["user_id"] and 
                    connection["status"] == "accepted"):
                    user_alerts.append(alert)
                    break
    
    return jsonify(user_alerts)

def notify_friends(user_id, status):
    """Helper function to notify friends of status changes"""
    # In a real app, this would send push notifications, emails, etc.
    print(f"User {user_id} status changed to {status} - notifying friends")

if __name__ == '__main__':
    print("🚀 Starting SafeSphere Backend (Flask)...")
    print("📍 API will be available at: http://localhost:5000")
    print("🔍 Health Check: http://localhost:5000/health")
    print(f"🌤️ Weather API Key: {'✅ Set' if OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != 'demo_key' else '❌ Not set'}")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True) 