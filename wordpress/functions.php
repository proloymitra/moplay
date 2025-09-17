<?php
/**
 * PlayInMo Theme Functions
 * Custom functions for the gaming website
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Theme setup
function playinmo_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    add_theme_support('custom-logo');
    
    // Register menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'playinmo'),
        'footer' => __('Footer Menu', 'playinmo'),
    ));
    
    // Set image sizes
    add_image_size('game-thumbnail', 250, 180, true);
    add_image_size('game-featured', 400, 300, true);
}
add_action('after_setup_theme', 'playinmo_setup');

// Enqueue scripts and styles
function playinmo_scripts() {
    wp_enqueue_style('playinmo-style', get_stylesheet_uri(), array(), '1.0.0');
    wp_enqueue_style('playinmo-main', get_template_directory_uri() . '/assets/css/style.css', array(), '1.0.0');
    
    wp_enqueue_script('playinmo-main', get_template_directory_uri() . '/assets/js/main.js', array(), '1.0.0', true);
    
    // Localize script for AJAX
    wp_localize_script('playinmo-main', 'playinmo_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('playinmo_nonce'),
    ));
}
add_action('wp_enqueue_scripts', 'playinmo_scripts');

// Register custom post types
function playinmo_register_post_types() {
    // Games post type
    register_post_type('game', array(
        'labels' => array(
            'name' => __('Games', 'playinmo'),
            'singular_name' => __('Game', 'playinmo'),
            'add_new' => __('Add New Game', 'playinmo'),
            'add_new_item' => __('Add New Game', 'playinmo'),
            'edit_item' => __('Edit Game', 'playinmo'),
            'new_item' => __('New Game', 'playinmo'),
            'view_item' => __('View Game', 'playinmo'),
            'search_items' => __('Search Games', 'playinmo'),
            'not_found' => __('No games found', 'playinmo'),
            'not_found_in_trash' => __('No games found in trash', 'playinmo'),
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'games'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'menu_icon' => 'dashicons-games',
        'show_in_rest' => true,
    ));
    
    // Achievements post type
    register_post_type('achievement', array(
        'labels' => array(
            'name' => __('Achievements', 'playinmo'),
            'singular_name' => __('Achievement', 'playinmo'),
            'add_new' => __('Add New Achievement', 'playinmo'),
            'add_new_item' => __('Add New Achievement', 'playinmo'),
            'edit_item' => __('Edit Achievement', 'playinmo'),
            'new_item' => __('New Achievement', 'playinmo'),
            'view_item' => __('View Achievement', 'playinmo'),
            'search_items' => __('Search Achievements', 'playinmo'),
            'not_found' => __('No achievements found', 'playinmo'),
            'not_found_in_trash' => __('No achievements found in trash', 'playinmo'),
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'achievements'),
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'menu_icon' => 'dashicons-awards',
        'show_in_rest' => true,
    ));
}
add_action('init', 'playinmo_register_post_types');

// Register taxonomies
function playinmo_register_taxonomies() {
    // Game categories
    register_taxonomy('game_category', 'game', array(
        'labels' => array(
            'name' => __('Game Categories', 'playinmo'),
            'singular_name' => __('Game Category', 'playinmo'),
            'search_items' => __('Search Categories', 'playinmo'),
            'all_items' => __('All Categories', 'playinmo'),
            'parent_item' => __('Parent Category', 'playinmo'),
            'parent_item_colon' => __('Parent Category:', 'playinmo'),
            'edit_item' => __('Edit Category', 'playinmo'),
            'update_item' => __('Update Category', 'playinmo'),
            'add_new_item' => __('Add New Category', 'playinmo'),
            'new_item_name' => __('New Category Name', 'playinmo'),
            'menu_name' => __('Categories', 'playinmo'),
        ),
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'game-category'),
        'show_in_rest' => true,
    ));
    
    // Game tags
    register_taxonomy('game_tag', 'game', array(
        'labels' => array(
            'name' => __('Game Tags', 'playinmo'),
            'singular_name' => __('Game Tag', 'playinmo'),
            'search_items' => __('Search Tags', 'playinmo'),
            'popular_items' => __('Popular Tags', 'playinmo'),
            'all_items' => __('All Tags', 'playinmo'),
            'edit_item' => __('Edit Tag', 'playinmo'),
            'update_item' => __('Update Tag', 'playinmo'),
            'add_new_item' => __('Add New Tag', 'playinmo'),
            'new_item_name' => __('New Tag Name', 'playinmo'),
            'menu_name' => __('Tags', 'playinmo'),
        ),
        'hierarchical' => false,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'game-tag'),
        'show_in_rest' => true,
    ));
}
add_action('init', 'playinmo_register_taxonomies');

// Add custom meta boxes
function playinmo_add_game_meta_boxes() {
    add_meta_box(
        'game_details',
        __('Game Details', 'playinmo'),
        'playinmo_game_details_callback',
        'game',
        'normal',
        'high'
    );
    
    add_meta_box(
        'game_settings',
        __('Game Settings', 'playinmo'),
        'playinmo_game_settings_callback',
        'game',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'playinmo_add_game_meta_boxes');

// Game details meta box callback
function playinmo_game_details_callback($post) {
    wp_nonce_field('playinmo_save_game_details', 'playinmo_game_details_nonce');
    
    $game_url = get_post_meta($post->ID, '_game_url', true);
    $game_file = get_post_meta($post->ID, '_game_file', true);
    $game_type = get_post_meta($post->ID, '_game_type', true);
    $game_width = get_post_meta($post->ID, '_game_width', true) ?: '800';
    $game_height = get_post_meta($post->ID, '_game_height', true) ?: '600';
    $game_instructions = get_post_meta($post->ID, '_game_instructions', true);
    
    ?>
    <table class="form-table">
        <tr>
            <th><label for="game_type"><?php _e('Game Type', 'playinmo'); ?></label></th>
            <td>
                <select id="game_type" name="game_type" class="regular-text">
                    <option value="url" <?php selected($game_type, 'url'); ?>><?php _e('External URL', 'playinmo'); ?></option>
                    <option value="file" <?php selected($game_type, 'file'); ?>><?php _e('Upload File', 'playinmo'); ?></option>
                </select>
            </td>
        </tr>
        <tr id="game_url_row">
            <th><label for="game_url"><?php _e('Game URL', 'playinmo'); ?></label></th>
            <td>
                <input type="url" id="game_url" name="game_url" value="<?php echo esc_attr($game_url); ?>" class="regular-text" placeholder="https://example.com/game.html" />
                <p class="description"><?php _e('Enter the external URL of the game.', 'playinmo'); ?></p>
            </td>
        </tr>
        <tr id="game_file_row">
            <th><label for="game_file"><?php _e('Game File', 'playinmo'); ?></label></th>
            <td>
                <input type="text" id="game_file" name="game_file" value="<?php echo esc_attr($game_file); ?>" class="regular-text" readonly />
                <button type="button" class="button" id="upload_game_file"><?php _e('Upload Game', 'playinmo'); ?></button>
                <p class="description"><?php _e('Upload a ZIP file containing the game files.', 'playinmo'); ?></p>
            </td>
        </tr>
        <tr>
            <th><label for="game_width"><?php _e('Game Width', 'playinmo'); ?></label></th>
            <td>
                <input type="number" id="game_width" name="game_width" value="<?php echo esc_attr($game_width); ?>" class="small-text" />
                <span>px</span>
            </td>
        </tr>
        <tr>
            <th><label for="game_height"><?php _e('Game Height', 'playinmo'); ?></label></th>
            <td>
                <input type="number" id="game_height" name="game_height" value="<?php echo esc_attr($game_height); ?>" class="small-text" />
                <span>px</span>
            </td>
        </tr>
        <tr>
            <th><label for="game_instructions"><?php _e('Game Instructions', 'playinmo'); ?></label></th>
            <td>
                <textarea id="game_instructions" name="game_instructions" rows="4" class="regular-text"><?php echo esc_textarea($game_instructions); ?></textarea>
                <p class="description"><?php _e('Enter instructions on how to play the game.', 'playinmo'); ?></p>
            </td>
        </tr>
    </table>
    
    <script>
    jQuery(document).ready(function($) {
        function toggleGameType() {
            var gameType = $('#game_type').val();
            if (gameType === 'url') {
                $('#game_url_row').show();
                $('#game_file_row').hide();
            } else {
                $('#game_url_row').hide();
                $('#game_file_row').show();
            }
        }
        
        $('#game_type').change(toggleGameType);
        toggleGameType();
        
        $('#upload_game_file').click(function(e) {
            e.preventDefault();
            var customUploader = wp.media({
                title: 'Upload Game File',
                button: {
                    text: 'Use this file'
                },
                multiple: false
            });
            
            customUploader.on('select', function() {
                var attachment = customUploader.state().get('selection').first().toJSON();
                $('#game_file').val(attachment.url);
            });
            
            customUploader.open();
        });
    });
    </script>
    <?php
}

// Game settings meta box callback
function playinmo_game_settings_callback($post) {
    $featured = get_post_meta($post->ID, '_featured_game', true);
    $rating = get_post_meta($post->ID, '_game_rating', true) ?: '0';
    $plays = get_post_meta($post->ID, '_game_plays', true) ?: '0';
    $preroll_ad = get_post_meta($post->ID, '_preroll_ad_enabled', true);
    $postroll_ad = get_post_meta($post->ID, '_postroll_ad_enabled', true);
    
    ?>
    <p>
        <label>
            <input type="checkbox" name="featured_game" value="1" <?php checked($featured, '1'); ?> />
            <?php _e('Featured Game', 'playinmo'); ?>
        </label>
    </p>
    <p>
        <label><?php _e('Game Rating', 'playinmo'); ?></label><br>
        <input type="number" name="game_rating" value="<?php echo esc_attr($rating); ?>" min="0" max="5" step="0.1" class="small-text" />
        <span>/5</span>
    </p>
    <p>
        <label><?php _e('Play Count', 'playinmo'); ?></label><br>
        <input type="number" name="game_plays" value="<?php echo esc_attr($plays); ?>" min="0" class="regular-text" />
    </p>
    <p>
        <label>
            <input type="checkbox" name="preroll_ad_enabled" value="1" <?php checked($preroll_ad, '1'); ?> />
            <?php _e('Enable Pre-roll Ads', 'playinmo'); ?>
        </label>
    </p>
    <p>
        <label>
            <input type="checkbox" name="postroll_ad_enabled" value="1" <?php checked($postroll_ad, '1'); ?> />
            <?php _e('Enable Post-roll Ads', 'playinmo'); ?>
        </label>
    </p>
    <?php
}

// Save game meta data
function playinmo_save_game_details($post_id) {
    if (!isset($_POST['playinmo_game_details_nonce']) || !wp_verify_nonce($_POST['playinmo_game_details_nonce'], 'playinmo_save_game_details')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    $fields = array(
        'game_url', 'game_file', 'game_type', 'game_width', 'game_height',
        'game_instructions', 'featured_game', 'game_rating', 'game_plays',
        'preroll_ad_enabled', 'postroll_ad_enabled'
    );
    
    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
        } else {
            delete_post_meta($post_id, '_' . $field);
        }
    }
}
add_action('save_post', 'playinmo_save_game_details');

// Create database tables for user data
function playinmo_create_tables() {
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    
    // User game plays table
    $table_name = $wpdb->prefix . 'playinmo_game_plays';
    $sql = "CREATE TABLE $table_name (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        game_id bigint(20) NOT NULL,
        score int(11) DEFAULT 0,
        play_time int(11) DEFAULT 0,
        completed tinyint(1) DEFAULT 0,
        played_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY game_id (game_id)
    ) $charset_collate;";
    
    // User achievements table
    $table_achievements = $wpdb->prefix . 'playinmo_user_achievements';
    $sql2 = "CREATE TABLE $table_achievements (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        achievement_id bigint(20) NOT NULL,
        unlocked_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY user_achievement (user_id, achievement_id)
    ) $charset_collate;";
    
    // Chat messages table
    $table_chat = $wpdb->prefix . 'playinmo_chat_messages';
    $sql3 = "CREATE TABLE $table_chat (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        message text NOT NULL,
        sent_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    dbDelta($sql2);
    dbDelta($sql3);
}
register_activation_hook(__FILE__, 'playinmo_create_tables');

// REST API endpoints
function playinmo_register_api_routes() {
    register_rest_route('playinmo/v1', '/games', array(
        'methods' => 'GET',
        'callback' => 'playinmo_get_games',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('playinmo/v1', '/games/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'playinmo_get_game',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('playinmo/v1', '/game-plays', array(
        'methods' => 'POST',
        'callback' => 'playinmo_record_game_play',
        'permission_callback' => 'is_user_logged_in'
    ));
    
    register_rest_route('playinmo/v1', '/leaderboard', array(
        'methods' => 'GET',
        'callback' => 'playinmo_get_leaderboard',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('playinmo/v1', '/achievements', array(
        'methods' => 'GET',
        'callback' => 'playinmo_get_achievements',
        'permission_callback' => 'is_user_logged_in'
    ));
    
    register_rest_route('playinmo/v1', '/chat', array(
        'methods' => 'GET',
        'callback' => 'playinmo_get_chat_messages',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('playinmo/v1', '/chat', array(
        'methods' => 'POST',
        'callback' => 'playinmo_send_chat_message',
        'permission_callback' => 'is_user_logged_in'
    ));
}
add_action('rest_api_init', 'playinmo_register_api_routes');

// API callback functions
function playinmo_get_games($request) {
    $args = array(
        'post_type' => 'game',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'meta_query' => array()
    );
    
    // Filter by category if specified
    if ($request->get_param('category')) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'game_category',
                'field' => 'slug',
                'terms' => $request->get_param('category')
            )
        );
    }
    
    // Filter by featured if specified
    if ($request->get_param('featured')) {
        $args['meta_query'][] = array(
            'key' => '_featured_game',
            'value' => '1',
            'compare' => '='
        );
    }
    
    $games = get_posts($args);
    $games_data = array();
    
    foreach ($games as $game) {
        $games_data[] = array(
            'id' => $game->ID,
            'title' => $game->post_title,
            'slug' => $game->post_name,
            'excerpt' => $game->post_excerpt,
            'thumbnail' => get_the_post_thumbnail_url($game->ID, 'game-thumbnail'),
            'category' => wp_get_post_terms($game->ID, 'game_category', array('fields' => 'names')),
            'rating' => floatval(get_post_meta($game->ID, '_game_rating', true)),
            'plays' => intval(get_post_meta($game->ID, '_game_plays', true)),
            'featured' => get_post_meta($game->ID, '_featured_game', true) === '1',
            'url' => get_post_meta($game->ID, '_game_url', true),
            'file' => get_post_meta($game->ID, '_game_file', true),
            'type' => get_post_meta($game->ID, '_game_type', true),
            'width' => intval(get_post_meta($game->ID, '_game_width', true)),
            'height' => intval(get_post_meta($game->ID, '_game_height', true)),
            'instructions' => get_post_meta($game->ID, '_game_instructions', true)
        );
    }
    
    return rest_ensure_response($games_data);
}

function playinmo_get_game($request) {
    $game_id = $request->get_param('id');
    $game = get_post($game_id);
    
    if (!$game || $game->post_type !== 'game') {
        return new WP_Error('game_not_found', 'Game not found', array('status' => 404));
    }
    
    $game_data = array(
        'id' => $game->ID,
        'title' => $game->post_title,
        'content' => $game->post_content,
        'excerpt' => $game->post_excerpt,
        'thumbnail' => get_the_post_thumbnail_url($game->ID, 'game-featured'),
        'category' => wp_get_post_terms($game->ID, 'game_category', array('fields' => 'names')),
        'tags' => wp_get_post_terms($game->ID, 'game_tag', array('fields' => 'names')),
        'rating' => floatval(get_post_meta($game->ID, '_game_rating', true)),
        'plays' => intval(get_post_meta($game->ID, '_game_plays', true)),
        'featured' => get_post_meta($game->ID, '_featured_game', true) === '1',
        'url' => get_post_meta($game->ID, '_game_url', true),
        'file' => get_post_meta($game->ID, '_game_file', true),
        'type' => get_post_meta($game->ID, '_game_type', true),
        'width' => intval(get_post_meta($game->ID, '_game_width', true)),
        'height' => intval(get_post_meta($game->ID, '_game_height', true)),
        'instructions' => get_post_meta($game->ID, '_game_instructions', true),
        'preroll_ad' => get_post_meta($game->ID, '_preroll_ad_enabled', true) === '1',
        'postroll_ad' => get_post_meta($game->ID, '_postroll_ad_enabled', true) === '1'
    );
    
    return rest_ensure_response($game_data);
}

function playinmo_record_game_play($request) {
    global $wpdb;
    
    $user_id = get_current_user_id();
    $game_id = $request->get_param('game_id');
    $score = intval($request->get_param('score'));
    $play_time = intval($request->get_param('play_time'));
    $completed = $request->get_param('completed') ? 1 : 0;
    
    $table_name = $wpdb->prefix . 'playinmo_game_plays';
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'user_id' => $user_id,
            'game_id' => $game_id,
            'score' => $score,
            'play_time' => $play_time,
            'completed' => $completed
        ),
        array('%d', '%d', '%d', '%d', '%d')
    );
    
    if ($result) {
        // Update game play count
        $current_plays = intval(get_post_meta($game_id, '_game_plays', true));
        update_post_meta($game_id, '_game_plays', $current_plays + 1);
        
        // Check for achievements
        playinmo_check_achievements($user_id);
        
        return rest_ensure_response(array('success' => true));
    }
    
    return new WP_Error('save_failed', 'Failed to save game play', array('status' => 500));
}

function playinmo_get_leaderboard($request) {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'playinmo_game_plays';
    
    $results = $wpdb->get_results("
        SELECT 
            u.ID as user_id,
            u.display_name as username,
            SUM(gp.score) as total_score,
            COUNT(gp.id) as total_plays
        FROM {$wpdb->users} u
        INNER JOIN $table_name gp ON u.ID = gp.user_id
        GROUP BY u.ID
        ORDER BY total_score DESC
        LIMIT 100
    ");
    
    $leaderboard = array();
    $rank = 1;
    
    foreach ($results as $result) {
        $leaderboard[] = array(
            'rank' => $rank++,
            'user_id' => $result->user_id,
            'username' => $result->username,
            'score' => intval($result->total_score),
            'plays' => intval($result->total_plays),
            'avatar' => get_avatar_url($result->user_id, array('size' => 40))
        );
    }
    
    return rest_ensure_response($leaderboard);
}

function playinmo_get_achievements($request) {
    $user_id = get_current_user_id();
    
    $achievements = get_posts(array(
        'post_type' => 'achievement',
        'post_status' => 'publish',
        'posts_per_page' => -1
    ));
    
    global $wpdb;
    $table_name = $wpdb->prefix . 'playinmo_user_achievements';
    
    $user_achievements = $wpdb->get_col($wpdb->prepare("
        SELECT achievement_id FROM $table_name WHERE user_id = %d
    ", $user_id));
    
    $achievements_data = array();
    
    foreach ($achievements as $achievement) {
        $achievements_data[] = array(
            'id' => $achievement->ID,
            'title' => $achievement->post_title,
            'description' => $achievement->post_content,
            'icon' => get_post_meta($achievement->ID, '_achievement_icon', true),
            'points' => intval(get_post_meta($achievement->ID, '_achievement_points', true)),
            'unlocked' => in_array($achievement->ID, $user_achievements)
        );
    }
    
    return rest_ensure_response($achievements_data);
}

function playinmo_get_chat_messages($request) {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'playinmo_chat_messages';
    $limit = intval($request->get_param('limit')) ?: 50;
    
    $messages = $wpdb->get_results($wpdb->prepare("
        SELECT 
            cm.message,
            cm.sent_at,
            u.display_name as username,
            u.ID as user_id
        FROM $table_name cm
        INNER JOIN {$wpdb->users} u ON cm.user_id = u.ID
        ORDER BY cm.sent_at DESC
        LIMIT %d
    ", $limit));
    
    $messages_data = array();
    
    foreach (array_reverse($messages) as $message) {
        $messages_data[] = array(
            'username' => $message->username,
            'message' => $message->message,
            'timestamp' => $message->sent_at,
            'avatar' => get_avatar_url($message->user_id, array('size' => 32))
        );
    }
    
    return rest_ensure_response($messages_data);
}

function playinmo_send_chat_message($request) {
    global $wpdb;
    
    $user_id = get_current_user_id();
    $message = sanitize_text_field($request->get_param('message'));
    
    if (empty($message)) {
        return new WP_Error('empty_message', 'Message cannot be empty', array('status' => 400));
    }
    
    if (strlen($message) > 500) {
        return new WP_Error('message_too_long', 'Message is too long', array('status' => 400));
    }
    
    $table_name = $wpdb->prefix . 'playinmo_chat_messages';
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'user_id' => $user_id,
            'message' => $message
        ),
        array('%d', '%s')
    );
    
    if ($result) {
        return rest_ensure_response(array('success' => true));
    }
    
    return new WP_Error('save_failed', 'Failed to send message', array('status' => 500));
}

function playinmo_check_achievements($user_id) {
    global $wpdb;
    
    $plays_table = $wpdb->prefix . 'playinmo_game_plays';
    $achievements_table = $wpdb->prefix . 'playinmo_user_achievements';
    $chat_table = $wpdb->prefix . 'playinmo_chat_messages';
    
    // Get user stats
    $total_plays = $wpdb->get_var($wpdb->prepare("
        SELECT COUNT(*) FROM $plays_table WHERE user_id = %d
    ", $user_id));
    
    $total_score = $wpdb->get_var($wpdb->prepare("
        SELECT SUM(score) FROM $plays_table WHERE user_id = %d
    ", $user_id));
    
    $chat_messages = $wpdb->get_var($wpdb->prepare("
        SELECT COUNT(*) FROM $chat_table WHERE user_id = %d
    ", $user_id));
    
    // Check achievements
    $achievements_to_unlock = array();
    
    // First game
    if ($total_plays >= 1) {
        $achievements_to_unlock[] = 1; // Assuming achievement ID 1 is "First Game"
    }
    
    // Game master
    if ($total_plays >= 100) {
        $achievements_to_unlock[] = 2; // Assuming achievement ID 2 is "Game Master"
    }
    
    // Social player
    if ($chat_messages >= 50) {
        $achievements_to_unlock[] = 4; // Assuming achievement ID 4 is "Social Player"
    }
    
    // Unlock achievements
    foreach ($achievements_to_unlock as $achievement_id) {
        $exists = $wpdb->get_var($wpdb->prepare("
            SELECT id FROM $achievements_table 
            WHERE user_id = %d AND achievement_id = %d
        ", $user_id, $achievement_id));
        
        if (!$exists) {
            $wpdb->insert(
                $achievements_table,
                array(
                    'user_id' => $user_id,
                    'achievement_id' => $achievement_id
                ),
                array('%d', '%d')
            );
        }
    }
}

// AdSense optimization
function playinmo_add_adsense_head() {
    ?>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>
    <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXX">
    <?php
}
add_action('wp_head', 'playinmo_add_adsense_head');

// SEO optimization
function playinmo_add_seo_meta() {
    if (is_singular('game')) {
        global $post;
        $game_description = get_post_meta($post->ID, '_game_instructions', true);
        $game_category = wp_get_post_terms($post->ID, 'game_category', array('fields' => 'names'));
        
        echo '<meta name="description" content="' . esc_attr($game_description) . '">' . "\n";
        echo '<meta name="keywords" content="' . esc_attr(implode(', ', $game_category)) . ', free online games, browser games">' . "\n";
        echo '<meta property="og:type" content="game">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($post->post_title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($game_description) . '">' . "\n";
        echo '<meta property="og:image" content="' . esc_attr(get_the_post_thumbnail_url($post->ID, 'game-featured')) . '">' . "\n";
    }
}
add_action('wp_head', 'playinmo_add_seo_meta');

// Cleanup function
function playinmo_cleanup() {
    global $wpdb;
    
    // Clean up old chat messages (keep only last 1000)
    $table_name = $wpdb->prefix . 'playinmo_chat_messages';
    $wpdb->query("
        DELETE FROM $table_name 
        WHERE id NOT IN (
            SELECT id FROM (
                SELECT id FROM $table_name 
                ORDER BY sent_at DESC 
                LIMIT 1000
            ) as t
        )
    ");
}

// Schedule cleanup
if (!wp_next_scheduled('playinmo_daily_cleanup')) {
    wp_schedule_event(time(), 'daily', 'playinmo_daily_cleanup');
}
add_action('playinmo_daily_cleanup', 'playinmo_cleanup');

?>