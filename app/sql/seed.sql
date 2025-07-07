-- Seed data for Lemore database
-- Using profile_id: 3eba1bf5-d0ca-4c10-a53e-ea7b214cb634

-- Categories table
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

-- Local businesses table
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
        'Bangkok Electronics Hub',
        'Electronics Store',
        'Bangkok, Thailand',
        4.2,
        45,
        '$$',
        '["electronics", "repair", "warranty"]',
        'https://example.com/bangkok-electronics.jpg',
        '123 Silom Road, Bangkok',
        'https://bangkokelectronics.com',
        'Premium electronics store with repair services'
    ),
    (
        'Chiang Mai Clothing Co',
        'Fashion Boutique',
        'Chiang Mai, Thailand',
        4.5,
        32,
        '$$$',
        '["fashion", "local", "sustainable"]',
        'https://example.com/chiangmai-clothing.jpg',
        '456 Nimman Road, Chiang Mai',
        'https://chiangmaiclothing.com',
        'Sustainable fashion boutique'
    ),
    (
        'Phuket Sports Center',
        'Sports Equipment',
        'Phuket, Thailand',
        4.1,
        28,
        '$$',
        '["sports", "fitness", "outdoor"]',
        'https://example.com/phuket-sports.jpg',
        '789 Patong Beach Road, Phuket',
        'https://phuketsports.com',
        'Complete sports equipment and fitness center'
    ),
    (
        'Pattaya Beauty Salon',
        'Beauty Services',
        'Pattaya, Thailand',
        4.3,
        67,
        '$$',
        '["beauty", "salon", "spa"]',
        'https://example.com/pattaya-beauty.jpg',
        '321 Walking Street, Pattaya',
        'https://pattayabeauty.com',
        'Professional beauty and spa services'
    ),
    (
        'Krabi Auto Parts',
        'Automotive',
        'Krabi, Thailand',
        4.0,
        23,
        '$$',
        '["automotive", "parts", "service"]',
        'https://example.com/krabi-auto.jpg',
        '654 Ao Nang Road, Krabi',
        'https://krabiauto.com',
        'Quality auto parts and service center'
    ),
    (
        'Hua Hin Health Clinic',
        'Healthcare',
        'Hua Hin, Thailand',
        4.6,
        89,
        '$$$',
        '["health", "clinic", "wellness"]',
        'https://example.com/huahin-health.jpg',
        '987 Petchkasem Road, Hua Hin',
        'https://huahinhealth.com',
        'Comprehensive health and wellness clinic'
    ),
    (
        'Koh Samui Toys',
        'Toy Store',
        'Koh Samui, Thailand',
        4.4,
        41,
        '$$',
        '["toys", "games", "children"]',
        'https://example.com/samui-toys.jpg',
        '147 Chaweng Road, Koh Samui',
        'https://samuitoys.com',
        'Fun toys and games for all ages'
    ),
    (
        'Ayutthaya Books',
        'Bookstore',
        'Ayutthaya, Thailand',
        4.2,
        38,
        '$',
        '["books", "education", "culture"]',
        'https://example.com/ayutthaya-books.jpg',
        '258 Historical Park Road, Ayutthaya',
        'https://ayutthayabooks.com',
        'Cultural and educational bookstore'
    ),
    (
        'Kanchanaburi Home Decor',
        'Home & Garden',
        'Kanchanaburi, Thailand',
        4.3,
        52,
        '$$',
        '["home", "decor", "garden"]',
        'https://example.com/kanchanaburi-home.jpg',
        '369 River Kwai Road, Kanchanaburi',
        'https://kanchanaburihome.com',
        'Beautiful home decor and garden supplies'
    ),
    (
        'Nakhon Ratchasima Market',
        'Local Market',
        'Nakhon Ratchasima, Thailand',
        4.1,
        156,
        '$',
        '["market", "local", "fresh"]',
        'https://example.com/nakhon-market.jpg',
        '741 City Center Road, Nakhon Ratchasima',
        'https://nakhonmarket.com',
        'Traditional local market with fresh produce'
    );

-- Local business reviews (composite primary key: business_id, author)
INSERT INTO
    local_business_reviews (
        business_id,
        rating,
        author,
        author_avatar,
        timestamp,
        tags
    )
VALUES (
        1,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-15T10:30:00Z',
        '["helpful", "professional"]'
    ),
    (
        2,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-16T14:20:00Z',
        '["quality", "service"]'
    ),
    (
        3,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-17T09:15:00Z',
        '["excellent", "variety"]'
    ),
    (
        4,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-18T16:45:00Z',
        '["clean", "friendly"]'
    ),
    (
        5,
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-19T11:30:00Z',
        '["adequate", "basic"]'
    ),
    (
        6,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-20T13:20:00Z',
        '["professional", "caring"]'
    ),
    (
        7,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-21T15:10:00Z',
        '["fun", "variety"]'
    ),
    (
        8,
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-22T12:00:00Z',
        '["knowledgeable", "cultural"]'
    ),
    (
        9,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-23T17:30:00Z',
        '["beautiful", "quality"]'
    ),
    (
        10,
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'https://example.com/avatar1.jpg',
        '2024-01-24T08:45:00Z',
        '["authentic", "fresh"]'
    );

-- Local tip posts
INSERT INTO
    local_tip_posts (
        title,
        content,
        category,
        location,
        author,
        likes,
        comments,
        reviews
    )
VALUES (
        'Best Visa Extension Process in Bangkok',
        'Here is the complete guide for extending your visa in Bangkok...',
        'Visa',
        'Bangkok, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        45,
        12,
        8
    ),
    (
        'Opening a Bank Account as Foreigner',
        'Step-by-step process to open a Thai bank account...',
        'Bank',
        'Chiang Mai, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        67,
        23,
        15
    ),
    (
        'Tax Filing for Digital Nomads',
        'Complete guide to filing taxes while working remotely...',
        'Tax',
        'Phuket, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        34,
        9,
        6
    ),
    (
        'Best Hospitals in Pattaya',
        'Top healthcare facilities and emergency contacts...',
        'Health',
        'Pattaya, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        89,
        31,
        22
    ),
    (
        'International Schools in Krabi',
        'Complete list of international schools and admission process...',
        'Education',
        'Krabi, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        56,
        18,
        11
    ),
    (
        'Public Transportation Guide',
        'How to navigate public transport efficiently...',
        'Transportation',
        'Hua Hin, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        78,
        25,
        19
    ),
    (
        'Local Food Markets Guide',
        'Best places to buy fresh local produce...',
        'Other',
        'Koh Samui, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        123,
        42,
        28
    ),
    (
        'Cultural Etiquette Tips',
        'Important cultural norms and customs to follow...',
        'Other',
        'Ayutthaya, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        91,
        37,
        24
    ),
    (
        'Weather and Best Time to Visit',
        'Seasonal guide for optimal travel experience...',
        'Other',
        'Kanchanaburi, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        67,
        21,
        14
    ),
    (
        'Local Language Basics',
        'Essential Thai phrases for daily communication...',
        'Education',
        'Nakhon Ratchasima, Thailand',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        145,
        58,
        33
    );

-- Local tip comments (composite primary key: comment_id, post_id, author)
INSERT INTO
    local_tip_comments (
        post_id,
        author,
        content,
        likes
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'This was incredibly helpful! I followed these steps and got my extension approved.',
        12
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Great information! Do you know if this works for all banks?',
        8
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Thanks for sharing this. Tax season is always confusing.',
        15
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'I can confirm this hospital is excellent. Very professional staff.',
        23
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'This list is comprehensive. My kids love their new school!',
        19
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'The BTS system is so convenient once you get the hang of it.',
        31
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'These markets have the freshest produce I have ever seen!',
        42
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Cultural respect is so important. Thanks for this guide.',
        28
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'The rainy season is actually quite beautiful here.',
        16
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Learning Thai has made my experience so much better!',
        47
    );

-- Let go buddy sessions
INSERT INTO
    let_go_buddy_sessions (
        user_id,
        situation,
        is_completed
    )
VALUES (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'moving',
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'downsizing',
        true
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'spring_cleaning',
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'digital_declutter',
        true
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'minimalism',
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'inheritance',
        true
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'relationship_change',
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'other',
        true
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'moving',
        false
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'downsizing',
        true
    );

-- Item analyses
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
        'iPhone 12',
        'electronics',
        'excellent',
        'sell',
        'This phone is in great condition and has good resale value. Consider selling it online.',
        3,
        'medium',
        45.50,
        'Low impact - electronics recycling available',
        true,
        899.00,
        450.00,
        425.00,
        0.00,
        25.00,
        'Excellent iPhone 12 - Great Condition',
        'iPhone 12 in excellent condition, barely used, comes with original box and charger',
        'Bangkok, Thailand',
        '["https://example.com/iphone1.jpg", "https://example.com/iphone2.jpg"]'
    ),
    (
        2,
        'Leather Jacket',
        'clothing',
        'good',
        'keep',
        'This jacket has sentimental value and is still in good condition. Consider keeping it.',
        8,
        'low',
        12.30,
        'Medium impact - leather takes time to decompose',
        false,
        200.00,
        80.00,
        75.00,
        15.00,
        10.00,
        'Classic Leather Jacket - Good Condition',
        'Vintage leather jacket, well-maintained, perfect for cooler weather',
        'Chiang Mai, Thailand',
        '["https://example.com/jacket1.jpg"]'
    ),
    (
        3,
        'Coffee Table',
        'home',
        'fair',
        'repurpose',
        'This table could be repurposed into a garden planter or storage unit.',
        4,
        'medium',
        8.75,
        'Medium impact - wood can be repurposed',
        true,
        150.00,
        30.00,
        25.00,
        20.00,
        15.00,
        'Wooden Coffee Table - Repurpose Project',
        'Solid wood coffee table, perfect for DIY projects or repurposing',
        'Phuket, Thailand',
        '["https://example.com/table1.jpg"]'
    ),
    (
        4,
        'Yoga Mat',
        'sports',
        'excellent',
        'donate',
        'This yoga mat is in excellent condition and would be perfect for donation to a local gym.',
        2,
        'low',
        5.20,
        'Low impact - can be recycled',
        true,
        50.00,
        35.00,
        30.00,
        0.00,
        5.00,
        'Premium Yoga Mat - Excellent Condition',
        'High-quality yoga mat, barely used, perfect for beginners or donation',
        'Pattaya, Thailand',
        '["https://example.com/yoga1.jpg"]'
    ),
    (
        5,
        'Old Books',
        'books',
        'poor',
        'recycle',
        'These books are in poor condition but can be recycled for paper.',
        1,
        'low',
        2.10,
        'Low impact - paper is easily recyclable',
        true,
        25.00,
        5.00,
        0.00,
        0.00,
        2.00,
        'Old Books for Recycling',
        'Collection of old books suitable for paper recycling',
        'Krabi, Thailand',
        '["https://example.com/books1.jpg"]'
    ),
    (
        6,
        'Makeup Collection',
        'beauty',
        'good',
        'sell',
        'This makeup collection is still in good condition and has good resale value.',
        3,
        'medium',
        15.80,
        'Medium impact - some items may not be recyclable',
        false,
        300.00,
        120.00,
        100.00,
        0.00,
        8.00,
        'Professional Makeup Collection',
        'Complete makeup collection, high-quality brands, good condition',
        'Hua Hin, Thailand',
        '["https://example.com/makeup1.jpg", "https://example.com/makeup2.jpg"]'
    ),
    (
        7,
        'Children Toys',
        'toys',
        'excellent',
        'donate',
        'These toys are in excellent condition and would bring joy to children in need.',
        6,
        'low',
        3.45,
        'Low impact - plastic toys can be recycled',
        true,
        80.00,
        50.00,
        40.00,
        0.00,
        3.00,
        'Children Toys - Excellent Condition',
        'Collection of educational and fun toys, perfect for donation',
        'Koh Samui, Thailand',
        '["https://example.com/toys1.jpg"]'
    ),
    (
        8,
        'Car Parts',
        'automotive',
        'good',
        'sell',
        'These car parts are still in good condition and have good resale value.',
        2,
        'medium',
        25.60,
        'Medium impact - metal parts can be recycled',
        true,
        200.00,
        80.00,
        70.00,
        10.00,
        12.00,
        'Quality Car Parts',
        'Various car parts in good condition, compatible with multiple models',
        'Ayutthaya, Thailand',
        '["https://example.com/carparts1.jpg"]'
    ),
    (
        9,
        'Vitamins and Supplements',
        'health',
        'excellent',
        'keep',
        'These supplements are still within expiration date and in excellent condition.',
        4,
        'low',
        1.20,
        'Low impact - packaging can be recycled',
        true,
        100.00,
        85.00,
        80.00,
        0.00,
        2.00,
        'Health Supplements - Excellent Condition',
        'High-quality vitamins and supplements, within expiration date',
        'Kanchanaburi, Thailand',
        '["https://example.com/vitamins1.jpg"]'
    ),
    (
        10,
        'Art Supplies',
        'other',
        'good',
        'donate',
        'These art supplies are in good condition and would be perfect for donation to schools.',
        5,
        'low',
        4.30,
        'Low impact - most art supplies are recyclable',
        true,
        60.00,
        35.00,
        30.00,
        0.00,
        4.00,
        'Art Supplies Collection',
        'Complete set of art supplies, perfect for donation to art programs',
        'Nakhon Ratchasima, Thailand',
        '["https://example.com/art1.jpg"]'
    );

-- Products
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
        stats
    )
VALUES (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'MacBook Pro 2021',
        25000.00,
        'THB',
        1,
        'excellent',
        'Bangkok, Thailand',
        'MacBook Pro 2021 in excellent condition, barely used, comes with original box and charger',
        '["electronics", "laptop", "apple"]',
        false,
        'fixed',
        '{"views": 45, "likes": 12}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Nike Running Shoes',
        1500.00,
        'THB',
        5,
        'good',
        'Chiang Mai, Thailand',
        'Nike running shoes, size 42, good condition, perfect for daily runs',
        '["sports", "shoes", "nike"]',
        false,
        'negotiable',
        '{"views": 23, "likes": 8}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Designer Handbag',
        8000.00,
        'THB',
        2,
        'like_new',
        'Phuket, Thailand',
        'Authentic designer handbag, like new condition, perfect for special occasions',
        '["clothing", "handbag", "designer"]',
        true,
        'fixed',
        '{"views": 67, "likes": 25}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Harry Potter Book Set',
        1200.00,
        'THB',
        3,
        'excellent',
        'Pattaya, Thailand',
        'Complete Harry Potter book set, excellent condition, perfect for collectors',
        '["books", "harry potter", "collection"]',
        false,
        'negotiable',
        '{"views": 34, "likes": 15}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Coffee Table',
        2500.00,
        'THB',
        4,
        'good',
        'Krabi, Thailand',
        'Solid wood coffee table, good condition, perfect for living room',
        '["home", "furniture", "wood"]',
        false,
        'fixed',
        '{"views": 28, "likes": 9}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Skincare Set',
        3000.00,
        'THB',
        6,
        'new',
        'Hua Hin, Thailand',
        'Complete skincare set, brand new, unopened, perfect gift',
        '["beauty", "skincare", "gift"]',
        false,
        'fixed',
        '{"views": 56, "likes": 22}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'LEGO Star Wars Set',
        1800.00,
        'THB',
        7,
        'excellent',
        'Koh Samui, Thailand',
        'LEGO Star Wars set, excellent condition, complete with instructions',
        '["toys", "lego", "star wars"]',
        false,
        'negotiable',
        '{"views": 41, "likes": 18}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Car Stereo System',
        5000.00,
        'THB',
        8,
        'good',
        'Ayutthaya, Thailand',
        'High-quality car stereo system, good condition, easy installation',
        '["automotive", "stereo", "car"]',
        false,
        'fixed',
        '{"views": 19, "likes": 6}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Yoga Mat Premium',
        800.00,
        'THB',
        9,
        'excellent',
        'Kanchanaburi, Thailand',
        'Premium yoga mat, excellent condition, perfect for home practice',
        '["health", "yoga", "fitness"]',
        false,
        'negotiable',
        '{"views": 38, "likes": 14}'
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Vintage Camera',
        3500.00,
        'THB',
        10,
        'fair',
        'Nakhon Ratchasima, Thailand',
        'Vintage camera, fair condition, perfect for collectors or decoration',
        '["other", "vintage", "camera"]',
        false,
        'auction',
        '{"views": 72, "likes": 31}'
    );

-- Product images (composite primary key: product_id, image_order)
INSERT INTO
    product_images (
        product_id,
        image_url,
        image_order,
        is_primary
    )
VALUES (
        1,
        'https://example.com/macbook1.jpg',
        0,
        true
    ),
    (
        1,
        'https://example.com/macbook2.jpg',
        1,
        false
    ),
    (
        1,
        'https://example.com/macbook3.jpg',
        2,
        false
    ),
    (
        2,
        'https://example.com/nike1.jpg',
        0,
        true
    ),
    (
        2,
        'https://example.com/nike2.jpg',
        1,
        false
    ),
    (
        3,
        'https://example.com/handbag1.jpg',
        0,
        true
    ),
    (
        4,
        'https://example.com/harrypotter1.jpg',
        0,
        true
    ),
    (
        4,
        'https://example.com/harrypotter2.jpg',
        1,
        false
    ),
    (
        5,
        'https://example.com/table1.jpg',
        0,
        true
    ),
    (
        6,
        'https://example.com/skincare1.jpg',
        0,
        true
    ),
    (
        7,
        'https://example.com/lego1.jpg',
        0,
        true
    ),
    (
        7,
        'https://example.com/lego2.jpg',
        1,
        false
    ),
    (
        8,
        'https://example.com/stereo1.jpg',
        0,
        true
    ),
    (
        9,
        'https://example.com/yoga1.jpg',
        0,
        true
    ),
    (
        10,
        'https://example.com/camera1.jpg',
        0,
        true
    ),
    (
        10,
        'https://example.com/camera2.jpg',
        1,
        false
    );

-- Product likes (composite primary key: product_id, user_id)
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

-- Product views
INSERT INTO
    product_views (product_id, user_id)
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

-- User conversations
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

-- Message participants (composite primary key: conversation_id, profile_id)
INSERT INTO
    message_participants (conversation_id, profile_id)
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

-- User messages
INSERT INTO
    user_messages (
        conversation_id,
        sender_id,
        receiver_id,
        content,
        message_type,
        media_url,
        seen
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Hi, is the MacBook still available?',
        'text',
        NULL,
        true
    ),
    (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Yes, it is still available. Would you like to see it?',
        'text',
        NULL,
        false
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Can you send me more photos of the Nike shoes?',
        'text',
        NULL,
        true
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Is the handbag authentic?',
        'text',
        NULL,
        true
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'What condition are the Harry Potter books in?',
        'text',
        NULL,
        false
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Can you deliver the coffee table?',
        'text',
        NULL,
        true
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Is the skincare set unopened?',
        'text',
        NULL,
        true
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'How many pieces are in the LEGO set?',
        'text',
        NULL,
        false
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Will the stereo fit my car model?',
        'text',
        NULL,
        true
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'What material is the yoga mat made of?',
        'text',
        NULL,
        true
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'Is the vintage camera functional?',
        'text',
        NULL,
        false
    );

-- User notifications
INSERT INTO
    user_notifications (
        type,
        sender_id,
        receiver_id,
        product_id,
        message_id,
        review_id,
        is_read,
        data
    )
VALUES (
        'message',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        1,
        1,
        NULL,
        false,
        '{"message": "New message about MacBook Pro"}'
    ),
    (
        'like',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        2,
        NULL,
        NULL,
        true,
        '{"message": "Someone liked your Nike shoes listing"}'
    ),
    (
        'reply',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        3,
        3,
        NULL,
        false,
        '{"message": "Reply to your handbag listing"}'
    ),
    (
        'mention',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4,
        NULL,
        NULL,
        true,
        '{"message": "You were mentioned in a review"}'
    ),
    (
        'message',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5,
        5,
        NULL,
        false,
        '{"message": "New message about coffee table"}'
    ),
    (
        'like',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        6,
        NULL,
        NULL,
        true,
        '{"message": "Someone liked your skincare listing"}'
    ),
    (
        'reply',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        7,
        7,
        NULL,
        false,
        '{"message": "Reply to your LEGO listing"}'
    ),
    (
        'mention',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        8,
        NULL,
        NULL,
        true,
        '{"message": "You were mentioned in a local tip"}'
    ),
    (
        'message',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        9,
        9,
        NULL,
        false,
        '{"message": "New message about yoga mat"}'
    ),
    (
        'like',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        10,
        NULL,
        NULL,
        true,
        '{"message": "Someone liked your vintage camera listing"}'
    );

-- User reviews
INSERT INTO
    user_reviews (
        reviewer_id,
        reviewee_id,
        rating
    )
VALUES (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        3
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        4
    ),
    (
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        5
    );

-- Give and glow reviews
INSERT INTO
    give_and_glow_reviews (
        product_id,
        giver_id,
        receiver_id,
        category,
        rating,
        review,
        timestamp,
        tags
    )
VALUES (
        1,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'electronics',
        5,
        'Amazing laptop! Works perfectly and the giver was so kind. Everything is in excellent condition.',
        '2024-01-15T10:30:00Z',
        '["helpful", "professional"]'
    ),
    (
        2,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'sports',
        4,
        'Great yoga mat! Very comfortable and durable. Perfect for my daily practice.',
        '2024-01-16T14:20:00Z',
        '["quality", "comfortable"]'
    ),
    (
        3,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'clothing',
        5,
        'Beautiful vintage dress! Authentic and in perfect condition. The giver was very thoughtful.',
        '2024-01-17T09:15:00Z',
        '["authentic", "beautiful"]'
    ),
    (
        4,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'books',
        4,
        'Complete Harry Potter collection! All books are in great condition. My kids are thrilled!',
        '2024-01-18T16:45:00Z',
        '["complete", "collectible"]'
    ),
    (
        5,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'home',
        3,
        'Solid coffee table. Minor scratches but very functional. Good for my apartment.',
        '2024-01-19T11:30:00Z',
        '["solid", "functional"]'
    ),
    (
        6,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'beauty',
        5,
        'Luxury skincare set! All products are unopened and high quality. So grateful!',
        '2024-01-20T13:20:00Z',
        '["effective", "luxurious"]'
    ),
    (
        7,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'toys',
        4,
        'Fun LEGO set! Complete with instructions. My children love building with it.',
        '2024-01-21T15:10:00Z',
        '["fun", "educational"]'
    ),
    (
        8,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'automotive',
        4,
        'Quality car seat covers! Easy to install and fit perfectly. Great protection.',
        '2024-01-22T12:00:00Z',
        '["quality", "easy_install"]'
    ),
    (
        9,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'health',
        5,
        'Comfortable ergonomic chair! Perfect for my home office. Very durable construction.',
        '2024-01-23T17:30:00Z',
        '["comfortable", "durable"]'
    ),
    (
        10,
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634',
        'other',
        4,
        'Vintage camera collection! All cameras are in working condition. Great for photography enthusiasts.',
        '2024-01-24T08:45:00Z',
        '["vintage", "collectible"]'
    );

-- Note: user_profiles table is not seeded as requested - using profile_id '3eba1bf5-d0ca-4c10-a53e-ea7b214cb634' throughout