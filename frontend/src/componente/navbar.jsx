import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(-10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  50% { 
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const CompactAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid #334155`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
  transition: 'all 0.3s ease',
  minHeight: '60px',
  '&:hover': {
    background: `linear-gradient(135deg, #1e293b 0%, #334155 100%)`,
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.35)',
  }
}));

const AnimatedLogo = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: '800',
  fontSize: '1.25rem',
  letterSpacing: '0.5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}));

const RobotIcon = styled(Box)(({ theme }) => ({
  width: '24px',
  height: '24px',
  background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
  borderRadius: '6px',
  position: 'relative',
  animation: `${pulse} 3s ease-in-out infinite`,
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    background: '#0f172a'
  },
  '&::before': {
    width: '12px',
    height: '8px',
    borderRadius: '4px 4px 0 0',
    top: '2px',
    left: '6px'
  },
  '&::after': {
    width: '16px',
    height: '2px',
    bottom: '6px',
    left: '4px',
    borderRadius: '1px'
  }
}));

const StatusBadge = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #059669, #10b981)',
  color: 'white',
  fontWeight: '600',
  fontSize: '0.75rem',
  height: '24px',
  animation: `${glow} 2s ease-in-out infinite`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const ConnectionDot = styled(Box)(({ online }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: online ? '#10b981' : '#ef4444',
  animation: online ? `${glow} 2s ease-in-out infinite` : 'none',
}));

const BatteryIcon = styled(Box)(({ level = 87 }) => ({
  width: '20px',
  height: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '2px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '2px',
    height: '4px',
    background: '#e2e8f0',
    right: '-3px',
    top: '3px',
    borderRadius: '0 1px 1px 0'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: `${(level / 100) * 16}px`,
    height: '8px',
    background: level > 20 ? '#10b981' : '#ef4444',
    left: '1px',
    top: '1px',
    borderRadius: '1px',
    transition: 'all 0.3s ease'
  }
}));

const InfoPanel = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '16px',
  marginTop: '8px',
  animation: `${slideIn} 0.3s ease-out`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}));

const ExpandIcon = styled(Box)(({ expanded }) => ({
  width: 0,
  height: 0,
  borderLeft: '5px solid transparent',
  borderRight: '5px solid transparent',
  borderTop: expanded ? '5px solid #60a5fa' : '5px solid #94a3b8',
  transition: 'all 0.3s ease',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
}));

export default function ModernNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(87);

  return (
    <CompactAppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isExpanded) setIsExpanded(false);
      }}
    >
      <Toolbar sx={{
        minHeight: '60px !important',
        padding: '0 16px !important'
      }}>
        { }
        <AnimatedLogo variant="h6" component="div">
          <RobotIcon />
          Nume_Robot
        </AnimatedLogo>

        { }
        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>

          { }
          <StatusBadge
            label="ACTIV"
            size="small"
          />

          { }
          <IconButton
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <ExpandIcon expanded={isExpanded} />
          </IconButton>
        </Box>
      </Toolbar>

      { }
      <Collapse in={isExpanded || isHovered}>
        <Box sx={{ px: 2, pb: 1 }}>
          <InfoPanel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>

              { }
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ConnectionDot online={true} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#e2e8f0',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}
                >
                  Conexiune stabilă
                </Typography>
              </Box>

              { }
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BatteryIcon level={batteryLevel} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#e2e8f0',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}
                >
                  {batteryLevel}%
                </Typography>
              </Box>

              { }
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.75rem'
                  }}
                >
                  Actualizat acum 2 min
                </Typography>
              </Box>

            </Box>
          </InfoPanel>
        </Box>
      </Collapse>
    </CompactAppBar>
  );
}