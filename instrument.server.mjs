import * as Sentry from "@sentry/react-router";

Sentry.init({
  dsn: "https://a32a79a5695bb0c3235e2d6c59ef9891@o4509695700107264.ingest.us.sentry.io/4509695711182848",

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
