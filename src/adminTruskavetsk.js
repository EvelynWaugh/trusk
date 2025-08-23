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
    const newKorpusData = data.map((korpus) => {
      if (korpus.hasOwnProperty("id")) {
        return korpus;
      }
      return {...korpus, id: uuid()};
    });
    return newKorpusData;
  };
  const [data, setData] = useState(
    TRUSKA_DATA.korpus ? maybeAddIds(TRUSKA_DATA.korpus) : []
  );
  const [tarifData, setTarifData] = useState(
    get(data, ["0", "room", "0", "taryf"], [])
  );
  const [seasonData, setSeasonData] = useState(
    get(data, ["0", "room", "0", "taryf", "0", "period_prozhyvannya"], [])
  );
  const [childData, setChildData] = useState(
    omitDeep(
      pickBy(
        get(
          data,
          ["0", "room", "0", "taryf", "0", "period_prozhyvannya", "0"],
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
			data.map((korpus) => {
			  const roomPics = korpus.room.map((r) => {
				const gallery =
				  r.hasOwnProperty("galereya_nomera") && r.galereya_nomera
					? r.galereya_nomera.map((g) => g.foto_nomera)
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
    const newKorpusData = data.map((korpus) => {
      const newRoomData = korpus.room.map((room) => {
        const taryfNew = room.taryf.map((taryf) => {
          const seasonNew = taryf.period_prozhyvannya.map((s) => {
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
          return {...taryf, period_prozhyvannya: seasonNew};
        });
        return {
          ...room,
          taryf: taryfNew,
        };
      });
      return {...korpus, room: newRoomData};
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

    const newKorpusData = data.map((korpus) => {
      const newRoomData = korpus.room.map((room) => {
        const taryfNew = room.taryf.map((taryf) => {
          const seasonNew = taryf.period_prozhyvannya.map((s) => {
            const editedChildId = Object.keys(editedChild);
            return {
              ...s,

              [editedChildId]: {
                ...s[editedChildId],
                kids_tarriff_name: editedChild[editedChildId].kids_tarriff_name,
              },
            };
          });
          return {...taryf, period_prozhyvannya: seasonNew};
        });
        return {
          ...room,
          taryf: taryfNew,
        };
      });
      return {...korpus, room: newRoomData};
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
    const newKorpusData = data.map((korpus) => {
      const newRoomData = korpus.room.map((room) => {
        const taryfNew = room.taryf.map((taryf) => {
          const seasonNew = taryf.period_prozhyvannya.map((s) => {
            return {
              ...s,

              ...childNew,
            };
          });
          return {...taryf, period_prozhyvannya: seasonNew};
        });
        return {
          ...room,
          taryf: taryfNew,
        };
      });
      return {...korpus, room: newRoomData};
    });
    setData(newKorpusData);

    closeDialogChild();
  };

  //taryf
  const [dialogTaryf, setDialogTaryf] = useState(false);
  const [dialogTaryfSingle, setDialogTaryfSingle] = useState({});
  const [tarifNew, setTarifNew] = useState({
    id: uuid(),
    nazva_taryfu: "",
    opys_taryfa: "",
    opys_taryfa_raw: JSON.stringify(
      convertToRaw(EditorState.createEmpty().getCurrentContent())
    ),
    najdeshevshyj_taryf: false,
    period_prozhyvannya: [],
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
      foundTarif.opys_taryfa &&
      foundTarif.opys_taryfa !== "" &&
      foundTarif.opys_taryfa !== undefined
    ) {
      const contentHTML = convertFromHTML(foundTarif.opys_taryfa);
      const state = ContentState.createFromBlockArray(
        contentHTML.contentBlocks,
        contentHTML.entityMap
      );
      foundTarif = {
        ...foundTarif,
        opys_taryfa: JSON.stringify(convertToRaw(state)),
        opys_taryfa_raw: JSON.stringify(convertToRaw(state)),
      };
    } else {
      const editorState = EditorState.createEmpty();
      foundTarif = {
        ...foundTarif,

        opys_taryfa: JSON.stringify(
          convertToRaw(editorState.getCurrentContent())
        ),
        opys_taryfa_raw: JSON.stringify(
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
    const foundKorpus = data.find((korpus) => korpus.id === id);
    const chnagedRoomds = foundKorpus.room.map((room) => {
      if (
        room.detalnyj_opys_nomeru &&
        room.detalnyj_opys_nomeru !== "" &&
        room.detalnyj_opys_nomeru !== "undefined"
      ) {
        const contentHTML = convertFromHTML(room.detalnyj_opys_nomeru);
        const state = ContentState.createFromBlockArray(
          contentHTML.contentBlocks,
          contentHTML.entityMap
        );
        return {
          ...room,
          detalnyj_opys_nomeru: JSON.stringify(convertToRaw(state)),
          detalnyj_opys_nomeru_raw: JSON.stringify(convertToRaw(state)),
        };
      } else {
        const editorState = EditorState.createEmpty();
        return {
          ...room,

          detalnyj_opys_nomeru: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          detalnyj_opys_nomeru_raw: JSON.stringify(
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
    const newKorpusData = data.filter((korpus) => korpus.id !== id);
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
    nazva_periodu: "",
    on_of_period: "yes",
    potochnyj_period: false,
    daty_periodu: [
      {
        data_pochatku_periodu: new Date(),
        data_kintsya_periodu: new Date(),
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
  //       nazva_taryfu: "",
  //       opys_taryfa: "",
  //       period_prozhyvannya: [],
  //       najdeshevshyj_taryf: false,
  //     },
  //   ]);
  // };

  // editedTaryf, setEditedTaryf;

  //TARIF SINGLE//

  const setTarifSingle = (e, id) => {
    setEditedTaryf({...editedTaryf, nazva_taryfu: e.target.value});
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
    // const newKorpusData = korpus.room.map((room) =>
    //   room.room_id === room_id
    //     ? {
    //         ...room,
    //         detalnyj_opys_nomeru_raw: JSON.stringify(
    //           convertToRaw(data.getCurrentContent())
    //         ),
    //       }
    //     : room
    // );

    // const markup = draftToHtml(JSON.parse(data));
    setEditedTaryf({
      ...editedTaryf,
      opys_taryfa_raw: JSON.stringify(convertToRaw(data.getCurrentContent())),
    });

    // const filteredData = tarifData.map((el) => {
    //   return el.id === id ? {...el, opys_taryfa: markup} : el;
    // });

    // setTarifData(filteredData);
  };
  const handleLowestTarif = (e, id) => {
    console.log(id);
    setEditedTaryf({...editedTaryf, najdeshevshyj_taryf: e.target.checked});
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
    const newKorpuses = data.map((korpus) => {
      const newRooms = korpus.room.map((room) => {
        const taryfNew = room.taryf.map((taryf) => {
          //   const newData = tarifData.find((t) => t.id === taryf.id);
          if (taryf.id === id) {
            return {
              ...taryf,
              opys_taryfa: draftToHtml(JSON.parse(editedTaryf.opys_taryfa_raw)),
              nazva_taryfu: editedTaryf.nazva_taryfu,
              najdeshevshyj_taryf: editedTaryf.najdeshevshyj_taryf,
            };
          }
          return taryf;
        });
        return {...room, taryf: taryfNew};
      });
      return {...korpus, room: newRooms};
    });
    console.log(newKorpuses);
    setData(newKorpuses);
    const indexOfFound = tarifData.findIndex((tarif) => tarif.id === id);

    tarifData.splice(indexOfFound, 1, {
      ...editedTaryf,
      opys_taryfa: draftToHtml(JSON.parse(editedTaryf.opys_taryfa_raw)),
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
    setEditedSeason({...editedSeason, nazva_periodu: e.target.value});
  };
  const addDateSeasonSingle = () => {
    setEditedSeason({
      ...editedSeason,
      daty_periodu: [
        ...editedSeason.daty_periodu,
        {
          data_pochatku_periodu: new Date(),
          data_kintsya_periodu: new Date(),
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
        daty_periodu: editedSeason.daty_periodu.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              data_pochatku_periodu: format(val, "dd.MM.yyyy"),
            };
          }
          return date_period;
        }),
      });
    }
    if (when === "end_date") {
      setEditedSeason({
        ...editedSeason,
        daty_periodu: editedSeason.daty_periodu.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              data_kintsya_periodu: format(val, "dd.MM.yyyy"),
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
      daty_periodu: editedSeason.daty_periodu.filter((date_period, i) => {
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
    const newKorpuses = data.map((korpus) => {
      const newRooms = korpus.room.map((room) => {
        const taryfNew = room.taryf.map((taryf) => {
          const seasonNew = taryf.period_prozhyvannya.map((season) => {
            const newData = seasonData.find((s) => s.id === season.id);
            return {
              ...season,
              nazva_periodu: newData.nazva_periodu,
              daty_periodu: newData.daty_periodu.map((date_period, i) => {
                return {
                  data_pochatku_periodu: date_period.data_pochatku_periodu,
                  data_kintsya_periodu: date_period.data_kintsya_periodu,
                };
              }),
            };
          });

          return {
            ...taryf,
            period_prozhyvannya: seasonNew,
          };
        });
        return {...room, taryf: taryfNew};
      });
      return {...korpus, room: newRooms};
    });

    console.log(newKorpuses);
    setData(newKorpuses);
    // console.log(newRooms);
    // setRoomsData(newRooms);
    // initRoomsData(newRooms);
    setDialogSeasonSingle(false);
  };
  //Taryf new

  const saveTarifNewField = (e) => {
    setTarifNew({...tarifNew, nazva_taryfu: e.target.value});
  };
  const saveTextEditorNew = (data) => {
    // const markup = draftToHtml(JSON.parse(data));

    setTarifNew({
      ...tarifNew,
      opys_taryfa_raw: JSON.stringify(convertToRaw(data.getCurrentContent())),
    });
  };
  const saveNewTaryf = () => {
    const editorState = EditorState.createEmpty();

    const newKorpusData = data.map((korpus) => {
      const newRoomData = korpus.room.map((room) => {
        let maxAdult = room.maksymalna_kilkist_doroslyh;
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
          taryf: [
            ...room.taryf,
            {
              ...tarifNew,
              opys_taryfa: draftToHtml(JSON.parse(tarifNew.opys_taryfa_raw)),
              period_prozhyvannya: newSeasonsData,
            },
          ],
        };
      });
      return {...korpus, room: newRoomData};
    });
    setData(newKorpusData);
    setTarifData([
      ...tarifData,
      {
        ...tarifNew,
        opys_taryfa: draftToHtml(JSON.parse(tarifNew.opys_taryfa_raw)),
      },
    ]);
    setTarifNew({
      id: uuid(),
      nazva_taryfu: "",
      opys_taryfa: "",
      opys_taryfa_raw: JSON.stringify(
        convertToRaw(editorState.getCurrentContent())
      ),
      najdeshevshyj_taryf: false,
      period_prozhyvannya: [],
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
    setSeasonNew({...seasonNew, nazva_periodu: e.target.value});
  };
  const setDatesNewSeason = (i, newValue, when) => {
    console.log(newValue);
    if (!isValid(newValue)) {
      return;
    }
    if (when === "start_date") {
      setSeasonNew({
        ...seasonNew,
        daty_periodu: seasonNew.daty_periodu.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              data_pochatku_periodu: format(newValue, "dd.MM.yyyy"),
            };
          }
          return date_period;
        }),
      });
    }
    if (when === "end_date") {
      setSeasonNew({
        ...seasonNew,
        daty_periodu: seasonNew.daty_periodu.map((date_period, index) => {
          if (i === index) {
            return {
              ...date_period,
              data_kintsya_periodu: format(newValue, "dd.MM.yyyy"),
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
      daty_periodu: [
        ...seasonNew.daty_periodu,
        {
          data_pochatku_periodu: new Date(),
          data_kintsya_periodu: new Date(),
        },
      ],
    });
  };
  const saveNewSeason = () => {
    console.log(seasonNew);
    const newKorpusData = data.map((korpus) => {
      const newRoomData = korpus.room.map((room) => {
        let maxAdult = room.maksymalna_kilkist_doroslyh;
        const newTaryfData = room.taryf.map((taryf) => {
          return {
            ...taryf,
            period_prozhyvannya: [
              ...taryf.period_prozhyvannya,
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
          taryf: newTaryfData,
        };
      });
      return {...korpus, room: newRoomData};
    });
    setData(newKorpusData);
    setSeasonData([...seasonData, {...seasonNew, position: seasonData.length}]);
    setSeasonNew({
      id: uuid(),
      nazva_periodu: "",
      on_of_period: "yes",
      potochnyj_period: false,
      daty_periodu: [
        {
          data_pochatku_periodu: new Date(),
          data_kintsya_periodu: new Date(),
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
      const newKorpuses = data.map((korpus) => {
        const modifiedData = korpus.room.map((r) => {
          const taryfArr = r.taryf.map((t) => {
            const filteredSeason = t.period_prozhyvannya.filter(
              (s) => s.id !== id
            );
            return {...t, period_prozhyvannya: filteredSeason};
          });
          return {...r, taryf: taryfArr};
        });
        return {...korpus, room: modifiedData};
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
      const newKorpuses = data.map((korpus) => {
        const modifiedData = korpus.room.map((r) => {
          const filteredTaryf = r.taryf.filter((t) => {
            return t.id !== id;
          });

          return {...r, taryf: filteredTaryf};
        });
        return {...korpus, room: modifiedData};
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
        {data.map((korpus, i) => (
          <FormWrapper key={`korpus-${i}`}>
            <FormControl>
              <TextField
                disabled
                type="text"
                label="Назва"
                name="nazva_korpusu"
                value={korpus.nazva_korpusu}
              />
            </FormControl>
            <FormControl>
              <TextField
                disabled
                type="text"
                label="Заголовок для секції"
                name="zagolovok_dlya_sektsiyi_nomeriv_korpusu"
                value={korpus.zagolovok_dlya_sektsiyi_nomeriv_korpusu}
              />
            </FormControl>
            <FormControl>
              <IconButton
                color="primary"
                onClick={() => openDialogKorpusSingle(korpus.id)}
              >
                <EditIcon />
              </IconButton>
            </FormControl>
            <FormControl>
              <IconButton
                color="secondary"
                onClick={() => deleteKorpusSingle(korpus.id)}
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
              <FormWrapper key={`korpus-${i}`}>
                <FormControl>
                  <TextField
                    disabled
                    type="text"
                    label="Назва"
                    name="nazva_taryfu"
                    value={tarif.nazva_taryfu}
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
                          name="nazva_taryfu_new"
                          value={editedTaryf?.nazva_taryfu}
                          onChange={(e) => setTarifSingle(e, tarif.id)}
                        />
                      </FormControl>
                      <TaryfFormControl>
                        <ThemeProvider theme={myTheme}>
                          <MUIRichTextEditor
                            label="Опис тарифу"
                            onChange={(data) => saveTextEditor(data, tarif.id)}
                            // onSave={(data) => saveTextEditor(data, tarif.id)}
                            defaultValue={editedTaryf?.opys_taryfa}
                          />
                        </ThemeProvider>
                      </TaryfFormControl>

                      <FormControl>
                        <FormControlLabel
                          label="Найдешевший тариф"
                          control={
                            <Checkbox
                              checked={editedTaryf?.najdeshevshyj_taryf}
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
                      name="nazva_taryfu_new"
                      value={tarifNew.nazva_taryfu}
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
              <FormWrapper key={`korpus-${i}`}>
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
          <FormWrapper key={`korpus-${sindex}`}>
            <BoxTypo>
              <Typography variant="h6" component="h6">
                {season.nazva_periodu}
              </Typography>
            </BoxTypo>
            {season.daty_periodu.map((date_period, i) => (
              <>
                <FormControl>
                  <TextField
                    disabled
                    label="Початок сезону"
                    value={date_period.data_pochatku_periodu}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    disabled
                    label="Кінець сезону"
                    value={date_period.data_kintsya_periodu}
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
                  name="nazva_periodu_new"
                  value={editedSeason?.nazva_periodu}
                  onChange={(e) => setSeasonSingle(e, editedSeason?.id)}
                />
              </FormControl>
              {editedSeason?.daty_periodu.map((date_period, i) => (
                <div key={`korpus-${i}`}>
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
                                date_period.data_pochatku_periodu,
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
                                date_period.data_kintsya_periodu,
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
                  value={seasonNew.nazva_periodu}
                  onChange={saveSeasonNewField}
                />
              </FormControl>
              {seasonNew.daty_periodu.map((date_period, i) => (
                <div key={`korpus-${i}`}>
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
                          seasonNew.daty_periodu[i].data_pochatku_periodu,
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
                          seasonNew.daty_periodu[i].data_kintsya_periodu,
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
