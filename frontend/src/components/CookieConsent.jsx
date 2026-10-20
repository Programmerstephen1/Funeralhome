import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "last-planner-cookie-consent-v1";
const SETTINGS_EVENT = "open-cookie-settings";

function saveConsent(choice) {
  const value = {
    necessary: true,
    analytics: choice === "accept_optional",
    choice,
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    // Keep the current-page choice even if browser storage is unavailable.
  }
  return value;
}

export default function CookieConsent() {
  const [consent, setConsent] = useState(undefined);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "null");
      setConsent(stored?.necessary === true ? stored : null);
    } catch {
      setConsent(null);
    }
    const openSettings = () => setConsent(null);
    window.addEventListener(SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(SETTINGS_EVENT, openSettings);
  }, []);

  const choose = (choice) => setConsent(saveConsent(choice));

  if (consent === undefined) return null;

  return (
    <>
      {consent === null ? (
        <section
          aria-label="Cookie preferences"
          aria-describedby="cookie-consent-description"
          className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-3xl rounded-xl border border-[#D8CFBC] bg-white p-5 shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6"
          role="region"
        >
          <h2 className="font-serif text-lg font-semibold text-[#1F2E27]">
            Your privacy choices
          </h2>
          <p id="cookie-consent-description" className="mt-2 text-sm leading-relaxed text-[#3D3530]">
            Essential browser storage supports site features. Optional analytics are currently not configured. You can choose essential only or allow optional analytics if enabled later. Read our <Link to="/privacy" className="font-semibold text-[#805400] underline">Privacy Policy</Link>.
          </p>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => choose("essential_only")} className="min-h-11 rounded border border-[#1F2E27] px-4 py-2 text-sm font-semibold text-[#1F2E27] hover:bg-[#F8F6F0] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#7C4A03]">
              Essential only
            </button>
            <button type="button" onClick={() => choose("accept_optional")} className="min-h-11 rounded bg-[#1F2E27] px-4 py-2 text-sm font-semibold text-white hover:bg-[#34483E] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#7C4A03]">
              Accept optional
            </button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setConsent(null)}
          className="fixed bottom-3 left-3 z-[110] min-h-11 rounded-full border border-[#D8CFBC] bg-white px-4 py-2 text-xs font-semibold text-[#1F2E27] shadow-lg hover:bg-[#F8F6F0] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#7C4A03] sm:bottom-5 sm:left-5"
          aria-label="Change cookie preferences"
        >
          Cookie settings
        </button>
      )}
    </>
  );
}

export { SETTINGS_EVENT };
