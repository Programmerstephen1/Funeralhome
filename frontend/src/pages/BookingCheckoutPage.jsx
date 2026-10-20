import React, { useState } from "react";
import { Calendar, CheckCircle2, Loader2, Phone, AlertCircle, Car } from "lucide-react";
import ProgressSteps from "../components/ProgressSteps";
import { getApiBaseUrl } from "../services/config";
import { BUSINESS, formatKES } from "../config/business";
import { Link } from "react-router-dom";

export default function BookingCheckoutPage({ serviceBookings }) {
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(() => localStorage.getItem("userEmail") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionNote, setSubmissionNote] = useState("");
  const [needsCall, setNeedsCall] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const listedSubtotal = serviceBookings?.reduce((total, item) => total + Number(item.price || 0) * (item.quantity || 1), 0) || 0;

  const requestQuote = async () => {
    setError("");
    if (!contactName.trim() || !phone.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setFieldError("Enter your name, phone number, and a valid email address so we can respond to your request.");
      return;
    }
    setFieldError("");
    const contactEmail = email.trim().toLowerCase();
    const bookingLines = serviceBookings.map((item) => {
      const schedule = item.rentalSchedule || {};
      return `- ${item.title}: listed base ${formatKES(item.price)}; pickup ${schedule.pickup || "not supplied"}; destination ${schedule.dropoff || "not supplied"}; date ${schedule.pickupDate || schedule.date || "not supplied"}; return ${schedule.returnDate || "not applicable"}; time ${schedule.time || "not supplied"}`;
    }).join("\n");
    const questions = [
      "TRANSPORT AVAILABILITY AND FINAL QUOTE REQUEST",
      `Requested by: ${contactName.trim()}`,
      `Email: ${contactEmail}`,
      `Phone: ${phone.trim()}`,
      "Requested transport:", bookingLines,
      `Listed base subtotal: ${formatKES(listedSubtotal)} (final delivery/route charges depend on distance and are not included)`,
      "Please confirm vehicle and date availability and provide a written itemized quote for the route. This request is not a reservation and no payment is authorized until the customer accepts the quote.",
    ].join("\n");

    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/consultation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName.trim(), email: contactEmail, phone: phone.trim(), questions }),
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

  if (!serviceBookings || serviceBookings.length === 0) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F8F6F0] px-4 text-center"><Car size={40} className="mb-5 text-[#805400]" /><h1 className="mb-4 font-serif text-2xl text-[#1F2E27]">No transport requests selected</h1><Link to="/catalog" className="text-[#805400] underline">Return to catalog</Link></div>;
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-20">
      <header className="mb-8 border-b-4 border-[#A8895C] bg-[#1F2E27] px-4 py-10 text-center text-white">
        <h1 className="font-serif text-3xl md:text-4xl">Request transport availability</h1>
        <p className="mt-2 text-sm text-[#E8DFD1]">We confirm the vehicle, date, route charge, and complete quote before you commit.</p>
      </header>
      <div className="site-container mx-auto mb-8 max-w-6xl px-4"><ProgressSteps steps={[{ id: "selection", label: "Choose transport", description: "your vehicle" }, { id: "details", label: "Request a quote", description: "your route" }, { id: "confirm", label: "Confirm together", description: "written estimate" }]} currentStep="details" title="Confirm your route" subtitle="The route-based delivery charge will be confirmed by the team." /></div>

      <div className="site-container mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 lg:grid-cols-5">
        <section className="flex flex-col gap-5 lg:col-span-3">
          <h2 className="border-b border-[#E8DFD1] pb-4 font-serif text-xl text-[#1F2E27]">Transport selection</h2>
          {serviceBookings.map((item, index) => {
            const schedule = item.rentalSchedule || {};
            return <article key={item.cartItemId || item.id || index} className="flex flex-col gap-5 rounded border border-[#E8DFD1] bg-white p-5 shadow-sm sm:flex-row">
              <div className="aspect-[4/3] w-full shrink-0 overflow-hidden border border-[#E8DFD1] bg-[#F8F6F0] sm:w-1/3"><img src={item.images?.[0]} alt={item.title} className="h-full w-full object-cover" /></div>
              <div className="flex-1"><h3 className="font-serif text-xl text-[#1F2E27]">{item.title}</h3><p className="mt-1 font-medium text-[#805400]">Listed base {formatKES(item.price)}</p><div className="mt-4 space-y-2 text-sm text-[#3D3530]"><p><span className="font-semibold">Pick-up:</span> {schedule.pickup}</p><p><span className="font-semibold">Destination:</span> {schedule.dropoff}</p><p className="flex items-center gap-2"><Calendar size={15} className="text-[#805400]" />{schedule.pickupDate || schedule.date} {schedule.time ? `· ${schedule.time}` : ""}</p>{schedule.returnDate && <p><span className="font-semibold">Return:</span> {schedule.returnDate}</p>}</div></div>
            </article>;
          })}
        </section>

        <aside className="h-fit rounded border border-[#E8DFD1] bg-white p-6 shadow-sm lg:col-span-2 lg:sticky lg:top-24">
          {submitted ? <div role="status"><CheckCircle2 size={34} className="mb-4 text-emerald-700" /><h2 className="font-serif text-xl text-[#1F2E27]">Request {needsCall ? "saved" : "sent"}</h2><p className="mt-3 text-sm leading-relaxed text-[#3D3530]">{submissionNote} {!needsCall && "Vehicle and date availability and the route-based quote will be confirmed by the team. This request does not reserve the vehicle and no payment has been taken."}</p><p className="mt-4 text-sm text-[#716860]">Call <a href={`tel:${BUSINESS.phoneLink}`} className="font-semibold underline">{BUSINESS.phoneDisplay}</a> for help.</p></div> : <>
            <h2 className="mb-5 border-b border-[#E8DFD1] pb-4 font-serif text-xl text-[#1F2E27]">Your contact details</h2>
            <label htmlFor="transport-contact-name" className="mb-2 block text-sm font-medium text-[#3D3530]">Name</label><input id="transport-contact-name" autoComplete="name" value={contactName} onChange={(event) => setContactName(event.target.value)} className="mb-4 w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none" />
            <label htmlFor="transport-contact-phone" className="mb-2 block text-sm font-medium text-[#3D3530]">Phone number</label><input id="transport-contact-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none" />
            <label htmlFor="transport-contact-email" className="mb-2 mt-4 block text-sm font-medium text-[#3D3530]">Email address</label><input id="transport-contact-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-sm border border-[#E8DFD1] bg-[#F8F6F0] p-3 focus:border-[#A8895C] focus:outline-none" />
            {fieldError && <p className="mt-3 text-sm text-red-700" role="alert">{fieldError}</p>}
            <div className="mt-6 border-t border-[#E8DFD1] pt-5"><div className="flex justify-between gap-3 text-sm"><span>Listed base subtotal</span><strong>{formatKES(listedSubtotal)}</strong></div><p className="mt-3 text-xs leading-relaxed text-[#716860]">Route-based delivery is not included. The team will send the complete price before requesting a 10% planning deposit or any other payment.</p></div>
            {error && <p className="mt-4 flex gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert"><AlertCircle size={18} className="shrink-0" />{error}</p>}
            <button type="button" onClick={requestQuote} disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[#1F2E27] py-4 text-sm font-semibold uppercase tracking-widest text-white hover:bg-[#A8895C] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : "Request availability & quote"}</button>
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[#716860]"><Phone size={15} className="text-[#805400]" />No payment is taken with this request.</p>
          </>}
        </aside>
      </div>
    </div>
  );
}
