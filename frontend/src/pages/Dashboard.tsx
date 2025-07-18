import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Chip,
  LinearProgress,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  VideoCall as VideoCallIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { PresentEmployeesResponse, AttendanceResponse, Employee } from '../types';
import { format } from 'date-fns';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  myAttendanceToday: boolean;
  attendanceRate: number;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    myAttendanceToday: false,
    attendanceRate: 0,
  });
  const [presentEmployees, setPresentEmployees] = useState<Employee[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceResponse | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch present employees (available to all roles)
      const presentData = await apiService.getPresentEmployees();
      setPresentEmployees(presentData.present_employees.slice(0, 5)); // Show only top 5
      
      // Fetch employee directory if admin
      let totalEmployees = 0;
      if (isAdmin() || isSuperAdmin()) {
        try {
          const allEmployees = await apiService.getEmployeeDirectory();
          totalEmployees = allEmployees.length;
        } catch (error) {
          console.warn('Could not fetch employee directory:', error);
        }
      }

      // Fetch my attendance
      let myAttendanceToday = false;
      try {
        const today = new Date().toISOString().split('T')[0];
        const myAttendance = await apiService.getMyAttendance(today, today);
        myAttendanceToday = myAttendance.attendance_logs.length > 0;
        setRecentAttendance(myAttendance);
      } catch (error) {
        console.warn('Could not fetch my attendance:', error);
      }

      // Calculate attendance rate
      const attendanceRate = totalEmployees > 0 ? (presentData.total_count / totalEmployees) * 100 : 0;

      setStats({
        totalEmployees,
        presentToday: presentData.total_count,
        myAttendanceToday,
        attendanceRate,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactElement;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" color={color} fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <IconButton onClick={fetchDashboardData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Attendance Today"
            value={stats.myAttendanceToday ? "Present" : "Not Marked"}
            icon={<CheckCircleIcon />}
            color={stats.myAttendanceToday ? "success.main" : "warning.main"}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={<PeopleIcon />}
            color="primary.main"
            subtitle="employees"
          />
        </Grid>

        {(isAdmin() || isSuperAdmin()) && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={<PersonIcon />}
                color="info.main"
                subtitle="registered"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Attendance Rate"
                value={`${stats.attendanceRate.toFixed(1)}%`}
                icon={<TrendingUpIcon />}
                color="secondary.main"
                subtitle="today"
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={3}>
        {/* Present Employees */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="div">
                  Currently Present
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/present-employees')}
                  endIcon={<PeopleIcon />}
                >
                  View All
                </Button>
              </Box>
              
              {presentEmployees.length > 0 ? (
                <List dense>
                  {presentEmployees.map((employee, index) => (
                    <React.Fragment key={employee.employee_id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            {employee.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={employee.name}
                          secondary={`${employee.department} • ${employee.role}`}
                        />
                        <Chip label="Present" color="success" size="small" />
                      </ListItem>
                      {index < presentEmployees.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No employees currently present
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" component="div" mb={2}>
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => navigate('/attendance')}
                  >
                    View My Attendance
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/employees')}
                  >
                    Employee Directory
                  </Button>
                </Grid>

                {isAdmin() && (
                  <>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<PersonIcon />}
                        onClick={() => navigate('/enroll-employee')}
                      >
                        Enroll New Employee
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VideoCallIcon />}
                        onClick={() => navigate('/live-feed')}
                      >
                        View Live Camera Feed
                      </Button>
                    </Grid>
                  </>
                )}

                {isSuperAdmin() && (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PersonIcon />}
                      onClick={() => navigate('/user-management')}
                    >
                      Manage Users
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        {recentAttendance && (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" component="div" mb={2}>
                  My Recent Attendance
                </Typography>
                
                {recentAttendance.attendance_logs.length > 0 ? (
                  <List dense>
                    {recentAttendance.attendance_logs.slice(0, 5).map((log) => (
                      <ListItem key={log.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: log.status === 'present' ? 'success.main' : 'error.main' }}>
                            {log.status === 'present' ? <CheckCircleIcon /> : <AccessTimeIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Marked ${log.status}`}
                          secondary={format(new Date(log.timestamp), 'PPp')}
                        />
                        {log.confidence_score && (
                          <Chip
                            label={`${(log.confidence_score * 100).toFixed(1)}%`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="text.secondary">
                      No recent attendance records
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;