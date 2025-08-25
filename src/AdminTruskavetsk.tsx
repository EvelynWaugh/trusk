import * as TruskReact from 'trusk-react';
import {
  Box,
  Paper,
  Container,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { v4 as uuid } from 'uuid';

import type { Section, Tariff, BookingPeriod } from '@/types';
import { useHotelStore } from '@/store/hotelStore';
import { TabPanel, tabProps } from '@/components/shared/TabPanel';
import { SectionsManagement } from '@/components/SectionsManagement';
import { RoomsPanel } from '@/components/RoomsPanel';
import { TariffsManagement } from '@/components/TariffsManagement';
import { SeasonsManagement } from '@/components/SeasonsManagement';
const { flattenDeep } = lodash;

declare global {
  interface Window {
    TRUSKA_DATA: {
      acf: any[];
      section: Section[] | null;
      rooms: any[];
      tarifs: Tariff[] | false;
      seasons: BookingPeriod[] | false;
    };
    lodash: any;
    hotelMetaboxConfig?: {
      ajaxUrl: string;
      nonce: string;
      pluginUrl: string;
      strings: Record<string, string>;
    };
  }
}

const theme = createTheme({});

const React = TruskReact;
const { useState, useCallback, useEffect } = TruskReact;

export const AdminTruskavetsk: React.FC = () => {
  const {
    data,
    setData,
    tab,
    setTab,
    tarifData,
    setTarifData,
    seasonData,
    setSeasonData,
    setChildData,
  } = useHotelStore();

  console.log(data);

  // Initialize data from WordPress global
  useEffect(() => {
    if (window.TRUSKA_DATA) {
      const { section, tarifs, seasons } = window.TRUSKA_DATA;

      // Initialize sections data
      if (section && section.length > 0) {
        const maybeAddIds = (sections: Section[]) => {
          return sections.map(section => {
            if (section.hasOwnProperty('id')) {
              return section;
            }
            return { ...section, id: uuid() };
          });
        };

        const initialData = maybeAddIds(section);
        setData(initialData);
      }

      // Initialize tariffs data
      if (tarifs && Array.isArray(tarifs)) {
        setTarifData(tarifs);
      }

      // Initialize seasons data
      if (seasons && Array.isArray(seasons)) {
        setSeasonData(seasons);
      }

      // Legacy initialization logic as fallback
      if (section && section.length > 0 && section[0].rooms?.length > 0) {
        const firstRoom = section[0].rooms[0];
        if (firstRoom.tariff?.length > 0 && (!tarifs || tarifs === false)) {
          setTarifData(firstRoom.tariff);

          const firstTariff = firstRoom.tariff[0];
          if (
            firstTariff.booking_period?.length > 0 &&
            (!seasons || seasons === false)
          ) {
            setSeasonData(firstTariff.booking_period);

            const firstSeason = firstTariff.booking_period[0];
            const childTariffs = Object.keys(firstSeason)
              .filter(key => key.startsWith('price_for_child'))
              .reduce((acc, key) => {
                acc[key] = firstSeason[key as keyof typeof firstSeason] as any;
                return acc;
              }, {} as any);

            setChildData(childTariffs);
          }
        }
      }
    }
  }, [setData, setTarifData, setSeasonData, setChildData]);

  //Update wp.media
  useEffect(() => {
    const attachmentIds = flattenDeep(
      data.map(section => {
        const roomPics = section.rooms.map(r => {
          const gallery =
            r.hasOwnProperty('room_gallery') && r.room_gallery
              ? r.room_gallery.map(g => g.room_gallery_image)
              : [];

          return [r.room_main_foto, ...gallery];
        });
        return roomPics;
      })
    ).filter(el => el !== '' && el !== false);
    console.log(attachmentIds);
    wp.media
      .query({ post__in: attachmentIds })
      .more()
      .then(function () {});
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const saveData = async () => {
    try {
      // Get configuration from WordPress
      const config = window.hotelMetaboxConfig;
      if (!config) {
        console.error('Hotel metabox configuration not found');
        return;
      }

      // Get current post ID from URL or global variable
      const urlParams = new URLSearchParams(window.location.search);
      let postId = urlParams.get('post');

      // Fallback methods to get post ID
      if (!postId) {
        const postIdElement = document.getElementById(
          'post_ID'
        ) as HTMLInputElement;
        if (postIdElement) {
          postId = postIdElement.value;
        }
      }

      if (!postId) {
        const bodyClasses = document.body.className;
        const match = bodyClasses.match(/postid-(\d+)/);
        if (match) {
          postId = match[1];
        }
      }

      if (!postId) {
        console.error('Post ID not found');
        return;
      }

      console.log('Saving data:', data);

      const formData = new FormData();
      formData.append('action', 'save_hotel_data');
      formData.append('nonce', config.nonce);
      formData.append('post_id', postId);
      formData.append('data', JSON.stringify(data));

      const response = await fetch(config.ajaxUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log('Data saved successfully:', result.data);
        // You could add a success notification here
      } else {
        console.error(
          'Failed to save data:',
          result.data?.message || 'Unknown error'
        );
        // You could add an error notification here
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={3}>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Управление отелем
              </Typography>
              <Button variant="contained" color="primary" onClick={saveData}>
                Сохранить
              </Button>
            </Toolbar>
          </AppBar>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="hotel tabs"
              variant="fullWidth"
            >
              <Tab label="Номера" {...tabProps(0)} />
              <Tab label="Тарифы" {...tabProps(1)} />
              <Tab label="Сезоны" {...tabProps(2)} />
              <Tab label="Панель цен" {...tabProps(3)} />
            </Tabs>
          </Box>

          <TabPanel value={tab} index={0}>
            <SectionsManagement />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <TariffsManagement />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <SeasonsManagement />
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <div>
              <Typography variant="h4" gutterBottom>
                Панель управления ценами
              </Typography>

              <RoomsPanel
                data={data}
                seasonData={seasonData}
                tarifData={tarifData}
              />
            </div>
          </TabPanel>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default AdminTruskavetsk;
