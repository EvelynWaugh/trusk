import React from 'react';
import { Box } from '@mui/material';
import type { TabPanelProps } from '@/types';

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trusk-tabpanel-${index}`}
      aria-labelledby={`trusk-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const tabProps = (index: number) => ({
  id: `trusk-tab-${index}`,
  'aria-controls': `trusk-tabpanel-${index}`,
});
