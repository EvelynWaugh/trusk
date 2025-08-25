import * as TruskReact from 'trusk-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import type { RoomAmenity, InRoomAmenities } from '@/types';

const React = TruskReact;
const { useState, useEffect } = TruskReact;

interface RoomAmenitiesProps {
  roomId: string;
  amenities: InRoomAmenities;
  onAmenitiesChange: (roomId: string, amenities: InRoomAmenities) => void;
}

// Get amenities from PHP function - this should match trusk_get_room_features()
const getRoomFeatures = (): RoomAmenity[] => {
  return [
    {
      id: 'balkon',
      name: 'Балкон',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'bide',
      name: 'Біде',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'dush',
      name: 'Душ',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'dytyache_lizhechko',
      name: 'Дитяче ліжечко',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'dyvan_ne_rozkladnyj',
      name: 'Диван нерозкладний',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'dyvan_rozkladnyj',
      name: 'Диван розкладний',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'dzhakuzi',
      name: 'Джакузі',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'elektrochajnyk',
      name: 'Електрочайник',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'fen',
      name: 'Фен',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'halat',
      name: 'Халат',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'holodylnyk',
      name: 'Холодильник',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'kabelne_telebachennya',
      name: 'Кабельне телебачення',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'kamin',
      name: 'Камін',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'kavachaj_v_nomeri',
      name: 'Кава/чай в номері',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'kavomashyna',
      name: 'Кавомашина',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'komplekt_tualetnogo_pryladdya',
      name: 'Комплект туалетного приладдя',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'kondytsioner',
      name: 'Кондиціонер',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'kuhnya',
      name: 'Кухня',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'lizhko_dvospalne',
      name: 'Ліжко двоспальне',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request,custom|Custom',
    },
    {
      id: 'lizhko_dvospalne_opys',
      name: 'Опис двоспального ліжка',
      type: 'text',
      value: '',
    },
    {
      id: 'lizhko_odnospalne',
      name: 'Ліжко односпальне',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'mikrohvylova_pich',
      name: 'Мікрохвильова піч',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'mini_bar',
      name: 'Міні-бар',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'myake_krislo',
      name: "М'яке крісло",
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'myakyj_kutok',
      name: "М'який куточок",
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'nabir_posudu',
      name: 'Набір посуду',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'nabir_rushnykiv',
      name: 'Набір рушників',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'obidnij_stil',
      name: 'Обідній стіл',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'pralna_mashyna',
      name: 'Пральна машина',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'praska',
      name: 'Праска',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'prylizhkovi_tumbochky',
      name: 'Приліжкові тумбочки',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'robochyj_stil',
      name: 'Робочий стіл',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'sanvuzel',
      name: 'Санвузол',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'sauna',
      name: 'Сауна',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'sejf',
      name: 'Сейф',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'shafa_dlya_odyagu',
      name: 'Шафа для одягу',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'shafa_kupe',
      name: 'Шафа-купе',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'suputnykove_telebachennya',
      name: 'Супутникове телебачення',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'tapochky',
      name: 'Тапочки',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'telefon',
      name: 'Телефон',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'televizor',
      name: 'Телевізор',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'vanna',
      name: 'Ванна',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
    {
      id: 'zona_vidpochynku',
      name: 'Зона відпочинку',
      type: 'radio',
      value: 'yes|Yes,no|No,on_request|Request',
    },
  ];
};

const RoomAmenities: React.FC<RoomAmenitiesProps> = ({
  roomId,
  amenities,
  onAmenitiesChange,
}) => {
  const [open, setOpen] = useState(false);
  const [tempAmenities, setTempAmenities] = useState<InRoomAmenities>(
    amenities || {}
  );
  const roomFeatures = getRoomFeatures();

  useEffect(() => {
    setTempAmenities(amenities || {});
  }, [amenities]);

  const handleOpen = () => {
    setOpen(true);
    setTempAmenities(amenities || {});
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    onAmenitiesChange(roomId, tempAmenities);
    setOpen(false);
  };

  const handleAmenityChange = (amenityId: string, value: string) => {
    setTempAmenities((prev: InRoomAmenities) => ({
      ...prev,
      [amenityId]: value,
    }));
  };

  const parseOptions = (valueString: string) => {
    if (!valueString) return [];
    return valueString.split(',').map(option => {
      const [value, label] = option.split('|');
      return { value: value.trim(), label: label.trim() };
    });
  };

  const getDisplayLabel = (value: string) => {
    switch (value) {
      case 'yes':
        return 'Так';
      case 'no':
        return 'Ні';
      case 'on_request':
        return 'За запитом';
      case 'custom':
        return 'Користувацький';
      default:
        return value;
    }
  };

  const getChipColor = (value: string) => {
    switch (value) {
      case 'yes':
        return 'success';
      case 'no':
        return 'error';
      case 'on_request':
        return 'warning';
      case 'custom':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get amenities to display as chips (only those with values)
  const selectedAmenities = Object.entries(amenities || {})
    .filter(([_, value]) => value && value !== '')
    .map(([id, value]) => {
      const feature = roomFeatures.find(f => f.id === id);
      return {
        id,
        name: feature?.name || id,
        value,
        type: feature?.type || 'radio',
      };
    });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SettingsIcon />}
          onClick={handleOpen}
        >
          Зручності в номері
        </Button>
        <Typography variant="body2" color="textSecondary">
          ({selectedAmenities.length} обрано)
        </Typography>
      </Box>

      {/* Display selected amenities as chips */}
      {selectedAmenities.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {selectedAmenities.map(({ id, name, value, type }) => (
            <Chip
              key={id}
              label={
                type === 'text'
                  ? `${name}: ${value}`
                  : `${name}: ${getDisplayLabel(value)}`
              }
              size="small"
              color={type === 'text' ? 'info' : getChipColor(value)}
              variant="outlined"
            />
          ))}
        </Box>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: 122999 }}
      >
        <DialogTitle>Зручності в номері</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {roomFeatures.map(feature => (
              <Grid item xs={12} sm={6} md={4} key={feature.id}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel
                    component="legend"
                    sx={{ fontSize: '0.875rem', mb: 1 }}
                  >
                    {feature.name}
                  </FormLabel>

                  {feature.type === 'radio' ? (
                    <RadioGroup
                      value={tempAmenities[feature.id] || ''}
                      onChange={e =>
                        handleAmenityChange(feature.id, e.target.value)
                      }
                      row
                    >
                      {parseOptions(feature.value).map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio size="small" />}
                          label={getDisplayLabel(option.value)}
                          sx={{ mr: 1 }}
                        />
                      ))}
                      <FormControlLabel
                        value=""
                        control={<Radio size="small" />}
                        label="Не вказано"
                        sx={{ mr: 1 }}
                      />
                    </RadioGroup>
                  ) : (
                    <TextField
                      size="small"
                      value={tempAmenities[feature.id] || ''}
                      onChange={e =>
                        handleAmenityChange(feature.id, e.target.value)
                      }
                      placeholder={feature.name}
                      fullWidth
                    />
                  )}
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button onClick={handleSave} variant="contained">
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomAmenities;
