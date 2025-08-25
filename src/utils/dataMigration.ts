import type { Section, Room } from '@/types';

/**
 * Migrates room data to ensure it has all required fields
 * This is needed for backward compatibility when new fields are added
 */
export const migrateRoomData = (room: any): Room => {
  return {
    room_name: room.room_name || '',
    room_id: room.room_id || '',
    room_main_foto: room.room_main_foto || 0,
    hide_room: room.hide_room || 'no',
    number_of_rooms: room.number_of_rooms || 1,
    ploshha_nomeru: room.ploshha_nomeru || '',
    in_room_amenities: room.in_room_amenities || {},
    room_gallery: room.room_gallery || [],
    key_features: room.key_features || [{ feature: '' }],
    room_info: room.room_info || '',
    adults_number: room.adults_number || '2',
    lovest_price_room: room.lovest_price_room || false,
    tariff: room.tariff || [],
    ...room, // Preserve any other fields that might exist
  };
};

/**
 * Migrates section data to ensure all rooms have required fields
 */
export const migrateSectionData = (sections: any[]): Section[] => {
  return sections.map(section => ({
    ...section,
    rooms: section.rooms ? section.rooms.map(migrateRoomData) : [],
  }));
};

/**
 * Validates if a room object has all required new fields
 */
export const hasNewFields = (room: any): boolean => {
  return (
    room.hasOwnProperty('hide_room') &&
    room.hasOwnProperty('number_of_rooms') &&
    room.hasOwnProperty('ploshha_nomeru') &&
    room.hasOwnProperty('in_room_amenities')
  );
};
