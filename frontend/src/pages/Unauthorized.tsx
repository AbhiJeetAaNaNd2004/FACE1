import React from 'react';
import { Box, Container, Typography, Button, Paper, Avatar } from '@mui/material';
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <Avatar sx={{ m: 1, bgcolor: 'error.main', width: 64, height: 64 }}>
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" gutterBottom align="center">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            You don't have permission to access this page.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} startIcon={<HomeIcon />} fullWidth sx={{ mt: 2 }}>
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
export default Unauthorized;