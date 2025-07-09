import { relations } from "drizzle-orm/relations";
import { categories, products, userProfiles, giveAndGlowReviews, usersInAuth, letGoBuddySessions, itemAnalyses, localTipComments, localTipPosts, productViews, userConversations, userMessages, userNotifications, userReviews, productLikes, localTipCommentLikes, localTipPostLikes, messageParticipants, productImages, localBusinessReviews, localBusinesses } from "./schema";

export const productsRelations = relations(products, ({one, many}) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.categoryId]
	}),
	userProfile: one(userProfiles, {
		fields: [products.sellerId],
		references: [userProfiles.profileId]
	}),
	giveAndGlowReviews: many(giveAndGlowReviews),
	userNotifications: many(userNotifications),
	productLikes: many(productLikes),
	productImages: many(productImages),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const userProfilesRelations = relations(userProfiles, ({one, many}) => ({
	products: many(products),
	giveAndGlowReviews_giverId: many(giveAndGlowReviews, {
		relationName: "giveAndGlowReviews_giverId_userProfiles_profileId"
	}),
	giveAndGlowReviews_receiverId: many(giveAndGlowReviews, {
		relationName: "giveAndGlowReviews_receiverId_userProfiles_profileId"
	}),
	usersInAuth: one(usersInAuth, {
		fields: [userProfiles.profileId],
		references: [usersInAuth.id]
	}),
	letGoBuddySessions: many(letGoBuddySessions),
	localTipComments: many(localTipComments),
	localTipPosts: many(localTipPosts),
	productViews: many(productViews),
	userMessages_receiverId: many(userMessages, {
		relationName: "userMessages_receiverId_userProfiles_profileId"
	}),
	userMessages_senderId: many(userMessages, {
		relationName: "userMessages_senderId_userProfiles_profileId"
	}),
	userNotifications_receiverId: many(userNotifications, {
		relationName: "userNotifications_receiverId_userProfiles_profileId"
	}),
	userNotifications_senderId: many(userNotifications, {
		relationName: "userNotifications_senderId_userProfiles_profileId"
	}),
	userReviews_revieweeId: many(userReviews, {
		relationName: "userReviews_revieweeId_userProfiles_profileId"
	}),
	userReviews_reviewerId: many(userReviews, {
		relationName: "userReviews_reviewerId_userProfiles_profileId"
	}),
	productLikes: many(productLikes),
	localTipCommentLikes: many(localTipCommentLikes),
	localTipPostLikes: many(localTipPostLikes),
	messageParticipants: many(messageParticipants),
	localBusinessReviews: many(localBusinessReviews),
}));

export const giveAndGlowReviewsRelations = relations(giveAndGlowReviews, ({one, many}) => ({
	userProfile_giverId: one(userProfiles, {
		fields: [giveAndGlowReviews.giverId],
		references: [userProfiles.profileId],
		relationName: "giveAndGlowReviews_giverId_userProfiles_profileId"
	}),
	product: one(products, {
		fields: [giveAndGlowReviews.productId],
		references: [products.productId]
	}),
	userProfile_receiverId: one(userProfiles, {
		fields: [giveAndGlowReviews.receiverId],
		references: [userProfiles.profileId],
		relationName: "giveAndGlowReviews_receiverId_userProfiles_profileId"
	}),
	userNotifications: many(userNotifications),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	userProfiles: many(userProfiles),
}));

export const letGoBuddySessionsRelations = relations(letGoBuddySessions, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [letGoBuddySessions.userId],
		references: [userProfiles.profileId]
	}),
	itemAnalyses: many(itemAnalyses),
}));

export const itemAnalysesRelations = relations(itemAnalyses, ({one}) => ({
	letGoBuddySession: one(letGoBuddySessions, {
		fields: [itemAnalyses.sessionId],
		references: [letGoBuddySessions.sessionId]
	}),
}));

export const localTipCommentsRelations = relations(localTipComments, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [localTipComments.author],
		references: [userProfiles.profileId]
	}),
	localTipPost: one(localTipPosts, {
		fields: [localTipComments.postId],
		references: [localTipPosts.id]
	}),
	localTipCommentLikes: many(localTipCommentLikes),
}));

export const localTipPostsRelations = relations(localTipPosts, ({one, many}) => ({
	localTipComments: many(localTipComments),
	userProfile: one(userProfiles, {
		fields: [localTipPosts.author],
		references: [userProfiles.profileId]
	}),
	localTipPostLikes: many(localTipPostLikes),
}));

export const productViewsRelations = relations(productViews, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [productViews.userId],
		references: [userProfiles.profileId]
	}),
}));

export const userMessagesRelations = relations(userMessages, ({one, many}) => ({
	userConversation: one(userConversations, {
		fields: [userMessages.conversationId],
		references: [userConversations.conversationId]
	}),
	userProfile_receiverId: one(userProfiles, {
		fields: [userMessages.receiverId],
		references: [userProfiles.profileId],
		relationName: "userMessages_receiverId_userProfiles_profileId"
	}),
	userProfile_senderId: one(userProfiles, {
		fields: [userMessages.senderId],
		references: [userProfiles.profileId],
		relationName: "userMessages_senderId_userProfiles_profileId"
	}),
	userNotifications: many(userNotifications),
}));

export const userConversationsRelations = relations(userConversations, ({many}) => ({
	userMessages: many(userMessages),
	messageParticipants: many(messageParticipants),
}));

export const userNotificationsRelations = relations(userNotifications, ({one}) => ({
	userMessage: one(userMessages, {
		fields: [userNotifications.messageId],
		references: [userMessages.messageId]
	}),
	product: one(products, {
		fields: [userNotifications.productId],
		references: [products.productId]
	}),
	userProfile_receiverId: one(userProfiles, {
		fields: [userNotifications.receiverId],
		references: [userProfiles.profileId],
		relationName: "userNotifications_receiverId_userProfiles_profileId"
	}),
	giveAndGlowReview: one(giveAndGlowReviews, {
		fields: [userNotifications.reviewId],
		references: [giveAndGlowReviews.id]
	}),
	userProfile_senderId: one(userProfiles, {
		fields: [userNotifications.senderId],
		references: [userProfiles.profileId],
		relationName: "userNotifications_senderId_userProfiles_profileId"
	}),
}));

export const userReviewsRelations = relations(userReviews, ({one}) => ({
	userProfile_revieweeId: one(userProfiles, {
		fields: [userReviews.revieweeId],
		references: [userProfiles.profileId],
		relationName: "userReviews_revieweeId_userProfiles_profileId"
	}),
	userProfile_reviewerId: one(userProfiles, {
		fields: [userReviews.reviewerId],
		references: [userProfiles.profileId],
		relationName: "userReviews_reviewerId_userProfiles_profileId"
	}),
}));

export const productLikesRelations = relations(productLikes, ({one}) => ({
	product: one(products, {
		fields: [productLikes.productId],
		references: [products.productId]
	}),
	userProfile: one(userProfiles, {
		fields: [productLikes.userId],
		references: [userProfiles.profileId]
	}),
}));

export const localTipCommentLikesRelations = relations(localTipCommentLikes, ({one}) => ({
	localTipComment: one(localTipComments, {
		fields: [localTipCommentLikes.commentId],
		references: [localTipComments.commentId]
	}),
	userProfile: one(userProfiles, {
		fields: [localTipCommentLikes.userId],
		references: [userProfiles.profileId]
	}),
}));

export const localTipPostLikesRelations = relations(localTipPostLikes, ({one}) => ({
	localTipPost: one(localTipPosts, {
		fields: [localTipPostLikes.postId],
		references: [localTipPosts.id]
	}),
	userProfile: one(userProfiles, {
		fields: [localTipPostLikes.userId],
		references: [userProfiles.profileId]
	}),
}));

export const messageParticipantsRelations = relations(messageParticipants, ({one}) => ({
	userConversation: one(userConversations, {
		fields: [messageParticipants.conversationId],
		references: [userConversations.conversationId]
	}),
	userProfile: one(userProfiles, {
		fields: [messageParticipants.profileId],
		references: [userProfiles.profileId]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.productId]
	}),
}));

export const localBusinessReviewsRelations = relations(localBusinessReviews, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [localBusinessReviews.author],
		references: [userProfiles.profileId]
	}),
	localBusiness: one(localBusinesses, {
		fields: [localBusinessReviews.businessId],
		references: [localBusinesses.id]
	}),
}));

export const localBusinessesRelations = relations(localBusinesses, ({many}) => ({
	localBusinessReviews: many(localBusinessReviews),
}));