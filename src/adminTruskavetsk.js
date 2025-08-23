// import React, {useState, useEffect, forwardRef} from "react";
import {useState, useEffect, forwardRef,createRoot} from "@wordpress/element";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import FormControl from "@mui/material/FormControl";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";
const {
  differenceBy,
  flattenDeep,
  get,
  pickBy,
  startsWith,
  omitBy,
  omit,
} = lodash;
import omitDeep from "omit-deep-lodash";
import {v4 as uuid} from "uuid";
import {createTheme, ThemeProvider} from "@mui/material/styles";

import styled from "@emotion/styled";

import RoomsPanel from "./components/RoomsPanel";
import Rooms from "./components/Rooms";
import {
  convertFromHTML,
  ContentState,
  convertToRaw,
  convertFromRaw,
  EditorState,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import MUIRichTextEditor from "mui-rte";

import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import ruLocale from "date-fns/locale/ru";
import {format, parse, isValid} from "date-fns";
const myTheme = createTheme({});
const TaryfFormControl = styled(FormControl)`
  border-left: 1px solid #ddd;
  padding-left: 20px;
  margin-left: 20px;
`;
function TabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trusk-tabpanel-${index}`}
      aria-labelledby={`trusk-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{p: 3}}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function tabProps(index) {
  return {
    id: `trusk-tab-${index}`,
    "aria-controls": `trusk-tabpanel-${index}`,
  };
}
const BoxTypo = styled.div`
  min-width: 150px;
`;
const FormWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  & > *:not(:last-child) {
    margin-right: 20px;
  }
`;
const FormWrapperVertical = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  & input {
    box-sizing: border-box;
  }
  & .trusk_date input {
    padding: 16.5px 14px;
    height: 55px;
  }
  & > * {
    margin-bottom: 20px;
  }
`;
const IconButtonAdd = styled(IconButton)`
  background-color: rgb(25, 118, 210);
  :hover {
    background-color: rgb(21, 101, 192);
  }
  color: white;
`;
const IconButtonAddDate = styled(IconButton)`
  background-color: rgb(25, 118, 210);
  :hover {
    background-color: rgb(21, 101, 192);
  }
  color: white;
  align-self: flex-start;
`;
const TariffsContainer = styled(Box)`
  display: flex;
  & > div {
    flex: 1;
  }
`;
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AdminTruskavetsk() {
  const [tab, setTab] = useState(0);
  const [renderedTaryf, setRenderedTaryf] = useState(0);

  //Main states
  const maybeAddIds = (data) => {
    const newKorpusData = data.map((section) => {
      if (section.hasOwnProperty("id")) {
        return section;
      }
      return {...section, id: uuid()};
    });
    return newKorpusData;
  };
  const [data, setData] = useState(
    TRUSKA_DATA.section ? maybeAddIds(TRUSKA_DATA.section) : []
  );
  const [tarifData, setTarifData] = useState(
    get(data, ["0", "room", "0", "tariff"], [])
  );
  const [seasonData, setSeasonData] = useState(
    get(data, ["0", "room", "0", "tariff", "0", "booking_period"], [])
  );
  const [childData, setChildData] = useState(
    omitDeep(
      pickBy(
        get(
          data,
          ["0", "room", "0", "tariff", "0", "booking_period", "0"],
          {}
        ),
        function (value, key) {
          return startsWith(key, "price_for_child");
        }
      ),
      "kids_tarriff_price"
    ) || {
      price_for_child: {kids_tarriff_name: "0-5"},
      price_for_child_2: {kids_tarriff_name: "6-11"},
    }
  );
    //Update wp.media
	useEffect(() => {
		const attachmentIds = flattenDeep(
			data.map((section) => {
			  const roomPics = section.room.map((r) => {
				const gallery =
				  r.hasOwnProperty("room_gallery") && r.room_gallery
					? r.room_gallery.map((g) => g.foto_nomera)
					: [];
		
				return [r.room_main_foto, ...gallery];
			  });
			  return roomPics;
			})
		  ).filter((el) => el !== "" && el !== false);
		  console.log(attachmentIds);
		  wp.media
			.query({post__in: attachmentIds})
			.more()
			.then(function () {});
	}, [])


  //child
  const [dialogChild, setDialogChild] = useState(false);
  const [dialogChildSingle, setDialogChildSingle] = useState(false);
  const [childNew, setChildNew] = useState({
    [Object.keys(childData).length > 0
      ? `price_for_child_${Object.keys(childData).length + 1}`
      : "price_for_child"]: {
      kids_tarriff_name: "",
    },
  });
  const [editedChild, setEditedChild] = useState(null);
  const openDialogChild = () => {
    setDialogChild(true);
  };
  const closeDialogChild = () => {
    setDialogChild(false);
  };

  const openDialogChildSingle = (id) => {
    setDialogChildSingle(true);

    const foundChild =
      childData[id] !== undefined ? {[id]: childData[id]} : null;
    setEditedChild(foundChild);
  };

  const closeDialogChildSingle = () => {
    setDialogChildSingle(false);
    setEditedChild(null);
  };
  const deleteSingleChild = (id) => {
    // console.log(
    //   Object.keys(childData).filter((child) => {
    //     console.log(child, id);
    //     return child !== id;
    //   })
    // );
    const newChildData = Object.keys(childData)
      .filter((child) => {
        console.log(child, id);
        return child !== id;
      })
      .reduce((obj, key, index) => {
        console.log(newChildData);
        obj[index > 0 ? `price_for_child_${index + 1}` : "price_for_child"] =
          childData[key];
        return obj;
      }, {});

    setChildData(newChildData);
    console.log(newChildData);
    const newKorpusData = data.map((section) => {
      const newRoomData = section.room.map((room) => {
        const taryfNew = room.tariff.map((tariff) => {
          const seasonNew = tariff.booking_period.map((s) => {
            const allChilds = pickBy(s, function (value, key) {
              return startsWith(key, "price_for_child");
            });
            Object.keys(allChilds).forEach((ch) => {
              delete s[ch];
            });

            const newChildData = Object.keys(allChilds)
              .filter((child) => {
                return child !== id;
              })
              .reduce((obj, key, index) => {
                obj[
                  index > 0 ? `price_for_child_${index + 1}` : "price_for_child"
                ] = allChilds[key];
                return obj;
              }, {});

            return {...s, ...newChildData};
          });
          return {...tariff, booking_period: seasonNew};
        });
        return {
          ...room,
          tariff: taryfNew,
        };
      });
      return {...section, room: newRoomData};
    });
    console.log(newKorpusData);
    setData(newKorpusData);
  };
  const setChildSingle = (e) => {
    setEditedChild({
      [Object.keys(editedChild)[0]]: {
        kids_tarriff_name: e.target.value,
      },
    });
  };
  const saveSingleChild = () => {
    setChildData({...childData, ...editedChild});

    const newKorpusData = data.map((section) => {
      const newRoomData = section.room.map((room) => {
        const taryfNew = room.tariff.map((tariff) => {
          const seasonNew = tariff.booking_period.map((s) => {
            const editedChildId = Object.keys(editedChild);
            return {
              ...s,

              [editedChildId]: {
                ...s[editedChildId],
                kids_tarriff_name: editedChild[editedChildId].kids_tarriff_name,
              },
            };
          });
          return {...tariff, booking_period: seasonNew};
        });
        return {
          ...room,
          tariff: taryfNew,
        };
      });
      return {...section, room: newRoomData};
    });
    setData(newKorpusData);

    closeDialogChildSingle();
  };
  const saveChildNewField = (e) => {
    setChildNew({
      [Object.keys(childData).length > 0
        ? `price_for_child_${Object.keys(childData).length + 1}`
        : "price_for_child"]: {
        kids_tarriff_name: e.target.value,
        kids_tarriff_price: "",
      },
    });
  };
  const saveNewChild = () => {
    setChildData({...childData, ...childNew});
    setChildNew({
      [Object.keys(childData).length > 0
        ? `price_for_child_${Object.keys(childData).length + 1}`
        : "price_for_child"]: {
          kids_tarriff_name: "",
      },
    });
    const newKorpusData = data.map((section) => {
      const newRoomData = section.room.map((room) => {
        const taryfNew = room.tariff.map((tariff) => {
          const seasonNew = tariff.booking_period.map((s) => {
            return {
              ...s,

              ...childNew,
            };
          });
          return {...tariff, booking_period: seasonNew};
        });
        return {
          ...room,
          tariff: taryfNew,
        };
      });
      return {...section, room: newRoomData};
    });
    setData(newKorpusData);

    closeDialogChild();
  };

  //tariff
  const [dialogTaryf, setDialogTaryf] = useState(false);
  const [dialogTaryfSingle, setDialogTaryfSingle] = useState({});
  const [tarifNew, setTarifNew] = useState({
    id: uuid(),
    tariff_name: "",
    tariff_description: "",
    tariff_description_raw: JSON.stringify(
      convertToRaw(EditorState.createEmpty().getCurrentContent())
    ),
    lovest_price_tariff: false,
    booking_period: [],
  });
  const [editedTaryf, setEditedTaryf] = useState(null);

  const openDialogTaryf = () => {
    setDialogTaryf(true);
  };
  const closeDialogTaryf = () => {
    setDialogTaryf(false);
  };
  const openDialogTaryfSingle = (id) => {
    setDialogTaryfSingle({...dialogTaryfSingle, [id]: true});
    let foundTarif = tarifData.find((tarif) => tarif.id === id);
    if (
      foundTarif.tariff_description &&
      foundTarif.tariff_description !== "" &&
      foundTarif.tariff_description !== undefined
    ) {
      const contentHTML = convertFromHTML(foundTarif.tariff_description);
      const state = ContentState.createFromBlockArray(
        contentHTML.contentBlocks,
        contentHTML.entityMap
      );
      foundTarif = {
        ...foundTarif,
        tariff_description: JSON.stringify(convertToRaw(state)),
        tariff_description_raw: JSON.stringify(convertToRaw(state)),
      };
    } else {
      const editorState = EditorState.createEmpty();
      foundTarif = {
        ...foundTarif,

        tariff_description: JSON.stringify(
          convertToRaw(editorState.getCurrentContent())
        ),
        tariff_description_raw: JSON.stringify(
          convertToRaw(editorState.getCurrentContent())
        ),
      };
    }
    setEditedTaryf(foundTarif);
  };

  const closeDialogTaryfSingle = (id) => {
    setDialogTaryfSingle({...dialogTaryfSingle, [id]: false});
    setEditedTaryf(null);
  };

  //Korpus
  const [dialogKorpus, setDialogKorpus] = useState(false);
  const [dialogKorpusSingle, setDialogKorpusSingle] = useState(false);
  const [korpusNew, setKorpusNew] = useState({
    id: uuid(),
    nazva_korpusu: "",
    zagolovok_dlya_sektsiyi_nomeriv_korpusu: "",
    room: [],
  });
  const [editedKorpus, setEditedKorpus] = useState(null);
  const openDialogKorpus = () => {
    setDialogKorpus(true);
  };
  const closeDialogKorpus = () => {
    setDialogKorpus(false);
  };
  const openDialogKorpusSingle = (id) => {
    const foundKorpus = data.find((section) => section.id === id);
    const chnagedRoomds = foundKorpus.room.map((room) => {
      if (
        room.room_info &&
        room.room_info !== "" &&
        room.room_info !== "undefined"
      ) {
        const contentHTML = convertFromHTML(room.room_info);
        const state = ContentState.createFromBlockArray(
          contentHTML.contentBlocks,
          contentHTML.entityMap
        );
        return {
          ...room,
          room_info: JSON.stringify(convertToRaw(state)),
          room_info_raw: JSON.stringify(convertToRaw(state)),
        };
      } else {
        const editorState = EditorState.createEmpty();
        return {
          ...room,

          room_info: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          room_info_raw: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
        };
      }
    });
    setEditedKorpus({...foundKorpus, room: chnagedRoomds});
    setDialogKorpusSingle(true);
  };

  const closeDialogKorpusSingle = (id) => {
    setDialogKorpusSingle(false);
    setEditedKorpus(null);
  };

  const deleteKorpusSingle = (id) => {
    const newKorpusData = data.filter((section) => section.id !== id);
    setData(newKorpusData);
  };
  const saveKorpusNewName = (e) => {
    setKorpusNew({...korpusNew, nazva_korpusu: e.target.value});
  };
  const saveKorpusNewSubname = (e) => {
    setKorpusNew({
      ...korpusNew,
      zagolovok_dlya_sektsiyi_nomeriv_korpusu: e.target.value,
    });
  };
  const saveNewKorpus = () => {
    setKorpusNew({
      id: uuid(),
      nazva_korpusu: "",
      zagolovok_dlya_sektsiyi_nomeriv_korpusu: "",
      room: [],
    });

    setDialogKorpus(false);
  };
  //Season
  const [dialogSeason, setDialogSeason] = useState(false);
  const [dialogSeasonSingle, setDialogSeasonSingle] = useState(false);
  const [seasonNew, setSeasonNew] = useState({
    id: uuid(),
    booking_period_name: "",
    on_of_period: "yes",
    current_period: false,
    booking_period_dates: [
      {
        booking_period_begin: new Date(),
        booking_period_end: new Date(),
      },
    ],
  });
  const [editedSeason, setEditedSeason] = useState(null);
  const openDialogSeason = () => {
    setDialogSeason(true);
  };
  const closeDialogSeason = () => {
    setDialogSeason(false);
  };

  const openDialogSeasonSingle = (id) => {
    setDialogSeasonSingle(true);
    const foundSeason = seasonData.find((season) => season.id === id);
    setEditedSeason(foundSeason);
  };

  const closeDialogSeasonSingle = () => {
    setDialogSeasonSingle(false);
    setEditedSeason(null);
  };
  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const addKorpus = () => {
    setKorpusData([
      ...korpusData,
      {
        id: uuid(),
        nazva_korpusu: "",
        zagolovok_dlya_sektsiyi_nomeriv_korpusu: "",
      },
    ]);
  };

  const updateEditedKorpus = (e, id) => {
    setEditedKorpus({...editedKorpus, [e.target.name]: e.target.value});
  };
  // const addTaryf = () => {
  //   setTarifData([
  //     ...tarifData,
  //     {
  //       id: uuid(),
  //       tariff_name: "",
  //       tariff_description: "",
  //       booking_period: [],
  //       lovest_price_tariff: false,
  //     },
  //   ]);
  // };

  // editedTaryf, setEditedTaryf;

  //TARIF SINGLE//

  const setTarifSingle = (e, id) => {
    setEditedTaryf({...editedTaryf, tariff_name: e.target.value});
  };
  // const setTarifSingle = (e, id) => {
  //   const filteredData = tarifData.map((el) => {
  //     return el.id === id ? {...el, [e.target.name]: e.target.value} : el;
  //   });
  //   setTarifData(filteredData);
  // };
  const saveTextEditor = (data, id) => {
    //     const contentHTML = convertFromHTML(sampleMarkup)
    // const state = ContentState.createFromBlockArray(contentHTML.contentBlocks, contentHTML.entityMap)
    // const content = JSON.stringify(convertToRaw(state))
    // const raw = convertFromRaw(JSON.parse(data));
    // const content = JSON.stringify(data);
    // console.log(state.getSelection());
    // console.log(JSON.stringify(convertToRaw(state.getCurrentContent())));

    // const markup = draftToHtml(convertToRaw(data.getCurrentContent()));
    // const newKorpusData = section.room.map((room) =>
    //   room.room_id === room_id
    //     ? {
    //         ...room,
    //         room_info_raw: JSON.stringify(
    //           convertToRaw(data.getCurrentContent())
    //         ),
    //       }
    //     : room
    // );

    // const markup = draftToHtml(JSON.parse(data));
    setEditedTaryf({
      ...editedTaryf,
      tariff_description_raw: JSON.stringify(convertToRaw(data.getCurrentContent())),
    });

    // const filteredData = tarifData.map((el) => {
    //   return el.id === id ? {...el, tariff_description: markup} : el;
    // });

    // setTarifData(filteredData);
  };
  const handleLowestTarif = (e, id) => {
    console.log(id);
    setEditedTaryf({...editedTaryf, lovest_price_tariff: e.target.checked});
  };
  const setTaryfOpus = (opus) => {
    if (opus && opus !== "" && opus !== "undefined") {
      const contentHTML = convertFromHTML(opus);
      const state = ContentState.createFromBlockArray(
        contentHTML.contentBlocks,
        contentHTML.entityMap
      );
      return JSON.stringify(convertToRaw(state));
    } else {
      const editorState = EditorState.createEmpty();
      return JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    }
  };
  const saveSingleTaryf = (id) => {
    const newKorpuses = data.map((section) => {
      const newRooms = section.room.map((room) => {
        const taryfNew = room.tariff.map((tariff) => {
          //   const newData = tarifData.find((t) => t.id === tariff.id);
          if (tariff.id === id) {
            return {
              ...tariff,
              tariff_description: draftToHtml(JSON.parse(editedTaryf.tariff_description_raw)),
              tariff_name: editedTaryf.tariff_name,
              lovest_price_tariff: editedTaryf.lovest_price_tariff,
            };
          }
          return tariff;
        });
        return {...room, tariff: taryfNew};
      });
      return {...section, room: newRooms};
    });
    console.log(newKorpuses);
    setData(newKorpuses);
    const indexOfFound = tarifData.findIndex((tarif) => tarif.id === id);

    tarifData.splice(indexOfFound, 1, {
      ...editedTaryf,
      tariff_description: draftToHtml(JSON.parse(editedTaryf.tariff_description_raw)),
    });
    setTarifData(tarifData);
    // setRoomsData(newRooms);
    // initRoomsData(newRooms);
    setDialogTaryfSingle({...dialogTaryfSingle, [id]: false});
  };
  //SEASON SINGLE//

  const setSeasonSingle = (e, id) => {
    if (!id) {
      return;
    }
    setEditedSeason({...editedSeason, booking_period_name: e.target.value});
  };
  const addDateSeasonSingle = () => {
    setEditedSeason({
      ...editedSeason,
      booking_period_dates: [
        ...editedSeason.booking_period_dates,
        {
          booking_period_begin: new Date(),
          booking_period_end: new Date(),
        },
      ],
    });
  };
  const updateDatesSingleSeason = (i, val, when) => {
    if (!isValid(val)) {
      return;
    }
    if (when === "start_date") {
      setEditedSeason({
        ...editedSeason,
        booking_period_dates: editedSeason.booking_period_dates.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              booking_period_begin: format(val, "dd.MM.yyyy"),
            };
          }
          return date_period;
        }),
      });
    }
    if (when === "end_date") {
      setEditedSeason({
        ...editedSeason,
        booking_period_dates: editedSeason.booking_period_dates.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              booking_period_end: format(val, "dd.MM.yyyy"),
            };
          }
          return date_period;
        }),
      });
    }
  };
  const deleteSeasonSingleDate = (index) => {
    setEditedSeason({
      ...editedSeason,
      booking_period_dates: editedSeason.booking_period_dates.filter((date_period, i) => {
        return i !== index;
      }),
    });
  };
  const saveSingleSeason = (id) => {
    if (!id) {
      return;
    }

    const indexOfFound = seasonData.findIndex((season) => season.id === id);

    seasonData.splice(indexOfFound, 1, editedSeason);
    setSeasonData(seasonData);
    const newKorpuses = data.map((section) => {
      const newRooms = section.room.map((room) => {
        const taryfNew = room.tariff.map((tariff) => {
          const seasonNew = tariff.booking_period.map((season) => {
            const newData = seasonData.find((s) => s.id === season.id);
            return {
              ...season,
              booking_period_name: newData.booking_period_name,
              booking_period_dates: newData.booking_period_dates.map((date_period, i) => {
                return {
                  booking_period_begin: date_period.booking_period_begin,
                  booking_period_end: date_period.booking_period_end,
                };
              }),
            };
          });

          return {
            ...tariff,
            booking_period: seasonNew,
          };
        });
        return {...room, tariff: taryfNew};
      });
      return {...section, room: newRooms};
    });

    console.log(newKorpuses);
    setData(newKorpuses);
    // console.log(newRooms);
    // setRoomsData(newRooms);
    // initRoomsData(newRooms);
    setDialogSeasonSingle(false);
  };
  //tariff new

  const saveTarifNewField = (e) => {
    setTarifNew({...tarifNew, tariff_name: e.target.value});
  };
  const saveTextEditorNew = (data) => {
    // const markup = draftToHtml(JSON.parse(data));

    setTarifNew({
      ...tarifNew,
      tariff_description_raw: JSON.stringify(convertToRaw(data.getCurrentContent())),
    });
  };
  const saveNewTaryf = () => {
    const editorState = EditorState.createEmpty();

    const newKorpusData = data.map((section) => {
      const newRoomData = section.room.map((room) => {
        let maxAdult = room.adults_number;
        const newSeasonsData = seasonData.map((s) => {
          return {
            ...s,
            tsina_za_doroslyh: Array.from(
              {length: maxAdult},
              (v, k) => k
            ).reduce((prevV, currValue) => {
              prevV[`${currValue + 1}_adult`] = "";
              return prevV;
            }, {}),
            dodatkovi_mistsya: "",
            ...childData,
          };
        });
        return {
          ...room,
          tariff: [
            ...room.tariff,
            {
              ...tarifNew,
              tariff_description: draftToHtml(JSON.parse(tarifNew.tariff_description_raw)),
              booking_period: newSeasonsData,
            },
          ],
        };
      });
      return {...section, room: newRoomData};
    });
    setData(newKorpusData);
    setTarifData([
      ...tarifData,
      {
        ...tarifNew,
        tariff_description: draftToHtml(JSON.parse(tarifNew.tariff_description_raw)),
      },
    ]);
    setTarifNew({
      id: uuid(),
      tariff_name: "",
      tariff_description: "",
      tariff_description_raw: JSON.stringify(
        convertToRaw(editorState.getCurrentContent())
      ),
      lovest_price_tariff: false,
      booking_period: [],
    });
    setDialogTaryf(false);
  };
  //   useEffect(() => {
  //     completeTaryfData();
  //     completeSeasonData();
  //     initRoomsData(roomsData);
  //   }, [tarifData]);
  //New Season
  const saveSeasonNewField = (e) => {
    setSeasonNew({...seasonNew, booking_period_name: e.target.value});
  };
  const setDatesNewSeason = (i, newValue, when) => {
    console.log(newValue);
    if (!isValid(newValue)) {
      return;
    }
    if (when === "start_date") {
      setSeasonNew({
        ...seasonNew,
        booking_period_dates: seasonNew.booking_period_dates.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              booking_period_begin: format(newValue, "dd.MM.yyyy"),
            };
          }
          return date_period;
        }),
      });
    }
    if (when === "end_date") {
      setSeasonNew({
        ...seasonNew,
        booking_period_dates: seasonNew.booking_period_dates.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              booking_period_end: format(newValue, "dd.MM.yyyy"),
            };
          }
          return date_period;
        }),
      });
    }
  };
  const addDateSeason = () => {
    setSeasonNew({
      ...seasonNew,
      booking_period_dates: [
        ...seasonNew.booking_period_dates,
        {
          booking_period_begin: new Date(),
          booking_period_end: new Date(),
        },
      ],
    });
  };
  const saveNewSeason = () => {
    console.log(seasonNew);
    const newKorpusData = data.map((section) => {
      const newRoomData = section.room.map((room) => {
        let maxAdult = room.adults_number;
        const newTaryfData = room.tariff.map((tariff) => {
          return {
            ...tariff,
            booking_period: [
              ...tariff.booking_period,
              {
                ...seasonNew,
                tsina_za_doroslyh: Array.from(
                  {length: maxAdult},
                  (v, k) => k
                ).reduce((prevV, currValue) => {
                  prevV[`${currValue + 1}_adult`] = "";
                  return prevV;
                }, {}),
                dodatkovi_mistsya: "",
                ...childData,
              },
            ],
          };
        });

        return {
          ...room,
          tariff: newTaryfData,
        };
      });
      return {...section, room: newRoomData};
    });
    setData(newKorpusData);
    setSeasonData([...seasonData, {...seasonNew, position: seasonData.length}]);
    setSeasonNew({
      id: uuid(),
      booking_period_name: "",
      on_of_period: "yes",
      current_period: false,
      booking_period_dates: [
        {
          booking_period_begin: new Date(),
          booking_period_end: new Date(),
        },
      ],
    });
    setDialogSeason(false);
  };

  //Delete Season

  const deleteSeasonSingle = (id) => {
    let applyDelete = confirm("Удалить период?");
    if (applyDelete) {
      const newSeasonData = seasonData.filter((season) => season.id !== id);
      setSeasonData(newSeasonData);
      const newKorpuses = data.map((section) => {
        const modifiedData = section.room.map((r) => {
          const taryfArr = r.tariff.map((t) => {
            const filteredSeason = t.booking_period.filter(
              (s) => s.id !== id
            );
            return {...t, booking_period: filteredSeason};
          });
          return {...r, tariff: taryfArr};
        });
        return {...section, room: modifiedData};
      });
      console.log(newKorpuses);
      //   setRoomsData(modifiedData);
      setData(newKorpuses);
    }
  };

  const deleteSingleTaryf = (id) => {
    let applyDelete = confirm("Удалить тариф?");
    if (applyDelete) {
      const newTaryfData = tarifData.filter((t) => t.id !== id);
      setTarifData(newTaryfData);
      const newKorpuses = data.map((section) => {
        const modifiedData = section.room.map((r) => {
          const filteredTaryf = r.tariff.filter((t) => {
            return t.id !== id;
          });

          return {...r, tariff: filteredTaryf};
        });
        return {...section, room: modifiedData};
      });

      //   setRoomsData(modifiedData);
      setData(newKorpuses);
    }
  };
  return (
    <Paper className="">
      <input
        type="hidden"
        name="trusk_tarif_data"
        value={JSON.stringify(tarifData)}
      />

      <input
        type="hidden"
        name="trusk_season_data"
        value={JSON.stringify(seasonData)}
      />
      <input
        type="hidden"
        name="trusk_whole_data"
        value={JSON.stringify(data)}
      />
      <input
        type="hidden"
        name="trusk_child_data"
        value={JSON.stringify(childData)}
      />

      <Box sx={{borderBottom: 1, borderColor: "divider"}}>
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="Корпуси / Номери" {...tabProps(0)} />
          <Tab label="Тарифи" {...tabProps(1)} />
          <Tab label="Сезони" {...tabProps(2)} />
          <Tab label="Ціни" {...tabProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        {data.map((section, i) => (
          <FormWrapper key={`section-${i}`}>
            <FormControl>
              <TextField
                disabled
                type="text"
                label="Назва"
                name="nazva_korpusu"
                value={section.nazva_korpusu}
              />
            </FormControl>
            <FormControl>
              <TextField
                disabled
                type="text"
                label="Заголовок для секції"
                name="zagolovok_dlya_sektsiyi_nomeriv_korpusu"
                value={section.zagolovok_dlya_sektsiyi_nomeriv_korpusu}
              />
            </FormControl>
            <FormControl>
              <IconButton
                color="primary"
                onClick={() => openDialogKorpusSingle(section.id)}
              >
                <EditIcon />
              </IconButton>
            </FormControl>
            <FormControl>
              <IconButton
                color="secondary"
                onClick={() => deleteKorpusSingle(section.id)}
              >
                <DeleteIcon />
              </IconButton>
            </FormControl>
          </FormWrapper>
        ))}
        <Dialog
          maxWidth="xl"
          fullScreen={true}
          open={dialogKorpusSingle}
          onClose={() => closeDialogKorpusSingle()}
          sx={{zIndex: 119999}}
          TransitionComponent={Transition}
		//   PaperComponent={(props) => (<div>{props.children}</div>)}
		tabIndex={'none'}
		 PaperProps={{ tabIndex: 'none' }}
		 disableEnforceFocus
        >
          <DialogContent tabIndex={'none'}>
            <AppBar>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={closeDialogKorpusSingle}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
                <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                  {editedKorpus?.nazva_korpusu}
                </Typography>
              </Toolbar>
            </AppBar>
            <div style={{paddingTop: "100px"}}>
              <FormWrapper>
                <FormControl>
                  <TextField
                    type="text"
                    label="Назва"
                    name="nazva_korpusu"
                    value={editedKorpus?.nazva_korpusu}
                    onChange={(e) => updateEditedKorpus(e, editedKorpus?.id)}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    type="text"
                    label="Заголовок"
                    name="zagolovok_dlya_sektsiyi_nomeriv_korpusu"
                    value={
                      editedKorpus?.zagolovok_dlya_sektsiyi_nomeriv_korpusu
                    }
                    onChange={(e) => updateEditedKorpus(e, editedKorpus?.id)}
                  />
                </FormControl>
              </FormWrapper>
              <Rooms
                closeDialog={closeDialogKorpusSingle}
                korpusData={[
                  editedKorpus,
                  setEditedKorpus,
                  data,
                  setData,
                  tarifData,
                  seasonData,
                  childData,
                ]}
              />
            </div>
          </DialogContent>
        </Dialog>
        <Tooltip title="Додати корпус" placement="top">
          <IconButtonAdd
            color="inherit"
            size="large"
            onClick={openDialogKorpus}
          >
            <AddIcon />
          </IconButtonAdd>
        </Tooltip>
        <Dialog
          maxWidth="xl"
          fullScreen={true}
          open={dialogKorpus}
          onClose={() => closeDialogKorpus()}
          sx={{zIndex: 119999}}
          TransitionComponent={Transition}
		  tabIndex={'none'}
		  PaperProps={{ tabIndex: 'none' }}
		  disableEnforceFocus
        >
          <DialogContent>
            <AppBar>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={closeDialogKorpus}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
                <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                  Корпус
                </Typography>
              </Toolbar>
            </AppBar>

            <FormWrapper style={{paddingTop: "100px"}}>
              <FormControl>
                <TextField
                  type="text"
                  label="Назва"
                  name="nazva_korpusu_new"
                  value={korpusNew.nazva_korpusu}
                  onChange={saveKorpusNewName}
                />
              </FormControl>
              <FormControl>
                <TextField
                  type="text"
                  label="Заголовок"
                  name="nazva_korpusu_new"
                  value={korpusNew.zagolovok_dlya_sektsiyi_nomeriv_korpusu}
                  onChange={saveKorpusNewSubname}
                />
              </FormControl>
            </FormWrapper>
            <Rooms
              isNew
              setKorpusNew={setKorpusNew}
              closeDialog={closeDialogKorpus}
              korpusData={[
                korpusNew,
                setKorpusNew,
                data,
                setData,
                tarifData,
                seasonData,
                childData,
              ]}
            />
          </DialogContent>
        </Dialog>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <TariffsContainer>
          <div>
            {tarifData?.map((tarif, i) => (
              <FormWrapper key={`section-${i}`}>
                <FormControl>
                  <TextField
                    disabled
                    type="text"
                    label="Назва"
                    name="tariff_name"
                    value={tarif.tariff_name}
                  />
                </FormControl>

                <FormControl>
                  <IconButton
                    color="primary"
                    onClick={() => openDialogTaryfSingle(tarif.id)}
                  >
                    <EditIcon />
                  </IconButton>
                </FormControl>
                <FormControl>
                  <IconButton
                    color="secondary"
                    onClick={() => deleteSingleTaryf(tarif.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </FormControl>

                <Dialog
                  open={
                    typeof dialogTaryfSingle[tarif.id] === "undefined"
                      ? false
                      : dialogTaryfSingle[tarif.id]
                  }
                  onClose={() => closeDialogTaryfSingle(tarif.id)}
                >
                  <DialogContent>
                    <FormWrapperVertical>
                      <FormControl>
                        <TextField
                          type="text"
                          label="Назва"
                          name="tariff_name_new"
                          value={editedTaryf?.tariff_name}
                          onChange={(e) => setTarifSingle(e, tarif.id)}
                        />
                      </FormControl>
                      <TaryfFormControl>
                        <ThemeProvider theme={myTheme}>
                          <MUIRichTextEditor
                            label="Опис тарифу"
                            onChange={(data) => saveTextEditor(data, tarif.id)}
                            // onSave={(data) => saveTextEditor(data, tarif.id)}
                            defaultValue={editedTaryf?.tariff_description}
                          />
                        </ThemeProvider>
                      </TaryfFormControl>

                      <FormControl>
                        <FormControlLabel
                          label="Найдешевший тариф"
                          control={
                            <Checkbox
                              checked={editedTaryf?.lovest_price_tariff}
                              onChange={(e) => handleLowestTarif(e, tarif.id)}
                            />
                          }
                        />
                      </FormControl>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => saveSingleTaryf(tarif.id)}
                      >
                        Зберегти
                      </Button>
                    </FormWrapperVertical>
                  </DialogContent>
                </Dialog>
              </FormWrapper>
            ))}
            <Tooltip title="Додати тариф" placement="top">
              <IconButtonAdd
                color="inherit"
                size="large"
                onClick={openDialogTaryf}
              >
                <AddIcon />
              </IconButtonAdd>
            </Tooltip>

            <Dialog open={dialogTaryf} onClose={closeDialogTaryf}>
              <DialogContent>
                <FormWrapperVertical>
                  <FormControl>
                    <TextField
                      type="text"
                      label="Назва"
                      name="tariff_name_new"
                      value={tarifNew.tariff_name}
                      onChange={saveTarifNewField}
                    />
                  </FormControl>
                  <TaryfFormControl>
                    <ThemeProvider theme={myTheme}>
                      <MUIRichTextEditor
                        label="Опис тарифу"
                        onChange={saveTextEditorNew}
                        // onSave={saveTextEditorNew}
                      />
                    </ThemeProvider>
                  </TaryfFormControl>

                  <Button
                    color="primary"
                    variant="contained"
                    onClick={saveNewTaryf}
                  >
                    Зберегти
                  </Button>
                </FormWrapperVertical>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            {Object.entries(childData)?.map((child, i) => (
              <FormWrapper key={`section-${i}`}>
                <FormControl>
                  <TextField
                    disabled
                    type="text"
                    label="Назва"
                    name={
                      i > 0 ? `price_for_child_${i + 1}` : "price_for_child"
                    }
                    value={
                      childData[
                        i > 0 ? `price_for_child_${i + 1}` : "price_for_child"
                      ]["kids_tarriff_name"]
                    }
                  />
                </FormControl>

                <FormControl>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      openDialogChildSingle(
                        i > 0 ? `price_for_child_${i + 1}` : "price_for_child"
                      )
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </FormControl>
                {i > 1 && (
                  <FormControl>
                    <IconButton
                      color="secondary"
                      onClick={() =>
                        deleteSingleChild(
                          i > 0 ? `price_for_child_${i + 1}` : "price_for_child"
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </FormControl>
                )}
              </FormWrapper>
            ))}
            <Dialog open={dialogChildSingle} onClose={closeDialogChildSingle}>
              <DialogContent>
                <FormWrapperVertical>
                  <FormControl>
                    <TextField
                      type="text"
                      label="Название"
                      name="nazva_child_new"
                      value={
                        editedChild &&
                        Object.values(editedChild)?.[0]["kids_tarriff_name"]
                      }
                      onChange={setChildSingle}
                    />
                  </FormControl>

                  <Button
                    color="primary"
                    variant="contained"
                    onClick={saveSingleChild}
                  >
                    Зберегти
                  </Button>
                </FormWrapperVertical>
              </DialogContent>
            </Dialog>
            <Tooltip title="Додати дитячі місця" placement="top">
              <IconButtonAdd
                color="inherit"
                size="large"
                onClick={openDialogChild}
              >
                <AddIcon />
              </IconButtonAdd>
            </Tooltip>
            <Dialog open={dialogChild} onClose={closeDialogChild}>
              <DialogContent>
                <FormWrapperVertical>
                  <FormControl>
                    <TextField
                      type="text"
                      label="Назва"
                      name="nazva_child_new"
                      value={childNew.kids_tarriff_name}
                      onChange={saveChildNewField}
                    />
                  </FormControl>

                  <Button
                    color="primary"
                    variant="contained"
                    onClick={saveNewChild}
                  >
                    Зберегти
                  </Button>
                </FormWrapperVertical>
              </DialogContent>
            </Dialog>
          </div>
        </TariffsContainer>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        {seasonData?.map((season, sindex) => (
          <FormWrapper key={`section-${sindex}`}>
            <BoxTypo>
              <Typography variant="h6" component="h6">
                {season.booking_period_name}
              </Typography>
            </BoxTypo>
            {season.booking_period_dates.map((date_period, i) => (
              <>
                <FormControl>
                  <TextField
                    disabled
                    label="Початок сезону"
                    value={date_period.booking_period_begin}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    disabled
                    label="Кінець сезону"
                    value={date_period.booking_period_end}
                  />
                </FormControl>
              </>
            ))}

            <FormControl>
              <IconButton
                color="primary"
                onClick={() => openDialogSeasonSingle(season.id)}
              >
                <EditIcon />
              </IconButton>
            </FormControl>
            <FormControl>
              <IconButton
                color="secondary"
                onClick={() => deleteSeasonSingle(season.id)}
              >
                <DeleteIcon />
              </IconButton>
            </FormControl>
          </FormWrapper>
        ))}
        <Dialog
          maxWidth="md"
          open={dialogSeasonSingle}
          onClose={() => closeDialogSeasonSingle()}
        >
          <DialogContent>
            <FormWrapperVertical>
              <FormControl>
                <TextField
                  type="text"
                  label="Назва"
                  name="booking_period_name_new"
                  value={editedSeason?.booking_period_name}
                  onChange={(e) => setSeasonSingle(e, editedSeason?.id)}
                />
              </FormControl>
              {editedSeason?.booking_period_dates.map((date_period, i) => (
                <div key={`section-${i}`}>
                  <FormControl className="trusk_date">
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      locale={ruLocale}
                    >
                      <DesktopDatePicker
                        label="Початок сезону"
                        // inputFormat="dd.MM.yyyy"
                        mask="__.__.____"
                        value={
                          editedSeason
                            ? parse(
                                date_period.booking_period_begin,
                                "dd.MM.yyyy",
                                new Date()
                              )
                            : new Date()
                        }
                        onChange={(val) =>
                          updateDatesSingleSeason(i, val, "start_date")
                        }
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </FormControl>

                  <FormControl className="trusk_date">
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      locale={ruLocale}
                    >
                      <DesktopDatePicker
                        label="Кінець сезону"
                        // inputFormat="dd.MM.yyyy"
                        mask="__.__.____"
                        value={
                          editedSeason
                            ? parse(
                                date_period.booking_period_end,
                                "dd.MM.yyyy",
                                new Date()
                              )
                            : new Date()
                        }
                        onChange={(val) =>
                          updateDatesSingleSeason(i, val, "end_date")
                        }
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </FormControl>
                  <IconButton
                    color="secondary"
                    onClick={() => deleteSeasonSingleDate(i)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
              <IconButtonAddDate
                color="warning"
                size="medium"
                onClick={addDateSeasonSingle}
              >
                <AddIcon />
              </IconButtonAddDate>
              <Button
                color="primary"
                variant="contained"
                onClick={() => saveSingleSeason(editedSeason?.id)}
              >
                Зберегти
              </Button>
            </FormWrapperVertical>
          </DialogContent>
        </Dialog>
        <Tooltip title="Додати сезон" placement="top">
          <IconButtonAdd
            color="inherit"
            size="large"
            onClick={openDialogSeason}
          >
            <AddIcon />
          </IconButtonAdd>
        </Tooltip>
        <Dialog open={dialogSeason} onClose={closeDialogSeason}>
          <DialogContent>
            <FormWrapperVertical>
              <FormControl>
                <TextField
                  type="text"
                  label="Назва"
                  name="nazva_season_new"
                  value={seasonNew.booking_period_name}
                  onChange={saveSeasonNewField}
                />
              </FormControl>
              {seasonNew.booking_period_dates.map((date_period, i) => (
                <div key={`section-${i}`}>
                  <FormControl className="trusk_date">
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      locale={ruLocale}
                    >
                      <DesktopDatePicker
                        label="Початок сезону"
                        // inputFormat="dd.MM.yyyy"
                        mask="__.__.____"
                        value={parse(
                          seasonNew.booking_period_dates[i].booking_period_begin,
                          "dd.MM.yyyy",
                          new Date()
                        )}
                        onChange={(val) =>
                          setDatesNewSeason(i, val, "start_date")
                        }
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </FormControl>

                  <FormControl className="trusk_date">
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      locale={ruLocale}
                    >
                      <DesktopDatePicker
                        label="Кінець сезону"
                        // inputFormat="dd.MM.yyyy"
                        mask="__.__.____"
                        value={parse(
                          seasonNew.booking_period_dates[i].booking_period_end,
                          "dd.MM.yyyy",
                          new Date()
                        )}
                        onChange={(val) =>
                          setDatesNewSeason(i, val, "end_date")
                        }
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
              ))}

              <IconButtonAddDate
                color="warning"
                size="medium"
                onClick={addDateSeason}
              >
                <AddIcon />
              </IconButtonAddDate>
              <Button
                color="primary"
                variant="contained"
                onClick={saveNewSeason}
              >
                Зберегти
              </Button>
            </FormWrapperVertical>
          </DialogContent>
        </Dialog>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <RoomsPanel
          data={data}
          setData={setData}
          seasonData={seasonData}
          tarifData={tarifData}
        />
      </TabPanel>
    </Paper>
  );
}

createRoot(document.getElementById("admin-trusk-app")).render(<AdminTruskavetsk />);
