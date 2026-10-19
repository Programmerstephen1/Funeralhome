import React from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "../config/business";

const sections = [
  {
    title: "Catalog prices and delivery",
    content: "Catalog amounts are the listed item or base rates. Casket size adjustments and other options are shown where available. Delivery and transport charges depend on distance and are not included unless a written quote says they are. Before you accept an order, we will confirm the items, options, route, availability, applicable charges and taxes, total amount, and any relevant timing in writing. A quote is valid for the period stated on it; availability must be reconfirmed when you accept it.",
  },
  {
    title: "Availability and when an arrangement is confirmed",
    content: "The website does not show live stock or calendar availability. Sending a quote request does not reserve stock, a vehicle, a service date, or a venue. We will check availability with you by phone or email. An arrangement is confirmed only when we have sent a written quote or agreement, you have accepted it, and any payment or planning deposit specified there has been received. Do not pay an amount that has not been included in the quote or agreement.",
  },
  {
    title: "Planning service deposit",
    content: `A compulsory deposit of ${BUSINESS.planningDepositPercent}% of the agreed planning fee is due before planning work begins. It is credited toward that planning fee and is not an extra charge. The written agreement will identify the planning fee, deposit amount, work included, payment milestones, and any third-party costs. The deposit is not automatically forfeited if an arrangement is cancelled; any deduction is limited to planning work already completed at the agreed rates and third-party costs that you approved in writing and that cannot reasonably be recovered. See the Refund and Cancellation Policy for details.`,
  },
  {
    title: "Payments",
    content: "Catalog and transport payments are requested only after you have received and accepted a written itemized quote confirming availability and the complete amount. M-Pesa confirmation by itself does not reserve a date or establish an arrangement that the team has not confirmed in writing. For digital tribute features that offer a separate M-Pesa payment, the page will identify the applicable price before you pay.",
  },
  {
    title: "Changes and customer information",
    content: "Tell us promptly if a requested date, route, quantity, size, or service detail changes. Any change that affects the price or availability will be explained and agreed in writing before additional payment is requested. Provide accurate contact and delivery details so the team can respond and coordinate the requested service.",
  },
  {
    title: "Memorial features and third-party services",
    content: "Memorial pages and gallery content currently save only in the browser where you entered them; they do not sync to family members' devices or have a website backup. Some website features depend on third parties such as M-Pesa, Google sign-in, email delivery, and map search, which have their own terms and privacy practices.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#E8DFD1] bg-white p-8 shadow-sm sm:p-12">
        <header className="mb-10 text-center">
          <h1 className="mb-4 font-serif text-3xl font-semibold text-[#1F2E27] sm:text-4xl">Terms of Use</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#716860]">{BUSINESS.name} · Updated October 2026</p>
        </header>
        <p className="mb-8 leading-relaxed text-[#3D3530]">These terms describe the current website and service request process. A written quote or service agreement will set out the specific arrangements agreed for your request.</p>
        <div className="space-y-8 leading-relaxed text-[#3D3530]">
          {sections.map((section) => <section key={section.title}><h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">{section.title}</h2><p>{section.content}</p></section>)}
          <section><h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">Refunds and cancellations</h2><p>Our cancellation, rescheduling, return, and refund process is set out in the <Link to="/refunds" className="font-semibold underline underline-offset-2">Refund and Cancellation Policy</Link>. Nothing in these website terms is intended to remove rights that apply under Kenyan law.</p></section>
          <section><h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">Contact</h2><p>Call <a href={`tel:${BUSINESS.phoneLink}`} className="font-semibold underline underline-offset-2">{BUSINESS.phoneDisplay}</a> or email <a href={`mailto:${BUSINESS.email}`} className="font-semibold underline underline-offset-2">{BUSINESS.email}</a>. Published hours: {BUSINESS.weekdayHours}; {BUSINESS.saturdayHours}. Our base is in {BUSINESS.address} and our stated service area is {BUSINESS.serviceArea}.</p></section>
        </div>
      </div>
    </div>
  );
}
