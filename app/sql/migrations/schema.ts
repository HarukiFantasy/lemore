import { pgTable, foreignKey, bigint, uuid, text, numeric, jsonb, boolean, timestamp, integer, check, primaryKey, pgView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const declutterSituation = pgEnum("declutter_situation", ['moving', 'downsizing', 'spring_cleaning', 'digital_declutter', 'minimalism', 'inheritance', 'relationship_change', 'other'])
export const environmentalImpactLevel = pgEnum("environmental_impact_level", ['low', 'medium', 'high', 'critical'])
export const localTipCategories = pgEnum("local_tip_categories", ['Visa', 'Bank', 'Tax', 'Health', 'Education', 'Transportation', 'Other'])
export const messageType = pgEnum("message_type", ['text', 'image', 'file', 'audio', 'video', 'location'])
export const notificationType = pgEnum("notification_type", ['message', 'like', 'reply', 'mention'])
export const priceType = pgEnum("price_type", ['fixed', 'negotiable', 'free', 'auction'])
export const productCategory = pgEnum("product_category", ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'automotive', 'health', 'other'])
export const productCondition = pgEnum("product_condition", ['new', 'like_new', 'excellent', 'good', 'fair', 'poor'])
export const recommendationAction = pgEnum("recommendation_action", ['keep', 'sell', 'donate', 'recycle', 'repair', 'repurpose', 'discard'])


export const products = pgTable("products", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "products_product_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	sellerId: uuid("seller_id").notNull(),
	title: text().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('THB').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }),
	condition: productCondition().notNull(),
	location: text().notNull(),
	description: text().notNull(),
	tags: jsonb().default([]).notNull(),
	isSold: boolean("is_sold").default(false).notNull(),
	priceType: priceType("price_type").default('fixed').notNull(),
	stats: jsonb().default({"likes":0,"views":0}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.categoryId],
			name: "products_category_id_categories_category_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sellerId],
			foreignColumns: [userProfiles.profileId],
			name: "products_seller_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
]);

export const giveAndGlowReviews = pgTable("give_and_glow_reviews", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "give_and_glow_reviews_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }),
	giverId: uuid("giver_id").notNull(),
	receiverId: uuid("receiver_id").notNull(),
	category: productCategory().notNull(),
	rating: integer().notNull(),
	review: text().notNull(),
	timestamp: text().notNull(),
	tags: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.giverId],
			foreignColumns: [userProfiles.profileId],
			name: "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "give_and_glow_reviews_product_id_products_product_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [userProfiles.profileId],
			name: "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
]);

export const userProfiles = pgTable("user_profiles", {
	profileId: uuid("profile_id").primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	avatarUrl: text("avatar_url"),
	bio: text(),
	location: text().notNull(),
	totalLikes: integer("total_likes").default(0).notNull(),
	totalViews: integer("total_views").default(0).notNull(),
	totalListings: integer("total_listings").default(0).notNull(),
	responseRate: numeric("response_rate", { precision: 10, scale:  2 }).default('0.00').notNull(),
	responseTime: text("response_time").default('< 1 hour').notNull(),
	rating: numeric({ precision: 10, scale:  2 }).default('0.00').notNull(),
	appreciationBadge: boolean("appreciation_badge").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [users.id],
			name: "user_profiles_profile_id_users_id_fk"
		}).onDelete("cascade"),
	check("rating_check", sql`(rating >= (0)::numeric) AND (rating <= (5)::numeric)`),
]);

export const letGoBuddySessions = pgTable("let_go_buddy_sessions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sessionId: bigint("session_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "let_go_buddy_sessions_session_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	userId: uuid("user_id").notNull(),
	situation: declutterSituation().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.profileId],
			name: "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk"
		}),
]);

export const itemAnalyses = pgTable("item_analyses", {
	analysisId: uuid("analysis_id").defaultRandom().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sessionId: bigint("session_id", { mode: "number" }).notNull(),
	itemName: text("item_name").notNull(),
	itemCategory: productCategory("item_category").notNull(),
	itemCondition: productCondition("item_condition").notNull(),
	recommendation: recommendationAction().notNull(),
	aiSuggestion: text("ai_suggestion").notNull(),
	emotionalScore: integer("emotional_score").notNull(),
	environmentalImpact: environmentalImpactLevel("environmental_impact").notNull(),
	co2Impact: numeric("co2_impact", { precision: 10, scale:  2 }).notNull(),
	landfillImpact: text("landfill_impact").notNull(),
	isRecyclable: boolean("is_recyclable").notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	currentValue: numeric("current_value", { precision: 10, scale:  2 }),
	aiListingPrice: numeric("ai_listing_price", { precision: 10, scale:  2 }),
	maintenanceCost: numeric("maintenance_cost", { precision: 10, scale:  2 }).default('0'),
	spaceValue: numeric("space_value", { precision: 10, scale:  2 }).default('0'),
	aiListingTitle: text("ai_listing_title"),
	aiListingDescription: text("ai_listing_description"),
	aiListingLocation: text("ai_listing_location"),
	images: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [letGoBuddySessions.sessionId],
			name: "item_analyses_session_id_let_go_buddy_sessions_session_id_fk"
		}),
]);

export const localBusinesses = pgTable("local_businesses", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "local_businesses_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: text().notNull(),
	type: text(),
	location: text().notNull(),
	averageRating: numeric("average_rating", { precision: 3, scale:  2 }).default('0.00').notNull(),
	totalReviews: integer("total_reviews").default(0).notNull(),
	priceRange: text("price_range").notNull(),
	tags: jsonb().default([]).notNull(),
	image: text(),
	address: text(),
	website: text(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const localTipComments = pgTable("local_tip_comments", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	commentId: bigint("comment_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "local_tip_comments_comment_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	postId: bigint("post_id", { mode: "number" }).notNull(),
	author: uuid().notNull(),
	content: text().notNull(),
	likes: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.author],
			foreignColumns: [userProfiles.profileId],
			name: "local_tip_comments_author_user_profiles_profile_id_fk"
		}),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [localTipPosts.id],
			name: "local_tip_comments_post_id_local_tip_posts_id_fk"
		}),
]);

export const localTipPosts = pgTable("local_tip_posts", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "local_tip_posts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	title: text().notNull(),
	content: text().notNull(),
	category: localTipCategories().notNull(),
	location: text().notNull(),
	author: uuid().notNull(),
	stats: jsonb().default({"likes":0,"reviews":0,"comments":0}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.author],
			foreignColumns: [userProfiles.profileId],
			name: "local_tip_posts_author_user_profiles_profile_id_fk"
		}),
]);

export const userConversations = pgTable("user_conversations", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	conversationId: bigint("conversation_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "user_conversations_conversation_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const productViews = pgTable("product_views", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	viewId: bigint("view_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "product_views_view_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	userId: uuid("user_id"),
	viewedAt: timestamp("viewed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.profileId],
			name: "product_views_user_id_user_profiles_profile_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "categories_category_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: productCategory().notNull(),
});

export const userMessages = pgTable("user_messages", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	messageId: bigint("message_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "user_messages_message_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	conversationId: bigint("conversation_id", { mode: "number" }).notNull(),
	senderId: uuid("sender_id").notNull(),
	receiverId: uuid("receiver_id").notNull(),
	content: text().notNull(),
	messageType: messageType("message_type").default('text').notNull(),
	mediaUrl: text("media_url"),
	seen: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [userConversations.conversationId],
			name: "user_messages_conversation_id_user_conversations_conversation_i"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [userProfiles.profileId],
			name: "user_messages_receiver_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [userProfiles.profileId],
			name: "user_messages_sender_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
]);

export const userNotifications = pgTable("user_notifications", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	notificationId: bigint("notification_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "user_notifications_notification_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	type: notificationType().notNull(),
	senderId: uuid("sender_id").notNull(),
	receiverId: uuid("receiver_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	messageId: bigint("message_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	reviewId: bigint("review_id", { mode: "number" }),
	isRead: boolean("is_read").default(false).notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	data: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [userMessages.messageId],
			name: "user_notifications_message_id_user_messages_message_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "user_notifications_product_id_products_product_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [userProfiles.profileId],
			name: "user_notifications_receiver_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reviewId],
			foreignColumns: [giveAndGlowReviews.id],
			name: "user_notifications_review_id_give_and_glow_reviews_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [userProfiles.profileId],
			name: "user_notifications_sender_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
]);

export const userReviews = pgTable("user_reviews", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	reviewId: bigint("review_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "user_reviews_review_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	reviewerId: uuid("reviewer_id").notNull(),
	revieweeId: uuid("reviewee_id").notNull(),
	rating: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.revieweeId],
			foreignColumns: [userProfiles.profileId],
			name: "user_reviews_reviewee_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [userProfiles.profileId],
			name: "user_reviews_reviewer_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
]);

export const productLikes = pgTable("product_likes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "product_likes_product_id_products_product_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.profileId],
			name: "product_likes_user_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.productId, table.userId], name: "product_likes_product_id_user_id_pk"}),
]);

export const localTipCommentLikes = pgTable("local_tip_comment_likes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	commentId: bigint("comment_id", { mode: "number" }).notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [localTipComments.commentId],
			name: "local_tip_comment_likes_comment_id_local_tip_comments_comment_i"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.profileId],
			name: "local_tip_comment_likes_user_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.commentId, table.userId], name: "local_tip_comment_likes_comment_id_user_id_pk"}),
]);

export const localTipPostLikes = pgTable("local_tip_post_likes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	postId: bigint("post_id", { mode: "number" }).notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [localTipPosts.id],
			name: "local_tip_post_likes_post_id_local_tip_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userProfiles.profileId],
			name: "local_tip_post_likes_user_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.postId, table.userId], name: "local_tip_post_likes_post_id_user_id_pk"}),
]);

export const messageParticipants = pgTable("message_participants", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	conversationId: bigint("conversation_id", { mode: "number" }).notNull(),
	profileId: uuid("profile_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [userConversations.conversationId],
			name: "message_participants_conversation_id_user_conversations_convers"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [userProfiles.profileId],
			name: "message_participants_profile_id_user_profiles_profile_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.conversationId, table.profileId], name: "message_participants_conversation_id_profile_id_pk"}),
]);

export const productImages = pgTable("product_images", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }).notNull(),
	imageUrl: text("image_url").notNull(),
	imageOrder: integer("image_order").default(0).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "product_images_product_id_products_product_id_fk"
		}),
	primaryKey({ columns: [table.productId, table.imageOrder], name: "product_images_product_id_image_order_pk"}),
]);

export const localBusinessReviews = pgTable("local_business_reviews", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	businessId: bigint("business_id", { mode: "number" }).notNull(),
	rating: integer().notNull(),
	author: uuid().notNull(),
	authorAvatar: text("author_avatar"),
	timestamp: text().notNull(),
	tags: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	content: text(),
}, (table) => [
	foreignKey({
			columns: [table.author],
			foreignColumns: [userProfiles.profileId],
			name: "local_business_reviews_author_user_profiles_profile_id_fk"
		}),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [localBusinesses.id],
			name: "local_business_reviews_business_id_local_businesses_id_fk"
		}),
	primaryKey({ columns: [table.businessId, table.author], name: "local_business_reviews_business_id_author_pk"}),
]);
export const localReviewsListView = pgView("local_reviews_list_view", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	businessId: bigint("business_id", { mode: "number" }),
	businessName: text("business_name"),
	businessType: text("business_type"),
	rating: integer(),
	author: uuid(),
	authorUsername: text("author_username"),
	authorAvatar: text("author_avatar"),
	tags: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	content: text(),
}).as(sql`SELECT r.business_id, b.name AS business_name, b.type AS business_type, r.rating, r.author, u.username AS author_username, u.avatar_url AS author_avatar, r.tags, r.created_at, r.content FROM local_business_reviews r JOIN local_businesses b ON r.business_id = b.id JOIN user_profiles u ON r.author = u.profile_id`);

export const userLetGoBuddyStatsView = pgView("user_let_go_buddy_stats_view", {	userId: uuid("user_id"),
	username: text(),
	avatarUrl: text("avatar_url"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalSessions: bigint("total_sessions", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	completedSessions: bigint("completed_sessions", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalItemsAnalyzed: bigint("total_items_analyzed", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalItemsCompleted: bigint("total_items_completed", { mode: "number" }),
	totalCo2Saved: numeric("total_co2_saved"),
	avgEnvironmentalImpactScore: numeric("avg_environmental_impact_score"),
	totalValueCreated: numeric("total_value_created"),
	avgItemValue: numeric("avg_item_value"),
	avgEmotionalScore: numeric("avg_emotional_score"),
	mostCommonSituation: declutterSituation("most_common_situation"),
	mostCommonRecommendation: recommendationAction("most_common_recommendation"),
	lastSessionDate: timestamp("last_session_date", { mode: 'string' }),
	lastItemAnalysisDate: timestamp("last_item_analysis_date", { mode: 'string' }),
}).as(sql`SELECT sessions.user_id, user_profiles.username, user_profiles.avatar_url, count(DISTINCT sessions.session_id) AS total_sessions, count(DISTINCT CASE WHEN sessions.is_completed THEN sessions.session_id ELSE NULL::bigint END) AS completed_sessions, count(items.analysis_id) AS total_items_analyzed, count( CASE WHEN items.recommendation = ANY (ARRAY['sell'::recommendation_action, 'donate'::recommendation_action, 'recycle'::recommendation_action, 'repurpose'::recommendation_action, 'discard'::recommendation_action]) THEN items.analysis_id ELSE NULL::uuid END) AS total_items_completed, sum(items.co2_impact) AS total_co2_saved, avg( CASE WHEN items.environmental_impact = 'low'::environmental_impact_level THEN 1 WHEN items.environmental_impact = 'medium'::environmental_impact_level THEN 2 WHEN items.environmental_impact = 'high'::environmental_impact_level THEN 3 WHEN items.environmental_impact = 'critical'::environmental_impact_level THEN 4 ELSE 0 END) AS avg_environmental_impact_score, sum(COALESCE(items.ai_listing_price, items.current_value, 0::numeric)) AS total_value_created, avg(COALESCE(items.ai_listing_price, items.current_value, 0::numeric)) AS avg_item_value, avg(items.emotional_score) AS avg_emotional_score, mode() WITHIN GROUP (ORDER BY sessions.situation) AS most_common_situation, mode() WITHIN GROUP (ORDER BY items.recommendation) AS most_common_recommendation, max(sessions.created_at) AS last_session_date, max(items.created_at) AS last_item_analysis_date FROM let_go_buddy_sessions sessions JOIN user_profiles ON sessions.user_id = user_profiles.profile_id LEFT JOIN item_analyses items ON sessions.session_id = items.session_id GROUP BY sessions.user_id, user_profiles.username, user_profiles.avatar_url`);

export const productsListingsView = pgView("products_listings_view", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	productId: bigint("product_id", { mode: "number" }),
	title: text(),
	price: numeric({ precision: 10, scale:  2 }),
	currency: text(),
	condition: productCondition(),
	location: text(),
	description: text(),
	tags: jsonb(),
	isSold: boolean("is_sold"),
	priceType: priceType("price_type"),
	stats: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	categoryName: productCategory("category_name"),
	sellerId: uuid("seller_id"),
	sellerName: text("seller_name"),
	sellerAvatar: text("seller_avatar"),
	sellerLocation: text("seller_location"),
	sellerRating: numeric("seller_rating", { precision: 10, scale:  2 }),
	sellerResponseRate: numeric("seller_response_rate", { precision: 10, scale:  2 }),
	sellerResponseTime: text("seller_response_time"),
	sellerAppreciationBadge: boolean("seller_appreciation_badge"),
	primaryImage: text("primary_image"),
	likesCount: integer("likes_count"),
	viewsCount: integer("views_count"),
}).as(sql`SELECT p.product_id, p.title, p.price, p.currency, p.condition, p.location, p.description, p.tags, p.is_sold, p.price_type, p.stats, p.created_at, p.updated_at, c.name AS category_name, up.profile_id AS seller_id, up.username AS seller_name, up.avatar_url AS seller_avatar, up.location AS seller_location, up.rating AS seller_rating, up.response_rate AS seller_response_rate, up.response_time AS seller_response_time, up.appreciation_badge AS seller_appreciation_badge, COALESCE(( SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_primary = true LIMIT 1), ( SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.image_order LIMIT 1), '/sample.png'::text) AS primary_image, COALESCE(p.stats ->> 'likes'::text, '0'::text)::integer AS likes_count, COALESCE(p.stats ->> 'views'::text, '0'::text)::integer AS views_count FROM products p LEFT JOIN categories c ON p.category_id = c.category_id LEFT JOIN user_profiles up ON p.seller_id = up.profile_id WHERE p.is_sold = false ORDER BY p.created_at DESC`);

export const localTipsListView = pgView("local_tips_list_view", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }),
	title: text(),
	content: text(),
	category: localTipCategories(),
	location: text(),
	author: uuid(),
	stats: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	username: text(),
	avatarUrl: text("avatar_url"),
}).as(sql`SELECT local_tip_posts.id, local_tip_posts.title, local_tip_posts.content, local_tip_posts.category, local_tip_posts.location, local_tip_posts.author, local_tip_posts.stats, local_tip_posts.created_at, local_tip_posts.updated_at, user_profiles.username, user_profiles.avatar_url FROM local_tip_posts LEFT JOIN user_profiles ON local_tip_posts.author = user_profiles.profile_id`);

export const localBusinessesListView = pgView("local_businesses_list_view", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }),
	name: text(),
	type: text(),
	location: text(),
	image: text(),
	tags: jsonb(),
	priceRange: text("price_range"),
	address: text(),
	website: text(),
	description: text(),
	averageRating: numeric("average_rating"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
}).as(sql`SELECT b.id, b.name, b.type, b.location, b.image, b.tags, b.price_range, b.address, b.website, b.description, COALESCE(avg(r.rating), 0::numeric) AS average_rating, count(r.rating) AS total_reviews FROM local_businesses b LEFT JOIN local_business_reviews r ON b.id = r.business_id GROUP BY b.id`);

export const itemAnalysesDetailedView = pgView("item_analyses_detailed_view", {	analysisId: uuid("analysis_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sessionId: bigint("session_id", { mode: "number" }),
	itemName: text("item_name"),
	itemCategory: productCategory("item_category"),
	itemCondition: productCondition("item_condition"),
	recommendation: recommendationAction(),
	aiSuggestion: text("ai_suggestion"),
	emotionalScore: integer("emotional_score"),
	environmentalImpact: environmentalImpactLevel("environmental_impact"),
	co2Impact: numeric("co2_impact", { precision: 10, scale:  2 }),
	landfillImpact: text("landfill_impact"),
	isRecyclable: boolean("is_recyclable"),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	currentValue: numeric("current_value", { precision: 10, scale:  2 }),
	aiListingPrice: numeric("ai_listing_price", { precision: 10, scale:  2 }),
	maintenanceCost: numeric("maintenance_cost", { precision: 10, scale:  2 }),
	spaceValue: numeric("space_value", { precision: 10, scale:  2 }),
	aiListingTitle: text("ai_listing_title"),
	aiListingDescription: text("ai_listing_description"),
	aiListingLocation: text("ai_listing_location"),
	images: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	situation: declutterSituation(),
	sessionCompleted: boolean("session_completed"),
	sessionCreatedAt: timestamp("session_created_at", { mode: 'string' }),
	username: text(),
	avatarUrl: text("avatar_url"),
	userLocation: text("user_location"),
	isDecisionMade: boolean("is_decision_made"),
	recommendationDisplay: text("recommendation_display"),
	environmentalImpactDisplay: text("environmental_impact_display"),
	effectiveValue: numeric("effective_value"),
	valueChangePercentage: numeric("value_change_percentage"),
	emotionalAttachmentLevel: text("emotional_attachment_level"),
}).as(sql`SELECT items.analysis_id, items.session_id, items.item_name, items.item_category, items.item_condition, items.recommendation, items.ai_suggestion, items.emotional_score, items.environmental_impact, items.co2_impact, items.landfill_impact, items.is_recyclable, items.original_price, items.current_value, items.ai_listing_price, items.maintenance_cost, items.space_value, items.ai_listing_title, items.ai_listing_description, items.ai_listing_location, items.images, items.created_at, items.updated_at, sessions.situation, sessions.is_completed AS session_completed, sessions.created_at AS session_created_at, user_profiles.username, user_profiles.avatar_url, user_profiles.location AS user_location, CASE WHEN items.recommendation = ANY (ARRAY['sell'::recommendation_action, 'donate'::recommendation_action, 'recycle'::recommendation_action, 'repurpose'::recommendation_action, 'discard'::recommendation_action]) THEN true ELSE false END AS is_decision_made, CASE WHEN items.recommendation = 'keep'::recommendation_action THEN 'Keep Item'::text WHEN items.recommendation = 'sell'::recommendation_action THEN 'Sell Item'::text WHEN items.recommendation = 'donate'::recommendation_action THEN 'Donate Item'::text WHEN items.recommendation = 'recycle'::recommendation_action THEN 'Recycle Item'::text WHEN items.recommendation = 'repair'::recommendation_action THEN 'Repair Item'::text WHEN items.recommendation = 'repurpose'::recommendation_action THEN 'Repurpose Item'::text WHEN items.recommendation = 'discard'::recommendation_action THEN 'Discard Item'::text ELSE 'Unknown'::text END AS recommendation_display, CASE WHEN items.environmental_impact = 'low'::environmental_impact_level THEN 'Low Impact'::text WHEN items.environmental_impact = 'medium'::environmental_impact_level THEN 'Medium Impact'::text WHEN items.environmental_impact = 'high'::environmental_impact_level THEN 'High Impact'::text WHEN items.environmental_impact = 'critical'::environmental_impact_level THEN 'Critical Impact'::text ELSE 'Unknown'::text END AS environmental_impact_display, COALESCE(items.ai_listing_price, items.current_value, 0::numeric) AS effective_value, CASE WHEN items.original_price IS NOT NULL AND items.original_price > 0::numeric THEN round((COALESCE(items.ai_listing_price, items.current_value, 0::numeric) - items.original_price) / items.original_price * 100::numeric, 2) ELSE NULL::numeric END AS value_change_percentage, CASE WHEN items.emotional_score >= 8 THEN 'Very High Attachment'::text WHEN items.emotional_score >= 6 THEN 'High Attachment'::text WHEN items.emotional_score >= 4 THEN 'Moderate Attachment'::text WHEN items.emotional_score >= 2 THEN 'Low Attachment'::text ELSE 'Very Low Attachment'::text END AS emotional_attachment_level FROM item_analyses items JOIN let_go_buddy_sessions sessions ON items.session_id = sessions.session_id JOIN user_profiles ON sessions.user_id = user_profiles.profile_id ORDER BY items.created_at DESC`);

export const usersView = pgView("users_view", {	userId: uuid("user_id"),
	profileId: uuid("profile_id"),
	username: text(),
	email: text(),
	avatarUrl: text("avatar_url"),
	bio: text(),
	location: text(),
	totalLikes: integer("total_likes"),
	totalViews: integer("total_views"),
	totalListings: integer("total_listings"),
	responseRate: numeric("response_rate", { precision: 10, scale:  2 }),
	responseTime: text("response_time"),
	rating: numeric({ precision: 10, scale:  2 }),
	appreciationBadge: boolean("appreciation_badge"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}).as(sql`SELECT u.id AS user_id, up.profile_id, up.username, up.email, up.avatar_url, up.bio, up.location, up.total_likes, up.total_views, up.total_listings, up.response_rate, up.response_time, up.rating, up.appreciation_badge, up.created_at, up.updated_at FROM auth.users u LEFT JOIN user_profiles up ON u.id = up.profile_id`);

export const environmentalImpactSummaryView = pgView("environmental_impact_summary_view", {	userId: uuid("user_id"),
	username: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sessionId: bigint("session_id", { mode: "number" }),
	situation: declutterSituation(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalItems: bigint("total_items", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	recyclableItems: bigint("recyclable_items", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	itemsToRecycle: bigint("items_to_recycle", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	itemsToDonate: bigint("items_to_donate", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	itemsToSell: bigint("items_to_sell", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	itemsToKeep: bigint("items_to_keep", { mode: "number" }),
	totalCo2Impact: numeric("total_co2_impact"),
	avgCo2Impact: numeric("avg_co2_impact"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lowImpactItems: bigint("low_impact_items", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	mediumImpactItems: bigint("medium_impact_items", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	highImpactItems: bigint("high_impact_items", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	criticalImpactItems: bigint("critical_impact_items", { mode: "number" }),
	totalValueCreated: numeric("total_value_created"),
	totalOriginalValue: numeric("total_original_value"),
	sessionDate: timestamp("session_date", { mode: 'string' }),
	isCompleted: boolean("is_completed"),
}).as(sql`SELECT sessions.user_id, user_profiles.username, sessions.session_id, sessions.situation, count(*) AS total_items, count( CASE WHEN items.is_recyclable THEN 1 ELSE NULL::integer END) AS recyclable_items, count( CASE WHEN items.recommendation = 'recycle'::recommendation_action THEN 1 ELSE NULL::integer END) AS items_to_recycle, count( CASE WHEN items.recommendation = 'donate'::recommendation_action THEN 1 ELSE NULL::integer END) AS items_to_donate, count( CASE WHEN items.recommendation = 'sell'::recommendation_action THEN 1 ELSE NULL::integer END) AS items_to_sell, count( CASE WHEN items.recommendation = 'keep'::recommendation_action THEN 1 ELSE NULL::integer END) AS items_to_keep, sum(items.co2_impact) AS total_co2_impact, avg(items.co2_impact) AS avg_co2_impact, count( CASE WHEN items.environmental_impact = 'low'::environmental_impact_level THEN 1 ELSE NULL::integer END) AS low_impact_items, count( CASE WHEN items.environmental_impact = 'medium'::environmental_impact_level THEN 1 ELSE NULL::integer END) AS medium_impact_items, count( CASE WHEN items.environmental_impact = 'high'::environmental_impact_level THEN 1 ELSE NULL::integer END) AS high_impact_items, count( CASE WHEN items.environmental_impact = 'critical'::environmental_impact_level THEN 1 ELSE NULL::integer END) AS critical_impact_items, sum(COALESCE(items.ai_listing_price, items.current_value, 0::numeric)) AS total_value_created, sum(COALESCE(items.original_price, 0::numeric)) AS total_original_value, sessions.created_at AS session_date, sessions.is_completed FROM let_go_buddy_sessions sessions JOIN user_profiles ON sessions.user_id = user_profiles.profile_id LEFT JOIN item_analyses items ON sessions.session_id = items.session_id GROUP BY sessions.user_id, user_profiles.username, sessions.session_id, sessions.situation, sessions.created_at, sessions.is_completed ORDER BY sessions.created_at DESC`);

export const letGoBuddySessionsWithItemsView = pgView("let_go_buddy_sessions_with_items_view", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sessionId: bigint("session_id", { mode: "number" }),
	userId: uuid("user_id"),
	situation: declutterSituation(),
	sessionCreatedAt: timestamp("session_created_at", { mode: 'string' }),
	sessionUpdatedAt: timestamp("session_updated_at", { mode: 'string' }),
	isCompleted: boolean("is_completed"),
	username: text(),
	avatarUrl: text("avatar_url"),
	userLocation: text("user_location"),
	analysisId: uuid("analysis_id"),
	itemName: text("item_name"),
	itemCategory: productCategory("item_category"),
	itemCondition: productCondition("item_condition"),
	recommendation: recommendationAction(),
	aiSuggestion: text("ai_suggestion"),
	emotionalScore: integer("emotional_score"),
	environmentalImpact: environmentalImpactLevel("environmental_impact"),
	co2Impact: numeric("co2_impact", { precision: 10, scale:  2 }),
	landfillImpact: text("landfill_impact"),
	isRecyclable: boolean("is_recyclable"),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	currentValue: numeric("current_value", { precision: 10, scale:  2 }),
	aiListingPrice: numeric("ai_listing_price", { precision: 10, scale:  2 }),
	maintenanceCost: numeric("maintenance_cost", { precision: 10, scale:  2 }),
	spaceValue: numeric("space_value", { precision: 10, scale:  2 }),
	aiListingTitle: text("ai_listing_title"),
	aiListingDescription: text("ai_listing_description"),
	aiListingLocation: text("ai_listing_location"),
	images: jsonb(),
	itemCreatedAt: timestamp("item_created_at", { mode: 'string' }),
	itemUpdatedAt: timestamp("item_updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalItemsInSession: bigint("total_items_in_session", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	completedItemsInSession: bigint("completed_items_in_session", { mode: "number" }),
	totalCo2Impact: numeric("total_co2_impact"),
	totalValueCreated: numeric("total_value_created"),
	avgEmotionalScore: numeric("avg_emotional_score"),
}).as(sql`SELECT sessions.session_id, sessions.user_id, sessions.situation, sessions.created_at AS session_created_at, sessions.updated_at AS session_updated_at, sessions.is_completed, user_profiles.username, user_profiles.avatar_url, user_profiles.location AS user_location, items.analysis_id, items.item_name, items.item_category, items.item_condition, items.recommendation, items.ai_suggestion, items.emotional_score, items.environmental_impact, items.co2_impact, items.landfill_impact, items.is_recyclable, items.original_price, items.current_value, items.ai_listing_price, items.maintenance_cost, items.space_value, items.ai_listing_title, items.ai_listing_description, items.ai_listing_location, items.images, items.created_at AS item_created_at, items.updated_at AS item_updated_at, count(*) OVER (PARTITION BY sessions.session_id) AS total_items_in_session, count(*) FILTER (WHERE items.recommendation = ANY (ARRAY['sell'::recommendation_action, 'donate'::recommendation_action, 'recycle'::recommendation_action, 'repurpose'::recommendation_action, 'discard'::recommendation_action])) OVER (PARTITION BY sessions.session_id) AS completed_items_in_session, sum(items.co2_impact) OVER (PARTITION BY sessions.session_id) AS total_co2_impact, sum(COALESCE(items.ai_listing_price, items.current_value, 0::numeric)) OVER (PARTITION BY sessions.session_id) AS total_value_created, avg(items.emotional_score) OVER (PARTITION BY sessions.session_id) AS avg_emotional_score FROM let_go_buddy_sessions sessions JOIN user_profiles ON sessions.user_id = user_profiles.profile_id LEFT JOIN item_analyses items ON sessions.session_id = items.session_id ORDER BY sessions.created_at DESC, items.created_at`);