-- ============================================================
-- Chico Water — Full Application Settings Table
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists settings (
  key        text primary key,
  value      text not null,
  label      text not null,           -- Human-readable name shown in admin UI
  description text,                   -- Tooltip / explanation
  category   text not null,           -- Groups settings in the UI
  type       text not null default 'text'
             check (type in ('text','number','boolean','select','textarea','color','time','email','phone','url')),
  options    text,                    -- JSON array of options for 'select' type e.g. '["mtn","vodafone"]'
  is_public  boolean default false,   -- true = safe to expose to frontend
  updated_at timestamptz default now()
);

-- ============================================================
-- BUSINESS INFORMATION
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('business_name',        'Chico Water Limited Company',   'Business Name',        'Your company''s full legal name',                       'Business',  'text',    true),
  ('business_tagline',     'Pure water, anywhere in Ghana', 'Tagline',              'Short tagline shown on the homepage hero',              'Business',  'text',    true),
  ('business_email',       'orders@chicowater.com',         'Business Email',       'Main contact email shown on the website',               'Business',  'email',   true),
  ('business_phone',       '+233200000000',                 'Business Phone',       'Primary phone number',                                  'Business',  'phone',   true),
  ('business_whatsapp',    '233200000000',                  'WhatsApp Number',      'Without the + sign (used for wa.me links)',             'Business',  'phone',   true),
  ('business_address',     'Pakyi No.1, Kumasi, Ghana', 'Physical Address',     'Your warehouse or office address',                     'Business',  'text',    true),
  ('business_website',     'https://chicowater.com',        'Website URL',          'Your public-facing website URL',                       'Business',  'url',     true),
  ('business_founded',     '2026',                          'Year Founded',         'Year the company was established',                     'Business',  'number',  true),
  ('business_logo_url',    '',                              'Logo URL',             'URL to your logo image (upload to Supabase Storage)',  'Business',  'url',     true),
  ('business_primary_color','#0077B6',                      'Brand Primary Color',  'Main brand color used across the site',                'Business',  'color',   true),
  ('business_tagline_2',   'Delivering purity to homes, businesses, and communities.', 'Footer Description', 'Short description shown in footer', 'Business', 'textarea', true);

-- ============================================================
-- DELIVERY SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('delivery_fee_default',    '15',    'Default Delivery Fee (GH₵)',    'Flat fee used when no region-specific fee is set',             'Delivery',  'number',  true),
  ('delivery_fee_accra',      '15',    'Delivery Fee — Greater Accra',  'Delivery fee for Greater Accra orders',                        'Delivery',  'number',  true),
  ('delivery_fee_ashanti',    '25',    'Delivery Fee — Ashanti',        'Delivery fee for Ashanti region orders',                       'Delivery',  'number',  true),
  ('delivery_fee_western',    '35',    'Delivery Fee — Western',        '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_eastern',    '30',    'Delivery Fee — Eastern',        '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_central',    '30',    'Delivery Fee — Central',        '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_volta',      '35',    'Delivery Fee — Volta',          '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_northern',   '50',    'Delivery Fee — Northern',       '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_upper_east', '60',    'Delivery Fee — Upper East',     '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_upper_west', '60',    'Delivery Fee — Upper West',     '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_bono',       '40',    'Delivery Fee — Brong-Ahafo',    '',                                                             'Delivery',  'number',  true),
  ('delivery_fee_oti',        '40',    'Delivery Fee — Oti',            '',                                                             'Delivery',  'number',  true),
  ('delivery_same_day_cutoff','12:00', 'Same-Day Delivery Cutoff',      'Orders placed before this time qualify for same-day delivery', 'Delivery',  'time',    true),
  ('delivery_same_day_regions','["Greater Accra"]', 'Same-Day Regions', 'JSON array of regions that offer same-day delivery',          'Delivery',  'textarea',true),
  ('delivery_min_order',      '0',     'Minimum Order Amount (GH₵)',    'Set to 0 to allow any order size',                            'Delivery',  'number',  true),
  ('delivery_free_threshold', '500',   'Free Delivery Above (GH₵)',     'Orders above this amount get free delivery. Set 0 to disable','Delivery',  'number',  true),
  ('delivery_hours_open',     '07:00', 'Delivery Opens',                'Time deliveries start each day',                              'Delivery',  'time',    true),
  ('delivery_hours_close',    '18:00', 'Delivery Closes',               'Time deliveries stop each day',                               'Delivery',  'time',    true),
  ('delivery_days',           'Mon,Tue,Wed,Thu,Fri,Sat', 'Delivery Days', 'Comma-separated list of delivery days',                    'Delivery',  'text',    true),
  ('delivery_sunday_close',   '14:00', 'Sunday Closing Time',           'Earlier close time on Sundays',                              'Delivery',  'time',    true);

-- ============================================================
-- ORDER SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('order_number_prefix',        'CW',    'Order Number Prefix',          'Prefix for all order IDs (e.g. CW-10001)',                    'Orders',    'text',    true),
  ('order_auto_confirm',         'false', 'Auto-Confirm Orders',          'If true, orders skip "pending" and go straight to confirmed', 'Orders',    'boolean', false),
  ('order_allow_guest',          'true',  'Allow Guest Checkout',         'Let customers order without creating an account',            'Orders',    'boolean', true),
  ('order_require_phone',        'true',  'Require Phone Number',         'Make phone number mandatory at checkout',                    'Orders',    'boolean', true),
  ('order_cancellation_window',  '30',    'Cancellation Window (minutes)','How many minutes after placing can a customer cancel',       'Orders',    'number',  true),
  ('order_max_items',            '100',   'Max Items Per Order',          'Maximum quantity of a single product per order',             'Orders',    'number',  false),
  ('order_notes_enabled',        'true',  'Enable Delivery Notes',        'Show the delivery notes field at checkout',                  'Orders',    'boolean', true),
  ('order_preferred_date_enabled','true', 'Enable Preferred Date',        'Let customers pick a preferred delivery date',              'Orders',    'boolean', true),
  ('order_receipt_footer',       'Thank you for choosing Chico Water. For support: orders@chicowater.com', 'Receipt Footer Text', 'Text shown at bottom of all receipts', 'Orders', 'textarea', false);

-- ============================================================
-- PAYMENT SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, options, is_public) values
  ('payment_momo_enabled',    'true',      'Enable Mobile Money',       'Show MoMo as a payment option at checkout',                  'Payments',  'boolean', null,                          true),
  ('payment_card_enabled',    'true',      'Enable Card Payment',       'Show card as a payment option at checkout',                  'Payments',  'boolean', null,                          true),
  ('payment_cash_enabled',    'true',      'Enable Cash on Delivery',   'Show cash as a payment option at checkout',                  'Payments',  'boolean', null,                          true),
  ('payment_default_method',  'momo',      'Default Payment Method',    'Pre-selected method on the payment step',                    'Payments',  'select',  '["momo","card","cash"]',      true),
  ('payment_momo_networks',   'mtn,vodafone,airteltigo', 'MoMo Networks', 'Comma-separated list of active MoMo networks',            'Payments',  'text',    null,                          true),
  ('payment_paystack_key',    '',          'Paystack Public Key',       'Your Paystack public key (pk_live_... or pk_test_...)',       'Payments',  'text',    null,                          false),
  ('payment_paystack_secret', '',          'Paystack Secret Key',       'Never expose this publicly. Used server-side only.',         'Payments',  'text',    null,                          false),
  ('payment_currency',        'GHS',       'Currency Code',             'ISO currency code (GHS = Ghana Cedis)',                      'Payments',  'text',    null,                          true),
  ('payment_currency_symbol', 'GH₵',      'Currency Symbol',           'Symbol displayed on prices throughout the site',             'Payments',  'text',    null,                          true);

-- ============================================================
-- NOTIFICATION SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('notif_whatsapp_enabled',       'true',  'WhatsApp Notifications',        'Send WhatsApp message to salesperson on new order',           'Notifications', 'boolean', false),
  ('notif_whatsapp_api_token',     '',      'WhatsApp API Token',            'WhatsApp Business Cloud API token',                          'Notifications', 'text',    false),
  ('notif_whatsapp_phone_id',      '',      'WhatsApp Phone ID',             'Your WhatsApp Business phone number ID',                     'Notifications', 'text',    false),
  ('notif_sms_enabled',            'true',  'SMS Notifications',             'Send SMS to customer on order confirmation and delivery',    'Notifications', 'boolean', false),
  ('notif_sms_api_key',            '',      'SMSOnlineGH API Key',           'Your SMSOnlineGH API key',                                   'Notifications', 'text',    false),
  ('notif_sms_sender_id',          'CHICOWATER', 'SMS Sender ID',            'Name shown as sender on SMS messages (max 11 chars)',        'Notifications', 'text',    false),
  ('notif_email_enabled',          'false', 'Email Notifications',           'Send email confirmations to customers',                      'Notifications', 'boolean', false),
  ('notif_email_from',             'orders@chicowater.com', 'From Email',    'Email address used to send notifications',                   'Notifications', 'email',   false),
  ('notif_admin_new_order',        'true',  'Notify Admin on New Order',     'Send notification to admin when any order is placed',        'Notifications', 'boolean', false),
  ('notif_low_stock_alert',        'true',  'Low Stock Alerts',              'Notify admin when a product falls below threshold',          'Notifications', 'boolean', false),
  ('notif_low_stock_threshold',    '100',   'Low Stock Threshold',           'Alert when stock falls below this number of units',          'Notifications', 'number',  false),
  ('notif_order_placed_msg',       'Hi {name}, your Chico Water order {order_number} has been received! Total: {total}. Track at chicowater.com/track', 'Order Placed SMS', 'SMS sent to customer when order is placed. Use {name} {order_number} {total}', 'Notifications', 'textarea', false),
  ('notif_order_delivered_msg',    'Hi {name}, your order {order_number} has been delivered. Thank you for choosing Chico Water!', 'Delivered SMS', 'SMS sent when order is marked delivered', 'Notifications', 'textarea', false),
  ('notif_salesperson_msg',        'New order {order_number} — {customer_name} · {items} · {total}. View: {dashboard_url}', 'Salesperson WhatsApp Template', 'Message sent to salesperson on new order', 'Notifications', 'textarea', false);

-- ============================================================
-- INVENTORY SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('inventory_auto_deduct',       'true',  'Auto-Deduct on Order Accept',  'Automatically reduce stock when salesperson accepts an order', 'Inventory', 'boolean', false),
  ('inventory_track_enabled',     'true',  'Enable Inventory Tracking',    'Track stock levels across all products',                     'Inventory', 'boolean', false),
  ('inventory_low_threshold',     '100',   'Default Low Stock Threshold',  'Products below this level trigger a low-stock alert',        'Inventory', 'number',  false),
  ('inventory_hide_out_of_stock', 'false', 'Hide Out-of-Stock Products',   'Remove products with 0 stock from the public catalogue',     'Inventory', 'boolean', true);

-- ============================================================
-- CUSTOMER & ACCOUNT SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('accounts_registration_open',  'true',  'Open Registration',            'Allow new customers to create accounts',                     'Accounts',  'boolean', true),
  ('accounts_loyalty_enabled',    'false', 'Loyalty Points',               'Enable the loyalty points system for customers',             'Accounts',  'boolean', true),
  ('accounts_points_per_cedi',    '1',     'Points Earned per GH₵ Spent',  'How many loyalty points earned per Ghana Cedi spent',       'Accounts',  'number',  true),
  ('accounts_points_redeem_rate', '100',   'Points Needed for GH₵1 Off',   'How many points = GH₵1 discount',                           'Accounts',  'number',  true),
  ('accounts_subscription_enabled','false','Recurring Orders',             'Allow customers to set up weekly/monthly repeat orders',     'Accounts',  'boolean', true),
  ('accounts_require_verification','false','Require Phone Verification',   'Customers must verify phone number via OTP before ordering', 'Accounts',  'boolean', true);

-- ============================================================
-- HOMEPAGE / CONTENT SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('home_hero_title',       'Pure water, anywhere in Ghana.',     'Hero Title',           'Big heading on the homepage hero section',              'Content',   'text',    true),
  ('home_hero_subtitle',    'Bottled water, sachet water, and packaging solutions — for households, businesses, and wholesale buyers.', 'Hero Subtitle', 'Sub-text under hero title', 'Content', 'textarea', true),
  ('home_announcement',     '',                                   'Announcement Banner',  'If set, shows a banner at the top of the site',        'Content',   'text',    true),
  ('home_announcement_on',  'false',                              'Show Announcement',    'Toggle the announcement banner on or off',             'Content',   'boolean', true),
  ('home_stats_orders',     '50',                                 'Stat — Orders',        'Number shown in the homepage stats bar',               'Content',   'number',  true),
  ('home_stats_customers',  '12000',                              'Stat — Customers',     'Number shown in the homepage stats bar',               'Content',   'number',  true),
  ('home_stats_regions',    '16',                                 'Stat — Regions',       'Number shown in the homepage stats bar',               'Content',   'number',  true),
  ('home_testimonials_on',  'true',                               'Show Testimonials',    'Show/hide the customer testimonials section',          'Content',   'boolean', true);

-- ============================================================
-- SECURITY SETTINGS
-- ============================================================
insert into settings (key, value, label, description, category, type, is_public) values
  ('security_jwt_expiry',        '7d',    'JWT Token Expiry',             'How long login sessions last (e.g. 1d, 7d, 30d)',            'Security',  'text',    false),
  ('security_max_login_attempts','5',     'Max Login Attempts',           'Lock account after this many failed logins',                 'Security',  'number',  false),
  ('security_rate_limit_orders', '10',    'Order Rate Limit (per hour)',  'Max orders a single IP can place per hour',                  'Security',  'number',  false),
  ('security_admin_ips',         '',      'Admin IP Whitelist',           'Comma-separated IPs allowed to access admin (leave blank for all)', 'Security', 'text', false);
