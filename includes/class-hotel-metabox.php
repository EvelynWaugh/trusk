<?php
/**
 * Hotel Metabox Class
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Hotel_Metabox {

	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_metabox' ) );
		add_action( 'save_post', array( $this, 'save_metabox' ), 10, 2 );
		add_action( 'admin_head', array( $this, 'correct_react' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts' ) );

		// add admin page
		add_action( 'admin_menu', array( $this, 'add_admin_page' ) );
	}

	public function add_admin_page() {
		add_menu_page(
			__( 'Hotel Settings', 'trusk' ),
			__( 'Hotel Settings', 'trusk' ),
			'manage_options',
			'hotel-settings',
			array( $this, 'render_admin_page' ),
			'dashicons-admin-multisite',
			26
		);
	}

	public function render_admin_page() {
		echo '<div id="hotel-metabox-root"></div>';
	}

	public function add_metabox() {
		add_meta_box( 'admin-trusk', __( 'Конфігурація об\'єкта' ), array( $this, 'admin_trusk_react' ), 'post', 'advanced' );
	}

	public function admin_trusk_react( $post ) {
		?>
	<div id="hotel-metabox-root"></div>

		<?php
	}

	public function correct_react() {
		if ( ! get_current_screen() == 'post' ) {
			return;
		}
		?>
	<style>
		/* #poster_product_data label {
		float: none;
		width: auto;
		margin: 0;
	} */

		.MuiFormControl-root .MuiFormLabel-root {
			float: none;
			width: auto;
			margin: 0;
		}

		.MuiFormControl-root input[type=color],
		.MuiFormControl-root input[type=date],

		.MuiFormControl-root input[type=number],
		.MuiFormControl-root input[type=text],
		.MuiFormControl-root input[type=tel],
		.MuiFormControl-root select,
		.MuiFormControl-root textarea {
			background-color: transparent;
			border: 0;
			width: 100%;
			padding: 16.5px 14px;
			box-sizing: border-box;
			height: 55px;
		}

		.MuiFormControl-root input[type=checkbox]:focus,
		.MuiFormControl-root input[type=color]:focus,

		.MuiFormControl-root input[type=number]:focus,
		.MuiFormControl-root input[type=password]:focus,
		.MuiFormControl-root input[type=radio]:focus,
		.MuiFormControl-root input[type=text]:focus,
		.MuiFormControl-root input[type=tel]:focus,
		.MuiFormControl-root select:focus,
		.MuiFormControl-root textarea:focus {
			border-color: transparent;
			box-shadow: none;
			outline: 0;
			border-radius: 0;
		}
			#mui-rte-editor-container blockquote {
			margin: 1em;
		}
		#mui-rte-editor-container ol, #mui-rte-editor-container ul {
			margin-left: 2em;
		}
	</style>
		<?php
	}



	public function save_metabox( $post_id, $post ) {
		if ( isset( $_POST['trusk_tarif_data'] ) ) {
			update_post_meta( $post_id, 'trusk_tarif_data', $_POST['trusk_tarif_data'] );
		}
		if ( isset( $_POST['trusk_season_data'] ) ) {
			update_post_meta( $post_id, 'trusk_season_data', $_POST['trusk_season_data'] );
		}
		if ( isset( $_POST['trusk_whole_data'] ) ) {
			update_post_meta( $post_id, 'trusk_whole_data', $_POST['trusk_whole_data'] );
		}
		if ( isset( $_POST['trusk_child_data'] ) ) {
			update_post_meta( $post_id, 'trusk_child_data', $_POST['trusk_child_data'] );
		}
	}



	function admin_scripts() {
		global $typenow, $current_screen, $post;
		// print_r($current_screen);
		if ( $current_screen->id === 'post' || $current_screen->id === 'toplevel_page_hotel-settings' ) {
			$react_data  = get_post_meta( $post->ID, 'trusk_whole_data', true );
			$react_rooms = get_post_meta( $post->ID, 'trusk_rooms_data', true );
			$rooms       = get_field( 'rooms' );

			$tarifs  = get_post_meta( $post->ID, 'trusk_tarif_data', true );
			$seasons = get_post_meta( $post->ID, 'trusk_season_data', true );

			$existing_tariffs     = array();
			$rooms_missing_tariff = array();

			foreach ( $rooms as $key => &$room ) {
				if ( ! isset( $room['tariff'] ) || empty( $room['tariff'] ) ) {
					$room['tariff']         = array();
					$rooms_missing_tariff[] = $key;
				} else {
					foreach ( $room['tariff'] as $k => &$tariff ) {

						if ( ! isset( $tariff['id'] ) ) {
								$tariff['id'] = 'tariff_' . $k;
						}
						foreach ( $tariff['booking_period'] as $period_key => &$period_value ) {
							if ( ! isset( $period_value['id'] ) ) {
								$period_value['id'] = 'season_' . $period_key;
							}
							if ( ! isset( $period_value['booking_period_dates'] ) || empty( $period_value['booking_period_dates'] ) ) {
								$period_value['booking_period_dates'] = array(
									array(
										'booking_period_begin' => '',
										'booking_period_end'   => '',
									),
								);
							}
							if ( ! isset( $period_value['price_for_child'] ) || empty( $period_value['price_for_child'] ) ) {
								$period_value['price_for_child'] = array(
									array(
										'kids_tarriff_name'  => '0-5',
										'kids_tarriff_price' => '-',
									),
									array(
										'kids_tarriff_name'  => '6-11',
										'kids_tarriff_price' => '-',
									),
								);
							}
						}
					}
					if ( ! empty( $existing_tariffs ) ) {
						continue;
					}
					$existing_tariffs = $rooms[ $key ]['tariff'];

				}
			}

			if ( ! empty( $rooms_missing_tariff ) && ! empty( $existing_tariffs ) ) {
				foreach ( $rooms_missing_tariff as $key ) {

					$rooms[ $key ]['tariff'] = $existing_tariffs;
				}
			}

			$child_tariff = get_post_meta( $post->ID, 'trusk_child_data', true );

			// If no child tariff meta data exists, extract from rooms
			if ( empty( $child_tariff ) && ! empty( $rooms ) ) {
				$child_tariff = $this->extract_child_tariffs_from_rooms( $rooms );
			}

			// Fallback to default structure if still empty
			if ( empty( $child_tariff ) ) {
				$child_tariff = array(
					'price_for_child'   => array( 'kids_tarriff_name' => '0-5' ),
					'price_for_child_2' => array( 'kids_tarriff_name' => '6-11' ),
				);
			}

			// wrap rooms in section array for acf
			$section_rooms = array(
				array(
					'id'            => 'section_1',
					'section_name'  => 'Секція 1',
					'section_title' => '',
					'rooms'         => $rooms,
				),
			);

			wp_enqueue_media();
			wp_enqueue_script( 'trusk-admin-react', HOTEL_METABOX_PLUGIN_URL . '/assets/dist/hotel-metabox.js', array( 'wp-element', 'wp-components', 'wp-data', 'lodash' ), time(), true );
			wp_localize_script(
				'trusk-admin-react',
				'TRUSKA_DATA',
				array(
					'acf'     => $section_rooms,
					'section' => $react_data,
					'rooms'   => $rooms,
					'tarifs'  => ! empty( $tarifs ) ? $tarifs : false,
					'seasons' => ! empty( $seasons ) ? $seasons : false,
					'child'   => $child_tariff,

				)
			);
			wp_localize_script(
				'trusk-admin-react',
				'hotelMetaboxConfig',
				array(
					'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
					'nonce'     => wp_create_nonce( 'hotel_metabox_nonce' ),
					'pluginUrl' => HOTEL_METABOX_PLUGIN_URL,
					'strings'   => array(
						'save'           => __( 'Save', 'hotel-metabox' ),
						'cancel'         => __( 'Cancel', 'hotel-metabox' ),
						'delete'         => __( 'Delete', 'hotel-metabox' ),
						'edit'           => __( 'Edit', 'hotel-metabox' ),
						'add'            => __( 'Add', 'hotel-metabox' ),
						'confirm_delete' => __( 'Are you sure you want to delete this item?', 'hotel-metabox' ),
					),
				)
			);
		}
	}

	/**
	 * Extract child tariff data from rooms structure
	 *
	 * @param array $rooms Rooms data from ACF
	 * @return array Extracted child tariff data
	 */
	private function extract_child_tariffs_from_rooms( $rooms ) {
		$child_data         = array();
		$child_tariff_names = array();

		// Loop through rooms to find child tariff data
		foreach ( $rooms as $room ) {
			if ( isset( $room['tariff'] ) && is_array( $room['tariff'] ) ) {
				foreach ( $room['tariff'] as $tariff ) {
					if ( isset( $tariff['booking_period'] ) && is_array( $tariff['booking_period'] ) ) {
						foreach ( $tariff['booking_period'] as $period ) {
							if ( isset( $period['price_for_child'] ) && is_array( $period['price_for_child'] ) ) {
								foreach ( $period['price_for_child'] as $child_tariff ) {
									if ( is_array( $child_tariff ) && isset( $child_tariff['kids_tarriff_name'] ) ) {
										$child_name = $child_tariff['kids_tarriff_name'];
										// Only add if not already processed
										if ( ! empty( $child_name ) && ! in_array( $child_name, $child_tariff_names, true ) ) {
											$child_tariff_names[]     = $child_name;
											$child_key                = 'price_for_child' . ( count( $child_data ) > 0 ? '_' . ( count( $child_data ) + 1 ) : '' );
											$child_data[ $child_key ] = array(
												'kids_tarriff_name' => $child_name,
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

		return $child_data;
	}
}
