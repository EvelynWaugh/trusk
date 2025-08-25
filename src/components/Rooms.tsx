import * as TruskReact from 'trusk-react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  TextField,
  IconButton,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
  TextFields as TextFieldsIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { v4 as uuid } from 'uuid';
import { Editor } from 'react-draft-wysiwyg';
import { convertToRaw, EditorState, ContentState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// Add custom CSS for better editor container handling
const editorContainerStyle = `
  .rdw-editor-main { 
    overflow-y: auto !important; 
    max-height: 150px !important; 
	height: 150px !important;
  }
  .rdw-editor-toolbar { 
    margin-bottom: 0 !important; 
    border-bottom: 1px solid #ccc !important;
    flex-wrap: wrap !important;
  }
  .rdw-option-wrapper {
    border: 1px solid #f1f1f1 !important;
    margin: 0 2px !important;
    border-radius: 2px !important;
  }
  .rdw-dropdown-wrapper {
    border: 1px solid #f1f1f1 !important;
    border-radius: 2px !important;
    margin: 0 2px !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = editorContainerStyle;
  document.head.appendChild(styleElement);
}

import type { Room, Section } from '@/types';
import { useHotelStore } from '@/store/hotelStore';
import { DragDropProvider, SortableItem } from '@/components/shared/DragDrop';
import {
  IconButtonAdd,
  CharacteFormControl,
  UploadContainer,
} from '@/components/shared/StyledComponents';
import { getMinPrice } from '@/utils/index';

const theme = createTheme({});

interface RoomsProps {
  sections: Section[];
}

export interface RoomsRef {
  saveEditorStates: () => void;
}

const React = TruskReact;
const {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} = TruskReact;

// Helper function to convert HTML to EditorState
const htmlToEditorState = (html: string): EditorState => {
  if (!html) {
    return EditorState.createEmpty();
  }
  const contentBlock = htmlToDraft(html);
  if (contentBlock) {
    const contentState = ContentState.createFromBlockArray(
      contentBlock.contentBlocks
    );
    return EditorState.createWithContent(contentState);
  }
  return EditorState.createEmpty();
};

// WordPress media types are already declared elsewhere, skip duplicate declaration

export const Rooms = forwardRef<RoomsRef, RoomsProps>(({ sections }, ref) => {
  const { data, setData } = useHotelStore();

  // Get the first section (since this component works with single section in dialog context)
  const section = sections[0];

  // Use the section from the current data state, not from props
  const currentSection = data.find(s => s.id === section?.id) || section;

  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [dialogGallery, setDialogGallery] = useState(false);
  const [editedGallery, setEditedGallery] = useState<any>(null);
  const [editorStates, setEditorStates] = useState<{
    [key: string]: EditorState;
  }>({});

  // Initialize editor states for each room
  useEffect(() => {
    if (currentSection?.rooms) {
      const newEditorStates: { [key: string]: EditorState } = {};
      currentSection.rooms.forEach(room => {
        if (!editorStates[room.room_id]) {
          newEditorStates[room.room_id] = htmlToEditorState(
            room.room_info || ''
          );
        }
      });
      if (Object.keys(newEditorStates).length > 0) {
        setEditorStates((prev: { [key: string]: EditorState }) => ({
          ...prev,
          ...newEditorStates,
        }));
      }
    }
  }, [currentSection?.rooms?.length]);

  if (!currentSection) {
    return <div></div>;
  }

  const updateSection = (updatedSection: Section) => {
    console.log(
      'Updating section:',
      updatedSection.section_name,
      'with rooms:',
      updatedSection.rooms.length
    );
    const newData = data.map(s =>
      s.id === currentSection.id ? updatedSection : s
    );
    console.log('New data structure:', newData);
    setData(newData);
  };

  const handleChangeExpanded =
    (room_id: string) => (_event: any, isExpanded: boolean) => {
      setExpanded({ ...expanded, [room_id]: isExpanded });
    };

  const getImageUrl = (id: number) => {
    if (!id || !window.wp?.media) return '';
    try {
      return (window.wp.media as any).attachment(id).get('url');
    } catch (error) {
      return '';
    }
  };

  const emptyRoom: Room = {
    room_name: '',
    room_id: uuid(),
    room_main_foto: 0,
    room_gallery: [],
    key_features: [
      {
        feature: '',
      },
    ],
    room_info: '',
    adults_number: '2',
    lovest_price_room: false,
    tariff: [],
  };

  const addRoom = () => {
    const updatedSection = {
      ...currentSection,
      rooms: [...(currentSection.rooms || []), emptyRoom],
    };
    updateSection(updatedSection);
  };

  const setRoomName = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    room_id: string
  ) => {
    const newRooms = currentSection.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            room_name: e.target.value,
          }
        : room
    );
    updateSection({ ...currentSection, rooms: newRooms });
  };

  const setRoomID = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    room_id: string
  ) => {
    const newRooms = currentSection.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            room_id: e.target.value,
          }
        : room
    );
    updateSection({ ...currentSection, rooms: newRooms });
  };

  const setMainImage = (room_id: string) => {
    if (!window.wp?.media) return;

    try {
      const frame = (window.wp.media as any)({
        multiple: false,
        library: { type: 'image' },
      });

      frame.on('select', function () {
        const attachment = frame.state().get('selection').first().toJSON();

        const newRooms = currentSection.rooms.map(r =>
          r.room_id === room_id
            ? {
                ...r,
                room_main_foto: attachment.id,
              }
            : r
        );
        updateSection({ ...currentSection, rooms: newRooms });
      });

      frame.open();
    } catch (error) {
      console.error('Error opening media frame:', error);
    }
  };

  const setGalleryImages = (room_id: string) => {
    if (!window.wp?.media) return;

    try {
      const multiFrame = (window.wp.media as any)({
        multiple: true,
        library: { type: 'image' },
      });

      multiFrame.on('select', function () {
        const selection = multiFrame.state().get('selection');
        const newGalleries: any[] = [];

        selection.each(function (att: any) {
          const attachment = att.toJSON();
          newGalleries.push({
            room_gallery_image: attachment.id,
            alt_image: '',
          });
        });

        const newRooms = currentSection.rooms.map(r =>
          r.room_id === room_id
            ? {
                ...r,
                room_gallery: [
                  ...(r.room_gallery ? r.room_gallery : []),
                  ...newGalleries,
                ],
              }
            : r
        );
        updateSection({ ...currentSection, rooms: newRooms });
      });

      multiFrame.open();
    } catch (error) {
      console.error('Error opening gallery media frame:', error);
    }
  };

  const deleteImage = (room_id: string) => {
    const newRooms = section.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            room_main_foto: 0,
          }
        : room
    );
    updateSection({ ...section, rooms: newRooms });
  };

  const deleteGalleryImage = (room_id: string, index: number) => {
    const newRooms = section.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            room_gallery: room.room_gallery.filter((_g, i) => index !== i),
          }
        : room
    );
    updateSection({ ...section, rooms: newRooms });
  };

  const openGalleryText = (room_id: string, index: number) => {
    const foundRoom = section.rooms.find(room => room.room_id === room_id);
    if (foundRoom) {
      setEditedGallery({
        ...foundRoom.room_gallery[index],
        room_id: room_id,
        index: index,
      });
      setDialogGallery(true);
    }
  };

  const updateGalleryText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedGallery({
      ...editedGallery,
      alt_image: e.target.value,
    });
  };

  const saveGalleryText = () => {
    const newRooms = section.rooms.map(room =>
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
    updateSection({ ...section, rooms: newRooms });
    setDialogGallery(false);
  };

  const setCharacteristics = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    room_id: string,
    hi: number
  ) => {
    const newRooms = section.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            key_features: room.key_features.map((ch, i) =>
              hi === i ? { feature: e.target.value } : ch
            ),
          }
        : room
    );
    updateSection({ ...section, rooms: newRooms });
  };

  const addCharacteristic = (room_id: string) => {
    const newRooms = section.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            key_features: [
              ...(room.key_features ? room.key_features : []),
              { feature: '' },
            ],
          }
        : room
    );
    updateSection({ ...section, rooms: newRooms });
  };

  const deleteCharacteristic = (room_id: string, hi: number) => {
    const newRooms = section.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            key_features: room.key_features.filter((_ch, i) => hi !== i),
          }
        : room
    );
    updateSection({ ...section, rooms: newRooms });
  };

  // Simple editor change handler - only update local state
  const handleEditorChange = useCallback(
    (editorState: any, room_id: string) => {
      // Update local state immediately for UI responsiveness
      setEditorStates((prev: { [key: string]: EditorState }) => ({
        ...prev,
        [room_id]: editorState,
      }));
    },
    []
  );

  // Function to save all editor states to the store
  const saveAllEditorStates = useCallback(() => {
    const newRooms = section.rooms.map(room => {
      const editorState = editorStates[room.room_id];
      if (editorState) {
        return {
          ...room,
          room_info: stateToHTML(editorState.getCurrentContent()),
        };
      }
      return room;
    });
    updateSection({ ...section, rooms: newRooms });
  }, [section.rooms, editorStates, updateSection]);

  // Expose save function to parent component
  useImperativeHandle(
    ref,
    () => ({
      saveEditorStates: saveAllEditorStates,
    }),
    [saveAllEditorStates]
  );

  // Memoized editor configuration with more options
  const editorConfig = useMemo(
    () => ({
      toolbar: {
        options: [
          'inline',
          'blockType',
          'fontSize',
          'list',
          'textAlign',
          'colorPicker',
          'link',
          'remove',
          'history',
        ],
        inline: {
          options: ['bold', 'italic', 'underline', 'strikethrough'],
        },
        blockType: {
          inDropdown: true,
          options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
          className: undefined,
          component: undefined,
          dropdownClassName: undefined,
        },
        fontSize: {
          options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
          className: undefined,
          component: undefined,
          dropdownClassName: undefined,
        },
        list: {
          inDropdown: false,
          options: ['unordered', 'ordered', 'indent', 'outdent'],
        },
        textAlign: {
          inDropdown: false,
          options: ['left', 'center', 'right', 'justify'],
        },
        colorPicker: {
          colors: [
            'rgb(97,189,109)',
            'rgb(26,188,156)',
            'rgb(84,172,210)',
            'rgb(44,130,201)',
            'rgb(147,101,184)',
            'rgb(71,85,119)',
            'rgb(204,204,204)',
            'rgb(65,168,95)',
            'rgb(0,168,133)',
            'rgb(61,142,185)',
            'rgb(41,105,176)',
            'rgb(85,57,130)',
            'rgb(40,50,78)',
            'rgb(0,0,0)',
            'rgb(247,218,100)',
            'rgb(251,160,38)',
            'rgb(235,107,86)',
            'rgb(226,80,65)',
            'rgb(163,143,132)',
            'rgb(239,239,239)',
            'rgb(255,255,255)',
          ],
        },
        link: {
          inDropdown: false,
          showOpenOptionOnHover: true,
          defaultTargetOption: '_self',
          options: ['link', 'unlink'],
        },
        remove: { className: undefined, component: undefined },
        history: {
          inDropdown: false,
          options: ['undo', 'redo'],
        },
      },
      editorStyle: {
        padding: '8px',
        minHeight: '80px',
        maxHeight: '200px',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      toolbarStyle: {
        border: 'none',
        borderBottom: '1px solid #ccc',
        marginBottom: '0',
        flexWrap: 'wrap',
      },
    }),
    []
  );

  const setAdultQuantity = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    room_id: string
  ) => {
    const newRooms = section.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            adults_number: e.target.value,
          }
        : room
    );
    updateSection({ ...section, rooms: newRooms });
  };

  const setCheapest = (
    e: React.ChangeEvent<HTMLInputElement>,
    room_id: string
  ) => {
    const newRooms = section.rooms.map(room =>
      room.room_id === room_id
        ? {
            ...room,
            lovest_price_room: e.target.checked,
          }
        : room
    );
    updateSection({ ...section, rooms: newRooms });
  };

  const removeRoom = (room_id: string) => {
    const newRooms = section.rooms.filter(room => room.room_id !== room_id);
    updateSection({ ...section, rooms: newRooms });
  };

  // Remove onDragEnd function since we're not using the old implementation

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Typography variant="h4" component="h2" sx={{ marginBottom: '10px' }}>
          Номера
        </Typography>

        <DragDropProvider
          items={currentSection.rooms.map(room => ({
            ...room,
            id: room.room_id,
          }))}
          onDragEnd={event => {
            const { active, over } = event;
            console.log('Drag end event:', {
              active: active.id,
              over: over?.id,
            });

            if (over && active.id !== over.id) {
              const oldIndex = currentSection.rooms.findIndex(
                room => room.room_id === active.id
              );
              const newIndex = currentSection.rooms.findIndex(
                room => room.room_id === over.id
              );

              console.log('Drag indices:', { oldIndex, newIndex });

              if (oldIndex !== -1 && newIndex !== -1) {
                const newRooms = [...currentSection.rooms];
                const [reorderedItem] = newRooms.splice(oldIndex, 1);
                newRooms.splice(newIndex, 0, reorderedItem);

                console.log(
                  'New rooms order:',
                  newRooms.map(r => r.room_name)
                );

                const updatedSection = { ...currentSection, rooms: newRooms };
                updateSection(updatedSection);

                console.log('Section updated in store');
              }
            }
          }}
        >
          {currentSection.rooms?.map((room, i) => (
            <SortableItem key={`${room.room_id}-${i}`} id={room.room_id}>
              {(dragHandleProps: any) => (
                <Accordion
                  expanded={
                    expanded.hasOwnProperty(room.room_id) &&
                    expanded[room.room_id]
                  }
                  onChange={handleChangeExpanded(room.room_id)}
                  sx={{
                    borderTop: '3px solid #9c27b0',
                    marginBottom: '10px',
                    position: 'relative',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-content-${i}`}
                    id={`panel-header-${i}`}
                    sx={{ alignItems: 'center', position: 'relative' }}
                  >
                    {/* Drag Handle */}
                    <div
                      {...dragHandleProps}
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'grab',
                        padding: '4px',
                        color: '#666',
                        zIndex: 10,
                      }}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <DragIcon />
                    </div>

                    <div
                      style={{
                        marginLeft: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      {((expanded.hasOwnProperty(room.room_id) &&
                        !expanded[room.room_id]) ||
                        !expanded.hasOwnProperty(room.room_id)) && (
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            marginRight: '10px',
                          }}
                        >
                          {room.room_main_foto > 0 && (
                            <img
                              src={getImageUrl(room.room_main_foto)}
                              style={{ maxWidth: '50px', height: '100%' }}
                              alt={room.room_name}
                            />
                          )}
                        </div>
                      )}
                      <Typography
                        variant="h6"
                        component="p"
                        sx={{
                          marginRight: '10px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {room.room_name || 'Новый номер'}
                      </Typography>
                      <Typography
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        {getMinPrice(room)} грн
                      </Typography>
                    </div>
                  </AccordionSummary>

                  <AccordionDetails>
                    <div style={{ marginBottom: '10px' }}>
                      <FormControl sx={{ marginRight: '10px' }}>
                        <TextField
                          label="Назва номеру"
                          value={room.room_name}
                          onChange={e => setRoomName(e, room.room_id)}
                        />
                      </FormControl>
                      <FormControl>
                        <TextField
                          label="ID номеру*"
                          value={room.room_id}
                          onChange={e => setRoomID(e, room.room_id)}
                        />
                      </FormControl>
                    </div>

                    <div>
                      <Typography variant="h5" component="h5">
                        Головна картинка
                      </Typography>
                      <UploadContainer
                        isUpload
                        onClick={() => setMainImage(room.room_id)}
                      >
                        <UploadIcon />
                      </UploadContainer>
                      {room.room_main_foto > 0 && (
                        <UploadContainer isUpload={false}>
                          <img
                            src={getImageUrl(room.room_main_foto)}
                            style={{
                              maxWidth: '100%',
                              height: '100%',
                              margin: '0 auto',
                              display: 'block',
                            }}
                            alt={room.room_name}
                          />
                          <IconButton
                            color="secondary"
                            className="delete-gallery"
                            onClick={() => deleteImage(room.room_id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </UploadContainer>
                      )}
                      <div style={{ clear: 'both' }}></div>
                    </div>

                    <div>
                      <Typography variant="h5" component="h5">
                        Галерея номеру
                      </Typography>
                      <UploadContainer
                        isUpload
                        onClick={() => setGalleryImages(room.room_id)}
                      >
                        <UploadIcon />
                      </UploadContainer>
                      {room.room_gallery &&
                        room.room_gallery.map((g, i) => (
                          <UploadContainer key={`upload-${i}`} isUpload={false}>
                            <img
                              src={getImageUrl(g.room_gallery_image)}
                              style={{
                                maxWidth: '100%',
                                height: '100%',
                                margin: '0 auto',
                                display: 'block',
                              }}
                              alt={g.alt_image}
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
                              onClick={() =>
                                deleteGalleryImage(room.room_id, i)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </UploadContainer>
                        ))}
                      <div style={{ clear: 'both' }}></div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
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
                              onChange={e =>
                                setCharacteristics(e, room.room_id, hi)
                              }
                            />
                            <IconButton
                              color="secondary"
                              onClick={() =>
                                deleteCharacteristic(room.room_id, hi)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CharacteFormControl>
                        ))}
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => addCharacteristic(room.room_id)}
                      >
                        Додати характеристику
                      </Button>
                    </div>

                    <div
                      style={{
                        marginBottom: '20px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      <Typography variant="h5" component="h5">
                        Опис номеру
                      </Typography>
                      <div
                        style={{
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          minHeight: '120px',
                          maxHeight: '300px',
                          overflow: 'hidden',
                        }}
                      >
                        <Editor
                          editorState={
                            editorStates[room.room_id] ||
                            (htmlToEditorState(room.room_info || '') as any)
                          }
                          onEditorStateChange={editorState =>
                            handleEditorChange(editorState, room.room_id)
                          }
                          toolbar={editorConfig.toolbar}
                          editorStyle={editorConfig.editorStyle}
                          toolbarStyle={editorConfig.toolbarStyle}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <FormControl>
                        <TextField
                          type="number"
                          label="Количество взрослых"
                          value={room.adults_number}
                          onChange={e => setAdultQuantity(e, room.room_id)}
                        />
                      </FormControl>
                    </div>

                    <div>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={room.lovest_price_room}
                            onChange={e => setCheapest(e, room.room_id)}
                          />
                        }
                        label="Самый дешевый номер"
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
            </SortableItem>
          ))}
        </DragDropProvider>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Tooltip title="Добавить номер" placement="top">
            <IconButtonAdd color="inherit" size="large" onClick={addRoom}>
              <AddIcon />
            </IconButtonAdd>
          </Tooltip>
        </div>

        <Dialog
          open={dialogGallery}
          onClose={() => setDialogGallery(false)}
          sx={{ zIndex: 121999 }}
        >
          <DialogTitle>Підпис до фото</DialogTitle>
          <DialogContent>
            <div style={{ marginBottom: '10px' }}>
              <TextField
                label="Назва"
                value={editedGallery?.alt_image || ''}
                onChange={updateGalleryText}
              />
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={saveGalleryText}
            >
              Зберегти
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
});
