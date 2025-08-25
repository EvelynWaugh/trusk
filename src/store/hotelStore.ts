import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Section,
  Tariff,
  BookingPeriod,
  ChildTariff,
  DialogState,
} from '@/types';
const { get, omitDeep, pickBy, startsWith } = lodash;

interface HotelState {
  // Main data
  data: Section[];
  tarifData: Tariff[];
  seasonData: BookingPeriod[];
  childData: ChildTariff;

  // UI state
  tab: number;
  renderedTaryf: number;

  // Dialog states
  dialogTaryf: boolean;
  dialogTaryfSingle: DialogState;
  dialogChild: boolean;
  dialogChildSingle: DialogState;
  dialogSeason: boolean;
  dialogSeasonSingle: DialogState;

  // Edited items
  editedTaryf: Tariff | null;
  editedSeason: BookingPeriod | null;
  editedChild: ChildTariff;

  // New items
  tarifNew: Tariff;
  seasonNew: BookingPeriod;
  childNew: ChildTariff;

  // Actions
  setData: (data: Section[]) => void;
  setTarifData: (data: Tariff[]) => void;
  setSeasonData: (data: BookingPeriod[]) => void;
  setChildData: (data: ChildTariff) => void;
  setTab: (tab: number) => void;
  setRenderedTaryf: (index: number) => void;

  // Dialog actions
  openDialogTaryf: () => void;
  closeDialogTaryf: () => void;
  openDialogTaryfSingle: (id: string) => void;
  closeDialogTaryfSingle: (id: string) => void;
  openDialogChild: () => void;
  closeDialogChild: () => void;
  openDialogChildSingle: (id: string) => void;
  closeDialogChildSingle: (id: string) => void;
  openDialogSeason: () => void;
  closeDialogSeason: () => void;
  openDialogSeasonSingle: (id: string) => void;
  closeDialogSeasonSingle: (id: string) => void;

  // CRUD operations
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  addRoom: (sectionId: string, room: any) => void;
  updateRoom: (sectionId: string, roomId: string, updates: any) => void;
  deleteRoom: (sectionId: string, roomId: string) => void;
  addTariff: (tariff: Tariff) => void;
  updateTariff: (id: string, updates: Partial<Tariff>) => void;
  deleteTariff: (id: string) => void;

  // Reset functions
  resetTarifNew: () => void;
  resetSeasonNew: () => void;
  resetChildNew: () => void;
}

const initialTariff: Tariff = {
  id: '',
  tariff_name: '',
  tariff_description: '',
  tariff_description_raw: '',
  lovest_price_tariff: false,
  booking_period: [],
};

const initialSeason: BookingPeriod = {
  id: '',
  booking_period_name: '',
  on_of_period: 'yes',
  current_period: false,
  booking_period_dates: [],
  position: 0,
  price_for_adult: {},
  dodatkove_mistse: '',
  price_for_child: [],
};

const data = TRUSKA_DATA?.section || TRUSKA_DATA?.acf || [];

// const childData = omitDeep(
//   pickBy(
//     get(data, ['0', 'room', '0', 'tariff', '0', 'booking_period', '0'], {}),
//     function (value: any, key: string) {
//       return startsWith(key, 'price_for_child');
//     }
//   ),
//   'kids_tarriff_price'
// ) || {
//   price_for_child: { kids_tarriff_name: '0-5' },
//   price_for_child_2: { kids_tarriff_name: '6-11' },
// };

const childData = TRUSKA_DATA?.child || {
  price_for_child: { kids_tarriff_name: '0-5' },
  price_for_child_2: { kids_tarriff_name: '6-11' },
};

export const useHotelStore = create<HotelState>()(
  devtools(
    set => ({
      // Initial state
      data: data,
      tarifData: get(data, ['0', 'rooms', '0', 'tariff'], []),
      seasonData: get(
        data,
        ['0', 'rooms', '0', 'tariff', '0', 'booking_period'],
        []
      ),
      childData: childData,
      tab: 0,
      renderedTaryf: 0,

      // Dialog states
      dialogTaryf: false,
      dialogTaryfSingle: {},
      dialogChild: false,
      dialogChildSingle: {},
      dialogSeason: false,
      dialogSeasonSingle: {},

      // Edited items
      editedTaryf: null,
      editedSeason: null,
      editedChild: {},

      // New items
      tarifNew: initialTariff,
      seasonNew: initialSeason,
      childNew: {},

      // Basic setters
      setData: data => set({ data }),
      setTarifData: tarifData => set({ tarifData }),
      setSeasonData: seasonData => set({ seasonData }),
      setChildData: childData => set({ childData }),
      setTab: tab => set({ tab }),
      setRenderedTaryf: renderedTaryf => set({ renderedTaryf }),

      // Dialog actions
      openDialogTaryf: () => set({ dialogTaryf: true }),
      closeDialogTaryf: () => set({ dialogTaryf: false }),
      openDialogTaryfSingle: id =>
        set(state => ({
          dialogTaryfSingle: { ...state.dialogTaryfSingle, [id]: true },
        })),
      closeDialogTaryfSingle: id =>
        set(state => ({
          dialogTaryfSingle: { ...state.dialogTaryfSingle, [id]: false },
        })),
      openDialogChild: () => set({ dialogChild: true }),
      closeDialogChild: () => set({ dialogChild: false }),
      openDialogChildSingle: id =>
        set(state => ({
          dialogChildSingle: { ...state.dialogChildSingle, [id]: true },
        })),
      closeDialogChildSingle: id =>
        set(state => ({
          dialogChildSingle: { ...state.dialogChildSingle, [id]: false },
        })),
      openDialogSeason: () => set({ dialogSeason: true }),
      closeDialogSeason: () => set({ dialogSeason: false }),
      openDialogSeasonSingle: id =>
        set(state => ({
          dialogSeasonSingle: { ...state.dialogSeasonSingle, [id]: true },
        })),
      closeDialogSeasonSingle: id =>
        set(state => ({
          dialogSeasonSingle: { ...state.dialogSeasonSingle, [id]: false },
        })),

      // CRUD operations
      addSection: section => set(state => ({ data: [...state.data, section] })),

      updateSection: (id, updates) =>
        set(state => ({
          data: state.data.map(section =>
            section.id === id ? { ...section, ...updates } : section
          ),
        })),

      deleteSection: id =>
        set(state => ({
          data: state.data.filter(section => section.id !== id),
        })),

      addRoom: (sectionId, room) =>
        set(state => ({
          data: state.data.map(section =>
            section.id === sectionId
              ? { ...section, rooms: [...section.rooms, room] }
              : section
          ),
        })),

      updateRoom: (sectionId, roomId, updates) =>
        set(state => ({
          data: state.data.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  rooms: section.rooms.map(room =>
                    room.room_id === roomId ? { ...room, ...updates } : room
                  ),
                }
              : section
          ),
        })),

      deleteRoom: (sectionId, roomId) =>
        set(state => ({
          data: state.data.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  rooms: section.rooms.filter(room => room.room_id !== roomId),
                }
              : section
          ),
        })),

      addTariff: tariff =>
        set(state => ({ tarifData: [...state.tarifData, tariff] })),

      updateTariff: (id, updates) =>
        set(state => ({
          tarifData: state.tarifData.map(tariff =>
            tariff.id === id ? { ...tariff, ...updates } : tariff
          ),
        })),

      deleteTariff: id =>
        set(state => ({
          tarifData: state.tarifData.filter(tariff => tariff.id !== id),
        })),

      // Reset functions
      resetTarifNew: () =>
        set({ tarifNew: { ...initialTariff, id: Date.now().toString() } }),
      resetSeasonNew: () =>
        set({ seasonNew: { ...initialSeason, id: Date.now().toString() } }),
      resetChildNew: () => set({ childNew: {} }),
    }),
    {
      name: 'hotel-store',
    }
  )
);
