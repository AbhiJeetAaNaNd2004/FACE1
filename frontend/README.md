# Face Recognition Attendance System - Frontend

A modern React TypeScript frontend for the Face Recognition Attendance System built with Material-UI.

## Features

### Role-Based Access Control
- **Employee Role**: View own attendance, employee directory, present employees
- **Admin Role**: All employee features + enroll employees, manage attendance, face embeddings, live camera feed, camera management
- **Super Admin Role**: All admin features + user management, system settings

### Core Features
- 🔐 JWT-based authentication
- 📊 Interactive dashboard with real-time statistics
- 📅 Personal attendance tracking with date filtering
- 👥 Employee directory with search functionality
- 📹 Live camera feed streaming
- 👤 Employee enrollment with face image upload
- 📱 Responsive design for mobile and desktop
- 🎨 Modern Material-UI interface

## Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components and theming
- **React Router** for routing and navigation
- **Axios** for HTTP requests
- **Date-fns** for date manipulation
- **Vite** for fast development and building

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on http://localhost:8000

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Update .env file if backend runs on different port
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env
   ```

## Development

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   - Open http://localhost:3000 in your browser
   - The app will automatically reload on file changes

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── AppLayout.tsx          # Main application layout
│   │   └── ProtectedRoute.tsx         # Route protection component
│   ├── contexts/
│   │   └── AuthContext.tsx            # Authentication context
│   ├── pages/
│   │   ├── admin/                     # Admin-only pages
│   │   │   ├── EnrollEmployee.tsx
│   │   │   ├── ManageAttendance.tsx
│   │   │   ├── FaceEmbeddings.tsx
│   │   │   ├── LiveFeed.tsx
│   │   │   └── CameraManagement.tsx
│   │   ├── superadmin/                # Super admin pages
│   │   │   ├── UserManagement.tsx
│   │   │   └── SystemSettings.tsx
│   │   ├── Dashboard.tsx              # Main dashboard
│   │   ├── Login.tsx                  # Login page
│   │   ├── Attendance.tsx             # Personal attendance
│   │   ├── EmployeeDirectory.tsx      # Employee listing
│   │   ├── PresentEmployees.tsx       # Currently present employees
│   │   ├── Profile.tsx                # User profile
│   │   └── Unauthorized.tsx           # Access denied page
│   ├── services/
│   │   └── api.ts                     # API service layer
│   ├── types/
│   │   └── index.ts                   # TypeScript type definitions
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # App entry point
├── .env                               # Environment variables
└── package.json
```

## Authentication

The app uses JWT-based authentication with the following demo credentials:

- **Employee**: `employee / password`
- **Admin**: `admin / password`
- **Super Admin**: `superadmin / password`

## API Integration

The frontend communicates with the FastAPI backend through:

- **Authentication**: JWT tokens with automatic refresh
- **Role-based endpoints**: Different API access based on user roles
- **Real-time data**: Polling for live updates
- **File uploads**: Base64 encoding for face images
- **Error handling**: Comprehensive error messages and fallbacks

## Key Components

### Authentication Context
Manages user authentication state, role checking, and JWT token handling.

### Protected Routes
Implements role-based access control for different user levels.

### App Layout
Responsive sidebar navigation with role-based menu items.

### API Service
Centralized HTTP client with request/response interceptors.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8000)

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure backend CORS is configured for frontend URL
2. **Authentication failures**: Check backend is running and credentials are correct
3. **API connection issues**: Verify VITE_API_BASE_URL in .env file
4. **Build errors**: Clear node_modules and reinstall dependencies

### Development Tips

- Use browser DevTools for debugging API calls
- Check Network tab for failed requests
- Monitor Console for JavaScript errors
- Use React DevTools extension for component debugging

## Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced attendance analytics
- [ ] Mobile app using React Native
- [ ] Offline support with service workers
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced filtering and sorting
- [ ] Export functionality for reports

## Contributing

1. Follow TypeScript and React best practices
2. Use Material-UI components consistently
3. Implement proper error handling
4. Add appropriate loading states
5. Ensure responsive design
6. Write descriptive commit messages

## License

This project is part of the Face Recognition Attendance System.
