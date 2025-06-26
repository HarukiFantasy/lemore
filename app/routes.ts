import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),
  ...prefix("secondhand", [
    index("features/products/pages/secondhand-page.tsx"),
    route("/submit-a-listing", "features/products/pages/submit-a-listing-page.tsx"), 
    route("/browse-listings", "features/products/pages/browse-listings-page.tsx"),
  ]),
  ...prefix("community", [
    index("features/community/pages/community-page.tsx"),
    route("/local-tips", "features/community/pages/local-tips-page.tsx"),
    route("/ask-and-answer", "features/community/pages/ask-and-answer-page.tsx"),
    route("/local-reviews", "features/community/pages/local-reviews-page.tsx"),
    route("/give-and-glow", "features/community/pages/give-and-glow-page.tsx"),
    route("/post", "features/community/pages/post-page.tsx"),
  ]),
  route("/let-go-buddy", "features/let-go-buddy/pages/let-go-buddy-page.tsx"),
] satisfies RouteConfig;
