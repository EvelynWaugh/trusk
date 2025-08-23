<?php
/**
 * Hotel Admin Notice Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class Hotel_Admin_Notice {
    
    public function __construct() {
        add_action('admin_notices', array($this, 'activation_notice'));
        add_action('wp_ajax_dismiss_hotel_notice', array($this, 'dismiss_notice'));
    }
    
    /**
     * Show activation notice
     */
    public function activation_notice() {
        // Only show on admin pages
        if (!is_admin()) {
            return;
        }
        
        // Check if notice was dismissed
        if (get_option('hotel_metabox_notice_dismissed')) {
            return;
        }
        
        // Check if assets are built
        $js_file = HOTEL_METABOX_PLUGIN_DIR . 'assets/dist/hotel-metabox.js';
        
        if (!file_exists($js_file)) {
            echo '<div class="notice notice-warning is-dismissible" data-notice="hotel-build">';
            echo '<p><strong>Hotel Metabox:</strong> ';
            echo __('React assets not found. Please run <code>pnpm install && pnpm run build</code> to build the assets.', 'hotel-metabox');
            echo '</p>';
            echo '</div>';
            return;
        }
        
        // Show success notice
        echo '<div class="notice notice-success is-dismissible" data-notice="hotel-success">';
        echo '<p><strong>Hotel Metabox:</strong> ';
        echo __('Plugin activated successfully! You can now manage hotel information in your posts.', 'hotel-metabox');
        echo '</p>';
        echo '</div>';
        
        // Auto-dismiss after showing once
        update_option('hotel_metabox_notice_dismissed', true);
    }
    
    /**
     * Dismiss notice via AJAX
     */
    public function dismiss_notice() {
        if (wp_verify_nonce($_POST['nonce'], 'hotel_notice_nonce')) {
            update_option('hotel_metabox_notice_dismissed', true);
            wp_send_json_success();
        }
        wp_send_json_error();
    }
}