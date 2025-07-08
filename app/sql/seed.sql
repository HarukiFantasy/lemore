-- Seed for categories
INSERT INTO
    categories (name)
VALUES ('electronics'),
    ('clothing'),
    ('books'),
    ('home'),
    ('sports'),
    ('beauty'),
    ('toys'),
    ('automotive'),
    ('health'),
    ('other');

-- Seed for local_businesses
INSERT INTO
    local_businesses (
        name,
        type,
        location,
        average_rating,
        total_reviews,
        price_range,
        tags,
        image,
        address,
        website,
        description
    )
VALUES (
        'Cafe Aroma',
        'Cafe',
        'Bangkok',
        4.5,
        120,
        '$$',
        '["coffee","wifi"]',
        'cafe1.png',
        '123 Main St',
        'http://cafearoma.com',
        'Cozy cafe with great coffee'
    ),
    (
        'Book Haven',
        'Bookstore',
        'Bangkok',
        4.8,
        80,
        '$',
        '["books","reading"]',
        'book1.png',
        '456 Book Rd',
        'http://bookhaven.com',
        'Best bookstore in town'
    ),
    (
        'Fit Gym',
        'Gym',
        'Bangkok',
        4.2,
        60,
        '$$',
        '["fitness","gym"]',
        'gym1.png',
        '789 Fit Ave',
        'http://fitgym.com',
        'Modern gym with classes'
    ),
    (
        'Green Grocer',
        'Grocery',
        'Bangkok',
        4.6,
        90,
        '$',
        '["organic","fresh"]',
        'grocery1.png',
        '321 Green St',
        'http://greengrocer.com',
        'Organic grocery store'
    ),
    (
        'Tech World',
        'Electronics',
        'Bangkok',
        4.3,
        70,
        '$$$',
        '["electronics","gadgets"]',
        'tech1.png',
        '654 Tech Rd',
        'http://techworld.com',
        'Latest gadgets and electronics'
    ),
    (
        'Beauty Bliss',
        'Salon',
        'Bangkok',
        4.7,
        50,
        '$$',
        '["beauty","salon"]',
        'salon1.png',
        '987 Beauty Ave',
        'http://beautybliss.com',
        'Top-rated beauty salon'
    ),
    (
        'Toy Planet',
        'Toy Store',
        'Bangkok',
        4.4,
        40,
        '$$',
        '["toys","kids"]',
        'toy1.png',
        '159 Toy St',
        'http://toyplanet.com',
        'Toys for all ages'
    ),
    (
        'Auto Care',
        'Car Service',
        'Bangkok',
        4.1,
        30,
        '$$$',
        '["car","service"]',
        'auto1.png',
        '753 Auto Rd',
        'http://autocare.com',
        'Reliable car service'
    ),
    (
        'Health Hub',
        'Clinic',
        'Bangkok',
        4.9,
        100,
        '$$',
        '["health","clinic"]',
        'clinic1.png',
        '852 Health Ave',
        'http://healthhub.com',
        'Comprehensive health services'
    ),
    (
        'Home Comforts',
        'Furniture',
        'Bangkok',
        4.0,
        20,
        '$$$',
        '["furniture","home"]',
        'furniture1.png',
        '951 Home St',
        'http://homecomforts.com',
        'Quality home furniture'
    );

-- Seed for user_conversations
INSERT INTO
    user_conversations (created_at)
VALUES (now()),
    (now()),
    (now()),
    (now()),
    (now()),
    (now()),
    (now()),
    (now()),
    (now()),
    (now());

-- Seed for let_go_buddy_sessions
INSERT INTO
    let_go_buddy_sessions (
        user_id,
        situation,
        created_at,
        updated_at,
        is_completed
    )
VALUES (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'moving',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'downsizing',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'spring_cleaning',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'digital_declutter',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'minimalism',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'inheritance',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'relationship_change',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'other',
        now(),
        now(),
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'moving',
        now(),
        now(),
        true
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'downsizing',
        now(),
        now(),
        true
    );

-- Seed for products
INSERT INTO
    products (
        seller_id,
        title,
        price,
        currency,
        category_id,
        condition,
        location,
        description,
        tags,
        "isSold",
        price_type,
        stats,
        created_at,
        updated_at
    )
VALUES (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'iPhone 12',
        25000.00,
        'THB',
        1,
        'like_new',
        'Bangkok',
        'Gently used iPhone 12',
        '["phone","apple"]',
        false,
        'fixed',
        '{"views":10,"likes":2}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Yoga Mat',
        500.00,
        'THB',
        5,
        'good',
        'Bangkok',
        'Non-slip yoga mat',
        '["yoga","fitness"]',
        false,
        'fixed',
        '{"views":5,"likes":1}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Bookshelf',
        1200.00,
        'THB',
        4,
        'excellent',
        'Bangkok',
        'Wooden bookshelf',
        '["furniture","books"]',
        false,
        'negotiable',
        '{"views":8,"likes":0}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Running Shoes',
        2000.00,
        'THB',
        5,
        'good',
        'Bangkok',
        'Nike running shoes',
        '["shoes","nike"]',
        false,
        'fixed',
        '{"views":12,"likes":3}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Blender',
        800.00,
        'THB',
        4,
        'like_new',
        'Bangkok',
        'Kitchen blender',
        '["kitchen","appliance"]',
        false,
        'fixed',
        '{"views":6,"likes":1}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Dress',
        700.00,
        'THB',
        2,
        'excellent',
        'Bangkok',
        'Summer dress',
        '["clothing","summer"]',
        false,
        'fixed',
        '{"views":7,"likes":2}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Laptop',
        30000.00,
        'THB',
        1,
        'good',
        'Bangkok',
        'Dell XPS 13',
        '["laptop","dell"]',
        false,
        'fixed',
        '{"views":15,"likes":4}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Toy Car',
        300.00,
        'THB',
        7,
        'like_new',
        'Bangkok',
        'Remote control car',
        '["toy","car"]',
        false,
        'fixed',
        '{"views":3,"likes":0}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Face Cream',
        400.00,
        'THB',
        6,
        'new',
        'Bangkok',
        'Moisturizing face cream',
        '["beauty","cream"]',
        false,
        'fixed',
        '{"views":2,"likes":0}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Car Seat',
        1500.00,
        'THB',
        8,
        'good',
        'Bangkok',
        'Child car seat',
        '["car","child"]',
        false,
        'fixed',
        '{"views":4,"likes":1}',
        now(),
        now()
    );

'3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'iPhone 12',
        25000.00,
        'THB',
        1,
        'like_new',
        'Bangkok',
        'Gently used iPhone 12',
        '["phone","apple"]',
        false,
        'fixed',
        '{"views":10,"likes":2}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Yoga Mat',
        500.00,
        'THB',
        5,
        'good',
        'Bangkok',
        'Non-slip yoga mat',
        '["yoga","fitness"]',
        false,
        'fixed',
        '{"views":5,"likes":1}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Bookshelf',
        1200.00,
        'THB',
        4,
        'excellent',
        'Bangkok',
        'Wooden bookshelf',
        '["furniture","books"]',
        false,
        'negotiable',
        '{"views":8,"likes":0}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Running Shoes',
        2000.00,
        'THB',
        5,
        'good',
        'Bangkok',
        'Nike running shoes',
        '["shoes","nike"]',
        false,
        'fixed',
        '{"views":12,"likes":3}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Blender',
        800.00,
        'THB',
        4,
        'like_new',
        'Bangkok',
        'Kitchen blender',
        '["kitchen","appliance"]',
        false,
        'fixed',
        '{"views":6,"likes":1}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Dress',
        700.00,
        'THB',
        2,
        'excellent',
        'Bangkok',
        'Summer dress',
        '["clothing","summer"]',
        false,
        'fixed',
        '{"views":7,"likes":2}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Laptop',
        30000.00,
        'THB',
        1,
        'good',
        'Bangkok',
        'Dell XPS 13',
        '["laptop","dell"]',
        false,
        'fixed',
        '{"views":15,"likes":4}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Toy Car',
        300.00,
        'THB',
        7,
        'like_new',
        'Bangkok',
        'Remote control car',
        '["toy","car"]',
        false,
        'fixed',
        '{"views":3,"likes":0}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Face Cream',
        400.00,
        'THB',
        6,
        'new',
        'Bangkok',
        'Moisturizing face cream',
        '["beauty","cream"]',
        false,
        'fixed',
        '{"views":2,"likes":0}',
        now(),
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Car Seat',
        1500.00,
        'THB',
        8,
        'good',
        'Bangkok',
        'Child car seat',
        '["car","child"]',
        false,
        'fixed',
        '{"views":4,"likes":1}',
        now(),
        now()
    );

-- Seed for local_tip_posts
INSERT INTO
    local_tip_posts (
        title,
        content,
        category,
        location,
        author,
        stats,
        created_at,
        updated_at
    )
VALUES (
        'Best Coffee Shops in Bangkok',
        'Here are my top picks for coffee in Bangkok...',
        'Other',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":15,"comments":5,"reviews":2}',
        now(),
        now()
    ),
    (
        'Visa Extension Process',
        'Step by step guide for visa extension...',
        'Visa',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":25,"comments":8,"reviews":3}',
        now(),
        now()
    ),
    (
        'Bank Account Opening',
        'How to open a bank account as a foreigner...',
        'Bank',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":12,"comments":3,"reviews":1}',
        now(),
        now()
    ),
    (
        'Tax Filing Guide',
        'Complete guide for filing taxes in Thailand...',
        'Tax',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":8,"comments":2,"reviews":0}',
        now(),
        now()
    ),
    (
        'Healthcare System Overview',
        'Understanding the healthcare system...',
        'Health',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":20,"comments":6,"reviews":4}',
        now(),
        now()
    ),
    (
        'International Schools',
        'Best international schools in Bangkok...',
        'Education',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":18,"comments":4,"reviews":2}',
        now(),
        now()
    ),
    (
        'BTS and MRT Guide',
        'Complete guide to public transportation...',
        'Transportation',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":30,"comments":10,"reviews":5}',
        now(),
        now()
    ),
    (
        'Night Markets Guide',
        'Best night markets to visit...',
        'Other',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":22,"comments":7,"reviews":3}',
        now(),
        now()
    ),
    (
        'Apartment Hunting Tips',
        'How to find the perfect apartment...',
        'Other',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":16,"comments":5,"reviews":2}',
        now(),
        now()
    ),
    (
        'Thai Language Learning',
        'Best resources for learning Thai...',
        'Education',
        'Bangkok',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '{"likes":14,"comments":3,"reviews":1}',
        now(),
        now()
    );

-- Seed for local_tip_comments
INSERT INTO
    local_tip_comments (
        post_id,
        author,
        content,
        likes,
        created_at
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Great recommendations!',
        3,
        now()
    ),
    (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'I love Cafe Aroma too!',
        2,
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Very helpful guide',
        4,
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Thanks for sharing',
        1,
        now()
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'This saved me a lot of time',
        5,
        now()
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Clear and concise',
        2,
        now()
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Excellent overview',
        3,
        now()
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Very informative',
        2,
        now()
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Perfect timing for this guide',
        6,
        now()
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Love the night markets!',
        4,
        now()
    );

-- Seed for local_tip_post_likes (composite primary key)
INSERT INTO
    local_tip_post_likes (post_id, user_id, created_at)
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    );

-- Seed for local_tip_comment_likes (composite primary key)
INSERT INTO
    local_tip_comment_likes (
        comment_id,
        user_id,
        created_at
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    );

-- Seed for local_business_reviews (composite primary key)
INSERT INTO
    local_business_reviews (
        business_id,
        rating,
        author,
        author_avatar,
        timestamp,
        tags,
        created_at
    )
VALUES (
        1,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-15',
        '["coffee","atmosphere"]',
        now()
    ),
    (
        2,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-16',
        '["books","quiet"]',
        now()
    ),
    (
        3,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-17',
        '["gym","equipment"]',
        now()
    ),
    (
        4,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-18',
        '["organic","fresh"]',
        now()
    ),
    (
        5,
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-19',
        '["electronics","expensive"]',
        now()
    ),
    (
        6,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-20',
        '["beauty","service"]',
        now()
    ),
    (
        7,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-21',
        '["toys","kids"]',
        now()
    ),
    (
        8,
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-22',
        '["car","service"]',
        now()
    ),
    (
        9,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-23',
        '["health","professional"]',
        now()
    ),
    (
        10,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'avatar1.png',
        '2024-01-24',
        '["furniture","quality"]',
        now()
    );

-- Seed for message_participants (composite primary key)
INSERT INTO
    message_participants (
        conversation_id,
        profile_id,
        created_at
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    );

-- Seed for user_messages
INSERT INTO
    user_messages (
        conversation_id,
        sender_id,
        receiver_id,
        content,
        message_type,
        media_url,
        seen,
        created_at
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Hello!',
        'text',
        null,
        false,
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'How are you?',
        'text',
        null,
        true,
        now()
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Check this out',
        'image',
        'image1.jpg',
        false,
        now()
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Great product!',
        'text',
        null,
        true,
        now()
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Is it still available?',
        'text',
        null,
        false,
        now()
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Yes, it is!',
        'text',
        null,
        true,
        now()
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Can we meet tomorrow?',
        'text',
        null,
        false,
        now()
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Sure, where?',
        'text',
        null,
        true,
        now()
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Here is the document',
        'file',
        'doc1.pdf',
        false,
        now()
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Thanks!',
        'text',
        null,
        true,
        now()
    );

-- Seed for user_notifications
INSERT INTO
    user_notifications (
        type,
        sender_id,
        receiver_id,
        product_id,
        message_id,
        review_id,
        is_read,
        read_at,
        data,
        created_at
    )
VALUES (
        'message',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        null,
        1,
        null,
        false,
        null,
        '{"message":"New message received"}',
        now()
    ),
    (
        'like',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        1,
        null,
        null,
        false,
        null,
        '{"product":"iPhone 12"}',
        now()
    ),
    (
        'reply',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        null,
        2,
        null,
        true,
        now(),
        '{"message":"Reply to your post"}',
        now()
    ),
    (
        'mention',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        null,
        3,
        null,
        false,
        null,
        '{"post":"Local tip post"}',
        now()
    ),
    (
        'message',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        null,
        4,
        null,
        true,
        now(),
        '{"message":"Product inquiry"}',
        now()
    ),
    (
        'like',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        2,
        null,
        null,
        false,
        null,
        '{"product":"Yoga Mat"}',
        now()
    ),
    (
        'reply',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        null,
        5,
        null,
        false,
        null,
        '{"message":"Comment reply"}',
        now()
    ),
    (
        'mention',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        null,
        6,
        null,
        true,
        now(),
        '{"post":"Community post"}',
        now()
    ),
    (
        'message',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        null,
        7,
        null,
        false,
        null,
        '{"message":"Meeting request"}',
        now()
    ),
    (
        'like',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        3,
        null,
        null,
        true,
        now(),
        '{"product":"Bookshelf"}',
        now()
    );

-- Seed for user_reviews
INSERT INTO
    user_reviews (
        reviewer_id,
        reviewee_id,
        rating,
        created_at
    )
VALUES (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        3,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        3,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5,
        now()
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4,
        now()
    );

-- Seed for product_images (composite primary key)
INSERT INTO
    product_images (
        product_id,
        image_url,
        image_order,
        is_primary
    )
VALUES (1, 'iphone1.jpg', 0, true),
    (1, 'iphone2.jpg', 1, false),
    (2, 'yoga1.jpg', 0, true),
    (3, 'bookshelf1.jpg', 0, true),
    (4, 'shoes1.jpg', 0, true),
    (4, 'shoes2.jpg', 1, false),
    (5, 'blender1.jpg', 0, true),
    (6, 'dress1.jpg', 0, true),
    (7, 'laptop1.jpg', 0, true),
    (8, 'toycar1.jpg', 0, true);

-- Seed for product_likes (composite primary key)
INSERT INTO
    product_likes (product_id, user_id)
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634'
    );

-- Seed for product_views
INSERT INTO
    product_views (
        product_id,
        user_id,
        viewed_at
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        now()
    );

-- Seed for give_and_glow_reviews
INSERT INTO
    give_and_glow_reviews (
        product_id,
        giver_id,
        receiver_id,
        category,
        rating,
        review,
        timestamp,
        tags,
        created_at,
        updated_at
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'electronics',
        5,
        'Great condition, fast delivery!',
        '2024-01-15',
        '["fast","good_condition"]',
        now(),
        now()
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'sports',
        4,
        'Perfect for my yoga practice',
        '2024-01-16',
        '["yoga","perfect"]',
        now(),
        now()
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'home',
        5,
        'Beautiful bookshelf, exactly as described',
        '2024-01-17',
        '["beautiful","as_described"]',
        now(),
        now()
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'sports',
        4,
        'Comfortable running shoes',
        '2024-01-18',
        '["comfortable","running"]',
        now(),
        now()
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'home',
        5,
        'Works perfectly, great deal!',
        '2024-01-19',
        '["works_perfect","great_deal"]',
        now(),
        now()
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'clothing',
        4,
        'Beautiful dress, fits perfectly',
        '2024-01-20',
        '["beautiful","fits_perfect"]',
        now(),
        now()
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'electronics',
        5,
        'Excellent laptop, great performance',
        '2024-01-21',
        '["excellent","great_performance"]',
        now(),
        now()
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'toys',
        4,
        'Kids love it, good quality',
        '2024-01-22',
        '["kids_love","good_quality"]',
        now(),
        now()
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'beauty',
        5,
        'Amazing cream, great for skin',
        '2024-01-23',
        '["amazing","great_skin"]',
        now(),
        now()
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'automotive',
        4,
        'Safe and comfortable car seat',
        '2024-01-24',
        '["safe","comfortable"]',
        now(),
        now()
    );

-- Seed for item_analyses
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
        images,
        created_at,
        updated_at
    )
VALUES (
        21,
        'Old Laptop',
        'electronics',
        'fair',
        'sell',
        'This laptop still has some value and can be sold',
        3,
        'medium',
        150.50,
        'High landfill impact',
        false,
        50000.00,
        8000.00,
        7500.00,
        0.00,
        500.00,
        'Used Laptop for Sale',
        'Fair condition laptop, good for basic tasks',
        'Bangkok',
        '["laptop1.jpg"]',
        now(),
        now()
    ),
    (
        22,
        'Books Collection',
        'books',
        'good',
        'donate',
        'Books can be donated to libraries or schools',
        7,
        'low',
        25.00,
        'Low landfill impact',
        true,
        5000.00,
        1000.00,
        800.00,
        0.00,
        200.00,
        'Book Collection Donation',
        'Good condition books, perfect for donation',
        'Bangkok',
        '["books1.jpg"]',
        now(),
        now()
    ),
    (
        23,
        'Yoga Mat',
        'sports',
        'excellent',
        'keep',
        'This item is in great condition and useful',
        8,
        'low',
        10.00,
        'Low landfill impact',
        true,
        1500.00,
        1200.00,
        1000.00,
        0.00,
        100.00,
        'Keep Yoga Mat',
        'Excellent condition, keep for personal use',
        'Bangkok',
        '["yoga1.jpg"]',
        now(),
        now()
    ),
    (
        24,
        'Broken Phone',
        'electronics',
        'poor',
        'recycle',
        'This should be recycled properly',
        2,
        'high',
        200.00,
        'High landfill impact',
        false,
        30000.00,
        0.00,
        0.00,
        0.00,
        0.00,
        'Recycle Broken Phone',
        'Broken phone for proper recycling',
        'Bangkok',
        '["phone1.jpg"]',
        now(),
        now()
    ),
    (
        25,
        'Clothing Items',
        'clothing',
        'good',
        'donate',
        'Clothing can be donated to charity',
        6,
        'low',
        15.00,
        'Low landfill impact',
        true,
        3000.00,
        500.00,
        300.00,
        0.00,
        150.00,
        'Clothing Donation',
        'Good condition clothing for donation',
        'Bangkok',
        '["clothing1.jpg"]',
        now(),
        now()
    ),
    (
        26,
        'Furniture Set',
        'home',
        'excellent',
        'sell',
        'High value furniture should be sold',
        9,
        'medium',
        300.00,
        'Medium landfill impact',
        false,
        50000.00,
        25000.00,
        22000.00,
        0.00,
        2000.00,
        'Furniture Set for Sale',
        'Excellent condition furniture set',
        'Bangkok',
        '["furniture1.jpg"]',
        now(),
        now()
    ),
    (
        27,
        'Kitchen Appliances',
        'home',
        'like_new',
        'sell',
        'New appliances have high resale value',
        8,
        'medium',
        200.00,
        'Medium landfill impact',
        false,
        15000.00,
        12000.00,
        11000.00,
        0.00,
        800.00,
        'Kitchen Appliances Sale',
        'Like new kitchen appliances',
        'Bangkok',
        '["appliance1.jpg"]',
        now(),
        now()
    ),
    (
        28,
        'Toy Collection',
        'toys',
        'good',
        'donate',
        'Toys can bring joy to other children',
        7,
        'low',
        20.00,
        'Low landfill impact',
        true,
        2000.00,
        300.00,
        200.00,
        0.00,
        100.00,
        'Toy Donation',
        'Good condition toys for donation',
        'Bangkok',
        '["toys1.jpg"]',
        now(),
        now()
    ),
    (
        29,
        'Beauty Products',
        'beauty',
        'new',
        'sell',
        'Unused beauty products have good value',
        6,
        'low',
        5.00,
        'Low landfill impact',
        true,
        1000.00,
        800.00,
        700.00,
        0.00,
        50.00,
        'Beauty Products Sale',
        'New beauty products for sale',
        'Bangkok',
        '["beauty1.jpg"]',
        now(),
        now()
    ),
    (
        30,
        'Car Accessories',
        'automotive',
        'excellent',
        'sell',
        'Car accessories have good resale value',
        7,
        'medium',
        100.00,
        'Medium landfill impact',
        false,
        5000.00,
        3000.00,
        2800.00,
        0.00,
        200.00,
        'Car Accessories Sale',
        'Excellent condition car accessories',
        'Bangkok',
        '["car1.jpg"]',
        now(),
        now()
    );