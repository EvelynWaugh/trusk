import * as TruskReact from 'trusk-react';
import {
  Box,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  FormControl,
  Tooltip,
  Slide,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { v4 as uuid } from 'uuid';

import { useHotelStore } from '@/store/hotelStore';
import { Rooms, type RoomsRef } from '@/components/Rooms';
import {
  FormWrapper,
  IconButtonAdd,
} from '@/components/shared/StyledComponents';

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

const Transition = forwardRef(function Transition(props: any, ref: any) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const SectionsManagement: React.FC = () => {
  const { data, setData } = useHotelStore();

  // Section dialog states
  const [dialogKorpus, setDialogKorpus] = useState(false);
  const [dialogKorpusSingle, setDialogKorpusSingle] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [korpusNew, setKorpusNew] = useState({
    id: uuid(),
    section_name: '',
    section_title: '',
    rooms: [],
  });

  // Refs for Rooms components
  const newRoomsRef = useRef<RoomsRef>(null);
  const editRoomsRef = useRef<RoomsRef>(null);

  // Dialog handlers
  const openDialogKorpus = () => {
    const newSection = {
      id: uuid(),
      section_name: '',
      section_title: '',
      rooms: [],
    };
    setKorpusNew(newSection);
    // Add to store immediately as a draft
    setData([...data, newSection]);
    setDialogKorpus(true);
  };

  const closeDialogKorpus = () => {
    // Remove the draft section from store if cancelled
    const newData = data.filter(s => s.id !== korpusNew.id);
    setData(newData);
    setDialogKorpus(false);
    setKorpusNew({
      id: uuid(),
      section_name: '',
      section_title: '',
      rooms: [],
    });
  };

  const openDialogKorpusSingle = (id: string) => {
    const foundKorpus = data.find(section => section.id === id);
    if (foundKorpus) {
      setEditingSectionId(id);
      setDialogKorpusSingle(true);
    }
  };

  const closeDialogKorpusSingle = () => {
    setDialogKorpusSingle(false);
    setEditingSectionId(null);
  };

  const deleteKorpusSingle = (id: string) => {
    const newKorpusData = data.filter(section => section.id !== id);
    setData(newKorpusData);
  };

  const saveKorpusNewName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSection = { ...korpusNew, section_name: e.target.value };
    setKorpusNew(updatedSection);
    // Update in store immediately
    const newData = data.map(s => (s.id === korpusNew.id ? updatedSection : s));
    setData(newData);
  };

  const saveKorpusNewTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSection = { ...korpusNew, section_title: e.target.value };
    setKorpusNew(updatedSection);
    // Update in store immediately
    const newData = data.map(s => (s.id === korpusNew.id ? updatedSection : s));
    setData(newData);
  };

  const updateEditedKorpus = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (editingSectionId) {
      const updatedData = data.map(section =>
        section.id === editingSectionId
          ? { ...section, [e.target.name]: e.target.value }
          : section
      );
      setData(updatedData);
    }
  };

  const saveNewKorpus = () => {
    // Save editor states first
    if (newRoomsRef.current) {
      newRoomsRef.current.saveEditorStates();
    }
    // Section is already in store, just close dialog
    setDialogKorpus(false);
    setKorpusNew({
      id: uuid(),
      section_name: '',
      section_title: '',
      rooms: [],
    });
  };

  const saveEditedKorpus = () => {
    // Save editor states first
    if (editRoomsRef.current) {
      editRoomsRef.current.saveEditorStates();
    }
    // Data is already saved in store through updateEditedKorpus
    // Just close the dialog
    closeDialogKorpusSingle();
  };

  return (
    <Box>
      {/* Sections list */}
      {data.map((section, i) => (
        <FormWrapper key={`section-${i}`}>
          <FormControl>
            <TextField
              disabled
              type="text"
              label="Назва секції"
              name="section_name"
              value={section.section_name}
            />
          </FormControl>
          <FormControl>
            <TextField
              disabled
              type="text"
              label="Заголовок для секції"
              name="section_title"
              value={section.section_title || ''}
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

      {/* Add section button */}
      <Tooltip title="Добавить секцию" placement="top">
        <IconButtonAdd color="inherit" size="large" onClick={openDialogKorpus}>
          <AddIcon />
        </IconButtonAdd>
      </Tooltip>

      {/* Edit existing section dialog */}
      <Dialog
        maxWidth="xl"
        fullScreen={true}
        open={dialogKorpusSingle}
        onClose={closeDialogKorpusSingle}
        sx={{ zIndex: 119999 }}
        TransitionComponent={Transition}
        disableEnforceFocus
      >
        <DialogContent>
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
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {editingSectionId
                  ? data.find(s => s.id === editingSectionId)?.section_name
                  : ''}
              </Typography>
            </Toolbar>
          </AppBar>
          <div style={{ paddingTop: '100px' }}>
            <FormWrapper>
              <FormControl>
                <TextField
                  type="text"
                  label="Назва секції"
                  name="section_name"
                  value={
                    editingSectionId
                      ? data.find(s => s.id === editingSectionId)
                          ?.section_name || ''
                      : ''
                  }
                  onChange={updateEditedKorpus}
                />
              </FormControl>
              <FormControl>
                <TextField
                  type="text"
                  label="Заголовок для секції"
                  name="section_title"
                  value={
                    editingSectionId
                      ? data.find(s => s.id === editingSectionId)
                          ?.section_title || ''
                      : ''
                  }
                  onChange={updateEditedKorpus}
                />
              </FormControl>
            </FormWrapper>
            {editingSectionId && (
              <Rooms
                ref={editRoomsRef}
                sections={[data.find(s => s.id === editingSectionId)!]}
              />
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={saveEditedKorpus}>
                Зберегти зміни
              </Button>
            </Box>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add new section dialog */}
      <Dialog
        maxWidth="xl"
        fullScreen={true}
        open={dialogKorpus}
        onClose={closeDialogKorpus}
        sx={{ zIndex: 119999 }}
        TransitionComponent={Transition}
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
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Новая секция
              </Typography>
            </Toolbar>
          </AppBar>

          <FormWrapper style={{ paddingTop: '100px' }}>
            <FormControl>
              <TextField
                type="text"
                label="Назва секції"
                name="section_name"
                value={korpusNew.section_name}
                onChange={saveKorpusNewName}
              />
            </FormControl>
            <FormControl>
              <TextField
                type="text"
                label="Заголовок для секції"
                name="section_title"
                value={korpusNew.section_title}
                onChange={saveKorpusNewTitle}
              />
            </FormControl>
          </FormWrapper>
          {data.find(s => s.id === korpusNew.id) && (
            <Rooms
              ref={newRoomsRef}
              sections={[data.find(s => s.id === korpusNew.id)!]}
            />
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={saveNewKorpus}>
              Додати корпус
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
