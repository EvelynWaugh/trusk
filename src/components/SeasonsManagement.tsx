import * as TruskReact from 'trusk-react';
import {
  Typography,
  Button,
  Dialog,
  DialogContent,
  TextField,
  FormControl,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { v4 as uuid } from 'uuid';

import type { BookingPeriod } from '@/types';
import { useHotelStore } from '@/store/hotelStore';
import {
  FormWrapper,
  FormWrapperVertical,
  IconButtonAdd,
  IconButtonAddDate,
  BoxTypo,
} from '@/components/shared/StyledComponents';

const React = TruskReact;
const { useState, useCallback, useEffect } = TruskReact;

export const SeasonsManagement: React.FC = () => {
  const {
    seasonData,
    setSeasonData,
    data,
    setData,
    childData,
    dialogSeason,
    openDialogSeason,
    closeDialogSeason,
    dialogSeasonSingle,
    openDialogSeasonSingle,
    closeDialogSeasonSingle,
  } = useHotelStore();

  const [seasonNew, setSeasonNew] = useState<BookingPeriod>({
    id: uuid(),
    booking_period_name: '',
    on_of_period: 'yes',
    current_period: false,
    booking_period_dates: [
      {
        booking_period_begin: format(new Date(), 'dd.MM.yyyy'),
        booking_period_end: format(new Date(), 'dd.MM.yyyy'),
      },
    ],
    position: 0,
    price_for_adult: {},
    dodatkove_mistse: '',
    price_for_child: [],
  });

  const [editedSeason, setEditedSeason] = useState<BookingPeriod | null>(null);

  const saveNewSeason = () => {
    const newData = data.map(section => {
      const newRoomData = section.rooms.map(room => {
        const maxAdult = parseInt(room.adults_number) || 1;
        const newTariffData = room.tariff.map(tariff => ({
          ...tariff,
          booking_period: [
            ...tariff.booking_period,
            {
              ...seasonNew,
              price_for_adult: Array.from(
                { length: maxAdult },
                (_, k) => k
              ).reduce(
                (prev, curr) => {
                  prev[`${curr + 1}-adult`] = '';
                  return prev;
                },
                {} as Record<string, string>
              ),
              dodatkove_mistse: '',
              ...childData,
            },
          ],
        }));

        return { ...room, tariff: newTariffData };
      });
      return { ...section, rooms: newRoomData };
    });

    setData(newData);
    setSeasonData([
      ...seasonData,
      { ...seasonNew, position: seasonData.length },
    ]);

    // Reset form
    setSeasonNew({
      id: uuid(),
      booking_period_name: '',
      on_of_period: 'yes',
      current_period: false,
      booking_period_dates: [
        {
          booking_period_begin: format(new Date(), 'dd.MM.yyyy'),
          booking_period_end: format(new Date(), 'dd.MM.yyyy'),
        },
      ],
      position: 0,
      price_for_adult: {},
      dodatkove_mistse: '',
      price_for_child: [],
    });

    closeDialogSeason();
  };

  const openEditDialog = (id: string) => {
    const foundSeason = seasonData.find(season => season.id === id);
    if (foundSeason) {
      setEditedSeason(foundSeason);
      openDialogSeasonSingle(id);
    }
  };

  const saveSingleSeason = (id: string) => {
    if (!editedSeason) return;

    const newSeasonData = seasonData.map(season =>
      season.id === id ? editedSeason : season
    );
    setSeasonData(newSeasonData);

    console.log('SEASON DATA', newSeasonData);

    // Update in all rooms
    const newData = data.map(section => {
      const newRoomData = section.rooms.map(room => {
        const newTariffs = room.tariff.map(tariff => {
          const newSeasons = tariff.booking_period.map(season =>
            season.id === id ? editedSeason : season
          );
          return { ...tariff, booking_period: newSeasons };
        });
        return { ...room, tariff: newTariffs };
      });
      return { ...section, rooms: newRoomData };
    });

    setData(newData);
    console.log('NEW DATA', newData);
    closeDialogSeasonSingle(id);
    setEditedSeason(null);
  };

  const deleteSeason = (id: string) => {
    if (window.confirm('Удалить сезон?')) {
      const newSeasonData = seasonData.filter(season => season.id !== id);
      setSeasonData(newSeasonData);

      const newData = data.map(section => {
        const modifiedRooms = section.rooms.map(room => {
          const newTariffs = room.tariff.map(tariff => {
            const filteredSeasons = tariff.booking_period.filter(
              season => season.id !== id
            );
            return { ...tariff, booking_period: filteredSeasons };
          });
          return { ...room, tariff: newTariffs };
        });
        return { ...section, rooms: modifiedRooms };
      });

      setData(newData);
    }
  };

  const setDatesNewSeason = (
    i: number,
    newValue: Date | null,
    when: 'start_date' | 'end_date'
  ) => {
    if (!newValue || !isValid(newValue)) return;

    const formattedDate = format(newValue, 'dd.MM.yyyy');

    setSeasonNew({
      ...seasonNew,
      booking_period_dates: seasonNew.booking_period_dates.map(
        (datePeriod, index) => {
          if (i === index) {
            return {
              ...datePeriod,
              [when === 'start_date'
                ? 'booking_period_begin'
                : 'booking_period_end']: formattedDate,
            };
          }
          return datePeriod;
        }
      ),
    });
  };

  const updateDatesSingleSeason = (
    i: number,
    newValue: Date | null,
    when: 'start_date' | 'end_date'
  ) => {
    if (!newValue || !isValid(newValue) || !editedSeason) return;

    const formattedDate = format(newValue, 'dd.MM.yyyy');

    setEditedSeason({
      ...editedSeason,
      booking_period_dates: editedSeason.booking_period_dates.map(
        (datePeriod, index) => {
          if (i === index) {
            return {
              ...datePeriod,
              [when === 'start_date'
                ? 'booking_period_begin'
                : 'booking_period_end']: formattedDate,
            };
          }
          return datePeriod;
        }
      ),
    });
  };

  const addDateSeason = () => {
    setSeasonNew({
      ...seasonNew,
      booking_period_dates: [
        ...seasonNew.booking_period_dates,
        {
          booking_period_begin: format(new Date(), 'dd.MM.yyyy'),
          booking_period_end: format(new Date(), 'dd.MM.yyyy'),
        },
      ],
    });
  };

  const addDateSeasonSingle = () => {
    if (!editedSeason) return;

    setEditedSeason({
      ...editedSeason,
      booking_period_dates: [
        ...editedSeason.booking_period_dates,
        {
          booking_period_begin: format(new Date(), 'dd.MM.yyyy'),
          booking_period_end: format(new Date(), 'dd.MM.yyyy'),
        },
      ],
    });
  };

  const deleteSeasonSingleDate = (index: number) => {
    if (!editedSeason) return;

    setEditedSeason({
      ...editedSeason,
      booking_period_dates: editedSeason.booking_period_dates.filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Управление сезонами
      </Typography>

      {seasonData?.map((season, index) => (
        <FormWrapper key={`season-${index}`}>
          <BoxTypo>
            <Typography variant="h6" component="h6">
              {season.booking_period_name}
            </Typography>
          </BoxTypo>

          {season.booking_period_dates.map((datePeriod, i) => (
            <React.Fragment key={`date-period-${i}`}>
              <FormControl>
                <TextField
                  disabled
                  label="Начало сезона"
                  value={datePeriod.booking_period_begin}
                />
              </FormControl>
              <FormControl>
                <TextField
                  disabled
                  label="Конец сезона"
                  value={datePeriod.booking_period_end}
                />
              </FormControl>
            </React.Fragment>
          ))}

          <FormControl>
            <IconButton
              color="primary"
              onClick={() => openEditDialog(season.id)}
            >
              <EditIcon />
            </IconButton>
          </FormControl>

          <FormControl>
            <IconButton color="error" onClick={() => deleteSeason(season.id)}>
              <DeleteIcon />
            </IconButton>
          </FormControl>
        </FormWrapper>
      ))}

      {/* Add New Season Button */}
      <Tooltip title="Добавить сезон" placement="top">
        <IconButtonAdd color="inherit" size="large" onClick={openDialogSeason}>
          <AddIcon />
        </IconButtonAdd>
      </Tooltip>

      {/* Add New Season Dialog */}
      <Dialog open={dialogSeason} onClose={closeDialogSeason}>
        <DialogContent>
          <FormWrapperVertical>
            <FormControl>
              <TextField
                label="Название сезона"
                value={seasonNew.booking_period_name}
                onChange={e =>
                  setSeasonNew({
                    ...seasonNew,
                    booking_period_name: e.target.value,
                  })
                }
              />
            </FormControl>

            {seasonNew.booking_period_dates.map((datePeriod, i) => (
              <div key={`new-season-${i}`}>
                <FormControl className="trusk_date">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={ru}
                  >
                    <DatePicker
                      label="Начало сезона"
                      value={parse(
                        datePeriod.booking_period_begin,
                        'dd.MM.yyyy',
                        new Date()
                      )}
                      onChange={(val: Date | null) =>
                        setDatesNewSeason(i, val, 'start_date')
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </FormControl>

                <FormControl className="trusk_date">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={ru}
                  >
                    <DatePicker
                      label="Конец сезона"
                      value={parse(
                        datePeriod.booking_period_end,
                        'dd.MM.yyyy',
                        new Date()
                      )}
                      onChange={(val: Date | null) =>
                        setDatesNewSeason(i, val, 'end_date')
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
            ))}

            <IconButtonAddDate
              color="inherit"
              size="medium"
              onClick={addDateSeason}
            >
              <AddIcon />
            </IconButtonAddDate>

            <Button color="primary" variant="contained" onClick={saveNewSeason}>
              Сохранить
            </Button>
          </FormWrapperVertical>
        </DialogContent>
      </Dialog>

      {/* Edit Season Dialog */}
      {Object.keys(dialogSeasonSingle).map(seasonId => (
        <Dialog
          key={seasonId}
          maxWidth="md"
          open={dialogSeasonSingle[seasonId] || false}
          onClose={() => closeDialogSeasonSingle(seasonId)}
        >
          <DialogContent>
            {editedSeason && (
              <FormWrapperVertical>
                <FormControl>
                  <TextField
                    label="Название сезона"
                    value={editedSeason.booking_period_name}
                    onChange={e =>
                      setEditedSeason({
                        ...editedSeason,
                        booking_period_name: e.target.value,
                      })
                    }
                  />
                </FormControl>

                {editedSeason.booking_period_dates.map((datePeriod, i) => (
                  <div key={`edit-season-${i}`}>
                    <FormControl className="trusk_date">
                      <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={ru}
                      >
                        <DatePicker
                          label="Начало сезона"
                          value={parse(
                            datePeriod.booking_period_begin,
                            'dd.MM.yyyy',
                            new Date()
                          )}
                          onChange={(val: Date | null) =>
                            updateDatesSingleSeason(i, val, 'start_date')
                          }
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </FormControl>

                    <FormControl className="trusk_date">
                      <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={ru}
                      >
                        <DatePicker
                          label="Конец сезона"
                          value={parse(
                            datePeriod.booking_period_end,
                            'dd.MM.yyyy',
                            new Date()
                          )}
                          onChange={(val: Date | null) =>
                            updateDatesSingleSeason(i, val, 'end_date')
                          }
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </FormControl>

                    <IconButton
                      color="error"
                      onClick={() => deleteSeasonSingleDate(i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ))}

                <IconButtonAddDate
                  color="inherit"
                  size="medium"
                  onClick={addDateSeasonSingle}
                >
                  <AddIcon />
                </IconButtonAddDate>

                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => saveSingleSeason(editedSeason.id)}
                >
                  Сохранить
                </Button>
              </FormWrapperVertical>
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};
