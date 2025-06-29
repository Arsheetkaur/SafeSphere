# SafeSphere Frontend

## 🚀 Quick Setup for Team Members

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/safesphere.git
cd safesphere
```

### Step 2: Start the Backend Server
```bash
cd backend
pip install -r requirements.txt
python flask_main.py
```
The backend will start on `http://localhost:5000`

### Step 3: Open the Frontend
Since this is a static frontend, you can open it directly in your browser:

**Option A: Direct File Opening**
- Navigate to the `Frontend` folder
- Double-click on `login.html` to open in your browser
- Or open `index.html` to go directly to the main app

**Option B: Using a Local Server (Recommended)**
```bash
cd Frontend
# Using Python (if you have Python installed)
python -m http.server 8000

# Using Node.js (if you have Node.js installed)
npx http-server -p 8000

# Using PHP (if you have PHP installed)
php -S localhost:8000
```

Then open `http://localhost:8000/login.html` in your browser.

### Step 4: Test the Application
1. **Register a new account** using the registration form
2. **Login** with your credentials
3. **Add friends** by sending friend requests
4. **Test emergency features** by clicking the emergency buttons
5. **View the demo** by opening `demo.html`

## 📁 Project Structure

```
Frontend/
├── index.html          # Main application
├── login.html          # Authentication page
├── demo.html           # Two-way communication demo
├── api.js              # API communication module
├── script.js           # Main application logic
├── style.css           # Styling
└── README.md           # This file
```

## 🔧 Development Setup

### For Developers Working on the Frontend

1. **Install a Code Editor** (VS Code recommended)
   - Download [VS Code](https://code.visualstudio.com/)
   - Install extensions: Live Server, HTML CSS Support, JavaScript

2. **Using VS Code Live Server**
   - Open the `Frontend` folder in VS Code
   - Right-click on `index.html` → "Open with Live Server"
   - This will automatically open the app and reload on changes

3. **Browser Developer Tools**
   - Press F12 to open developer tools
   - Check the Console tab for any errors
   - Use the Network tab to monitor API calls

## 🐛 Troubleshooting

### Common Issues

**1. Backend Connection Error**
- Make sure the backend is running on `http://localhost:5000`
- Check if the backend server started without errors
- Verify your firewall isn't blocking the connection

**2. CORS Errors**
- The backend should handle CORS automatically
- If you see CORS errors, make sure you're using a local server (not opening files directly)

**3. Authentication Issues**
- Clear browser cache and local storage
- Check if the session token is being stored properly
- Try logging out and logging back in

**4. Map Not Loading**
- Check your internet connection (map tiles are loaded from OpenStreetMap)
- Verify that Leaflet.js is loading properly

### Debug Mode
Open browser console (F12) and look for:
- API call errors
- JavaScript errors
- Network request failures

## 🔄 API Integration

The frontend communicates with the backend via these endpoints:

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout

### Friends & Communication
- `POST /friends/request` - Send friend request
- `GET /friends/requests` - Get pending requests
- `GET /friends/` - Get friends list

### Emergency Features
- `POST /emergency/safe/{id}` - Mark as safe
- `POST /emergency/alert/{id}` - Send alert
- `GET /emergency/alerts` - Get alerts

### Location & Weather
- `GET /weather/{lat}/{lon}` - Get weather data
- `POST /locations/` - Add location
- `GET /locations/` - Get user locations

## 🎨 Customization

### Styling
- Edit `style.css` to change colors, layout, and design
- The app uses CSS custom properties for easy theming
- Main color: `#4CAF50` (green)

### Features
- Modify `script.js` to add new functionality
- Update `api.js` to add new API endpoints
- Edit HTML files to change the UI structure

## 📱 Mobile Support

The frontend is fully responsive and works on:
- Desktop browsers
- Mobile browsers (iOS Safari, Chrome Mobile)
- Tablet browsers

## 🚀 Deployment

### For Production
1. **Build the frontend** (if using a build tool)
2. **Upload files** to your web server
3. **Configure CORS** on the backend for your domain
4. **Update API_BASE_URL** in `api.js` to point to your production backend

### For Testing
- Use the local server setup mentioned above
- Test on different browsers and devices
- Verify all features work correctly

## 🤝 Contributing

### Before Making Changes
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Commit with a clear message: `git commit -m "Add feature: description"`
5. Push to your branch: `git push origin feature/your-feature-name`
6. Create a pull request

### Code Style
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow JavaScript best practices
- Test your changes before committing

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at browser console for errors
3. Verify backend is running correctly
4. Ask in the team chat or create an issue

## 🔗 Links

- **Backend Repository**: [Link to backend repo]
- **API Documentation**: See backend README
- **Demo**: Open `demo.html` to see the system in action
- **Main App**: Open `index.html` to use the full application 