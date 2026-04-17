-- ============================================================
-- Chico Water — Settings Table Seed
-- Run this AFTER supabase-schema.sql
-- ============================================================

insert into settings (key, value, label, description, category, type, is_public) values
-- BUSINESS
('business_name',        'Chico Water Limited Company',   'Business Name',       'Full legal company name',                    'Business', 'text',    true),
('business_tagline',     'Inspire Natural Mineral Water', 'Tagline',             'Shown on homepage hero',                     'Business', 'text',    true),
('business_tagline_2',   'Delivering purity to homes, businesses, and communities across Ghana.', 'Footer Description', 'Shown in footer', 'Business', 'textarea', true),
('business_email',       'orders@chicowater.com',         'Business Email',      'Main contact email',                         'Business', 'email',   true),
('business_phone',       '+233200000000',                 'Business Phone',      'Primary phone number',                       'Business', 'phone',   true),
('business_whatsapp',    '233200000000',                  'WhatsApp Number',     'Without + sign (used for wa.me links)',       'Business', 'phone',   true),
('business_address',     'Industrial Area, Accra, Ghana', 'Physical Address',    'Warehouse or office address',                'Business', 'text',    true),
('business_website',     'https://chicowater.com',        'Website URL',         'Public-facing website URL',                  'Business', 'url',     true),
('business_founded',     '2008',                          'Year Founded',        'Year the company was established',           'Business', 'number',  true),
('business_logo_url',    '',                              'Logo URL',            'URL to your logo image',                     'Business', 'url',     true),
('business_primary_color','#0077B6',                      'Brand Primary Color', 'Main brand color',                           'Business', 'color',   true),

-- DELIVERY
('delivery_fee_default',    '15',    'Default Delivery Fee (GH₵)',   'Flat fee when no region fee is set',        'Delivery', 'number', true),
('delivery_fee_accra',      '15',    'Delivery Fee — Greater Accra', '',                                          'Delivery', 'number', true),
('delivery_fee_ashanti',    '25',    'Delivery Fee — Ashanti',       '',                                          'Delivery', 'number', true),
('delivery_fee_western',    '35',    'Delivery Fee — Western',       '',                                          'Delivery', 'number', true),
('delivery_fee_eastern',    '30',    'Delivery Fee — Eastern',       '',                                          'Delivery', 'number', true),
('delivery_fee_central',    '30',    'Delivery Fee — Central',       '',                                          'Delivery', 'number', true),
('delivery_fee_volta',      '35',    'Delivery Fee — Volta',         '',                                          'Delivery', 'number', true),
('delivery_fee_northern',   '50',    'Delivery Fee — Northern',      '',                                          'Delivery', 'number', true),
('delivery_fee_upper_east', '60',    'Delivery Fee — Upper East',    '',                                          'Delivery', 'number', true),
('delivery_fee_upper_west', '60',    'Delivery Fee — Upper West',    '',                                          'Delivery', 'number', true),
('delivery_fee_bono',       '40',    'Delivery Fee — Brong-Ahafo',   '',                                          'Delivery', 'number', true),
('delivery_same_day_cutoff','12:00', 'Same-Day Cutoff Time',         'Orders before this time get same-day',      'Delivery', 'time',   true),
('delivery_free_threshold', '500',   'Free Delivery Above (GH₵)',    'Set 0 to disable free delivery',            'Delivery', 'number', true),
('delivery_hours_open',     '7:00 AM','Delivery Opens',              'Time deliveries start each day',            'Delivery', 'time',   true),
('delivery_hours_close',    '6:00 PM','Delivery Closes',             'Time deliveries stop each day',             'Delivery', 'time',   true),
('delivery_sunday_close',   '2:00 PM','Sunday Closing Time',         'Earlier close on Sundays',                  'Delivery', 'time',   true),
('delivery_days',           'Mon,Tue,Wed,Thu,Fri,Sat', 'Delivery Days', 'Comma-separated delivery days',          'Delivery', 'text',   true),

-- ORDERS
('order_number_prefix',        'CW',    'Order Number Prefix',        'Prefix for all order IDs',                  'Orders', 'text',    true),
('order_auto_confirm',         'false', 'Auto-Confirm Orders',        'Skip pending, go straight to confirmed',    'Orders', 'boolean', false),
('order_allow_guest',          'true',  'Allow Guest Checkout',       'Order without creating an account',         'Orders', 'boolean', true),
('order_require_phone',        'true',  'Require Phone Number',       'Make phone mandatory at checkout',          'Orders', 'boolean', true),
('order_cancellation_window',  '30',    'Cancellation Window (mins)', 'How long customer can cancel after order',  'Orders', 'number',  true),
('order_notes_enabled',        'true',  'Enable Delivery Notes',      'Show delivery notes field at checkout',     'Orders', 'boolean', true),
('order_preferred_date_enabled','true', 'Enable Preferred Date',      'Let customers pick preferred delivery date','Orders', 'boolean', true),
('order_receipt_footer',       'Thank you for choosing Chico Water. For support call us.', 'Receipt Footer', 'Text at bottom of receipts', 'Orders', 'textarea', false),

-- PAYMENTS
('payment_momo_enabled',    'true',  'Enable Mobile Money',      'Show MoMo at checkout',                     'Payments', 'boolean', true),
('payment_card_enabled',    'true',  'Enable Card Payment',      'Show card at checkout',                     'Payments', 'boolean', true),
('payment_cash_enabled',    'true',  'Enable Cash on Delivery',  'Show cash at checkout',                     'Payments', 'boolean', true),
('payment_momo_networks',   'mtn,vodafone,airteltigo', 'MoMo Networks', 'Comma-separated active networks',   'Payments', 'text',    true),
('payment_paystack_key',    '',      'Paystack Public Key',      'pk_live_... or pk_test_...',                'Payments', 'text',    false),
('payment_paystack_secret', '',      'Paystack Secret Key',      'Never expose publicly',                     'Payments', 'text',    false),
('payment_currency',        'GHS',   'Currency Code',            'ISO currency code',                         'Payments', 'text',    true),
('payment_currency_symbol', 'GH₵',  'Currency Symbol',          'Symbol shown on prices',                    'Payments', 'text',    true),

-- NOTIFICATIONS
('notif_whatsapp_enabled',    'false', 'WhatsApp Notifications',     'Ping salesperson on new order',             'Notifications', 'boolean', false),
('notif_whatsapp_api_token',  '',      'WhatsApp API Token',         'WhatsApp Business Cloud API token',         'Notifications', 'text',    false),
('notif_whatsapp_phone_id',   '',      'WhatsApp Phone ID',          'WhatsApp Business phone number ID',         'Notifications', 'text',    false),
('notif_sms_enabled',         'false', 'SMS Notifications',          'SMS customer on order updates',             'Notifications', 'boolean', false),
('notif_sms_api_key',         '',      'SMSOnlineGH API Key',        'Your SMSOnlineGH API key',                  'Notifications', 'text',    false),
('notif_sms_sender_id',       'CHICOWATER', 'SMS Sender ID',         'Max 11 chars',                              'Notifications', 'text',    false),
('notif_low_stock_alert',     'true',  'Low Stock Alerts',           'Notify admin when stock is low',            'Notifications', 'boolean', false),
('notif_low_stock_threshold', '100',   'Low Stock Threshold',        'Alert when stock falls below this',         'Notifications', 'number',  false),

-- INVENTORY
('inventory_auto_deduct',       'true',  'Auto-Deduct on Accept',    'Reduce stock when order is accepted',       'Inventory', 'boolean', false),
('inventory_track_enabled',     'true',  'Enable Inventory Tracking','Track stock levels',                        'Inventory', 'boolean', false),
('inventory_low_threshold',     '100',   'Low Stock Threshold',      'Products below this trigger alert',         'Inventory', 'number',  false),
('inventory_hide_out_of_stock', 'false', 'Hide Out-of-Stock',        'Remove 0-stock products from catalogue',    'Inventory', 'boolean', true),

-- ACCOUNTS
('accounts_registration_open',   'true',  'Open Registration',       'Allow new customer accounts',               'Accounts', 'boolean', true),
('accounts_loyalty_enabled',     'false', 'Loyalty Points',          'Enable loyalty points system',              'Accounts', 'boolean', true),
('accounts_points_per_cedi',     '1',     'Points per GH₵ Spent',   'Loyalty points earned per cedi',            'Accounts', 'number',  true),
('accounts_points_redeem_rate',  '100',   'Points for GH₵1 Off',    'How many points = GH₵1 discount',          'Accounts', 'number',  true),
('accounts_subscription_enabled','false', 'Recurring Orders',        'Allow weekly/monthly repeat orders',        'Accounts', 'boolean', true),

-- CONTENT
('home_hero_title',      'Inspire Natural Mineral Water',  'Hero Title',          'Big heading on homepage',                   'Content', 'text',    true),
('home_hero_subtitle',   'Bottled water, sachet water, and packaging solutions — for households, businesses, and wholesale buyers across Ghana.', 'Hero Subtitle', 'Sub-text under hero', 'Content', 'textarea', true),
('home_announcement',    '',      'Announcement Banner',  'Shows at top of site when enabled',         'Content', 'text',    true),
('home_announcement_on', 'false', 'Show Announcement',    'Toggle the announcement banner',            'Content', 'boolean', true),
('home_stats_orders',    '50000', 'Stat — Orders',        'Orders count on homepage',                  'Content', 'number',  true),
('home_stats_customers', '12000', 'Stat — Customers',     'Customers count on homepage',               'Content', 'number',  true),
('home_stats_regions',   '16',    'Stat — Regions',       'Regions count on homepage',                 'Content', 'number',  true),
('home_testimonials_on', 'true',  'Show Testimonials',    'Show/hide testimonials section',            'Content', 'boolean', true),

-- SECURITY
('security_jwt_expiry',        '7d', 'JWT Token Expiry',          'How long login sessions last',              'Security', 'text',   false),
('security_max_login_attempts','5',  'Max Login Attempts',        'Lock after this many failed logins',        'Security', 'number', false),
('security_rate_limit_orders', '10', 'Order Rate Limit/hour',     'Max orders a single IP can place per hour', 'Security', 'number', false)

on conflict (key) do update set
  value = excluded.value,
  label = excluded.label,
  updated_at = now();
