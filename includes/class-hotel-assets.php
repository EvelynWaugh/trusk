<?php
/**
 * Hotel Assets Management Class
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Hotel_Assets {

	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Enqueue admin assets
	 */
	public function enqueue_admin_assets( $hook ) {
		// Skip if the metabox class is handling script loading
		// The Hotel_Metabox class already handles the React script loading
		return;

		// Only load on post edit screens
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ) ) ) {
			return;
		}

		global $post_type;

		// Load on all post types for now (can be restricted to 'hotel' post type later)
		if ( ! in_array( $post_type, array( 'post', 'hotel' ) ) ) {
			return;
		}

		// Enqueue CSS
		wp_enqueue_style(
			'hotel-metabox-style',
			HOTEL_METABOX_PLUGIN_URL . 'assets/css/hotel-metabox.css',
			array(),
			HOTEL_METABOX_VERSION
		);

		// Check if built assets exist
		$js_file  = HOTEL_METABOX_PLUGIN_DIR . 'assets/dist/hotel-metabox.js';
		$css_file = HOTEL_METABOX_PLUGIN_DIR . 'assets/dist/hotel-metabox.css';

		if ( file_exists( $js_file ) ) {
			// Enqueue built React app
			wp_enqueue_script(
				'trusk-admin-react',
				HOTEL_METABOX_PLUGIN_URL . 'assets/dist/hotel-metabox.js',
				array( 'wp-element', 'wp-components', 'wp-data', 'lodash' ),
				HOTEL_METABOX_VERSION,
				true
			);

			// Enqueue built CSS if it exists
			if ( file_exists( $css_file ) ) {
				wp_enqueue_style(
					'hotel-metabox-app-style',
					HOTEL_METABOX_PLUGIN_URL . 'assets/dist/hotel-metabox.css',
					array(),
					HOTEL_METABOX_VERSION
				);
			}
		} else {
			// Development mode - show notice
			add_action( 'admin_notices', array( $this, 'dev_notice' ) );
		}

		// Enqueue WordPress media library
		wp_enqueue_media();

		// Localize script with WordPress data
		wp_localize_script(
			'trusk-admin-react',
			'hotelMetaboxConfig',
			array(
				'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
				'nonce'     => wp_create_nonce( 'hotel_metabox_ajax' ),
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

	/**
	 * Show development notice
	 */
	public function dev_notice() {
		echo '<div class="notice notice-warning"><p>';
		echo __( 'Hotel Metabox: React assets not found. Please run <code>pnpm install && pnpm run build</code> to build the assets.', 'hotel-metabox' );
		echo '</p></div>';
	}
}
