-- Drop views that reference tables being altered
DROP VIEW IF EXISTS "let_go_buddy_sessions_with_items_view";

DROP VIEW IF EXISTS "user_let_go_buddy_stats_view";

DROP VIEW IF EXISTS "item_analyses_detailed_view";

DROP VIEW IF EXISTS "environmental_impact_summary_view";
--> statement-breakpoint

ALTER TABLE "let_go_buddy_sessions"
ALTER COLUMN "situation"
SET
    DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."declutter_situation";
--> statement-breakpoint
CREATE TYPE "public"."declutter_situation" AS ENUM('Moving', 'Downsizing', 'Spring Cleaning', 'Digital Declutter', 'Minimalism', 'Inheritance', 'Relationship Change', 'Other');
--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ALTER COLUMN "situation" SET DATA TYPE "public"."declutter_situation" USING 
  CASE 
    WHEN "situation" = 'moving' THEN 'Moving'::"public"."declutter_situation"
    WHEN "situation" = 'downsizing' THEN 'Downsizing'::"public"."declutter_situation"
    WHEN "situation" = 'spring cleaning' THEN 'Spring Cleaning'::"public"."declutter_situation"
    WHEN "situation" = 'digital declutter' THEN 'Digital Declutter'::"public"."declutter_situation"
    WHEN "situation" = 'minimalism' THEN 'Minimalism'::"public"."declutter_situation"
    WHEN "situation" = 'inheritance' THEN 'Inheritance'::"public"."declutter_situation"
    WHEN "situation" = 'relationship change' THEN 'Relationship Change'::"public"."declutter_situation"
    ELSE 'Other'::"public"."declutter_situation"
  END;
--> statement-breakpoint
ALTER TABLE "item_analyses"
ALTER COLUMN "environmental_impact"
SET
    DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."environmental_impact_level";
--> statement-breakpoint
CREATE TYPE "public"."environmental_impact_level" AS ENUM('Low', 'Medium', 'High', 'Critical');
--> statement-breakpoint
ALTER TABLE "item_analyses" ALTER COLUMN "environmental_impact" SET DATA TYPE "public"."environmental_impact_level" USING 
  CASE 
    WHEN "environmental_impact" = 'low' THEN 'Low'::"public"."environmental_impact_level"
    WHEN "environmental_impact" = 'medium' THEN 'Medium'::"public"."environmental_impact_level"
    WHEN "environmental_impact" = 'high' THEN 'High'::"public"."environmental_impact_level"
    WHEN "environmental_impact" = 'critical' THEN 'Critical'::"public"."environmental_impact_level"
    ELSE 'Medium'::"public"."environmental_impact_level"
  END;
--> statement-breakpoint
ALTER TABLE "user_messages"
ALTER COLUMN "message_type"
SET
    DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "user_messages" ALTER COLUMN "message_type" SET DEFAULT 'text'::text;
--> statement-breakpoint
DROP TYPE "public"."message_type";
--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('Text', 'Image', 'File', 'Audio', 'Video', 'Location');
--> statement-breakpoint
ALTER TABLE "user_messages" ALTER COLUMN "message_type" SET DEFAULT 'Text'::"public"."message_type";
--> statement-breakpoint
ALTER TABLE "user_messages" ALTER COLUMN "message_type" SET DATA TYPE "public"."message_type" USING 
  CASE 
    WHEN "message_type" = 'text' THEN 'Text'::"public"."message_type"
    WHEN "message_type" = 'image' THEN 'Image'::"public"."message_type"
    WHEN "message_type" = 'file' THEN 'File'::"public"."message_type"
    WHEN "message_type" = 'audio' THEN 'Audio'::"public"."message_type"
    WHEN "message_type" = 'video' THEN 'Video'::"public"."message_type"
    WHEN "message_type" = 'location' THEN 'Location'::"public"."message_type"
    ELSE 'Text'::"public"."message_type"
  END;
--> statement-breakpoint
ALTER TABLE "user_notifications"
ALTER COLUMN "type"
SET
    DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."notification_type";
--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('Message', 'Like', 'Reply', 'Mention');
--> statement-breakpoint
ALTER TABLE "user_notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING 
  CASE 
    WHEN "type" = 'message' THEN 'Message'::"public"."notification_type"
    WHEN "type" = 'like' THEN 'Like'::"public"."notification_type"
    WHEN "type" = 'reply' THEN 'Reply'::"public"."notification_type"
    WHEN "type" = 'mention' THEN 'Mention'::"public"."notification_type"
    ELSE 'Message'::"public"."notification_type"
  END;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price_type" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price_type" SET DEFAULT 'fixed'::text;
--> statement-breakpoint
DROP TYPE "public"."price_type";
--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('Fixed', 'Negotiable', 'Free', 'Auction');
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price_type" SET DEFAULT 'Fixed'::"public"."price_type";
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price_type" SET DATA TYPE "public"."price_type" USING 
  CASE 
    WHEN "price_type" = 'fixed' THEN 'Fixed'::"public"."price_type"
    WHEN "price_type" = 'negotiable' THEN 'Negotiable'::"public"."price_type"
    WHEN "price_type" = 'free' THEN 'Free'::"public"."price_type"
    WHEN "price_type" = 'auction' THEN 'Auction'::"public"."price_type"
    ELSE 'Fixed'::"public"."price_type"
  END;
--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews"
ALTER COLUMN "category"
SET
    DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "item_analyses"
ALTER COLUMN "item_category"
SET
    DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."product_category";
--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Other');
--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE "public"."product_category" USING 
  CASE 
    WHEN "name" = 'electronics' THEN 'Electronics'::"public"."product_category"
    WHEN "name" = 'clothing' THEN 'Clothing'::"public"."product_category"
    WHEN "name" = 'books' THEN 'Books'::"public"."product_category"
    WHEN "name" = 'home' THEN 'Home'::"public"."product_category"
    WHEN "name" = 'sports' THEN 'Sports'::"public"."product_category"
    WHEN "name" = 'beauty' THEN 'Beauty'::"public"."product_category"
    WHEN "name" = 'toys' THEN 'Toys'::"public"."product_category"
    WHEN "name" = 'automotive' THEN 'Automotive'::"public"."product_category"
    WHEN "name" = 'health' THEN 'Health'::"public"."product_category"
    WHEN "name" = 'other' THEN 'Other'::"public"."product_category"
    ELSE 'Other'::"public"."product_category"
  END;
--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews" ALTER COLUMN "category" SET DATA TYPE "public"."product_category" USING 
  CASE 
    WHEN "category" = 'electronics' THEN 'Electronics'::"public"."product_category"
    WHEN "category" = 'clothing' THEN 'Clothing'::"public"."product_category"
    WHEN "category" = 'books' THEN 'Books'::"public"."product_category"
    WHEN "category" = 'home' THEN 'Home'::"public"."product_category"
    WHEN "category" = 'sports' THEN 'Sports'::"public"."product_category"
    WHEN "category" = 'beauty' THEN 'Beauty'::"public"."product_category"
    WHEN "category" = 'toys' THEN 'Toys'::"public"."product_category"
    WHEN "category" = 'automotive' THEN 'Automotive'::"public"."product_category"
    WHEN "category" = 'health' THEN 'Health'::"public"."product_category"
    WHEN "category" = 'other' THEN 'Other'::"public"."product_category"
    ELSE 'Other'::"public"."product_category"
  END;
--> statement-breakpoint
ALTER TABLE "item_analyses" ALTER COLUMN "item_category" SET DATA TYPE "public"."product_category" USING 
  CASE 
    WHEN "item_category" = 'electronics' THEN 'Electronics'::"public"."product_category"
    WHEN "item_category" = 'clothing' THEN 'Clothing'::"public"."product_category"
    WHEN "item_category" = 'books' THEN 'Books'::"public"."product_category"
    WHEN "item_category" = 'home' THEN 'Home'::"public"."product_category"
    WHEN "item_category" = 'sports' THEN 'Sports'::"public"."product_category"
    WHEN "item_category" = 'beauty' THEN 'Beauty'::"public"."product_category"
    WHEN "item_category" = 'toys' THEN 'Toys'::"public"."product_category"
    WHEN "item_category" = 'automotive' THEN 'Automotive'::"public"."product_category"
    WHEN "item_category" = 'health' THEN 'Health'::"public"."product_category"
    WHEN "item_category" = 'other' THEN 'Other'::"public"."product_category"
    ELSE 'Other'::"public"."product_category"
  END;
--> statement-breakpoint
ALTER TABLE "item_analyses"
ALTER COLUMN "item_condition"
SET
    DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "condition" SET DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."product_condition";
--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor');
--> statement-breakpoint
ALTER TABLE "item_analyses" ALTER COLUMN "item_condition" SET DATA TYPE "public"."product_condition" USING 
  CASE 
    WHEN "item_condition" = 'new' THEN 'New'::"public"."product_condition"
    WHEN "item_condition" = 'like new' THEN 'Like New'::"public"."product_condition"
    WHEN "item_condition" = 'excellent' THEN 'Excellent'::"public"."product_condition"
    WHEN "item_condition" = 'good' THEN 'Good'::"public"."product_condition"
    WHEN "item_condition" = 'fair' THEN 'Fair'::"public"."product_condition"
    WHEN "item_condition" = 'poor' THEN 'Poor'::"public"."product_condition"
    ELSE 'Good'::"public"."product_condition"
  END;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "condition" SET DATA TYPE "public"."product_condition" USING 
  CASE 
    WHEN "condition" = 'new' THEN 'New'::"public"."product_condition"
    WHEN "condition" = 'like new' THEN 'Like New'::"public"."product_condition"
    WHEN "condition" = 'excellent' THEN 'Excellent'::"public"."product_condition"
    WHEN "condition" = 'good' THEN 'Good'::"public"."product_condition"
    WHEN "condition" = 'fair' THEN 'Fair'::"public"."product_condition"
    WHEN "condition" = 'poor' THEN 'Poor'::"public"."product_condition"
    ELSE 'Good'::"public"."product_condition"
  END;
--> statement-breakpoint
ALTER TABLE "item_analyses"
ALTER COLUMN "recommendation"
SET
    DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."recommendation_action";
--> statement-breakpoint
CREATE TYPE "public"."recommendation_action" AS ENUM('Keep', 'Sell', 'Donate', 'Recycle', 'Repair', 'Repurpose', 'Discard');
--> statement-breakpoint
ALTER TABLE "item_analyses" ALTER COLUMN "recommendation" SET DATA TYPE "public"."recommendation_action" USING 
  CASE 
    WHEN "recommendation" = 'keep' THEN 'Keep'::"public"."recommendation_action"
    WHEN "recommendation" = 'sell' THEN 'Sell'::"public"."recommendation_action"
    WHEN "recommendation" = 'donate' THEN 'Donate'::"public"."recommendation_action"
    WHEN "recommendation" = 'recycle' THEN 'Recycle'::"public"."recommendation_action"
    WHEN "recommendation" = 'repair' THEN 'Repair'::"public"."recommendation_action"
    WHEN "recommendation" = 'repurpose' THEN 'Repurpose'::"public"."recommendation_action"
    WHEN "recommendation" = 'discard' THEN 'Discard'::"public"."recommendation_action"
    ELSE 'Keep'::"public"."recommendation_action"
  END;
--> statement-breakpoint

-- Recreate views after table alterations
CREATE OR REPLACE VIEW let_go_buddy_sessions_with_items_view AS
SELECT
    -- Session data
    sessions.session_id,
    sessions.user_id,
    sessions.situation,
    sessions.created_at as session_created_at,
    sessions.updated_at as session_updated_at,
    sessions.is_completed,

-- User profile data
user_profiles.username,
user_profiles.avatar_url,
user_profiles.location as user_location,

-- Item analysis data
items.analysis_id,
items.item_name,
items.item_category,
items.item_condition,
items.recommendation,
items.ai_suggestion,
items.emotional_score,
items.environmental_impact,
items.co2_impact,
items.landfill_impact,
items.is_recyclable,
items.original_price,
items.current_value,
items.ai_listing_price,
items.maintenance_cost,
items.space_value,
items.ai_listing_title,
items.ai_listing_description,
items.ai_listing_location,
items.images,
items.created_at as item_created_at,
items.updated_at as item_updated_at,

-- Calculated statistics
COUNT(*) OVER (
    PARTITION BY
        sessions.session_id
) as total_items_in_session,
COUNT(*) FILTER (
    WHERE
        items.recommendation IN (
            'sell',
            'donate',
            'recycle',
            'repurpose',
            'discard'
        )
) OVER (
    PARTITION BY
        sessions.session_id
) as completed_items_in_session,
SUM(items.co2_impact) OVER (
    PARTITION BY
        sessions.session_id
) as total_co2_impact,
SUM(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) OVER (
    PARTITION BY
        sessions.session_id
) as total_value_created,
AVG(items.emotional_score) OVER (
    PARTITION BY
        sessions.session_id
) as avg_emotional_score
FROM
    let_go_buddy_sessions sessions
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
    LEFT JOIN item_analyses items ON sessions.session_id = items.session_id
ORDER BY sessions.created_at DESC, items.created_at ASC;
--> statement-breakpoint

-- Recreate other views
CREATE OR REPLACE VIEW user_let_go_buddy_stats_view AS
SELECT sessions.user_id, user_profiles.username, user_profiles.avatar_url,

-- Session statistics
COUNT(DISTINCT sessions.session_id) as total_sessions,
COUNT(
    DISTINCT CASE
        WHEN sessions.is_completed THEN sessions.session_id
    END
) as completed_sessions,

-- Item statistics
COUNT(items.analysis_id) as total_items_analyzed,
COUNT(
    CASE
        WHEN items.recommendation IN (
            'sell',
            'donate',
            'recycle',
            'repurpose',
            'discard'
        ) THEN items.analysis_id
    END
) as total_items_completed,

-- Environmental impact
SUM(items.co2_impact) as total_co2_saved,
AVG(
    CASE
        WHEN items.environmental_impact = 'low' THEN 1
        WHEN items.environmental_impact = 'medium' THEN 2
        WHEN items.environmental_impact = 'high' THEN 3
        WHEN items.environmental_impact = 'critical' THEN 4
        ELSE 0
    END
) as avg_environmental_impact_score,

-- Value statistics
SUM(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) as total_value_created,
AVG(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) as avg_item_value,

-- Emotional statistics
AVG(items.emotional_score) as avg_emotional_score,

-- Most common patterns
MODE () WITHIN GROUP (
    ORDER BY sessions.situation
) as most_common_situation,
MODE () WITHIN GROUP (
    ORDER BY items.recommendation
) as most_common_recommendation,

-- Recent activity
MAX(sessions.created_at) as last_session_date,
MAX(items.created_at) as last_item_analysis_date
FROM
    let_go_buddy_sessions sessions
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
    LEFT JOIN item_analyses items ON sessions.session_id = items.session_id
GROUP BY
    sessions.user_id,
    user_profiles.username,
    user_profiles.avatar_url;
--> statement-breakpoint

CREATE OR REPLACE VIEW item_analyses_detailed_view AS
SELECT
    -- Item analysis data
    items.analysis_id,
    items.session_id,
    items.item_name,
    items.item_category,
    items.item_condition,
    items.recommendation,
    items.ai_suggestion,
    items.emotional_score,
    items.environmental_impact,
    items.co2_impact,
    items.landfill_impact,
    items.is_recyclable,
    items.original_price,
    items.current_value,
    items.ai_listing_price,
    items.maintenance_cost,
    items.space_value,
    items.ai_listing_title,
    items.ai_listing_description,
    items.ai_listing_location,
    items.images,
    items.created_at,
    items.updated_at,

-- Session context
sessions.situation,
sessions.is_completed as session_completed,
sessions.created_at as session_created_at,

-- User context
user_profiles.username,
user_profiles.avatar_url,
user_profiles.location as user_location,

-- Calculated fields
CASE
    WHEN items.recommendation IN (
        'sell',
        'donate',
        'recycle',
        'repurpose',
        'discard'
    ) THEN true
    ELSE false
END as is_decision_made,
CASE
    WHEN items.recommendation = 'keep' THEN 'Keep Item'
    WHEN items.recommendation = 'sell' THEN 'Sell Item'
    WHEN items.recommendation = 'donate' THEN 'Donate Item'
    WHEN items.recommendation = 'recycle' THEN 'Recycle Item'
    WHEN items.recommendation = 'repair' THEN 'Repair Item'
    WHEN items.recommendation = 'repurpose' THEN 'Repurpose Item'
    WHEN items.recommendation = 'discard' THEN 'Discard Item'
    ELSE 'Unknown'
END as recommendation_display,
CASE
    WHEN items.environmental_impact = 'low' THEN 'Low Impact'
    WHEN items.environmental_impact = 'medium' THEN 'Medium Impact'
    WHEN items.environmental_impact = 'high' THEN 'High Impact'
    WHEN items.environmental_impact = 'critical' THEN 'Critical Impact'
    ELSE 'Unknown'
END as environmental_impact_display,

-- Value calculations
COALESCE(
    items.ai_listing_price,
    items.current_value,
    0
) as effective_value,
CASE
    WHEN items.original_price IS NOT NULL
    AND items.original_price > 0 THEN ROUND(
        (
            (
                COALESCE(
                    items.ai_listing_price,
                    items.current_value,
                    0
                ) - items.original_price
            ) / items.original_price
        ) * 100,
        2
    )
    ELSE NULL
END as value_change_percentage,

-- Emotional assessment
CASE
    WHEN items.emotional_score >= 8 THEN 'Very High Attachment'
    WHEN items.emotional_score >= 6 THEN 'High Attachment'
    WHEN items.emotional_score >= 4 THEN 'Moderate Attachment'
    WHEN items.emotional_score >= 2 THEN 'Low Attachment'
    ELSE 'Very Low Attachment'
END as emotional_attachment_level
FROM
    item_analyses items
    INNER JOIN let_go_buddy_sessions sessions ON items.session_id = sessions.session_id
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
ORDER BY items.created_at DESC;
--> statement-breakpoint

CREATE OR REPLACE VIEW environmental_impact_summary_view AS
SELECT sessions.user_id, user_profiles.username, sessions.session_id, sessions.situation,

-- Environmental impact summary
COUNT(*) as total_items,
COUNT(
    CASE
        WHEN items.is_recyclable THEN 1
    END
) as recyclable_items,
COUNT(
    CASE
        WHEN items.recommendation = 'recycle' THEN 1
    END
) as items_to_recycle,
COUNT(
    CASE
        WHEN items.recommendation = 'donate' THEN 1
    END
) as items_to_donate,
COUNT(
    CASE
        WHEN items.recommendation = 'sell' THEN 1
    END
) as items_to_sell,
COUNT(
    CASE
        WHEN items.recommendation = 'keep' THEN 1
    END
) as items_to_keep,

-- CO2 impact
SUM(items.co2_impact) as total_co2_impact,
AVG(items.co2_impact) as avg_co2_impact,

-- Environmental impact levels
COUNT(
    CASE
        WHEN items.environmental_impact = 'low' THEN 1
    END
) as low_impact_items,
COUNT(
    CASE
        WHEN items.environmental_impact = 'medium' THEN 1
    END
) as medium_impact_items,
COUNT(
    CASE
        WHEN items.environmental_impact = 'high' THEN 1
    END
) as high_impact_items,
COUNT(
    CASE
        WHEN items.environmental_impact = 'critical' THEN 1
    END
) as critical_impact_items,

-- Value impact
SUM(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) as total_value_created,
SUM(
    COALESCE(items.original_price, 0)
) as total_original_value,

-- Session info
sessions.created_at as session_date,
sessions.is_completed
FROM
    let_go_buddy_sessions sessions
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
    LEFT JOIN item_analyses items ON sessions.session_id = items.session_id
GROUP BY
    sessions.user_id,
    user_profiles.username,
    sessions.session_id,
    sessions.situation,
    sessions.created_at,
    sessions.is_completed
ORDER BY sessions.created_at DESC;