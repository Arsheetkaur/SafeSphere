# SafeSphere Backend

A Flask-based backend for the SafeSphere Weather Radar + Friend Safety App with two-way communication support.

## Features

- **🔐 User Authentication** - Secure registration, login, and session management
- **👥 Friend Management** - Send/accept friend requests and manage connections
- **🚨 Emergency Features** - Real-time safety status updates and emergency alerts
- **📍 Location Management** - Store and retrieve important locations
- **🌤️ Weather Integration** - Real-time weather data via OpenWeatherMap API
- **🔔 Real-time Notifications** - Instant updates when friends' status changes
- **🛡️ Security** - Password hashing and session-based authentication

## Tech Stack

- **Framework**: Flask
- **Database**: SQLite (for development) / PostgreSQL (for production)
- **Authentication**: Session-based with password hashing
- **External APIs**: OpenWeatherMap for weather data
- **CORS**: Cross-origin resource sharing enabled

## 🚀 Quick Setup for Team Members

### Prerequisites

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone and Navigate

```bash
# Clone the repository (if not already done)
git clone https://github.com/your-username/safesphere.git
cd safesphere/backend
```

### Step 2: Set Up Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r flask_requirements.txt
```

### Step 4: Environment Configuration

```bash
# Copy the example environment file
copy env_example.txt .env

# Edit .env file and add your OpenWeatherMap API key
# Get a free API key from: https://openweathermap.org/api
```

**Important**: You need to get a free API key from [OpenWeatherMap](https://openweathermap.org/api) and add it to the `.env` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### Step 5: Run the Server

```bash
python flask_main.py
```

You should see output like:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

The backend is now running on `http://localhost:5000`

## 🔄 API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login to account
- `POST /auth/logout` - Logout
- `GET /users/profile` - Get current user profile

### Friends & Communication
- `POST /friends/request` - Send friend request
- `GET /friends/requests` - Get pending friend requests
- `POST /friends/request/{id}/accept` - Accept friend request
- `POST /friends/request/{id}/reject` - Reject friend request
- `GET /friends/` - Get friends list

### Emergency Features
- `POST /emergency/safe/{id}` - Mark user as safe
- `POST /emergency/alert/{id}` - Send emergency alert
- `POST /emergency/danger/{id}` - Mark user as in danger
- `GET /emergency/alerts` - Get recent alerts

### Location & Weather
- `POST /locations/` - Add important location
- `GET /locations/` - Get user's locations
- `GET /weather/{lat}/{lon}` - Get weather data
- `GET /disasters/{lat}/{lon}` - Get disaster alerts (mock data)

### Health & Status
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint

## 📊 Database Schema

### Users Table
- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `password_hash`: Hashed password
- `phone`: Phone number (optional)
- `is_safe`: Safety status boolean
- `last_safe_update`: Timestamp of last safety update

### Locations Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `name`: Location name (e.g., "Home", "Office")
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `address`: Human-readable address
- `is_important`: Boolean for important places

### Friend Requests Table
- `id`: Primary key
- `from_user_id`: User sending request
- `to_user_id`: User receiving request
- `status`: Request status (pending/accepted/rejected)
- `created_at`: Timestamp of request

### Emergency Alerts Table
- `id`: Primary key
- `user_id`: User who sent alert
- `alert_type`: Type of alert (safe/alert/danger)
- `message`: Alert message
- `created_at`: Timestamp of alert

## 🛠️ Development

### Project Structure

```
backend/
├── flask_main.py           # Main Flask application
├── flask_requirements.txt  # Python dependencies
├── env_example.txt         # Environment variables template
└── README.md              # This file
```

### Adding New Features

1. **Database Models**: Add new models in `flask_main.py`
2. **API Endpoints**: Add new routes in `flask_main.py`
3. **Business Logic**: Implement logic within route functions
4. **Error Handling**: Add proper error responses

### Testing API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get weather data
curl http://localhost:5000/weather/40.7128/-74.0060
```

### Debug Mode

The Flask app runs in debug mode by default, which provides:
- Automatic reloading when code changes
- Detailed error messages
- Interactive debugger

## 🐛 Troubleshooting

### Common Issues

**1. Import Errors**
- Make sure all dependencies are installed: `pip install -r flask_requirements.txt`
- Verify you're using Python 3.8+
- Check if virtual environment is activated

**2. Port Already in Use**
- Change the port in `flask_main.py` or kill the process using port 5000
- Use: `netstat -ano | findstr :5000` (Windows) or `lsof -i :5000` (macOS/Linux)

**3. Weather API Errors**
- Verify your OpenWeatherMap API key is correct
- Check if the API key has the required permissions
- Look at the Flask logs for detailed error messages

**4. Database Issues**
- The app uses SQLite by default (safesphere.db file)
- For production, consider using PostgreSQL

### Debug Commands

```bash
# Check Python version
python --version

# Check installed packages
pip list

# Check if server is running
curl http://localhost:5000/health

# View Flask logs
# Look at the terminal where you ran python flask_main.py
```

## 🚀 Production Deployment

### Environment Variables

Set these in production:

```bash
OPENWEATHER_API_KEY=your_actual_api_key
FLASK_ENV=production
DEBUG=False
```

### Using Gunicorn (Recommended)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 flask_main:app
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY flask_requirements.txt .
RUN pip install -r flask_requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "flask_main.py"]
```

## 🔗 Frontend Integration

The frontend communicates with this backend via the API endpoints listed above. The backend handles:

- **CORS**: Cross-origin requests are enabled for frontend communication
- **Session Management**: User sessions are maintained via cookies
- **Error Handling**: Proper HTTP status codes and error messages
- **Data Validation**: Input validation for all endpoints

### Example Frontend API Calls

```javascript
// Register user
const response = await fetch('http://localhost:5000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// Get weather data
const weather = await fetch('http://localhost:5000/weather/40.7128/-74.0060')
  .then(r => r.json());

// Send emergency alert
await fetch('http://localhost:5000/emergency/alert/1', { method: 'POST' });
```

## 🤝 Contributing

### Before Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow PEP 8 Python style guide
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Test the API**
   - Use curl or Postman to test new endpoints
   - Verify error handling works correctly
   - Check that CORS is working for frontend

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **Python**: Follow PEP 8 style guide
- **Comments**: Add docstrings for functions and classes
- **Error Handling**: Use proper HTTP status codes
- **Testing**: Test all endpoints before committing

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Look at Flask logs** in the terminal
3. **Test endpoints** using curl or Postman
4. **Ask in the team chat** or create an issue on GitHub

## 🔗 Useful Links

- **Flask Documentation**: https://flask.palletsprojects.com/
- **OpenWeatherMap API**: https://openweathermap.org/api
- **Python Virtual Environments**: https://docs.python.org/3/tutorial/venv.html
- **HTTP Status Codes**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

## 📄 License

This project is part of the SafeSphere hackathon solution.

---

**Happy coding! 🎉**

The backend is now ready to serve the SafeSphere frontend application! 