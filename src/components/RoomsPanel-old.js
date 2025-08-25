// import React from "react";

import styled from "@emotion/styled";
import {Typography} from "@mui/material";
import Input from "@mui/material/Input";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FormControl from "@mui/material/FormControl";
const {pickBy, startsWith} = lodash;
const RoomRowTable = styled.div`
  display: grid;
  grid-template-columns: ${(props) => "repeat(" + props.rows + ",1fr)"};
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
export default function RoomsPanel({data, setData, seasonData, tarifData}) {
  const handlechangeRoom = (e, korpus_id, room_id, tariff, season) => {
    const korpusDataChanged = data.map((section) => {
      const roomsdataChanged = section.room.map((room) => {
        if (room.room_id === room_id) {
          console.log(room_id);
          const taryfModified = room.tariff.map((t) => {
            if (t.tariff_name === tariff) {
              console.log(tariff);
              const seasonModified = t.booking_period.map((s) => {
                if (s.booking_period_name === season) {
                  console.log(season);
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
              return {...t, booking_period: seasonModified};
            }
            return t;
          });
          return {...room, tariff: taryfModified};
        }
        return room;
      });
      return section.id === korpus_id
        ? {...section, room: roomsdataChanged}
        : section;
    });

    console.log(korpusDataChanged);
    setData(korpusDataChanged);
  };

  const handleChangeChild = (e, korpus_id, room_id, tariff, season, dt) => {
    const korpusDataChanged = data.map((section) => {
      const roomsdataChanged = section.room.map((room) => {
        if (room.room_id === room_id) {
          const taryfModified = room.tariff.map((t) => {
            if (t.tariff_name === tariff) {
              const seasonModified = t.booking_period.map((s) => {
                if (s.booking_period_name === season) {
                  return {
                    ...s,
                    [dt]: {
                      ...s[dt],
                      price_for_child: e.target.value,
                    },
                  };
                }
                return s;
              });
              return {...t, booking_period: seasonModified};
            }
            return t;
          });
          return {...room, tariff: taryfModified};
        }
        return room;
      });
      return section.id === korpus_id
        ? {...section, room: roomsdataChanged}
        : section;
    });
    console.log(korpusDataChanged);
    setData(korpusDataChanged);
  };

  return (
    <div>
      {data.map((section, korpus_index) => (
        <div>
          <Typography align="center" component="h3" variant="h3">
            {section.nazva_korpusu}
          </Typography>
          {section.room.map((sRoom, ri) => (
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
                      <div key={`dates-${i}`}>{`${date_period.booking_period_begin}-${date_period.booking_period_end}`}</div>
                    ))}
                  </div>
                ))}
              </RoomRowTable>
              {sRoom.tariff.map((tarif, indexT) => (
                <RoomRowTable rows={seasonData.length + 1} key={`tariff-${indexT}`}>
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
                          <Typography>Вартість, грн</Typography>
                        </RoomsInnerRows>
                        {Array.from({
                          length: sRoom.adults_number,
                        }).map((maxAdult, i) => {
                          return (
                            <RoomsInnerRows key={`adult-${i}`}>
                              <span>{i + 1}</span>
                              <FormControl>
                                <Input
                                  type="text"
                                  name={`${i + 1}_adult`}
                                  onChange={(e) =>
                                    handlechangeRoom(
                                      e,
                                      section.id,
                                      sRoom.room_id,
                                      tarif.tariff_name,
                                      season.booking_period_name
                                    )
                                  }
                                  value={
                                    season.price_for_adult[`${i + 1}_adult`]
                                  }
                                />
                              </FormControl>
                            </RoomsInnerRows>
                          );
                        })}

                        {Object.keys(
                          pickBy(season, function (value, key) {
                            return startsWith(key, "price_for_child");
                          })
                        ).map((dt, i) => (
                          <RoomsInnerRows key={`child-${i}`}>
                            <div>
                              <Typography variant="body2" component="span">
                                {season[dt].kids_tarriff_name}
                              </Typography>
                            </div>
                            <FormControl>
                              <Input
                                type="text"
                                value={season[dt].price_for_child}
                                onChange={(e) =>
                                  handleChangeChild(
                                    e,
                                    section.id,
                                    sRoom.room_id,
                                    tarif.tariff_name,
                                    season.booking_period_name,
                                    dt
                                  )
                                }
                              />
                            </FormControl>
                          </RoomsInnerRows>
                        ))}
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
}
