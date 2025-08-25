import * as TruskReact from 'trusk-react';

import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  TextField,
  FormControl,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
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

// Inject styles (only once)
if (
  typeof document !== 'undefined' &&
  !document.querySelector('#tariff-editor-styles')
) {
  const styleElement = document.createElement('style');
  styleElement.id = 'tariff-editor-styles';
  styleElement.innerHTML = editorContainerStyle;
  document.head.appendChild(styleElement);
}

import type { Tariff } from '@/types';
import { useHotelStore } from '@/store/hotelStore';
import {
  FormWrapper,
  FormWrapperVertical,
  IconButtonAdd,
  BoxTypo,
  TariffsContainer,
} from '@/components/shared/StyledComponents';
import { set } from 'lodash';
import { se } from 'date-fns/locale';

const React = TruskReact;
const {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
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

export const TariffsManagement: React.FC = () => {
  const {
    tarifData,
    setTarifData,
    data,
    setData,
    seasonData,
    childData,
    setChildData,
    dialogTaryf,
    openDialogTaryf,
    closeDialogTaryf,
    dialogTaryfSingle,
    openDialogTaryfSingle,
    closeDialogTaryfSingle,
    dialogChild,
    openDialogChild,
    closeDialogChild,
    dialogChildSingle,
    openDialogChildSingle,
    closeDialogChildSingle,
    childNew,
    resetChildNew,
    editedChild,
  } = useHotelStore();

  const [tarifNew, setTarifNew] = useState<Tariff>({
    id: uuid(),
    tariff_name: '',
    tariff_description: '',

    lovest_price_tariff: false,
    booking_period: [],
  });

  const [editedTaryf, setEditedTaryf] = useState<Tariff | null>(null);

  const [newTariffEditorState, setNewTariffEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const [editTariffEditorState, setEditTariffEditorState] =
    useState<EditorState>(EditorState.createEmpty());

  // Initialize editor states when dialogs open
  useEffect(() => {
    if (dialogTaryf) {
      setNewTariffEditorState(
        htmlToEditorState(tarifNew.tariff_description || '')
      );
    }
  }, [dialogTaryf]);

  useEffect(() => {
    if (dialogTaryfSingle && editedTaryf) {
      setEditTariffEditorState(
        htmlToEditorState(editedTaryf.tariff_description || '')
      );
    }
  }, [dialogTaryfSingle, editedTaryf]);

  const saveNewTariff = () => {
    // Add tariff to all rooms
    const newData = data.map(section => {
      const newRoomData = section.rooms.map(room => {
        const maxAdult = parseInt(room.adults_number) || 1;

        const newSeasonsData = seasonData.map(season => ({
          ...season,
          price_for_adult: Array.from({ length: maxAdult }, (_, k) => k).reduce(
            (prev, curr) => {
              prev[`${curr + 1}-adult`] = '';
              return prev;
            },
            {} as Record<string, string>
          ),
          dodatkove_mistse: '',
          ...childData,
        }));

        return {
          ...room,
          tariff: [
            ...room.tariff,
            {
              ...tarifNew,
              booking_period: newSeasonsData,
            },
          ],
        };
      });
      return { ...section, rooms: newRoomData };
    });

    setData(newData);
    setTarifData([...tarifData, tarifNew]);

    // Reset form
    setTarifNew({
      id: uuid(),
      tariff_name: '',
      tariff_description: '',

      lovest_price_tariff: false,
      booking_period: [],
    });

    closeDialogTaryf();
  };

  const openEditDialog = (id: string) => {
    const foundTariff = tarifData.find(tariff => tariff.id === id);
    if (foundTariff) {
      setEditedTaryf(foundTariff);
      openDialogTaryfSingle(id);
    }
  };

  const saveSingleTariff = (id: string) => {
    if (!editedTaryf) return;

    const newTarifData = tarifData.map(tariff =>
      tariff.id === id ? editedTaryf : tariff
    );
    setTarifData(newTarifData);

    // Update in all rooms
    const newData = data.map(section => {
      const newRoomData = section.rooms.map(room => {
        const newTariffs = room.tariff.map(tariff =>
          tariff.id === id ? editedTaryf : tariff
        );
        return { ...room, tariff: newTariffs };
      });
      return { ...section, rooms: newRoomData };
    });

    setData(newData);
    closeDialogTaryfSingle(id);
    setEditedTaryf(null);
  };

  const deleteTariff = (id: string) => {
    if (window.confirm('Удалить тариф?')) {
      const newTarifData = tarifData.filter(t => t.id !== id);
      setTarifData(newTarifData);

      const newData = data.map(section => {
        const modifiedRooms = section.rooms.map(room => {
          const filteredTariffs = room.tariff.filter(t => t.id !== id);
          return { ...room, tariff: filteredTariffs };
        });
        return { ...section, rooms: modifiedRooms };
      });

      setData(newData);
    }
  };

  // Child tariff management functions
  const saveNewChild = () => {
    const childKey = `price_for_child_${Object.keys(childData).length + 1}`;
    const newChildItem = {
      kids_tarriff_name: childNew.new_child?.kids_tarriff_name || '',
      kids_tarriff_price: '-',
    };
    const newChildData = {
      ...childData,
      [childKey]: newChildItem,
    };

    setChildData(newChildData);

    // Update all booking periods in all rooms with new child data
    const newData = data.map(section => {
      const newRoomData = section.rooms.map(room => {
        const newTariffs = room.tariff.map(tariff => ({
          ...tariff,
          booking_period: tariff.booking_period.map(period => ({
            ...period,
            price_for_child: [
              ...period.price_for_child,
              {
                kids_tarriff_name: newChildItem.kids_tarriff_name,
                kids_tarriff_price: newChildItem.kids_tarriff_price,
              },
            ],
          })),
        }));
        return { ...room, tariff: newTariffs };
      });
      return { ...section, rooms: newRoomData };
    });

    setData(newData);
    resetChildNew();
    closeDialogChild();
  };

  const saveChildNewField = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the childNew state in the store
    useHotelStore.setState({
      childNew: {
        new_child: {
          kids_tarriff_name: e.target.value,
          kids_tarriff_price: '-',
        },
      },
    });
  };

  const setChildSingle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedChild && Object.keys(editedChild).length > 0) {
      const childKey = Object.keys(editedChild)[0];
      useHotelStore.setState(state => ({
        editedChild: {
          [childKey]: {
            kids_tarriff_name: e.target.value,
            kids_tarriff_price:
              state.editedChild[childKey]?.kids_tarriff_price || '-',
          },
        },
      }));
    }
  };

  const saveSingleChild = () => {
    if (editedChild && Object.keys(editedChild).length > 0) {
      const childKey = Object.keys(editedChild)[0];
      const newChildData = {
        ...childData,
        [childKey]: editedChild[childKey],
      };

      setChildData(newChildData);

      // Update all booking periods in all rooms with updated child data
      const newData = data.map(section => {
        const newRoomData = section.rooms.map(room => {
          const newTariffs = room.tariff.map(tariff => ({
            ...tariff,
            booking_period: tariff.booking_period.map(period => ({
              ...period,
              price_for_child: period.price_for_child.map((child, index) => {
                // Update the specific child tariff based on its index or key
                const childIndex = Object.keys(childData).indexOf(childKey);
                if (index === childIndex) {
                  return {
                    kids_tarriff_name: editedChild[childKey].kids_tarriff_name,
                    kids_tarriff_price:
                      editedChild[childKey].kids_tarriff_price || '-',
                  };
                }
                return child;
              }),
            })),
          }));
          return { ...room, tariff: newTariffs };
        });
        return { ...section, rooms: newRoomData };
      });

      setData(newData);
      closeDialogChildSingle(childKey);
    }
  };

  const deleteSingleChild = (childKey: string) => {
    if (window.confirm('Удалить детский тариф?')) {
      const newChildData = { ...childData };
      delete newChildData[childKey];

      setChildData(newChildData);

      // Update all booking periods in all rooms by removing this child data
      const newData = data.map(section => {
        const newRoomData = section.rooms.map(room => {
          const newTariffs = room.tariff.map(tariff => ({
            ...tariff,
            booking_period: tariff.booking_period.map(period => ({
              ...period,
              price_for_child: period.price_for_child.filter((_, index) => {
                const childIndex = Object.keys(childData).indexOf(childKey);
                return index !== childIndex;
              }),
            })),
          }));
          return { ...room, tariff: newTariffs };
        });
        return { ...section, rooms: newRoomData };
      });

      setData(newData);
    }
  };

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
        maxHeight: '150px',
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

  // Debounced save timeout refs
  const newTariffTimeoutRef = useRef<number | null>(null);
  const editTariffTimeoutRef = useRef<number | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (newTariffTimeoutRef.current) {
        clearTimeout(newTariffTimeoutRef.current);
      }
      if (editTariffTimeoutRef.current) {
        clearTimeout(editTariffTimeoutRef.current);
      }
    };
  }, []);

  // Debounced editor change handlers with proper memoization
  const handleNewTariffEditorChange = useCallback((editorState: any) => {
    // Update local state immediately for UI responsiveness
    setNewTariffEditorState(editorState);

    // Clear existing timeout
    if (newTariffTimeoutRef.current) {
      clearTimeout(newTariffTimeoutRef.current);
    }

    // Set new timeout for debounced save
    newTariffTimeoutRef.current = window.setTimeout(() => {
      try {
        const contentState = editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        const htmlContent = stateToHTML(contentState);

        setTarifNew((prev: Tariff) => ({
          ...prev,
          tariff_description: htmlContent,
        }));
      } catch (error) {
        console.error('Error converting rich text:', error);
      }
    }, 500);
  }, []); // Empty dependency array to prevent recreation

  const handleEditTariffEditorChange = useCallback((editorState: any) => {
    // Update local state immediately for UI responsiveness
    setEditTariffEditorState(editorState);

    // Clear existing timeout
    if (editTariffTimeoutRef.current) {
      clearTimeout(editTariffTimeoutRef.current);
    }

    // Set new timeout for debounced save
    editTariffTimeoutRef.current = window.setTimeout(() => {
      try {
        const contentState = editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        const htmlContent = stateToHTML(contentState);

        setEditedTaryf((prev: Tariff | null) =>
          prev
            ? {
                ...prev,
                tariff_description: htmlContent,
              }
            : null
        );
      } catch (error) {
        console.error('Error converting rich text:', error);
      }
    }, 500);
  }, []); // Empty dependency array to prevent recreation

  return (
    <TariffsContainer>
      <Box>
        {tarifData?.map((tariff, index) => (
          <FormWrapper key={`tariff-${index}`}>
            <FormControl>
              <TextField
                disabled
                type="text"
                label="Назва"
                value={tariff.tariff_name}
              />
            </FormControl>

            {tariff.lovest_price_tariff && <span>(Краща ціна)</span>}

            <FormControl>
              <IconButton
                color="primary"
                onClick={() => openEditDialog(tariff.id)}
              >
                <EditIcon />
              </IconButton>
            </FormControl>

            <FormControl>
              <IconButton color="error" onClick={() => deleteTariff(tariff.id)}>
                <DeleteIcon />
              </IconButton>
            </FormControl>
          </FormWrapper>
        ))}

        {/* Add New Tariff Button */}
        <Tooltip title="Добавить тариф" placement="top">
          <IconButtonAdd color="inherit" size="large" onClick={openDialogTaryf}>
            <AddIcon />
          </IconButtonAdd>
        </Tooltip>

        {/* Add New Tariff Dialog */}
        <Dialog
          open={dialogTaryf}
          onClose={closeDialogTaryf}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <FormWrapperVertical>
              <FormControl fullWidth>
                <TextField
                  label="Назва тарифу"
                  value={tarifNew.tariff_name}
                  onChange={e =>
                    setTarifNew({ ...tarifNew, tariff_name: e.target.value })
                  }
                />
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={tarifNew.lovest_price_tariff}
                    onChange={e =>
                      setTarifNew({
                        ...tarifNew,
                        lovest_price_tariff: e.target.checked,
                      })
                    }
                  />
                }
                label="Краща ціна"
              />

              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Опис тарифу
                </Typography>
                <div
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minHeight: '120px',
                    maxHeight: '250px',
                    overflow: 'hidden',
                  }}
                >
                  <Editor
                    editorState={newTariffEditorState}
                    onEditorStateChange={handleNewTariffEditorChange}
                    toolbar={editorConfig.toolbar}
                    editorStyle={editorConfig.editorStyle}
                    toolbarStyle={editorConfig.toolbarStyle}
                  />
                </div>
              </Box>

              <Button
                color="primary"
                variant="contained"
                onClick={saveNewTariff}
                sx={{ mt: 2 }}
              >
                Зберегти
              </Button>
            </FormWrapperVertical>
          </DialogContent>
        </Dialog>

        {/* Edit Tariff Dialog */}
        {Object.keys(dialogTaryfSingle).map(tariffId => (
          <Dialog
            key={tariffId}
            open={dialogTaryfSingle[tariffId] || false}
            onClose={() => closeDialogTaryfSingle(tariffId)}
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              {editedTaryf && (
                <FormWrapperVertical>
                  <FormControl fullWidth>
                    <TextField
                      label="Назва тарифу"
                      value={editedTaryf.tariff_name}
                      onChange={e =>
                        setEditedTaryf({
                          ...editedTaryf,
                          tariff_name: e.target.value,
                        })
                      }
                    />
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editedTaryf.lovest_price_tariff}
                        onChange={e =>
                          setEditedTaryf({
                            ...editedTaryf,
                            lovest_price_tariff: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Краща ціна"
                  />

                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Опис тарифу
                    </Typography>
                    <div
                      style={{
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        minHeight: '120px',
                        maxHeight: '250px',
                        overflow: 'hidden',
                      }}
                    >
                      <Editor
                        editorState={editTariffEditorState}
                        onEditorStateChange={handleEditTariffEditorChange}
                        toolbar={editorConfig.toolbar}
                        editorStyle={editorConfig.editorStyle}
                        toolbarStyle={editorConfig.toolbarStyle}
                      />
                    </div>
                  </Box>

                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => saveSingleTariff(editedTaryf.id)}
                    sx={{ mt: 2 }}
                  >
                    Зберегти
                  </Button>
                </FormWrapperVertical>
              )}
            </DialogContent>
          </Dialog>
        ))}
      </Box>
      <Box>
        {Object.entries(childData)?.map(([childKey, childValue], i) => (
          <FormWrapper key={`korpus-${i}`}>
            <FormControl>
              <TextField
                disabled
                type="text"
                label="Назва"
                name={childKey}
                value={childValue.kids_tarriff_name}
              />
            </FormControl>

            <FormControl>
              <IconButton
                color="primary"
                onClick={() => {
                  useHotelStore.setState({
                    editedChild: { [childKey]: childValue },
                  });
                  openDialogChildSingle(childKey);
                }}
              >
                <EditIcon />
              </IconButton>
            </FormControl>
            {i > 0 && (
              <FormControl>
                <IconButton
                  color="secondary"
                  onClick={() => deleteSingleChild(childKey)}
                >
                  <DeleteIcon />
                </IconButton>
              </FormControl>
            )}
          </FormWrapper>
        ))}
        {Object.keys(dialogChildSingle).map(childKey => (
          <Dialog
            key={childKey}
            open={dialogChildSingle[childKey] || false}
            onClose={() => closeDialogChildSingle(childKey)}
          >
            <DialogContent>
              <FormWrapperVertical>
                <FormControl>
                  <TextField
                    type="text"
                    label="Назва"
                    name="name_child_new"
                    value={
                      editedChild && editedChild[childKey]
                        ? editedChild[childKey].kids_tarriff_name
                        : ''
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
        ))}
        <Tooltip title="Додати дитячі місця" placement="top">
          <IconButtonAdd color="inherit" size="large" onClick={openDialogChild}>
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
                  name="name_child_new"
                  value={childNew.new_child?.kids_tarriff_name || ''}
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
      </Box>
    </TariffsContainer>
  );
};
