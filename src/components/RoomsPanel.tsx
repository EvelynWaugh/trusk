import * as TruskReact from 'trusk-react';
import { Typography, Input, FormControl } from '@mui/material';
import {
  Person as PersonIcon,
  EscalatorWarning as EscalatorWarningIcon,
  PersonAdd,
} from '@mui/icons-material';
import styled from '@emotion/styled';
import { useHotelStore } from '@/store/hotelStore';
import type { Section, BookingPeriod, Tariff } from '@/types';

// Utility functions to replace lodash
const pickBy = (obj: any, predicate: (value: any, key: string) => boolean) => {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value, key)) {
      result[key] = value;
    }
  }
  return result;
};

const startsWith = (str: string, target: string) => str.startsWith(target);

const RoomRowTable = styled.div<{ rows: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.rows}, 1fr);
  border-bottom: 1px solid #ddd;
  & > * {
    padding: 20px;
  }
  & > *:not(:last-child) {
    border-right: 1px solid #ddd;
  }
`;

const RoomsInnerRows = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
  margin-bottom: 10px;
`;

const React = TruskReact;

export const RoomsPanel: React.FC = () => {
  const { data, setData, tarifData, seasonData } = useHotelStore();

  const handlechangeRoomAdult = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    korpus_id: string,
    room_id: string,
    tariff: string,
    season: string
  ) => {
    const korpusDataChanged = data.map(section => {
      const roomsdataChanged = section.rooms.map(room => {
        if (room.room_id === room_id) {
          const taryfModified = room.tariff.map(t => {
            if (t.tariff_name === tariff) {
              const seasonModified = t.booking_period.map(s => {
                if (s.booking_period_name === season) {
                  return {
                    ...s,
                    price_for_adult: {
                      ...s.price_for_adult,
                      [e.target.name]: e.target.value,
                    },
                  };
                }
                return s;
              });
              return { ...t, booking_period: seasonModified };
            }
            return t;
          });
          return { ...room, tariff: taryfModified };
        }
        return room;
      });
      return section.id === korpus_id
        ? { ...section, rooms: roomsdataChanged }
        : section;
    });

    console.log(korpusDataChanged);
    setData(korpusDataChanged);
  };

  const handlechangeRoomExtra = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    korpus_id: string,
    room_id: string,
    tariff: string,
    season: string
  ) => {
    const korpusDataChanged = data.map(section => {
      const roomsdataChanged = section.rooms.map(room => {
        if (room.room_id === room_id) {
          const taryfModified = room.tariff.map(t => {
            if (t.tariff_name === tariff) {
              const seasonModified = t.booking_period.map(s => {
                if (s.booking_period_name === season) {
                  return {
                    ...s,
                    dodatkove_mistse: e.target.value,
                  };
                }
                return s;
              });
              return { ...t, booking_period: seasonModified };
            }
            return t;
          });
          return { ...room, tariff: taryfModified };
        }
        return room;
      });
      return section.id === korpus_id
        ? { ...section, rooms: roomsdataChanged }
        : section;
    });

    console.log(korpusDataChanged);
    setData(korpusDataChanged);
  };

  const handleChangeChild = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    korpus_id: string,
    room_id: string,
    tariff: string,
    season: string,
    kids_tarriff_name: string
  ) => {
    const korpusDataChanged = data.map(section => {
      const roomsdataChanged = section.rooms.map(room => {
        if (room.room_id === room_id) {
          const taryfModified = room.tariff.map(t => {
            if (t.tariff_name === tariff) {
              const seasonModified = t.booking_period.map(s => {
                if (s.booking_period_name === season) {
                  return {
                    ...s,
                    price_for_child: s.price_for_child.map(c =>
                      kids_tarriff_name === c.kids_tarriff_name
                        ? { ...c, kids_tarriff_price: e.target.value }
                        : c
                    ),
                  };
                }
                return s;
              });
              return { ...t, booking_period: seasonModified };
            }
            return t;
          });
          return { ...room, tariff: taryfModified };
        }
        return room;
      });
      return section.id === korpus_id
        ? { ...section, rooms: roomsdataChanged }
        : section;
    });
    console.log(korpusDataChanged);
    setData(korpusDataChanged);
  };

  return (
    <div>
      {data.map(section => (
        <div key={section.id}>
          <Typography align="center" component="h3" variant="h3">
            {section.section_name}
          </Typography>
          {section.rooms.map((sRoom, ri) => (
            <div key={`room-${ri}`}>
              <RoomRowTable
                className="header_room"
                rows={seasonData.length + 1}
              >
                <Typography variant="h5" component="h5">
                  {sRoom.room_name}
                </Typography>
                {seasonData.map((season, si) => (
                  <div key={`season-${si}`}>
                    <Typography variant="body1" component="span">
                      {season.booking_period_name}
                    </Typography>
                    {season.booking_period_dates.map((date_period, i) => (
                      <div
                        key={`dates-${i}`}
                      >{`${date_period.booking_period_begin}-${date_period.booking_period_end}`}</div>
                    ))}
                  </div>
                ))}
              </RoomRowTable>
              {sRoom.tariff.map((tarif, indexT) => (
                <RoomRowTable
                  rows={seasonData.length + 1}
                  key={`tariff-${indexT}`}
                >
                  <div>{tarif.tariff_name}</div>
                  {tarif.booking_period
                    .sort((a, b) => {
                      return a.position - b.position;
                    })
                    .map((season, indexS) => (
                      <div key={`season-${indexS}`}>
                        <RoomsInnerRows>
                          <div>
                            <PersonIcon color="primary" />
                          </div>
                          <Typography>Дорослі, грн</Typography>
                        </RoomsInnerRows>
                        {Array.from({
                          length: parseInt(sRoom.adults_number),
                        }).map((_, i) => {
                          return (
                            <RoomsInnerRows key={`adult-${i}`}>
                              <span>{i + 1}</span>
                              <FormControl>
                                <Input
                                  type="text"
                                  name={`${i + 1}-adult`}
                                  onChange={e =>
                                    handlechangeRoomAdult(
                                      e,
                                      section.id,
                                      sRoom.room_id,
                                      tarif.tariff_name,
                                      season.booking_period_name
                                    )
                                  }
                                  value={
                                    season.price_for_adult[`${i + 1}-adult`] ||
                                    ''
                                  }
                                />
                              </FormControl>
                            </RoomsInnerRows>
                          );
                        })}
                        {season.price_for_child.length > 0 && (
                          <RoomsInnerRows>
                            <div>
                              <EscalatorWarningIcon color="primary" />
                            </div>
                            <Typography>Діти, грн</Typography>
                          </RoomsInnerRows>
                        )}
                        {season.price_for_child.map((child_row, i) => (
                          <RoomsInnerRows key={`child-${i}`}>
                            <div>
                              <Typography variant="body2" component="span">
                                {child_row.kids_tarriff_name}
                              </Typography>
                            </div>
                            <FormControl>
                              <Input
                                type="text"
                                value={child_row.kids_tarriff_price || ''}
                                onChange={e =>
                                  handleChangeChild(
                                    e,
                                    section.id,
                                    sRoom.room_id,
                                    tarif.tariff_name,
                                    season.booking_period_name,
                                    child_row.kids_tarriff_name
                                  )
                                }
                              />
                            </FormControl>
                          </RoomsInnerRows>
                        ))}

                        <RoomsInnerRows>
                          <div>
                            <PersonAdd color="primary" />
                          </div>
                          <Typography>Додаткове, грн</Typography>
                        </RoomsInnerRows>

                        <div>
                          <FormControl>
                            <Input
                              type="text"
                              name="dodatkove_mistse"
                              onChange={e =>
                                handlechangeRoomExtra(
                                  e,
                                  section.id,
                                  sRoom.room_id,
                                  tarif.tariff_name,
                                  season.booking_period_name
                                )
                              }
                              value={season.dodatkove_mistse || ''}
                            />
                          </FormControl>
                        </div>
                      </div>
                    ))}
                </RoomRowTable>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
