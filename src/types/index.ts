export interface BookingPeriodDate {
  booking_period_begin: string;
  booking_period_end: string;
}

export interface PriceForChild {
  kids_tarriff_name: string;
  kids_tarriff_price: string;
}

export interface BookingPeriod {
  id: string;
  booking_period_name: string;
  on_of_period: 'yes' | 'no';
  current_period: boolean;
  booking_period_dates: BookingPeriodDate[];
  position: number;
  price_for_adult: Record<string, string>;
  dodatkove_mistse: string;
  price_for_child: PriceForChild[];
}

export interface Tariff {
  id: string;
  tariff_name: string;
  tariff_description: string;
  tariff_description_raw: string;
  lovest_price_tariff: boolean;
  booking_period: BookingPeriod[];
}

export interface GalleryImage {
  room_gallery_image: number;
  alt_image: string;
}

export interface KeyFeature {
  feature: string;
}

export interface Room {
  room_name: string;
  room_id: string;
  room_main_foto: number;
  room_gallery: GalleryImage[];
  key_features: KeyFeature[];
  room_info: string;
  room_info_raw: string;
  adults_number: string;
  lovest_price_room: boolean;
  tariff: Tariff[];
  [key: string]: any; // For numbered tariff keys like "0", "1"
}

export interface Section {
  id: string;
  section_name: string;
  section_title?: string; // Optional field for subtitle/description
  rooms: Room[];
}

export interface HotelData {
  section: Section[];
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface ChildTariff {
  [key: string]: {
    kids_tarriff_name: string;
    kids_tarriff_price?: string;
  };
}

export interface DialogState {
  [key: string]: boolean;
}

export interface AdminTruskavetskProps {
  // Add any props if needed
}

// WordPress specific types
declare global {
  interface Window {
    wp: {
      media: () => any;
      element: {
        render: (element: React.ReactElement, container: Element) => void;
      };
    };
    lodash: any;
  }
}

export interface MediaUploadConfig {
  title: string;
  button: {
    text: string;
  };
  multiple: boolean;
}

export interface MediaAttachment {
  id: number;
  url: string;
  alt: string;
  title: string;
}
