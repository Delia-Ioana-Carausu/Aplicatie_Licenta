import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(96, 165, 250, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
  }
`;

const HiddenDrawer = styled(Drawer)(({ theme }) => ({
  width: 0,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    background: `linear-gradient(180deg, #0f172a 0%, #1e293b 100%)`,
    border: 'none',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
    marginTop: '60px',
    height: 'calc(100vh - 60px)',
    overflowX: 'hidden',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  '&:hover .MuiDrawer-paper': {
    transform: 'translateX(0)',
    boxShadow: '8px 0 30px rgba(0, 0, 0, 0.5)',
  },
}));

const SidebarTrigger = styled(Box)(({ theme }) => ({
  position: 'fixed',
  left: 0,
  top: '60px',
  width: '20px',
  height: 'calc(100vh - 60px)',
  zIndex: 1201,
  cursor: 'pointer',
  '&:hover + .hidden-drawer .MuiDrawer-paper': {
    transform: 'translateX(0)',
    boxShadow: '8px 0 30px rgba(0, 0, 0, 0.5)',
  },
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: '16px 8px',
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: '12px',
  margin: '4px 8px',
  padding: '12px 16px',
  transition: 'all 0.3s ease',
  background: selected
    ? 'linear-gradient(45deg, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.1))'
    : 'transparent',
  border: selected
    ? '1px solid rgba(96, 165, 250, 0.3)'
    : '1px solid transparent',
  position: 'relative',
  overflow: 'hidden',
  animation: `${slideIn} 0.3s ease-out`,
  '&::before': selected ? {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '3px',
    background: 'linear-gradient(180deg, #60a5fa, #a78bfa)',
    borderRadius: '0 2px 2px 0',
    animation: `${pulse} 2s infinite`,
  } : {},
  '&:hover': {
    background: 'linear-gradient(45deg, rgba(96, 165, 250, 0.15), rgba(167, 139, 250, 0.05))',
    border: '1px solid rgba(96, 165, 250, 0.2)',
    transform: 'translateX(4px)',
    '& .MuiListItemText-primary': {
      color: '#60a5fa',
    },
    '& .menu-icon': {
      transform: 'scale(1.1)',
    }
  },
}));

const MenuItemText = styled(ListItemText)(({ theme, selected }) => ({
  '& .MuiTypography-root': {
    color: selected ? '#60a5fa' : '#e2e8f0',
    fontWeight: selected ? '600' : '500',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.3px',
  },
}));

const DashboardIcon = styled(Box)(({ selected }) => ({
  width: '20px',
  height: '20px',
  marginRight: '12px',
  background: selected
    ? 'linear-gradient(45deg, #60a5fa, #a78bfa)'
    : '#94a3b8',
  borderRadius: '4px',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    background: selected ? '#0f172a' : '#1e293b',
    transition: 'all 0.3s ease',
  },
  '&::before': {
    width: '12px',
    height: '8px',
    borderRadius: '2px',
    top: '3px',
    left: '4px',
  },
  '&::after': {
    width: '6px',
    height: '6px',
    borderRadius: '1px',
    bottom: '3px',
    left: '7px',
    transform: 'rotate(45deg)',
  }
}));

const StatisticsIcon = styled(Box)(({ selected }) => ({
  width: '20px',
  height: '20px',
  marginRight: '12px',
  background: selected
    ? 'linear-gradient(45deg, #60a5fa, #a78bfa)'
    : '#94a3b8',
  borderRadius: '4px',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    background: selected ? '#0f172a' : '#1e293b',
    transition: 'all 0.3s ease',
  },
  '&::before': {
    width: '14px',
    height: '2px',
    bottom: '6px',
    left: '3px',
    transform: 'rotate(45deg)',
  },
  '&::after': {
    width: '10px',
    height: '2px',
    bottom: '10px',
    left: '5px',
    transform: 'rotate(-45deg)',
  }
}));

const MenuItem = ({ to, primary, icon, selected, onClick }) => (
  <StyledListItem
    button
    component={Link}
    to={to}
    selected={selected}
    onClick={onClick}
  >
    <ListItemIcon sx={{ minWidth: '32px' }}>
      {icon}
    </ListItemIcon>
    <MenuItemText primary={primary} selected={selected} />
  </StyledListItem>
);

export default function Sidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <DashboardIcon selected={activeItem === '/'} className="menu-icon" />
    },
    {
      path: '/statistici',
      label: 'Statistici',
      icon: <StatisticsIcon selected={activeItem === '/statistici'} className="menu-icon" />
    },
  ];

  return (
    <>
      { }
      <SidebarTrigger className="sidebar-trigger" />

      { }
      <HiddenDrawer
        variant="permanent"
        className="hidden-drawer"
        sx={{
          '& .MuiDrawer-paper': {
            transform: 'translateX(-100%)',
            '&:hover': {
              transform: 'translateX(0)',
            }
          }
        }}
      >
        <StyledList>
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.path}
              to={item.path}
              primary={item.label}
              icon={item.icon}
              selected={activeItem === item.path}
              onClick={() => setActiveItem(item.path)}
            />
          ))}
        </StyledList>

        { }
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontSize: '0.7rem',
              textAlign: 'center',
              display: 'block'
            }}
          >
          </Typography>
        </Box>
      </HiddenDrawer>
    </>
  );
}