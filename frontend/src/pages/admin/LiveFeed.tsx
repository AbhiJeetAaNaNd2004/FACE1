import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { apiService } from '../../services/api';

const LiveFeed: React.FC = () => {
  const streamUrl = apiService.getLiveFeedUrl();
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Live Camera Feed</Typography>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Main Camera Stream</Typography>
          <Box 
            component="img" 
            src={streamUrl}
            alt="Live camera feed"
            sx={{ 
              width: '100%', 
              maxWidth: 800, 
              height: 'auto',
              border: '1px solid #ccc',
              borderRadius: 1
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYW1lcmEgZmVlZCB1bmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
export default LiveFeed;