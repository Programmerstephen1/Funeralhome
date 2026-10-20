import * as Sentry from "@sentry/react";

let monitoringEnabled = false;

function scrubEvent(event) {
  event.user = undefined;
  event.extra = undefined;
  event.message = undefined;

  for (const exception of event.exception?.values ?? []) {
    exception.value = exception.type ?? "Error";
  }

  if (event.request) {
    event.request.data = undefined;
    event.request.headers = undefined;
    event.request.cookies = undefined;
    event.request.query_string = undefined;
    event.request.url = undefined;
  }

  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs
      .filter((breadcrumb) => !["console", "navigation", "ui"].includes(breadcrumb.category))
      .map((breadcrumb) => {
        if (["fetch", "xhr"].includes(breadcrumb.category)) {
          return {
            ...breadcrumb,
            data: {
              method: breadcrumb.data?.method,
              status_code: breadcrumb.data?.status_code,
            },
            message: undefined,
          };
        }
        return breadcrumb;
      });
  }

  return event;
}

export function initializeErrorMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  if (!dsn || monitoringEnabled) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: scrubEvent,
  });
  monitoringEnabled = true;
}

export function captureApplicationError(error) {
  if (monitoringEnabled) Sentry.captureException(error);
}
