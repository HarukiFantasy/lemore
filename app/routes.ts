import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),
  ...prefix("secondhand", [
    index("features/products/pages/secondhand-page.tsx"),
    route("/submit-a-listing", "features/products/pages/submit-a-listing-page.tsx"), 
    route("/browse-listings", "features/products/pages/browse-listings-page.tsx"),
    route("/product/:id", "features/products/pages/product-detail-page.tsx"),
  ]),
  ...prefix("community", [
    index("features/community/pages/community-page.tsx"),
    route("/local-tips", "features/community/pages/local-tips-page.tsx"),
    route("/local-reviews", "features/community/pages/local-reviews-page.tsx"),
    route("/give-and-glow", "features/community/pages/give-and-glow-page.tsx"),
  ]),
  route("/let-go-buddy", "features/let-go-buddy/pages/let-go-buddy-page.tsx"),
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
    route("/settings", "features/users/pages/settings-page.tsx"),
    route("/notifications", "features/users/pages/notifications-page.tsx"),
    route("/messages", "features/users/pages/messages-page.tsx"),
    route("/likes", "features/users/pages/likes-page.tsx"),
  ]),
  route("/users/:username", "features/users/pages/usersProfile-page.tsx"),
] satisfies RouteConfig;
