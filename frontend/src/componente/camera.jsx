import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Camera({ imageSrc }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Camera Live</Typography>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Live Feed"
          style={{ width: '100%', maxWidth: '800px', borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
        />
      ) : (
        <Box sx={{
          width: '100%',
          height: 400,
          bgcolor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8
        }}>
          <Typography variant="body1" color="textSecondary">
            Așteptare conexiune video...
          </Typography>
        </Box>
      )}
    </Box>
  );
}
