import { pgTable, foreignKey, bigint, uuid, text, numeric, jsonb, boolean, timestamp, integer, check, primaryKey, pgEnum } from "drizzle-orm/pg-core"
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
	isSold: boolean().default(false).notNull(),
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

export const localTipPosts = pgTable("local_tip_posts", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "local_tip_posts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	title: text().notNull(),
	content: text().notNull(),
	category: localTipCategories().notNull(),
	location: text().notNull(),
	author: uuid().notNull(),
	likes: integer().default(0).notNull(),
	comments: integer().default(0).notNull(),
	reviews: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.author],
			foreignColumns: [userProfiles.profileId],
			name: "local_tip_posts_author_user_profiles_profile_id_fk"
		}),
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
