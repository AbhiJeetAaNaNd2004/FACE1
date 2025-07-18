import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { apiService } from '../services/api';
import { PresentEmployeesResponse, Employee } from '../types';

const PresentEmployees: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [presentData, setPresentData] = useState<PresentEmployeesResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPresentEmployees();
  }, []);

  const fetchPresentEmployees = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.getPresentEmployees();
      setPresentData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch present employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Present Employees
        </Typography>
        <IconButton onClick={fetchPresentEmployees} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Card */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64 }}>
              <CheckCircleIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" component="div" color="success.main" fontWeight="bold">
                {presentData?.total_count || 0}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Employees Present Today
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {format(new Date(), 'PPp')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <LinearProgress />
      ) : presentData && presentData.present_employees.length > 0 ? (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Present Employees List
            </Typography>
            
            <List>
              {presentData.present_employees.map((employee, index) => (
                <React.Fragment key={employee.employee_id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        {employee.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {employee.name}
                          </Typography>
                          <Chip
                            label={employee.employee_id}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <BusinessIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {employee.department}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <WorkIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {employee.role}
                            </Typography>
                          </Box>
                          {employee.email && (
                            <Typography variant="body2" color="text.secondary">
                              {employee.email}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Present"
                        color="success"
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  {index < presentData.present_employees.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        <Card elevation={2}>
          <CardContent>
            <Box textAlign="center" py={6}>
              <PeopleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No employees present
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                No employees have been marked as present today.
              </Typography>
              <Button
                variant="contained"
                onClick={fetchPresentEmployees}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PresentEmployees;