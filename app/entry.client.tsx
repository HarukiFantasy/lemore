import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import * as Sentry from "@sentry/react-router";

Sentry.init({
  dsn: "https://a32a79a5695bb0c3235e2d6c59ef9891@o4509695700107264.ingest.us.sentry.io/4509695711182848",
  sendDefaultPii: true,
  integrations: [
    Sentry.replayIntegration()
  ],
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0,
  });

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
