import React, { useState } from "react";
import { Building2, CheckCircle2, Loader2, ShieldCheck, AlertCircle, Phone } from "lucide-react";
import ProgressSteps from "../components/ProgressSteps";
import LocationPicker from "../components/LocationPicker";
import { getApiBaseUrl } from "../services/config";
import { BUSINESS, formatKES, getLocalDateInputValue } from "../config/business";
import { Link, useLocation } from "react-router-dom";

export default function CheckoutPage({ cart: accountCart }) {
  const location = useLocation();
  const cart = location.state?.cart || accountCart;
  const [formData, setFormData] = useState({ contactName: "", email: localStorage.getItem("userEmail") || "", venueName: "", burialDate: "", timing: "morning", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionNote, setSubmissionNote] = useState("");
  const [needsCall, setNeedsCall] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const subtotal = cart?.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0) || 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: "" }));
  };

  const requestQuote = async () => {
    setError("");
    const errors = {};
    if (!formData.contactName.trim()) errors.contactName = "Please add the contact person's name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim())) errors.email = "Please enter a valid email address.";
    if (!formData.phone.trim()) errors.phone = "Please add a contact phone number.";
    if (!formData.venueName.trim()) errors.venueName = "Please add the service or delivery location.";
    if (!formData.burialDate) errors.burialDate = "Please choose the requested service date.";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setError("Please complete the highlighted details.");
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const itemLines = cart.map((item) => `- ${item.quantity || 1} × ${item.title}: ${formatKES(Number(item.price) * (item.quantity || 1))} (listed item price)`).join("\n");
    const questions = [
      "CATALOG QUOTE AND AVAILABILITY REQUEST",
      `Requested by: ${formData.contactName.trim()}`,
      `Email: ${email}`,
      `Phone: ${formData.phone.trim()}`,
      `Requested date: ${formData.burialDate}`,
      `Timing preference: ${formData.timing === "morning" ? "Morning of service" : "Day prior (evening)"}`,
      `Location: ${formData.venueName.trim()}`,
      "Requested items:", itemLines,
      `Listed items subtotal: ${formatKES(subtotal)} (excludes delivery and any other charges not yet quoted)`,
      "Please confirm item/service availability and send a written, itemized final quote. Delivery charges depend on distance. No booking or payment is authorized by this request.",
    ].join("\n");

    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/consultation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.contactName.trim(), email, phone: formData.phone.trim(), questions }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || "We could not send your request. Please call us.");
      setSubmissionNote(data.message || "Your request has been received.");
      setNeedsCall(response.status === 202);
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message || "We could not send your request. Please call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F8F6F0] px-4 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#E8DFD1] bg-white shadow-sm"><ShieldCheck className="text-[#A8895C]" size={32} /></div>
        <h2 className="mb-4 text-2xl font-serif text-[#1F2E27]">Your selection is empty</h2>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-[#3D3530]">Browse the catalog and add items to request availability and a complete delivered quote.</p>
        <Link to="/catalog" className="rounded-full bg-[#1F2E27] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#A8895C]">Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-20">
      <div className="mb-8 border-b border-[#E8DFD1] bg-white py-6">
        <div className="site-container mx-auto max-w-4xl px-4">
          <ProgressSteps steps={[{ id: "selection", label: "Select items", description: "your choices" }, { id: "details", label: "Request a quote", description: "date and location" }, { id: "confirm", label: "Confirm together", description: "written estimate" }]} currentStep="details" title="Check availability before you commit" subtitle="Send your requested items, date, and location for a complete written quote." />
        </div>
      </div>

      <div className="site-container mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          {submitted ? (
            <section className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm" role="status">
              <CheckCircle2 className="mb-4 text-emerald-700" size={34} />
              <h1 className="mb-3 font-serif text-2xl text-[#1F2E27]">Quote request sent</h1>
              <p className="leading-relaxed text-[#3D3530]">{submissionNote} {!needsCall && "We will confirm availability, distance-based delivery, and the itemized total. This is not a booking and no payment has been taken."} {needsCall && "This request is not a booking and no payment has been taken."}</p>
              <p className="mt-4 text-sm text-[#716860]">Questions? Call <a className="font-semibold underline" href={`tel:${BUSINESS.phoneLink}`}>{BUSINESS.phoneDisplay}</a>.</p>
              <Link to="/catalog" className="mt-6 inline-flex rounded bg-[#1F2E27] px-5 py-3 font-semibold text-white hover:bg-[#A8895C]">Continue browsing</Link>
            </section>
          ) : (
            <section className="rounded-[1.25rem] border border-[#E8DFD1] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <p className="section-eyebrow">Availability request</p>
                <h1 className="mt-2 flex items-center gap-2 font-serif text-xl text-[#1F2E27]"><Building2 className="text-[#A8895C]" size={20} />Tell us where and when</h1>
                <p className="mt-2 text-sm leading-relaxed text-[#716860]">Your listed item prices remain visible. Delivery depends on distance. We’ll confirm availability and send the full price for your approval before any payment.</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="quote-contact-name" className="mb-2 block text-sm font-medium text-[#3D3530]">Your name</label>
                  <input id="quote-contact-name" name="contactName" autoComplete="name" value={formData.contactName} onChange={handleChange} className="w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none" aria-invalid={!!formErrors.contactName} />
                  {formErrors.contactName && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.contactName}</p>}
                </div>
                <div>
                  <label htmlFor="quote-contact-phone" className="mb-2 block text-sm font-medium text-[#3D3530]">Phone number</label>
                  <input id="quote-contact-phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} className="w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none" aria-invalid={!!formErrors.phone} />
                  {formErrors.phone && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="quote-contact-email" className="mb-2 block text-sm font-medium text-[#3D3530]">Email address</label>
                  <input id="quote-contact-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className="w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none" aria-invalid={!!formErrors.email} />
                  {formErrors.email && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="quote-location" className="mb-2 block text-sm font-medium text-[#3D3530]">Delivery or service location</label>
                  <LocationPicker id="quote-location" onLocationSelect={(address) => { setFormData((current) => ({ ...current, venueName: address })); setFormErrors((current) => ({ ...current, venueName: "" })); }} />
                  {formErrors.venueName && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.venueName}</p>}
                  <p className="mt-2 text-xs text-[#716860]">We use the location to calculate delivery. The final charge will be shown in your quote.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-service-date" className="mb-2 block text-sm font-medium text-[#3D3530]">Requested date</label>
                    <input id="quote-service-date" type="date" name="burialDate" min={getLocalDateInputValue()} value={formData.burialDate} onChange={handleChange} className="w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none" aria-invalid={!!formErrors.burialDate} />
                    {formErrors.burialDate && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.burialDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="quote-timing" className="mb-2 block text-sm font-medium text-[#3D3530]">Timing preference</label>
                    <select id="quote-timing" name="timing" value={formData.timing} onChange={handleChange} className="w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none">
                      <option value="morning">Morning of service</option><option value="prior">Day prior (evening)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-[1.25rem] border border-[#E8DFD1] bg-white p-6 shadow-sm md:sticky md:top-24 md:p-8" aria-label="Quote request summary">
          <h2 className="mb-6 border-b border-[#E8DFD1] pb-4 font-serif text-lg text-[#1F2E27]">Your selection</h2>
          <div className="mb-6 flex max-h-72 flex-col gap-4 overflow-y-auto pr-2">
            {cart.map((item, index) => <div key={item.cartItemId || item.id || index} className="flex items-start justify-between gap-3 text-sm"><span className="text-[#3D3530]">{item.quantity || 1} × {item.title}</span><span className="shrink-0 font-medium text-[#1F2E27]">{formatKES(Number(item.price) * (item.quantity || 1))}</span></div>)}
          </div>
          <div className="border-t border-[#E8DFD1] pt-5">
            <div className="flex justify-between gap-3 text-sm"><span>Listed items subtotal</span><strong>{formatKES(subtotal)}</strong></div>
            <p className="mt-4 text-xs leading-relaxed text-[#716860]">Delivery and any applicable charges are not included. The team will confirm them in an itemized quote based on your location. No charge is made when you request a quote.</p>
          </div>
          {error && <div className="mt-5 flex gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert"><AlertCircle size={18} className="shrink-0" />{error}</div>}
          {!submitted && <button type="button" onClick={requestQuote} disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[#1F2E27] py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#A8895C] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : "Request availability & quote"}</button>}
          <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#716860]"><Phone size={15} className="text-[#A8895C]" /><span>Questions? <a className="font-semibold underline" href={`tel:${BUSINESS.phoneLink}`}>{BUSINESS.phoneDisplay}</a></span></div>
        </aside>
      </div>
    </div>
  );
}
