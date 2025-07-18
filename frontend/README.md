# Face Recognition Attendance System - Frontend

A modern, responsive single-page application (SPA) built with vanilla JavaScript for the Face Recognition Attendance System. Features role-based dashboards, real-time data updates, and seamless API integration.

## 🚀 Features

### Role-Based Dashboards

#### Employee Dashboard
- View personal attendance history
- Filter attendance by date range
- Personal profile management
- See currently present employees
- Attendance statistics and insights

#### Admin Dashboard
- All employee features plus:
- Manage all employees
- Enroll new employees with face recognition
- View and manage all attendance records
- Face embedding management
- Camera system control
- Live video feed access

#### Super Admin Dashboard
- All admin features plus:
- User account management
- Role assignment and permissions
- Network camera discovery
- Advanced system configuration
- System logs and monitoring

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Authentication**: JWT-based with role-based access control
- **Styling**: Modern CSS with CSS Grid/Flexbox and CSS Variables
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter from Google Fonts
- **No Dependencies**: Pure implementation without external frameworks

### Project Structure
```
frontend/
├── index.html              # Main application file
├── css/
│   ├── styles.css         # Core styles and design system
│   └── dashboard.css      # Dashboard-specific components
├── js/
│   ├── app.js            # Main application controller
│   ├── api.js            # API service layer
│   ├── auth.js           # Authentication service
│   ├── router.js         # SPA routing system
│   ├── ui.js             # UI utilities and components
│   └── pages/
│       ├── employee.js   # Employee-level functionality
│       ├── admin.js      # Admin-level pages (to be added)
│       ├── superadmin.js # Super admin pages (to be added)
│       ├── attendance.js # Attendance management (to be added)
│       ├── cameras.js    # Camera management (to be added)
│       └── system.js     # System control (to be added)
└── README.md
```

## 🛠️ Setup and Installation

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Web server for serving files (development/production)
- Face Recognition Attendance System backend running

### Development Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd face-recognition-attendance/frontend
   ```

2. **Configure API URL**
   Edit `js/app.js` and update the API base URL:
   ```javascript
   this.config = {
       apiBaseUrl: 'http://localhost:8000', // Update this URL
       version: '1.0.0'
   };
   ```

3. **Start a local web server**

   **Option A: Python**
   ```bash
   # Python 3
   python -m http.server 3000
   
   # Python 2
   python -m SimpleHTTPServer 3000
   ```

   **Option B: Node.js**
   ```bash
   npx serve -s . -p 3000
   ```

   **Option C: PHP**
   ```bash
   php -S localhost:3000
   ```

   **Option D: VS Code Live Server Extension**
   - Install Live Server extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### Backend Integration

Ensure the backend API is running and accessible. Default configuration expects:
- Backend URL: `http://localhost:8000`
- CORS enabled for frontend domain
- All API endpoints documented in the backend analysis

## 🚀 Production Deployment

### Web Server Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimize static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

#### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/frontend
    
    # Handle SPA routing
    <Directory "/path/to/frontend">
        Options -Indexes
        AllowOverride All
        Require all granted
        
        # Fallback to index.html for SPA routes
        FallbackResource /index.html
    </Directory>
    
    # Cache static assets
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
```

### Environment Configuration

1. **Update API URL for production**
   ```javascript
   // In js/app.js
   this.config = {
       apiBaseUrl: 'https://your-api-domain.com',
       version: '1.0.0'
   };
   ```

2. **Enable HTTPS**
   - Obtain SSL certificate
   - Configure web server for HTTPS
   - Redirect HTTP to HTTPS

3. **Configure CORS on backend**
   - Add frontend domain to allowed origins
   - Enable credentials if needed

## 🔐 Authentication & Security

### Authentication Flow
1. User enters credentials on login page
2. Frontend sends credentials to `/auth/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Token included in all subsequent API requests
6. Automatic logout on token expiration

### Security Features
- JWT token-based authentication
- Role-based access control (RBAC)
- XSS prevention through input sanitization
- CSRF protection via JWT tokens
- Secure credential storage
- Automatic session validation

### User Roles and Permissions
- **Employee**: Personal data access only
- **Admin**: Employee management + system operations
- **Super Admin**: Full system administration

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px (1 column layout)
- **Tablet**: 481px - 768px (adapted layout)
- **Desktop**: 769px - 1024px (full layout)
- **Large Desktop**: > 1024px (expanded layout)

### Mobile Features
- Touch-friendly interface
- Collapsible sidebar navigation
- Optimized table layouts
- Responsive forms and modals

## 🎨 UI Components

### Navigation
- Fixed header with user info
- Collapsible sidebar with role-based menu
- Breadcrumb navigation
- Mobile hamburger menu

### Data Display
- Sortable and searchable data tables
- Statistics dashboard cards
- Status badges and indicators
- Real-time data updates

### Forms
- Dynamic form generation
- Client-side validation
- File upload with drag-and-drop
- Loading states and feedback

### Feedback
- Toast notification system
- Confirmation modals
- Loading spinners
- Error handling and display

## 🔧 Development

### Code Style
- ES6+ JavaScript features
- Modular architecture
- Consistent naming conventions
- Comprehensive error handling

### Browser Compatibility
- Modern browsers (ES6+ support)
- Progressive enhancement
- Graceful degradation
- Cross-browser testing

### Performance
- Lazy loading of page modules
- Efficient DOM manipulation
- Minimal initial bundle size
- Optimized asset loading

## 📊 Monitoring and Analytics

### Error Handling
- Global error catching
- User-friendly error messages
- Console logging for debugging
- Network error detection

### Performance Monitoring
- Page load times
- API response times
- User interaction tracking
- Browser compatibility issues

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login/logout functionality
- [ ] Role-based access control
- [ ] All dashboard features
- [ ] Responsive design
- [ ] Cross-browser compatibility
- [ ] API integration
- [ ] Error handling
- [ ] Performance

### Test User Accounts
Request test accounts from backend administrator with different roles:
- Employee role account
- Admin role account  
- Super admin role account

## 🚧 Troubleshooting

### Common Issues

#### "CORS Error" or "Network Error"
- Check backend is running
- Verify API URL in `js/app.js`
- Ensure CORS is configured on backend
- Check browser console for specific errors

#### "Authentication Failed"
- Verify backend credentials
- Check if user account exists
- Ensure backend authentication is working
- Clear localStorage and try again

#### "Permission Denied" for certain pages
- Check user role and permissions
- Verify role-based access is working
- Ensure user is properly authenticated

#### Layout Issues on Mobile
- Test on actual devices
- Check responsive breakpoints
- Verify touch interactions
- Test with different screen sizes

### Debug Mode
Enable debug logging by opening browser console and running:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

## 📈 Future Enhancements

### Planned Features
- Real-time notifications via WebSockets
- Advanced analytics and reporting
- Bulk operations for admin users
- Export functionality (PDF, Excel)
- Offline support (PWA)
- Dark mode theme

### Technical Improvements
- Unit testing framework
- Bundle optimization
- Service worker implementation
- Advanced caching strategies
- Internationalization (i18n)

## 🤝 Contributing

### Development Guidelines
1. Follow existing code patterns
2. Maintain responsive design
3. Test across browsers
4. Document complex functionality
5. Handle errors gracefully

### Submitting Changes
1. Test all user roles
2. Verify responsive design
3. Check browser compatibility
4. Update documentation
5. Submit for review

## 📄 License

This project is part of the Face Recognition Attendance System. See the main project LICENSE file for details.

## 📞 Support

For technical support or questions:
1. Check troubleshooting section
2. Review backend documentation
3. Check browser console for errors
4. Contact system administrator

---

**Built with ❤️ using vanilla JavaScript, HTML5, and CSS3**