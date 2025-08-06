import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),
  ...prefix("secondhand", [
    index("features/products/pages/secondhand-page.tsx"),
    route("/submit-a-listing", "features/products/pages/submit-a-listing-page.tsx"), 
    route("/browse-listings", "features/products/pages/browse-listings-page.tsx"),
    route("/product/:productId", "features/products/pages/product-detail-page.tsx"),
    route("/product/:productId/edit", "features/products/pages/edit-product-page.tsx"),
    route("/:productId/like", "features/products/pages/like-product-page.tsx"),
    
  ]),
  ...prefix("let-go-buddy", [
    index("features/let-go-buddy/pages/let-go-buddy-page.tsx"),
    route("chat/:session_id", "features/let-go-buddy/pages/let-go-buddy-chat-page.tsx"),
    route("analysis/:session_id", "features/let-go-buddy/pages/let-go-buddy-analysis-page.tsx"),
    route("challenge-calendar", "features/let-go-buddy/pages/challenge-calendar-page.tsx"),
  ]),

  ...prefix("/auth", [
    layout("features/auth/layouts/auth-layout.tsx", [
      route("/login", "features/auth/pages/login-page.tsx"),
      route("/join", "features/auth/pages/join-page.tsx"),
      ...prefix("/otp", [
        route("/start", "features/auth/pages/otp-start-page.tsx"),
        route("/complete", "features/auth/pages/otp-complete-page.tsx"),
      ]),
      ...prefix("/social/:provider", [
        route("/start", "features/auth/pages/social-start-page.tsx"),
        route("/complete", "features/auth/pages/social-complete-page.tsx"),
      ]),
    ]),
    route("/logout", "features/auth/pages/logout-page.tsx"),
  ]),
  ...prefix("/my", [
    route("/dashboard", "features/users/pages/dashboard-page.tsx"),
    route("/listings", "features/users/pages/user-listings-page.tsx"),
    route("/profile", "features/users/pages/profile-page.tsx"),
    route("/notifications", "features/users/pages/notifications-page.tsx"),
    route("/notifications/:notificationId/see", "features/users/pages/notification-see-page.tsx"),
    route("/messages", "features/users/pages/messages-page.tsx"),
    route("/likes", "features/users/pages/likes-page.tsx"),
  ]),
  route("/users/:username", "features/users/pages/usersProfile-page.tsx"),
  route("/api/send-welcome-email", "api/send-welcome-email.ts"),
  
  
  // Legal pages for Facebook OAuth
  route("/privacy-policy", "common/pages/privacy-policy-page.tsx"),
  route("/terms-of-service", "common/pages/terms-of-service-page.tsx"),
  route("/data-deletion", "common/pages/data-deletion-page.tsx"),
] satisfies RouteConfig;
