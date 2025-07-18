import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80 }}>
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5">{user?.username}</Typography>
              <Chip label={user?.role.replace('_', ' ').toUpperCase()} color="primary" />
              {user?.employee_id && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Employee ID: {user.employee_id}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
export default Profile;