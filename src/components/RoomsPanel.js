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
  const handlechangeRoom = (e, korpus_id, room_id, taryf, season) => {
    const korpusDataChanged = data.map((korpus) => {
      const roomsdataChanged = korpus.room.map((room) => {
        if (room.room_id === room_id) {
          console.log(room_id);
          const taryfModified = room.taryf.map((t) => {
            if (t.nazva_taryfu === taryf) {
              console.log(taryf);
              const seasonModified = t.period_prozhyvannya.map((s) => {
                if (s.nazva_periodu === season) {
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
              return {...t, period_prozhyvannya: seasonModified};
            }
            return t;
          });
          return {...room, taryf: taryfModified};
        }
        return room;
      });
      return korpus.id === korpus_id
        ? {...korpus, room: roomsdataChanged}
        : korpus;
    });

    console.log(korpusDataChanged);
    setData(korpusDataChanged);
  };

  const handleChangeChild = (e, korpus_id, room_id, taryf, season, dt) => {
    const korpusDataChanged = data.map((korpus) => {
      const roomsdataChanged = korpus.room.map((room) => {
        if (room.room_id === room_id) {
          const taryfModified = room.taryf.map((t) => {
            if (t.nazva_taryfu === taryf) {
              const seasonModified = t.period_prozhyvannya.map((s) => {
                if (s.nazva_periodu === season) {
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
              return {...t, period_prozhyvannya: seasonModified};
            }
            return t;
          });
          return {...room, taryf: taryfModified};
        }
        return room;
      });
      return korpus.id === korpus_id
        ? {...korpus, room: roomsdataChanged}
        : korpus;
    });
    console.log(korpusDataChanged);
    setData(korpusDataChanged);
  };

  return (
    <div>
      {data.map((korpus, korpus_index) => (
        <div>
          <Typography align="center" component="h3" variant="h3">
            {korpus.nazva_korpusu}
          </Typography>
          {korpus.room.map((sRoom, ri) => (
            <div key={`room-${ri}`}>
              <RoomRowTable
                className="header_room"
                rows={seasonData.length + 1}
              >
                <Typography variant="h5" component="h5">
                  {sRoom.nazva_nomeru}
                </Typography>
                {seasonData.map((season, si) => (
                  <div key={`season-${si}`}>
                    <Typography variant="body1" component="span">
                      {season.nazva_periodu}
                    </Typography>
                    {season.daty_periodu.map((date_period, i) => (
                      <div key={`dates-${i}`}>{`${date_period.data_pochatku_periodu}-${date_period.data_kintsya_periodu}`}</div>
                    ))}
                  </div>
                ))}
              </RoomRowTable>
              {sRoom.taryf.map((tarif, indexT) => (
                <RoomRowTable rows={seasonData.length + 1} key={`taryf-${indexT}`}>
                  <div>{tarif.nazva_taryfu}</div>
                  {tarif.period_prozhyvannya
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
                          length: sRoom.maksymalna_kilkist_doroslyh,
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
                                      korpus.id,
                                      sRoom.room_id,
                                      tarif.nazva_taryfu,
                                      season.nazva_periodu
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
                            return startsWith(key, "dytyachyj_taryf");
                          })
                        ).map((dt, i) => (
                          <RoomsInnerRows key={`dytyc-${i}`}>
                            <div>
                              <Typography variant="body2" component="span">
                                {season[dt].nazva_vik_ditej}
                              </Typography>
                            </div>
                            <FormControl>
                              <Input
                                type="text"
                                value={season[dt].price_for_child}
                                onChange={(e) =>
                                  handleChangeChild(
                                    e,
                                    korpus.id,
                                    sRoom.room_id,
                                    tarif.nazva_taryfu,
                                    season.nazva_periodu,
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
