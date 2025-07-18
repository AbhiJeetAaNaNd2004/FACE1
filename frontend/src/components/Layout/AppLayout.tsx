import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  VideoCall as VideoCallIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  CameraAlt as CameraIcon,
  FaceRetouchingNatural as FaceIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const drawerWidth = 280;

interface AppLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isEmployee, isAdmin, isSuperAdmin } = useAuth();

  const menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: [UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'My Attendance',
      icon: <AccessTimeIcon />,
      path: '/attendance',
      roles: [UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'Employee Directory',
      icon: <PeopleIcon />,
      path: '/employees',
      roles: [UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'Present Employees',
      icon: <PersonIcon />,
      path: '/present-employees',
      roles: [UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'Enroll Employee',
      icon: <FaceIcon />,
      path: '/enroll-employee',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'Manage Attendance',
      icon: <AdminIcon />,
      path: '/manage-attendance',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'Face Embeddings',
      icon: <FaceIcon />,
      path: '/embeddings',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'Live Camera Feed',
      icon: <VideoCallIcon />,
      path: '/live-feed',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'Camera Management',
      icon: <CameraIcon />,
      path: '/cameras',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      text: 'User Management',
      icon: <SuperAdminIcon />,
      path: '/user-management',
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      text: 'System Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: [UserRole.SUPER_ADMIN],
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || UserRole.EMPLOYEE)
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <SuperAdminIcon color="primary" />;
      case UserRole.ADMIN:
        return <AdminIcon color="secondary" />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return theme.palette.primary.main;
      case UserRole.ADMIN:
        return theme.palette.secondary.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={2}>
          <FaceIcon color="primary" fontSize="large" />
          <Typography variant="h6" noWrap component="div" color="primary">
            Face Attendance
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      {/* User Info */}
      <Box p={2}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Avatar sx={{ bgcolor: getRoleColor(user?.role || UserRole.EMPLOYEE) }}>
            {user?.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role.replace('_', ' ').toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />

      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Face Recognition Attendance System
          </Typography>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="account-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <Avatar /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;