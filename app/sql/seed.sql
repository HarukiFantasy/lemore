-- SEED DATA FOR ALL TABLES (except user_profiles)
-- profile_id values to use everywhere: '9347748f-8c23-4fae-89a1-a8a3dde71b9d', 'f2e07533-64f9-4d39-8aaf-c018d52ebace'

-- 1. categories
INSERT INTO
    categories (name)
VALUES ('Electronics'),
    ('Clothing'),
    ('Books'),
    ('Home'),
    ('Sports'),
    ('Beauty'),
    ('Toys'),
    ('Automotive'),
    ('Health'),
    ('Other');

-- 2. local_businesses
INSERT INTO
    local_businesses (
        name,
        type,
        location,
        price_range,
        tags,
        address,
        website,
        description
    )
VALUES (
        'Cafe Aroma',
        'Cafe',
        'Bangkok',
        '$$',
        '["coffee","wifi"]',
        '123 Main St',
        'http://cafearoma.com',
        'Cozy cafe with great coffee'
    ),
    (
        'Book Haven',
        'Bookstore',
        'Bangkok',
        '$',
        '["books","reading"]',
        '456 Book Rd',
        'http://bookhaven.com',
        'Wide selection of books'
    ),
    (
        'Fit Gym',
        'Gym',
        'Bangkok',
        '$$$',
        '["fitness","gym"]',
        '789 Fit Ave',
        'http://fitgym.com',
        'Modern gym facilities'
    ),
    (
        'Green Grocer',
        'Grocery',
        'Bangkok',
        '$$',
        '["organic","fresh"]',
        '321 Green St',
        'http://greengrocer.com',
        'Organic produce'
    ),
    (
        'Tech World',
        'Electronics',
        'Bangkok',
        '$$$',
        '["tech","gadgets"]',
        '654 Tech Rd',
        'http://techworld.com',
        'Latest electronics'
    ),
    (
        'Toy Planet',
        'Toy Store',
        'Bangkok',
        '$$',
        '["toys","kids"]',
        '987 Toy Ave',
        'http://toyplanet.com',
        'Toys for all ages'
    ),
    (
        'Beauty Bliss',
        'Salon',
        'Bangkok',
        '$$',
        '["beauty","salon"]',
        '159 Beauty St',
        'http://beautybliss.com',
        'Beauty treatments'
    ),
    (
        'AutoFix',
        'Auto Repair',
        'Bangkok',
        '$$$',
        '["auto","repair"]',
        '753 Auto Rd',
        'http://autofix.com',
        'Car repair services'
    ),
    (
        'Health Hub',
        'Clinic',
        'Bangkok',
        '$$$',
        '["health","clinic"]',
        '852 Health Ave',
        'http://healthhub.com',
        'Health services'
    ),
    (
        'Home Comforts',
        'Furniture',
        'Bangkok',
        '$$$',
        '["home","furniture"]',
        '951 Home St',
        'http://homecomforts.com',
        'Furniture and decor'
    );

-- 3. let_go_buddy_sessions
INSERT INTO
    let_go_buddy_sessions (user_id, situation)
VALUES (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Moving'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Downsizing'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Spring Cleaning'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Digital Declutter'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Minimalism'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Inheritance'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Relationship Change'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Other'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Moving'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Downsizing'
    );

-- 4. products
INSERT INTO
    products (
        seller_id,
        title,
        price,
        category_id,
        condition,
        location,
        description
    )
VALUES (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'iPhone 12',
        20000,
        1,
        'Excellent',
        'Bangkok',
        'Gently used iPhone 12'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Yoga Mat',
        500,
        5,
        'Good',
        'Bangkok',
        'Non-slip yoga mat'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Book Set',
        800,
        3,
        'Like New',
        'Bangkok',
        'Classic literature set'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Sofa',
        7000,
        4,
        'Fair',
        'Bangkok',
        'Comfortable 3-seater sofa'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Bicycle',
        3500,
        5,
        'Good',
        'Bangkok',
        'Mountain bike'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Hair Dryer',
        1200,
        6,
        'Excellent',
        'Bangkok',
        'Powerful hair dryer'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Toy Car',
        300,
        7,
        'Like New',
        'Bangkok',
        'Remote control car'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Car Seat',
        1500,
        8,
        'Good',
        'Bangkok',
        'Child car seat'
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Blood Pressure Monitor',
        900,
        9,
        'Excellent',
        'Bangkok',
        'Digital monitor'
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Lamp',
        400,
        4,
        'Good',
        'Bangkok',
        'Desk lamp'
    );

-- 5. product_images (composite PK)
INSERT INTO
    product_images (
        product_id,
        image_url,
        image_order,
        is_primary
    )
VALUES (
        1,
        'http://img.com/iphone.jpg',
        0,
        true
    ),
    (
        2,
        'http://img.com/yogamat.jpg',
        0,
        true
    ),
    (
        3,
        'http://img.com/bookset.jpg',
        0,
        true
    ),
    (
        4,
        'http://img.com/sofa.jpg',
        0,
        true
    ),
    (
        5,
        'http://img.com/bike.jpg',
        0,
        true
    ),
    (
        6,
        'http://img.com/hairdryer.jpg',
        0,
        true
    ),
    (
        7,
        'http://img.com/toycar.jpg',
        0,
        true
    ),
    (
        8,
        'http://img.com/carseat.jpg',
        0,
        true
    ),
    (
        9,
        'http://img.com/bpmonitor.jpg',
        0,
        true
    ),
    (
        10,
        'http://img.com/lamp.jpg',
        0,
        true
    ),
    (
        1,
        'http://img.com/iphone2.jpg',
        1,
        false
    );

-- 6. product_likes (composite PK)
INSERT INTO
    product_likes (product_id, user_id)
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        6,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        7,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        8,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        9,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        10,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    );

-- 7. product_views
INSERT INTO
    product_views (product_id, user_id)
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        6,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        7,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        8,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        9,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        10,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    );

-- 8. give_and_glow_reviews
INSERT INTO
    give_and_glow_reviews (
        product_id,
        giver_id,
        receiver_id,
        category,
        rating,
        review,
        timestamp,
        location,
        tags
    )
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Electronics',
        5,
        'Great product!',
        '2024-06-01T10:00:00Z',
        'Bangkok',
        '["fast","friendly"]'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Sports',
        4,
        'Good deal.',
        '2024-06-02T11:00:00Z',
        'Bangkok',
        '["clean","quick"]'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Books',
        5,
        'Loved it!',
        '2024-06-03T12:00:00Z',
        'Bangkok',
        '["book","classic"]'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Home',
        3,
        'Okay.',
        '2024-06-04T13:00:00Z',
        'Bangkok',
        '["sofa"]'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Sports',
        4,
        'Nice bike.',
        '2024-06-05T14:00:00Z',
        'Bangkok',
        '["bike"]'
    ),
    (
        6,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Beauty',
        5,
        'Works well.',
        '2024-06-06T15:00:00Z',
        'Bangkok',
        '["hair"]'
    ),
    (
        7,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Toys',
        5,
        'Fun toy.',
        '2024-06-07T16:00:00Z',
        'Bangkok',
        '["toy"]'
    ),
    (
        8,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Automotive',
        4,
        'Safe seat.',
        '2024-06-08T17:00:00Z',
        'Bangkok',
        '["car"]'
    ),
    (
        9,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Health',
        5,
        'Very useful.',
        '2024-06-09T18:00:00Z',
        'Bangkok',
        '["health"]'
    ),
    (
        10,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Home',
        4,
        'Bright lamp.',
        '2024-06-10T19:00:00Z',
        'Bangkok',
        '["lamp"]'
    );

-- 9. item_analyses
INSERT INTO
    item_analyses (
        session_id,
        item_name,
        item_category,
        item_condition,
        recommendation,
        ai_suggestion,
        emotional_score,
        environmental_impact,
        co2_impact,
        landfill_impact,
        is_recyclable,
        original_price,
        current_value,
        ai_listing_price,
        maintenance_cost,
        space_value,
        ai_listing_title,
        ai_listing_description,
        ai_listing_location,
        images
    )
VALUES (
        1,
        'Old Laptop',
        'Electronics',
        'Good',
        'Sell',
        'Consider selling online',
        7,
        'Medium',
        12.5,
        'Low',
        true,
        25000,
        8000,
        9000,
        100,
        50,
        'Used Laptop for Sale',
        'A reliable used laptop',
        'Bangkok',
        '["img1.jpg"]'
    ),
    (
        2,
        'Yoga Mat',
        'Sports',
        'Fair',
        'Donate',
        'Donate to local gym',
        5,
        'Low',
        2.0,
        'Minimal',
        true,
        1000,
        200,
        0,
        0,
        0,
        'Yoga Mat',
        'Still usable',
        'Bangkok',
        '["img2.jpg"]'
    ),
    (
        3,
        'Books',
        'Books',
        'Excellent',
        'Keep',
        'Keep for future reading',
        8,
        'Low',
        0.5,
        'None',
        true,
        500,
        500,
        0,
        0,
        0,
        'Book Collection',
        'Classic books',
        'Bangkok',
        '["img3.jpg"]'
    ),
    (
        4,
        'Sofa',
        'Home',
        'Fair',
        'Recycle',
        'Recycle at local center',
        4,
        'High',
        30.0,
        'High',
        false,
        10000,
        1000,
        0,
        0,
        0,
        'Old Sofa',
        'Worn but usable',
        'Bangkok',
        '["img4.jpg"]'
    ),
    (
        5,
        'Bike',
        'Sports',
        'Good',
        'Sell',
        'Sell to neighbor',
        6,
        'Medium',
        8.0,
        'Low',
        true,
        5000,
        2000,
        2500,
        50,
        20,
        'Mountain Bike',
        'Good for city rides',
        'Bangkok',
        '["img5.jpg"]'
    ),
    (
        6,
        'Hair Dryer',
        'Beauty',
        'Excellent',
        'Keep',
        'Keep for personal use',
        9,
        'Low',
        0.2,
        'None',
        true,
        1500,
        1500,
        0,
        0,
        0,
        'Hair Dryer',
        'Works perfectly',
        'Bangkok',
        '["img6.jpg"]'
    ),
    (
        7,
        'Toy Car',
        'Toys',
        'Like New',
        'Donate',
        'Donate to charity',
        8,
        'Low',
        0.1,
        'None',
        true,
        400,
        300,
        0,
        0,
        0,
        'Toy Car',
        'Fun for kids',
        'Bangkok',
        '["img7.jpg"]'
    ),
    (
        8,
        'Car Seat',
        'Automotive',
        'Good',
        'Sell',
        'Sell online',
        7,
        'Medium',
        5.0,
        'Low',
        true,
        2000,
        800,
        1000,
        20,
        10,
        'Car Seat',
        'Safe and clean',
        'Bangkok',
        '["img8.jpg"]'
    ),
    (
        9,
        'BP Monitor',
        'Health',
        'Excellent',
        'Keep',
        'Keep for health',
        10,
        'Low',
        0.3,
        'None',
        true,
        1200,
        1200,
        0,
        0,
        0,
        'BP Monitor',
        'Accurate readings',
        'Bangkok',
        '["img9.jpg"]'
    ),
    (
        10,
        'Lamp',
        'Home',
        'Good',
        'Repair',
        'Repair and reuse',
        6,
        'Low',
        0.4,
        'Minimal',
        true,
        600,
        200,
        0,
        50,
        10,
        'Desk Lamp',
        'Needs minor repair',
        'Bangkok',
        '["img10.jpg"]'
    );

-- 10. local_business_reviews (composite PK)
INSERT INTO
    local_business_reviews (
        business_id,
        rating,
        author,
        author_avatar,
        timestamp,
        tags,
        content
    )
VALUES (
        1,
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'http://img.com/avatar1.jpg',
        '2024-06-01T10:00:00Z',
        '["friendly"]',
        'Great coffee!'
    ),
    (
        2,
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'http://img.com/avatar2.jpg',
        '2024-06-02T11:00:00Z',
        '["books"]',
        'Nice selection.'
    ),
    (
        3,
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'http://img.com/avatar1.jpg',
        '2024-06-03T12:00:00Z',
        '["gym"]',
        'Clean gym.'
    ),
    (
        4,
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'http://img.com/avatar2.jpg',
        '2024-06-04T13:00:00Z',
        '["organic"]',
        'Fresh produce.'
    ),
    (
        5,
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'http://img.com/avatar1.jpg',
        '2024-06-05T14:00:00Z',
        '["tech"]',
        'Cool gadgets.'
    ),
    (
        6,
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'http://img.com/avatar2.jpg',
        '2024-06-06T15:00:00Z',
        '["toys"]',
        'Fun toys.'
    ),
    (
        7,
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'http://img.com/avatar1.jpg',
        '2024-06-07T16:00:00Z',
        '["beauty"]',
        'Great salon.'
    ),
    (
        8,
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'http://img.com/avatar2.jpg',
        '2024-06-08T17:00:00Z',
        '["auto"]',
        'Quick repair.'
    ),
    (
        9,
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'http://img.com/avatar1.jpg',
        '2024-06-09T18:00:00Z',
        '["health"]',
        'Helpful staff.'
    ),
    (
        10,
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'http://img.com/avatar2.jpg',
        '2024-06-10T19:00:00Z',
        '["home"]',
        'Nice furniture.'
    );

-- 11. local_tip_posts
INSERT INTO
    local_tip_posts (
        title,
        content,
        category,
        location,
        author
    )
VALUES (
        'Visa Tips',
        'How to get a visa in Thailand',
        'Visa',
        'Bangkok',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Banking 101',
        'Opening a bank account',
        'Bank',
        'Bangkok',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Tax Guide',
        'Filing taxes as an expat',
        'Tax',
        'Bangkok',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Health Insurance',
        'Best health insurance options',
        'Health',
        'Bangkok',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Education Tips',
        'Finding schools in Bangkok',
        'Education',
        'Bangkok',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Getting Around',
        'Public transport tips',
        'Transportation',
        'Bangkok',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Other Tips',
        'Miscellaneous tips',
        'Other',
        'Bangkok',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Visa Renewal',
        'Renewing your visa',
        'Visa',
        'Bangkok',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Bank Transfers',
        'Transferring money',
        'Bank',
        'Bangkok',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Tax Deductions',
        'What you can deduct',
        'Tax',
        'Bangkok',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    );

-- 12. local_tip_comments
INSERT INTO
    local_tip_comments (post_id, author, content)
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Very helpful!'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Thanks for sharing.'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Great info.'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Useful tips.'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Appreciate it!'
    ),
    (
        6,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Good to know.'
    ),
    (
        7,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Thanks!'
    ),
    (
        8,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Very clear.'
    ),
    (
        9,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Super helpful.'
    ),
    (
        10,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Great advice.'
    );

-- 13. local_tip_comment_likes (composite PK)
INSERT INTO
    local_tip_comment_likes (comment_id, user_id)
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        6,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        7,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        8,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        9,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        10,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    );

-- 14. local_tip_post_likes (composite PK)
INSERT INTO
    local_tip_post_likes (post_id, user_id)
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        6,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        7,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        8,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        9,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        10,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    );

-- 15. message_participants (composite PK)
INSERT INTO
    message_participants (conversation_id, profile_id)
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        1,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        2,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        3,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        4,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        5,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    );

-- 16. user_conversations
INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

INSERT INTO user_conversations DEFAULT VALUES;

-- 17. user_messages
INSERT INTO
    user_messages (
        conversation_id,
        sender_id,
        receiver_id,
        content
    )
VALUES (
        1,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Hello!'
    ),
    (
        2,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Hi!'
    ),
    (
        3,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'How are you?'
    ),
    (
        4,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Good, thanks!'
    ),
    (
        5,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'What are you up to?'
    ),
    (
        6,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Just working.'
    ),
    (
        7,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Same here.'
    ),
    (
        8,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'Let''s meet up.'
    ),
    (
        9,
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        'Sure!'
    ),
    (
        10,
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'See you soon.'
    );

-- 18. user_notifications
INSERT INTO
    user_notifications (type, sender_id, receiver_id)
VALUES (
        'Message',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Like',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Reply',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Mention',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Message',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Like',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Reply',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Mention',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    ),
    (
        'Message',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace'
    ),
    (
        'Like',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d'
    );

-- 19. user_reviews
INSERT INTO
    user_reviews (
        reviewer_id,
        reviewee_id,
        rating
    )
VALUES (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        5
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        4
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        5
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        4
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        5
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        4
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        5
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        4
    ),
    (
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        5
    ),
    (
        'f2e07533-64f9-4d39-8aaf-c018d52ebace',
        '9347748f-8c23-4fae-89a1-a8a3dde71b9d',
        4
    );