import * as TruskReact from 'trusk-react';
import { Typography, Input } from '@mui/material';
import {
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';

import type { Section, BookingPeriod, Tariff } from '@/types';
import { useHotelStore } from '@/store/hotelStore';

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
`;

interface RoomsPanelProps {
  data: Section[];
  seasonData: BookingPeriod[];
  tarifData: Tariff[];
}

const React = TruskReact;
const { useState, useCallback, useEffect } = TruskReact;

export const RoomsPanel: React.FC<RoomsPanelProps> = ({
  data,
  seasonData,
  tarifData,
}) => {
  const { setData } = useHotelStore();

  const handleRoomPriceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    sectionId: string,
    roomId: string,
    tariffName: string,
    seasonName: string
  ) => {
    const newData = data.map(section => {
      if (section.id !== sectionId) return section;

      const newRooms = section.rooms.map(room => {
        if (room.room_id !== roomId) return room;

        const newTariffs = room.tariff.map(tariff => {
          if (tariff.tariff_name !== tariffName) return tariff;

          const newSeasons = tariff.booking_period.map(season => {
            if (season.booking_period_name !== seasonName) return season;

            return {
              ...season,
              price_for_adult: {
                ...season.price_for_adult,
                [e.target.name]: e.target.value,
              },
            };
          });

          return { ...tariff, booking_period: newSeasons };
        });

        return { ...room, tariff: newTariffs };
      });

      return { ...section, rooms: newRooms };
    });

    setData(newData);
  };

  const handleChildPriceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    sectionId: string,
    roomId: string,
    tariffName: string,
    seasonName: string,
    childKey: string
  ) => {
    const newData = data.map(section => {
      if (section.id !== sectionId) return section;

      const newRooms = section.rooms.map(room => {
        if (room.room_id !== roomId) return room;

        const newTariffs = room.tariff.map(tariff => {
          if (tariff.tariff_name !== tariffName) return tariff;

          const newSeasons = tariff.booking_period.map(season => {
            if (season.booking_period_name !== seasonName) return season;

            const seasonCopy = { ...season };
            if (seasonCopy[childKey as keyof typeof seasonCopy]) {
              (seasonCopy as any)[childKey] = {
                ...(seasonCopy as any)[childKey],
                price_for_child: e.target.value,
              };
            }

            return seasonCopy;
          });

          return { ...tariff, booking_period: newSeasons };
        });

        return { ...room, tariff: newTariffs };
      });

      return { ...section, rooms: newRooms };
    });

    setData(newData);
  };

  // Calculate the number of columns for the grid
  const calculateColumns = () => {
    const baseColumns = 1; // Room name column
    const adultColumns = Math.max(
      ...data.flatMap(section =>
        section.rooms.map(
          room =>
            Object.keys(
              room.tariff[0]?.booking_period[0]?.price_for_adult || {}
            ).length
        )
      )
    );
    const childColumns = Math.max(
      ...data.flatMap(section =>
        section.rooms.map(room => {
          const season = room.tariff[0]?.booking_period[0];
          if (!season) return 0;
          return Object.keys(season).filter(key =>
            key.startsWith('price_for_child')
          ).length;
        })
      )
    );
    return baseColumns + adultColumns + childColumns;
  };

  const columns = calculateColumns();

  return (
    <div>
      {data.map(section => (
        <div key={section.id}>
          <Typography variant="h5" gutterBottom>
            {section.section_name}
          </Typography>

          {tarifData.map(tariff => (
            <div key={tariff.id} style={{ marginBottom: '30px' }}>
              <Typography variant="h6" gutterBottom>
                {tariff.tariff_name}
              </Typography>

              {seasonData.map(season => (
                <div key={season.id} style={{ marginBottom: '20px' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {season.booking_period_name}
                  </Typography>

                  {/* Header Row */}
                  <RoomRowTable rows={columns}>
                    <div>
                      <Typography variant="body2" fontWeight="bold">
                        Номер
                      </Typography>
                    </div>

                    {/* Adult Price Headers */}
                    {Object.keys(season.price_for_adult || {}).map(adultKey => (
                      <div key={adultKey}>
                        <RoomsInnerRows>
                          <PersonIcon />
                          <Typography variant="body2" fontWeight="bold">
                            {adultKey.replace('-adult', ' взр.')}
                          </Typography>
                        </RoomsInnerRows>
                      </div>
                    ))}

                    {/* Child Price Headers */}
                    {season.price_for_child &&
                      season.price_for_child?.map((child, index) => (
                        <div key={index}>
                          <RoomsInnerRows>
                            <PersonAddIcon />
                            <Typography variant="body2" fontWeight="bold">
                              {child.kids_tarriff_name}
                            </Typography>
                          </RoomsInnerRows>
                        </div>
                      ))}
                  </RoomRowTable>

                  {/* Data Rows */}
                  {section.rooms.map(room => {
                    const roomTariff = room.tariff.find(
                      t => t.tariff_name === tariff.tariff_name
                    );
                    const roomSeason = roomTariff?.booking_period.find(
                      s => s.booking_period_name === season.booking_period_name
                    );

                    if (!roomSeason) return null;

                    return (
                      <RoomRowTable key={room.room_id} rows={columns}>
                        <div>
                          <Typography variant="body2">
                            {room.room_name}
                          </Typography>
                        </div>

                        {/* Adult Price Inputs */}
                        {Object.entries(roomSeason.price_for_adult || {}).map(
                          ([adultKey, price]) => (
                            <div key={adultKey}>
                              <Input
                                type="number"
                                name={adultKey}
                                value={price}
                                onChange={e =>
                                  handleRoomPriceChange(
                                    e,
                                    section.id,
                                    room.room_id,
                                    tariff.tariff_name,
                                    season.booking_period_name
                                  )
                                }
                                placeholder="Цена"
                              />
                            </div>
                          )
                        )}

                        {/* Child Price Inputs */}
                        {roomSeason.price_for_child &&
                          roomSeason.price_for_child?.map((child, index) => (
                            <div key={index}>
                              <Input
                                type="number"
                                value={child.kids_tarriff_price}
                                onChange={e =>
                                  handleChildPriceChange(
                                    e,
                                    section.id,
                                    room.room_id,
                                    tariff.tariff_name,
                                    season.booking_period_name,
                                    `price_for_child${
                                      index > 0 ? `_${index + 1}` : ''
                                    }`
                                  )
                                }
                                placeholder="Цена"
                              />
                            </div>
                          ))}
                      </RoomRowTable>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
