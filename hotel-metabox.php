<?php
/**
 * Plugin Name: Hotel Metabox
 * Plugin URI: https://example.com/hotel-metabox
 * Description: A WordPress metabox for managing hotel information with rooms, tariffs, and booking periods using React and Material UI.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: hotel-metabox
 * Domain Path: /languages
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'HOTEL_METABOX_VERSION', '1.0.0' );
define( 'HOTEL_METABOX_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'HOTEL_METABOX_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'HOTEL_METABOX_PLUGIN_FILE', __FILE__ );

/**
 * Main plugin class
 */
class HotelMetabox {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'init' ) );
		register_activation_hook( __FILE__, array( $this, 'activate' ) );
		register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );
	}

	/**
	 * Initialize the plugin
	 */
	public function init() {
		// Load text domain for translations
		load_plugin_textdomain( 'hotel-metabox', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

		// Initialize components
		$this->load_dependencies();
		$this->init_hooks();
	}

	/**
	 * Load plugin dependencies
	 */
	private function load_dependencies() {

		require_once HOTEL_METABOX_PLUGIN_DIR . 'includes/functions.php';
		require_once HOTEL_METABOX_PLUGIN_DIR . 'includes/class-hotel-metabox.php';
		require_once HOTEL_METABOX_PLUGIN_DIR . 'includes/class-hotel-assets.php';
		require_once HOTEL_METABOX_PLUGIN_DIR . 'includes/class-hotel-admin-notice.php';
		require_once HOTEL_METABOX_PLUGIN_DIR . 'includes/class-hotel-ajax.php';
	}

	/**
	 * Initialize hooks
	 */
	private function init_hooks() {

		// Initialize metabox
		new Hotel_Metabox();

		// Initialize assets
		new Hotel_Assets();

		// Initialize admin notices
		new Hotel_Admin_Notice();

		// Initialize AJAX handlers
		new Hotel_Ajax();
	}

	/**
	 * Plugin activation
	 */
	public function activate() {
		// Flush rewrite rules
		flush_rewrite_rules();
	}

	/**
	 * Plugin deactivation
	 */
	public function deactivate() {
		// Flush rewrite rules
		flush_rewrite_rules();
	}
}

// Initialize the plugin
new HotelMetabox();
