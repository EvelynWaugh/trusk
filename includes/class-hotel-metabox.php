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
	}


	public function add_metabox() {
		add_meta_box( 'admin-trusk', __( 'Конфігурація об\'єкта' ), 'display_admin_trusk_react', 'post', 'advanced' );
	}

	public function display_admin_trusk_react( $post ) {
		?>
	<div id="admin-trusk-app"></div>

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
		if ( $current_screen->id === 'post' ) {
			$react_data     = json_decode( get_post_meta( $post->ID, 'trusk_whole_data', true ), true );
			$react_rooms    = json_decode( get_post_meta( $post->ID, 'trusk_rooms_data', true ), true );
			$rooms          = get_field( 'rooms' );
			$modified_rooms = array();
			if ( ! empty( $react_rooms ) ) {

				$used_keys = array();
				foreach ( $rooms as $room_key => $room ) {

					foreach ( $react_rooms as $rr ) {
						if ( $rr['room_id'] === $room['room_id'] ) {

							$taryf                                 = array_replace( $room['tarif'], $rr['tariff'] );
							$modified_rooms[ $room_key ]           = $room;
							$modified_rooms[ $room_key ]['tariff'] = $rr['tariff'];

							$used_keys[] = $room_key;
						}
					}
				}
				foreach ( $rooms as $room_key => $room ) {
					if ( in_array( $room_key, $used_keys ) ) {
						continue;
					}
					$modified_rooms[ $room_key ] = $room;
				}
				ksort( $modified_rooms );
			}
			$tarifs  = json_decode( get_post_meta( $post->ID, 'trusk_tarif_data', true ), true );
			$seasons = json_decode( get_post_meta( $post->ID, 'trusk_season_data', true ), true );
			if ( ! empty( $seasons ) ) {
				foreach ( $seasons as &$season ) {

					if ( isset( $season['booking_period_dates']['booking_period_begin'] ) ) {

						$season['booking_period_dates'] = array(
							array(
								'booking_period_begin' => $season['booking_period_dates']['booking_period_begin'],
								'booking_period_end'   => $season['booking_period_dates']['booking_period_end'],
							),
						);
					}
				}
			}

			wp_enqueue_media();
			wp_enqueue_script( 'trusk-admin-react', get_template_directory_uri() . '/assets/dist/adminTrusk.js', array( 'wp-element', 'wp-components', 'wp-data', 'lodash' ), time(), true );
			wp_localize_script(
				'trusk-admin-react',
				'TRUSKA_DATA',
				array(
					'acf'     => $rooms,
					'korpus'  => $react_data,
					'rooms'   => $rooms,
					'tarifs'  => ! empty( $tarifs ) ? $tarifs : false,
					'seasons' => ! empty( $seasons ) ? $seasons : false,

				)
			);
		}
	}
}
