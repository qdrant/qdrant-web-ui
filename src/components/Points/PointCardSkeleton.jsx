import React from 'react';
import { Card, CardContent, CardHeader, Divider, Skeleton, Box } from '@mui/material';

const PointCardSkeleton = () => {
  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardHeader
        title={<Skeleton variant="text" width="60%" height={24} />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        }
      />
      <CardContent sx={{ padding: '0.5rem 1rem' }}>
        <Skeleton variant="rounded" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={40} />
      </CardContent>
      <Divider />
      <CardContent sx={{ padding: '1rem' }}>
        <Skeleton variant="rounded" height={100} />
      </CardContent>
    </Card>
  );
};

export default PointCardSkeleton;
