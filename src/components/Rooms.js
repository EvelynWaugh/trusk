import {
  useState,
  useEffect,
  forwardRef,
  memo,
  useRef,
} from "@wordpress/element";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionActions from "@mui/material/AccordionActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadIcon from "@mui/icons-material/Upload";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {Attachment} from "@mui/icons-material";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import styled from "@emotion/styled";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {
  convertFromHTML,
  ContentState,
  convertToRaw,
  convertFromRaw,
  EditorState,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import MUIRichTextEditor from "mui-rte";
import {v4 as uuid} from "uuid";
const {flattenDeep, defaults} = lodash;

import {getMinPrice} from "../utils";


const myTheme = createTheme({});
const IconButtonAdd = styled(IconButton)`
  background-color: rgb(25, 118, 210);
  :hover {
    background-color: rgb(21, 101, 192);
  }
  color: white;
`;
const CharacteFormControl = styled(FormControl)`
  position: relative;
  margin-right: 10px;
  & .MuiButtonBase-root {
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(30%, -50%);
  }
  :hover .MuiButtonBase-root {
    visibility: visible;
    opacity: 1;
  }
`;
const UploadContainer = styled("div")`
  border: ${(prop) =>
    prop.isUpload ? "2px dashed #ddd" : "2px solid transparent"};
  display: block;
  float: left;
  margin: 0 10px 10px 0;
  width: ${(prop) => (prop.isUpload ? "calc(15% - 10px)" : "auto")};
  height: 120px;
  color: rgba(45, 45, 45, 0.21);
  background: transparent;
  position: relative;
  & .MuiSvgIcon-root {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
  }
  & .delete-gallery {
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    top: 0;
    right: 0;
    width: 32px;
    height: 32px;
    background-color: #fff !important;
    box-shadow: -2px 3px 5px #666;
    transform: translate(30%, -50%);
  }
  & .add-text {
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 32px;
    background-color: #fff !important;
    box-shadow: -2px 3px 5px #666;
    transform: translate(20%, -50%);
  }
  :hover .delete-gallery .MuiSvgIcon-root {
    color: #cc5a71;
  }
  :hover > .MuiSvgIcon-root {
    color: #cc5a71;
  }
  :hover .delete-gallery {
    visibility: visible;
    opacity: 1;
  }
  :hover .add-text {
    visibility: visible;
    opacity: 1;
  }

  cursor: pointer;
`;
const Rooms = (props) => {
  const {isNew, setKorpusNew, closeDialog, korpusData} = props;

  const [
    section,
    setKorpusData,
    data,
    setData,
    tarifData,
    seasonData,
    childData,
  ] = korpusData;
  console.log(data);
  if (!section) {
    return <div></div>;
  }
  const [expanded, setExpanded] = useState({});
  const [dialogGallery, setDialogGallery] = useState(false);
  const [editedGallery, setEditedGallery] = useState(null);
  console.log(section);
  const handleChangeExpanded = (panel) => (event, isExpanded) => {
    setExpanded({...expanded, [panel]: !expanded[panel]});
  };

  //   wp.media
  //     .attachment(661)
  //     .fetch()
  //     .then(function (data) {

  //       console.log(data);
  //       wp.media.attachment(661).get("url");
  //     });

  //   const ref = useRef(null);
  //   console.log(ref.current?.value);
  // useEffect(() => {
  //   const newKorpusData = section.room.map((room) => {
  //     if (
  //       room.room_info &&
  //       room.room_info !== "" &&
  //       room.room_info !== "undefined"
  //     ) {
  //       const contentHTML = convertFromHTML(room.room_info);
  //       const state = ContentState.createFromBlockArray(
  //         contentHTML.contentBlocks,
  //         contentHTML.entityMap
  //       );
  //       return {
  //         ...room,
  //         room_info: JSON.stringify(convertToRaw(state)),
  //       };
  //     } else {
  //       const editorState = EditorState.createEmpty();
  //       return {
  //         ...room,
  //         room_info: JSON.stringify(
  //           convertToRaw(editorState.getCurrentContent())
  //         ),
  //       };
  //     }
  //   });
  //   return {...section, room: newKorpusData};
  // });
  const getImageUrl = (id) => {
    return wp.media.attachment(id).get("url");
  };
  const emptyRoom = {
    room_name: "",
    room_id: uuid(),
    room_main_foto: "",
    room_gallery: [],
    key_features: [
      {
        feature: "",
      },
    ],
    room_info: "",
    adults_number: "2",
    lovest_price_room: false,
  };
  const addRoom = (id) => {
    setKorpusData({...section, room: [...section.room, emptyRoom]});
  };
  //roomName
  const setRoomName = (e, room_id) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            room_name: e.target.value,
          }
        : room
    );
    setKorpusData({...section, room: newKorpusData});
  };
  const setRoomID = (e, room_id) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            room_id: e.target.value,
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };
  let frame;
  const setMainImage = (e, id) => {
    if (frame) {
      frame.open();
      return;
    }
	console.log(new URLSearchParams(window.location.search).get('post').toString())
	const mainImagestate = wp.media.controller.Library.extend({
		defaults :  defaults({
			allowLocalEdits: true,
			displaySettings: true,
			filterable: 'all',
			displayUserSettings: true,
			
			multiple : false,
		}, wp.media.controller.Library.prototype.defaults )
	});
    frame = wp.media({
    //   multiple: false,
	// library : { type : 'image' },
	  states: [
        new mainImagestate() 
    ]
    });

    frame.on("select", function () {
      // Get media attachment details from the frame state
      const attachment = frame.state().get("selection").first().toJSON();

      setKorpusData({
        ...section,
        room: section.room.map((r) =>
          r.room_id === id
            ? {
                ...r,
                room_main_foto: attachment.id,
                // golovne_foto_url: attachment.url,
              }
            : r
        ),
      });
      //   e.target.innerHTML = `<img src="${attachment.url}" alt="" style="max-width: 100%;height: 100%;margin: 0 auto; display: block" />`;
    });

    // Finally, open the modal on click
    frame.open();
  };
  let multiFrame;
  const setGalleryImages = (e, id) => {
    if (multiFrame) {
      multiFrame.open();
      return;
    }
	const galleryImagestate = wp.media.controller.Library.extend({
		defaults :  defaults({
			allowLocalEdits: true,
			displaySettings: true,
			filterable: 'all',
			displayUserSettings: true,
			multiple : true,
		}, wp.media.controller.Library.prototype.defaults )
	});
    multiFrame = wp.media({
    //   multiple: true,

	  states: [
        new galleryImagestate() 
    ]
    });

    multiFrame.on("select", function () {
      // Get media attachment details from the frame state
      const selection = multiFrame.state().get("selection");
      const newGalleries = [];
      selection.each(function (att) {
        let attachment = att.toJSON();
        newGalleries.push({room_gallery_image: attachment.id, alt_image: ""});
      });
      setKorpusData({
        ...section,
        room: section.room.map((r) =>
          r.room_id === id
            ? {
                ...r,
                room_gallery: [
                  ...(r.room_gallery ? r.room_gallery : []),
                  ...newGalleries,
                ],
              }
            : r
        ),
      });
    });

    // Finally, open the modal on click
    multiFrame.open();
  };
  const deleteImage = (room_id) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            room_main_foto: "",
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };
  const deleteGalleryImage = (room_id, index) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            room_gallery: room.room_gallery.filter((g, i) => index !== i),
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };
  const openGalleryText = (room_id, index) => {
    const foundRoom = section.room.find((room) => room.room_id === room_id);
    setEditedGallery({
      ...foundRoom.room_gallery[index],
      room_id: room_id,
      index: index,
    });
    setDialogGallery(true);
  };
  const updateGalleryText = (e) => {
    setEditedGallery({
      ...editedGallery,
      alt_image: e.target.value,
    });
  };
  const saveGalleryText = () => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === editedGallery.room_id
        ? {
            ...room,
            room_gallery: room.room_gallery.map((ch, i) =>
              editedGallery.index === i
                ? {
                    room_gallery_image: editedGallery.room_gallery_image,
                    alt_image: editedGallery.alt_image,
                  }
                : ch
            ),
          }
        : room
    );
    setKorpusData({...section, room: newKorpusData});
    setDialogGallery(false);
  };

  //Characterics

  const setHarackterics = (e, room_id, hi) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            key_features: room.key_features.map(
              (ch, i) => (hi === i ? {feature: e.target.value} : ch)
            ),
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };

  const addHarackteric = (room_id) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            key_features: [
              ...(room.key_features
                ? room.key_features
                : []),
              {feature: ""},
            ],
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };

  const deleteHarackteric = (room_id, hi) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            key_features: room.key_features.filter(
              (ch, i) => hi !== i
            ),
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };

  // Opus

  const saveTextEditor = (data, room_id) => {
    // const markup = draftToHtml(JSON.parse(data));

    // const markup = draftToHtml(convertToRaw(data.getCurrentContent()));
    // const oldData = section.room.find((room) => room.room_id === room_id);
    // if (
    //   oldData.room_info ===
    //   JSON.stringify(convertToRaw(data.getCurrentContent()))
    // ) {
    //   console.log(oldData.room_info, markup);
    //   return;
    // }
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            room_info_raw: JSON.stringify(
              convertToRaw(data.getCurrentContent())
            ),
          }
        : room
    );
    setKorpusData({...section, room: newKorpusData});
  };
  const saveSingleKorpus = () => {
    if (isNew) {
      const newKorpusRoomsData = section.room.map((r) => {
        let maxAdult = r.adults_number;
        const createTaryfData = (maxAdult) => {
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
          const newTarifData = tarifData.map((tarif) => {
            return {...tarif, booking_period: newSeasonsData};
          });
          return {tariff: newTarifData};
        };

        return {
          ...r,
          room_info: draftToHtml(
            JSON.parse(r.room_info_raw)
          ),
          ...(r.hasOwnProperty("tariff") ? r.tariff : createTaryfData(maxAdult)),
        };
      });

      setData([...data, {...section, room: newKorpusRoomsData}]);
      setKorpusNew({
        id: uuid(),
        nazva_korpusu: "",
        zagolovok_dlya_sektsiyi_nomeriv_korpusu: "",
        room: [],
      });
      closeDialog(false);
    } else {
      const korpusAddedData = data.map((k) => {
        if (k.id === section.id) {
          const newKorpusRoomsData = section.room.map((r) => {
            let maxAdult = r.adults_number;
            const createTaryfData = (maxAdult) => {
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
              const newTarifData = tarifData.map((tarif) => {
                return {...tarif, booking_period: newSeasonsData};
              });
              return {tariff: newTarifData};
            };

            return {
              ...r,
              room_info: draftToHtml(
                JSON.parse(r.room_info_raw)
              ),
              ...(r.hasOwnProperty("tariff")
                ? r.tariff
                : createTaryfData(maxAdult)),
            };
          });
          return {...section, room: newKorpusRoomsData};
        }
        return k;
      });
      setData(korpusAddedData);
      closeDialog(false);
    }
    // initRoomsData(roomsAddedData)
  };
  const saveContent = (data) => {
    console.log(data);

    const newKorpusData = section.room.map((room, i) => {
      return {
        ...room,
        room_info: draftToHtml(JSON.parse(data)),
      };
    });
    setKorpusData({...section, room: newKorpusData});
  };
  const setRoomOpus = (opus) => {
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
  //   const memoizedOpus = useMemo(setRoomOpus, [section]);

  //adult
  const setHAdultQuantity = (e, room_id) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            adults_number: e.target.value,
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };
  //cheepest
  const setCheepest = (e, room_id) => {
    const newKorpusData = section.room.map((room) =>
      room.room_id === room_id
        ? {
            ...room,
            lovest_price_room: e.target.checked,
          }
        : room
    );

    setKorpusData({...section, room: newKorpusData});
  };
  //remove room
  const removeRoom = (room_id) => {
    const newKorpusData = section.room.filter(
      (room) => room.room_id !== room_id
    );

    setKorpusData({...section, room: newKorpusData});
  };

  const onDragEnd = ( result ) => {
	if ( result.destination === null ) {
		return;
	}
	const newItems = [ ...section.room ];
	const [ reorderedItem ] = newItems.splice( result.source.index, 1 );

	newItems.splice( result.destination.index, 0, reorderedItem );
	setKorpusData( { ...section, room: newItems } );
};
  return (
    <div>
      <Typography variant="h4" component="h2" sx={{marginBottom: "10px"}}>
        Номери
      </Typography>
	  <DragDropContext onDragEnd={ onDragEnd }>
	  <Droppable droppableId="rooms">
	  { ( provided ) => (
		<div
			{ ...provided.droppableProps }
			ref={ provided.innerRef }
		>
      {section.room.map((room, i) => (
		<Draggable
		key={ `room-${ i }` }
		draggableId={ `room-${ i }` }
		index={ i }
	>
		{ (
			provided
		) => (
        <Accordion
          expanded={expanded.hasOwnProperty(i) && expanded[i]}
          onChange={handleChangeExpanded(i)}
          sx={{borderTop: "3px solid #9c27b0", marginBottom: "10px"}}
		  ref={provided.innerRef}
		  { ...provided.draggableProps }
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-content-${i}`}
            id={`panel-header-${i}`}
            sx={{alignItems: "center"}}
			
			{ ...provided.dragHandleProps }
			

          >
            {((expanded.hasOwnProperty(i) && !expanded[i]) ||
              !expanded.hasOwnProperty(i)) && (
              <div style={{width: "50px", height: "50px", marginRight: "10px"}}>
                <img
                  src={getImageUrl(room.room_main_foto)}
                  style={{maxWidth: "50px", height: "100%"}}
                />
              </div>
            )}
            <Typography
              variant="h6"
              component="p"
              sx={{marginRight: "10px", display: "flex", alignItems: "center"}}
            >
              {room.room_name}
            </Typography>
            <Typography sx={{display: "flex", alignItems: "center"}}>
              {getMinPrice(section, room.room_id)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{marginBottom: "10px"}}>
              <FormControl sx={{marginRight: "10px"}}>
                <TextField
                  label="Назва номеру"
                  value={room.room_name}
                  onChange={(e) => setRoomName(e, room.room_id)}
                />
              </FormControl>
              <FormControl>
                <TextField
                  label="ID номеру*"
                  value={room.room_id}
                  onChange={(e) => setRoomID(e, room.room_id)}
                />
              </FormControl>
            </div>
            <div>
              <Typography variant="h5" component="h5">
                Головна картинка
              </Typography>
              <UploadContainer
                isUpload
                onClick={(e) => setMainImage(e, room.room_id)}
              >
                <UploadIcon />
              </UploadContainer>
              <UploadContainer>
                <img
                  src={getImageUrl(room.room_main_foto)}
                  style={{
                    maxWidth: "100%",
                    height: "100%",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
                <IconButton
                  color="secondary"
                  className="delete-gallery"
                  onClick={() => deleteImage(room.room_id)}
                >
                  <DeleteIcon />
                </IconButton>
              </UploadContainer>
              <div style={{clear: "both"}}></div>
            </div>
            <div>
              <Typography variant="h5" component="h5">
                Галерея номеру
              </Typography>
              <UploadContainer
                isUpload
                onClick={(e) => setGalleryImages(e, room.room_id)}
              >
                <UploadIcon />
              </UploadContainer>
              {room.room_gallery &&
                room.room_gallery.map((g, i) => (
                  <UploadContainer key={`upload-${i}`}>
                    <img
                      src={getImageUrl(g.room_gallery_image)}
                      style={{
                        maxWidth: "100%",
                        height: "100%",
                        margin: "0 auto",
                        display: "block",
                      }}
                    />
                    <IconButton
                      color="primary"
                      className="add-text"
                      onClick={() => openGalleryText(room.room_id, i)}
                    >
                      <TextFieldsIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      className="delete-gallery"
                      onClick={() => deleteGalleryImage(room.room_id, i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </UploadContainer>
                ))}
              <div style={{clear: "both"}}></div>
              <Dialog
                open={dialogGallery}
                onClose={() => setDialogGallery(false)}
                sx={{zIndex: 121999}}
              >
                <DialogTitle>Підпис до фото</DialogTitle>
                <DialogContent>
                  <div style={{marginBottom: "10px"}}>
                    <TextField
                      label="Назва"
                      value={editedGallery?.alt_image}
                      onChange={updateGalleryText}
                    />
                  </div>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => saveGalleryText()}
                  >
                    Зберегти
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <div style={{marginBottom: "10px"}}>
              <Typography variant="h5" component="h5">
                Характеристики
              </Typography>
              {room.key_features &&
                room.key_features.map((h, hi) => (
                  <CharacteFormControl key={`character-${hi}`}>
                    <TextField
                      type="text"
                      label={`Характеристика-${hi + 1}`}
                      value={h.feature}
                      onChange={(e) => setHarackterics(e, room.room_id, hi)}
                    />
                    <IconButton
                      color="secondary"
                      onClick={() => deleteHarackteric(room.room_id, hi)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CharacteFormControl>
                ))}
              <Button
                color="secondary"
                variant="contained"
                onClick={() => addHarackteric(room.room_id)}
              >
                Додати характеристику
              </Button>
            </div>
            <div
              style={{
                minHeight: "200px",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Typography variant="h5" component="h5">
                Опис тарифу
              </Typography>
              <ThemeProvider theme={myTheme}>
                <MUIRichTextEditor
                  label="Опис тарифу"
                  //   ref={refArray[i].ref}
                  //   onSave={saveContent}
                  onChange={(data) => saveTextEditor(data, room.room_id)}
                  defaultValue={room.room_info}
                />
              </ThemeProvider>
            </div>
            <div style={{marginBottom: "10px"}}>
              <FormControl>
                <TextField
                  type="number"
                  label="Кількість дорослих"
                  value={room.adults_number}
                  onChange={(e) => setHAdultQuantity(e, room.room_id)}
                />
              </FormControl>
            </div>
            <div>
              <FormControlLabel
                control={
                  <Switch
                    checked={room.lovest_price_room}
                    onChange={(e) => setCheepest(e, room.room_id)}
                  />
                }
                label="Найдешевший номер"
              />
            </div>
          </AccordionDetails>
          <AccordionActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => removeRoom(room.room_id)}
            >
              Видалити номер
            </Button>
          </AccordionActions>
        </Accordion>
		)}
		</Draggable>	
      ))}
	 { provided.placeholder }
	 </div>
	  )}
	  </Droppable>
	  </DragDropContext>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Tooltip title="Додати номер" placement="top" sx={{zIndex: 124111}}>
          <IconButtonAdd
            color="inherit"
            size="large"
            onClick={() => addRoom(section.id)}
          >
            <AddIcon />
          </IconButtonAdd>
        </Tooltip>
        <Button color="primary" variant="contained" onClick={saveSingleKorpus}>
          Зберегти
        </Button>
      </div>
    </div>
  );
};

export default memo(Rooms);
