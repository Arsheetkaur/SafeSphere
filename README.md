# SafeSphere 🛡️

A comprehensive safety and emergency communication platform that enables real-time two-way communication between friends and family during emergencies.

## 🌟 Features

- **🔐 User Authentication** - Secure registration and login system
- **👥 Friend Management** - Send and accept friend requests
- **🚨 Emergency Alerts** - Real-time emergency status updates
- **📍 Location Sharing** - Share and view friend locations on interactive maps
- **🌤️ Weather Integration** - Real-time weather data via OpenWeatherMap API
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices
- **🔔 Real-time Notifications** - Instant updates when friends' status changes

## 🚀 Quick Start for Team Members

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/safesphere.git

# Navigate to the project directory
cd safesphere
```

### Step 2: Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r flask_requirements.txt

# Set up environment variables
# Copy the example environment file
copy env_example.txt .env

# Edit .env file and add your OpenWeatherMap API key
# Get a free API key from: https://openweathermap.org/api
```

**Important**: You need to get a free API key from [OpenWeatherMap](https://openweathermap.org/api) and add it to the `.env` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### Step 3: Start the Backend Server

```bash
# Make sure you're in the backend directory and virtual environment is activated
python flask_main.py
```

You should see output like:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

The backend is now running on `http://localhost:5000`

### Step 4: Open the Frontend

**Option A: Direct File Opening (Simplest)**
- Navigate to the `Frontend` folder
- Double-click on `login.html` to open in your browser
- Or open `index.html` to go directly to the main app

**Option B: Using a Local Server (Recommended for Development)**
```bash
# Open a new terminal window/tab
cd Frontend

# Using Python
python -m http.server 8000

# Or using Node.js (if you have Node.js installed)
npx http-server -p 8000
```

Then open `http://localhost:8000/login.html` in your browser.

### Step 5: Test the Application

1. **Register a new account** using the registration form
2. **Login** with your credentials
3. **Add friends** by sending friend requests
4. **Test emergency features** by clicking the emergency buttons
5. **View the demo** by opening `demo.html`

## 📁 Project Structure

```
Safesphere/
├── backend/
│   ├── flask_main.py           # Main Flask application
│   ├── flask_requirements.txt  # Python dependencies
│   ├── env_example.txt         # Environment variables template
│   └── README.md              # Backend documentation
├── Frontend/
│   ├── index.html             # Main application
│   ├── login.html             # Authentication page
│   ├── demo.html              # Two-way communication demo
│   ├── api.js                 # API communication module
│   ├── script.js              # Main application logic
│   ├── style.css              # Styling
│   └── README.md              # Frontend documentation
└── README.md                  # This file
```

## 🔧 Development Setup

### For Backend Developers

1. **Install Python Dependencies**
   ```bash
   cd backend
   pip install -r flask_requirements.txt
   ```

2. **Set Up Environment Variables**
   ```bash
   copy env_example.txt .env
   # Edit .env and add your OpenWeatherMap API key
   ```

3. **Run the Server**
   ```bash
   python flask_main.py
   ```

4. **Test API Endpoints**
   - Backend runs on `http://localhost:5000`
   - API documentation available in `backend/README.md`

### For Frontend Developers

1. **Open in VS Code**
   ```bash
   cd Frontend
   code .
   ```

2. **Install VS Code Extensions**
   - Live Server
   - HTML CSS Support
   - JavaScript (ES6) code snippets

3. **Use Live Server**
   - Right-click on `index.html` → "Open with Live Server"
   - This automatically reloads the page when you make changes

4. **Browser Developer Tools**
   - Press F12 to open developer tools
   - Check Console for errors
   - Use Network tab to monitor API calls

## 🐛 Troubleshooting

### Common Issues

**1. Backend Won't Start**
- Make sure Python 3.8+ is installed
- Check if all dependencies are installed: `pip install -r flask_requirements.txt`
- Verify the `.env` file exists and has the API key
- Check if port 5000 is already in use

**2. Frontend Can't Connect to Backend**
- Ensure backend is running on `http://localhost:5000`
- Check browser console (F12) for CORS errors
- Use a local server instead of opening files directly

**3. Weather Data Not Loading**
- Verify your OpenWeatherMap API key is correct
- Check if the API key has the required permissions
- Look at backend logs for API errors

**4. Authentication Issues**
- Clear browser cache and local storage
- Check if session cookies are being set
- Verify the backend is running properly

### Debug Commands

```bash
# Check Python version
python --version

# Check installed packages
pip list

# Check if backend is running
curl http://localhost:5000/health

# Check backend logs
# Look at the terminal where you ran python flask_main.py
```

## 🔄 API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login to account
- `POST /auth/logout` - Logout

### Friends & Communication
- `POST /friends/request` - Send friend request
- `GET /friends/requests` - Get pending requests
- `POST /friends/request/{id}/accept` - Accept friend request
- `GET /friends/` - Get friends list

### Emergency Features
- `POST /emergency/safe/{id}` - Mark user as safe
- `POST /emergency/alert/{id}` - Send emergency alert
- `GET /emergency/alerts` - Get recent alerts

### Location & Weather
- `GET /weather/{lat}/{lon}` - Get weather data
- `POST /locations/` - Add location
- `GET /locations/` - Get user locations

## 🤝 Contributing

### Before Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

4. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to the GitHub repository
   - Create a new pull request from your branch
   - Add a description of your changes

### Code Style Guidelines

- **Python**: Follow PEP 8 style guide
- **JavaScript**: Use consistent indentation (2 spaces)
- **HTML/CSS**: Use semantic HTML and clean CSS
- **Comments**: Add comments for complex logic
- **Testing**: Test your changes before committing

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Tablet browsers

## 🚀 Deployment

### For Production

1. **Backend Deployment**
   - Deploy to a cloud service (Heroku, AWS, DigitalOcean)
   - Set up environment variables
   - Configure CORS for your domain

2. **Frontend Deployment**
   - Upload frontend files to a web server
   - Update `API_BASE_URL` in `api.js` to point to your production backend
   - Configure HTTPS for security

### For Testing

- Use the local setup described above
- Test on different browsers and devices
- Verify all features work correctly

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Look at browser console** (F12) for frontend errors
3. **Check backend logs** in the terminal
4. **Ask in the team chat** or create an issue on GitHub
5. **Check the documentation** in `backend/README.md` and `Frontend/README.md`

## 🔗 Useful Links

- **OpenWeatherMap API**: https://openweathermap.org/api
- **Flask Documentation**: https://flask.palletsprojects.com/
- **Leaflet.js (Maps)**: https://leafletjs.com/
- **VS Code**: https://code.visualstudio.com/

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy coding! 🎉**

If you have any questions or need help, don't hesitate to ask your team members or create an issue on GitHub.