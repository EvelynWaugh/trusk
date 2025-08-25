<?php
/**
 * Hotel AJAX Handler
 *
 * Handles all AJAX requests for the hotel metabox plugin
 *
 * @package HotelMetabox
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Hotel AJAX Handler Class
 */
class Hotel_Ajax {

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize hooks
	 */
	private function init_hooks() {
		// AJAX hooks for logged-in users
		add_action( 'wp_ajax_save_hotel_data', array( $this, 'save_hotel_data' ) );

		// If you need AJAX for non-logged-in users, uncomment the line below
		// add_action( 'wp_ajax_nopriv_save_hotel_data', array( $this, 'save_hotel_data' ) );
	}

	/**
	 * Save hotel data via AJAX
	 */
	public function save_hotel_data() {
		// Verify nonce for security.
		$nonce = wp_unslash( $_POST['nonce'] ?? '' );
		if ( ! wp_verify_nonce( $nonce, 'hotel_metabox_nonce' ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Security check failed', 'hotel-metabox' ),
				),
				403
			);
		}

		// Check user capabilities.
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Insufficient permissions', 'hotel-metabox' ),
				),
				403
			);
		}

		// Get and validate data.
		$raw_data = wp_unslash( $_POST['data'] ?? '' );
		if ( empty( $raw_data ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'No data provided', 'hotel-metabox' ),
				),
				400
			);
		}

		// Decode JSON data.
		$data = json_decode( $raw_data, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			wp_send_json_error(
				array(
					'message' => __( 'Invalid JSON data', 'hotel-metabox' ),
				),
				400
			);
		}

		// Get post ID.
		$post_id = intval( $_POST['post_id'] ?? 0 );
		if ( ! $post_id ) {
			wp_send_json_error(
				array(
					'message' => __( 'Invalid post ID', 'hotel-metabox' ),
				),
				400
			);
		}

		try {
			// Sanitize and validate the data.
			$sanitized_data = $this->sanitize_hotel_data( $data );

			// Save the main hotel data.
			$updated = update_post_meta( $post_id, 'trusk_whole_data', $sanitized_data );

			// Extract and save specific data types.
			$this->save_extracted_data( $post_id, $sanitized_data );

			// Check if update was successful.
			if ( false !== $updated ) {
				wp_send_json_success(
					array(
						'message'   => __( 'Hotel data saved successfully', 'hotel-metabox' ),
						'post_id'   => $post_id,
						'timestamp' => current_time( 'mysql' ),
					)
				);
			} else {
				wp_send_json_error(
					array(
						'message' => __( 'Failed to save hotel data', 'hotel-metabox' ),
					),
					500
				);
			}
		} catch ( Exception $e ) {
			error_log( 'Hotel AJAX Error: ' . $e->getMessage() );
			wp_send_json_error(
				array(
					'message' => __( 'An error occurred while saving data', 'hotel-metabox' ),
				),
				500
			);
		}
	}

	/**
	 * Sanitize hotel data
	 *
	 * @param array $data Raw data to sanitize
	 * @return array Sanitized data
	 */
	private function sanitize_hotel_data( $data ) {
		if ( ! is_array( $data ) ) {
			return array();
		}

		$sanitized = array();

		foreach ( $data as $section ) {
			if ( ! is_array( $section ) ) {
				continue;
			}

			$sanitized_section = array();

			// Sanitize section fields
			$sanitized_section['id']           = sanitize_text_field( $section['id'] ?? '' );
			$sanitized_section['section_name'] = sanitize_text_field( $section['section_name'] ?? '' );

			// Sanitize rooms data
			if ( isset( $section['rooms'] ) && is_array( $section['rooms'] ) ) {
				$sanitized_section['rooms'] = $this->sanitize_rooms_data( $section['rooms'] );
			}

			$sanitized[] = $sanitized_section;
		}

		return $sanitized;
	}

	/**
	 * Sanitize rooms data
	 *
	 * @param array $rooms Raw rooms data
	 * @return array Sanitized rooms data
	 */
	private function sanitize_rooms_data( $rooms ) {
		$sanitized_rooms = array();

		foreach ( $rooms as $room ) {
			if ( ! is_array( $room ) ) {
				continue;
			}

			$sanitized_room = array();

			// Basic room fields
			$sanitized_room['room_id']           = sanitize_text_field( $room['room_id'] ?? '' );
			$sanitized_room['room_name']         = sanitize_text_field( $room['room_name'] ?? '' );
			$sanitized_room['adults_number']     = sanitize_text_field( $room['adults_number'] ?? '' );
			$sanitized_room['lovest_price_room'] = (bool) ( $room['lovest_price_room'] ?? false );
			$sanitized_room['room_main_foto']    = intval( $room['room_main_foto'] ?? 0 );

			// Sanitize HTML content
			$sanitized_room['room_info']     = wp_kses_post( $room['room_info'] ?? '' );
			$sanitized_room['room_info_raw'] = sanitize_textarea_field( $room['room_info_raw'] ?? '' );

			// Sanitize arrays
			if ( isset( $room['room_gallery'] ) && is_array( $room['room_gallery'] ) ) {
				$sanitized_room['room_gallery'] = $this->sanitize_gallery_data( $room['room_gallery'] );
			}

			if ( isset( $room['key_features'] ) && is_array( $room['key_features'] ) ) {
				$sanitized_room['key_features'] = $this->sanitize_features_data( $room['key_features'] );
			}

			if ( isset( $room['tariff'] ) && is_array( $room['tariff'] ) ) {
				$sanitized_room['tariff'] = $this->sanitize_tariff_data( $room['tariff'] );
			}

			$sanitized_rooms[] = $sanitized_room;
		}

		return $sanitized_rooms;
	}

	/**
	 * Sanitize gallery data
	 *
	 * @param array $gallery Raw gallery data
	 * @return array Sanitized gallery data
	 */
	private function sanitize_gallery_data( $gallery ) {
		$sanitized = array();

		foreach ( $gallery as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$sanitized[] = array(
				'room_gallery_image' => intval( $item['room_gallery_image'] ?? 0 ),
				'alt_image'          => sanitize_text_field( $item['alt_image'] ?? '' ),
			);
		}

		return $sanitized;
	}

	/**
	 * Sanitize features data
	 *
	 * @param array $features Raw features data
	 * @return array Sanitized features data
	 */
	private function sanitize_features_data( $features ) {
		$sanitized = array();

		foreach ( $features as $feature ) {
			if ( ! is_array( $feature ) ) {
				continue;
			}

			$sanitized[] = array(
				'feature' => sanitize_text_field( $feature['feature'] ?? '' ),
			);
		}

		return $sanitized;
	}

	/**
	 * Sanitize tariff data
	 *
	 * @param array $tariffs Raw tariff data
	 * @return array Sanitized tariff data
	 */
	private function sanitize_tariff_data( $tariffs ) {
		$sanitized = array();

		foreach ( $tariffs as $tariff ) {
			if ( ! is_array( $tariff ) ) {
				continue;
			}

			$sanitized_tariff                           = array();
			$sanitized_tariff['id']                     = sanitize_text_field( $tariff['id'] ?? '' );
			$sanitized_tariff['tariff_name']            = sanitize_text_field( $tariff['tariff_name'] ?? '' );
			$sanitized_tariff['tariff_description']     = wp_kses_post( $tariff['tariff_description'] ?? '' );
			$sanitized_tariff['tariff_description_raw'] = sanitize_textarea_field( $tariff['tariff_description_raw'] ?? '' );
			$sanitized_tariff['lovest_price_tariff']    = (bool) ( $tariff['lovest_price_tariff'] ?? false );

			// Sanitize booking periods
			if ( isset( $tariff['booking_period'] ) && is_array( $tariff['booking_period'] ) ) {
				$sanitized_tariff['booking_period'] = $this->sanitize_booking_periods( $tariff['booking_period'] );
			}

			$sanitized[] = $sanitized_tariff;
		}

		return $sanitized;
	}

	/**
	 * Sanitize booking periods data
	 *
	 * @param array $periods Raw booking periods data
	 * @return array Sanitized booking periods data
	 */
	private function sanitize_booking_periods( $periods ) {
		$sanitized = array();

		foreach ( $periods as $period ) {
			if ( ! is_array( $period ) ) {
				continue;
			}

			$sanitized_period                        = array();
			$sanitized_period['id']                  = sanitize_text_field( $period['id'] ?? '' );
			$sanitized_period['booking_period_name'] = sanitize_text_field( $period['booking_period_name'] ?? '' );
			$sanitized_period['on_of_period']        = sanitize_text_field( $period['on_of_period'] ?? '' );
			$sanitized_period['current_period']      = (bool) ( $period['current_period'] ?? false );
			$sanitized_period['position']            = intval( $period['position'] ?? 0 );
			$sanitized_period['dodatkove_mistse']    = sanitize_text_field( $period['dodatkove_mistse'] ?? '' );

			// Sanitize booking period dates
			if ( isset( $period['booking_period_dates'] ) && is_array( $period['booking_period_dates'] ) ) {
				$sanitized_period['booking_period_dates'] = array();
				foreach ( $period['booking_period_dates'] as $date_range ) {
					if ( is_array( $date_range ) ) {
						$sanitized_period['booking_period_dates'][] = array(
							'booking_period_begin' => sanitize_text_field( $date_range['booking_period_begin'] ?? '' ),
							'booking_period_end'   => sanitize_text_field( $date_range['booking_period_end'] ?? '' ),
						);
					}
				}
			}

			// Sanitize price for adult
			if ( isset( $period['price_for_adult'] ) && is_array( $period['price_for_adult'] ) ) {
				$sanitized_period['price_for_adult'] = array();
				foreach ( $period['price_for_adult'] as $key => $price ) {
					$sanitized_period['price_for_adult'][ sanitize_key( $key ) ] = sanitize_text_field( $price );
				}
			}

			// Sanitize price for child
			if ( isset( $period['price_for_child'] ) && is_array( $period['price_for_child'] ) ) {
				$sanitized_period['price_for_child'] = array();
				foreach ( $period['price_for_child'] as $child_tariff ) {
					if ( is_array( $child_tariff ) ) {
						$sanitized_period['price_for_child'][] = array(
							'kids_tarriff_name'  => sanitize_text_field( $child_tariff['kids_tarriff_name'] ?? '' ),
							'kids_tarriff_price' => sanitize_text_field( $child_tariff['kids_tarriff_price'] ?? '' ),
						);
					}
				}
			}

			$sanitized[] = $sanitized_period;
		}

		return $sanitized;
	}

	/**
	 * Extract and save specific data types
	 *
	 * @param int   $post_id Post ID
	 * @param array $data Sanitized hotel data
	 */
	private function save_extracted_data( $post_id, $data ) {
		// Extract rooms data
		$rooms_data   = array();
		$tariffs_data = array();
		$seasons_data = array();
		$child_data   = array();

		// Track unique IDs to prevent duplicates
		$tariff_ids         = array();
		$season_ids         = array();
		$child_tariff_names = array();

		foreach ( $data as $section ) {
			if ( isset( $section['rooms'] ) && is_array( $section['rooms'] ) ) {
				foreach ( $section['rooms'] as $room ) {
					$rooms_data[] = $room;

					// Extract tariffs from rooms
					if ( isset( $room['tariff'] ) && is_array( $room['tariff'] ) ) {
						foreach ( $room['tariff'] as $tariff ) {
							// Only add tariff if ID hasn't been seen before
							$tariff_id = $tariff['id'] ?? '';
							if ( ! empty( $tariff_id ) && ! in_array( $tariff_id, $tariff_ids, true ) ) {
								$tariff_ids[]   = $tariff_id;
								$tariffs_data[] = $tariff;
							}

							// Extract seasons from tariffs
							if ( isset( $tariff['booking_period'] ) && is_array( $tariff['booking_period'] ) ) {
								foreach ( $tariff['booking_period'] as $season ) {
									// Only add season if ID hasn't been seen before
									$season_id = $season['id'] ?? '';
									if ( ! empty( $season_id ) && ! in_array( $season_id, $season_ids, true ) ) {
										$season_ids[]   = $season_id;
										$seasons_data[] = $season;
									}

									// Extract child tariffs from seasons
									if ( isset( $season['price_for_child'] ) && is_array( $season['price_for_child'] ) ) {
										foreach ( $season['price_for_child'] as $child_tariff ) {
											if ( is_array( $child_tariff ) && isset( $child_tariff['kids_tarriff_name'] ) ) {
												$child_name = $child_tariff['kids_tarriff_name'];
												// Only add child tariff if name hasn't been seen before
												if ( ! empty( $child_name ) && ! in_array( $child_name, $child_tariff_names, true ) ) {
													$child_tariff_names[] = $child_name;
													$child_data[]         = array(
														'kids_tarriff_name'  => $child_name,
													);
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		// Save extracted data
		if ( ! empty( $rooms_data ) ) {
			update_post_meta( $post_id, 'trusk_rooms_data', $rooms_data );
		}

		if ( ! empty( $tariffs_data ) ) {
			update_post_meta( $post_id, 'trusk_tarif_data', $tariffs_data );
		}

		if ( ! empty( $seasons_data ) ) {
			update_post_meta( $post_id, 'trusk_season_data', $seasons_data );
		}

		if ( ! empty( $child_data ) ) {
			update_post_meta( $post_id, 'trusk_child_data', $child_data );
		}
	}
}
