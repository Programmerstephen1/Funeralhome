import React from "react";
import { BUSINESS } from "../config/business";

const sections = [
  {
    title: "1. Requesting a cancellation, change, or refund",
    content: `Contact us by phone at ${BUSINESS.phoneDisplay} or email ${BUSINESS.email}. Include your name, the quote or payment reference, the service or item, and what you are requesting. We will acknowledge a request within two business days and aim to give you an update within five business days. If the date is close, call us as soon as possible as well as sending the written request.`,
  },
  {
    title: "2. Planning fee and compulsory 10% deposit",
    content: `A ${BUSINESS.planningDepositPercent}% deposit of the agreed planning fee is compulsory before planning work begins. It is credited toward the fee. If you cancel before planning work has started, we will refund the deposit in full. Once work has begun, we may deduct only the agreed value of work already completed and third-party costs that you approved in writing and that cannot reasonably be recovered. We will provide an itemized calculation and refund any remaining balance. The deposit is not automatically forfeited as a cancellation penalty.`,
  },
  {
    title: "3. Funeral, transport, and event services",
    content: "You may ask to cancel or reschedule at any time. Please give at least 72 hours' notice where possible so we can stop work and limit costs; a shorter notice period does not automatically cancel your refund. For a cancellation, we will deduct only work already completed at the rates in your written agreement and non-recoverable third-party costs that you approved in writing. For rescheduling, we will first check the new date. We will not add an administrative or late-cancellation penalty that was not disclosed and agreed in writing. Any additional supplier cost will be shared with you for approval before it is incurred.",
  },
  {
    title: "4. If we cannot provide the confirmed arrangement",
    content: "If we cannot provide a confirmed item or service, we will tell you promptly. You can choose to accept a replacement or new date only if you agree to it, or cancel the affected part and receive a refund of the payment for the part we cannot provide. We will not substitute a materially different item, vehicle, or service without your agreement.",
  },
  {
    title: "5. Product returns and made-to-order items",
    content: "For a standard, non-personalized item, contact us within seven calendar days after delivery to request a return. The item should be unused and in its original packaging where reasonably possible. We will explain how to return it; the customer pays reasonable return delivery for a change-of-mind return. If an item is damaged, defective, or materially different from the description or accepted quote, contact us as soon as possible and we will discuss an appropriate repair, replacement, or refund; we will cover reasonable return or collection costs for a confirmed supply error. For personalized or made-to-order items, tell us about a cancellation before production begins. If production has begun, any deduction is limited to work completed and approved, non-recoverable costs. These conditions do not limit any rights that apply to faulty, misdescribed, or undelivered goods.",
  },
  {
    title: "6. Flowers and other time-sensitive items",
    content: "Please check the delivery details and requested date in the written confirmation. Because fresh flowers are prepared for a particular date and are perishable, a change-of-mind cancellation may not be possible once preparation has started; we will tell you before accepting an order when that point is reached. If we cannot deliver as confirmed, or the arrangement is materially different from what you accepted, contact us promptly so we can arrange a suitable remedy or refund. This does not reduce rights that apply by law.",
  },
  {
    title: "7. Refund timing and method",
    content: "Once a refund is approved, we aim to initiate it within seven business days using the original payment method where possible. We will confirm the amount and any permitted itemized deductions. M-Pesa or another payment provider may take additional time to post the funds after we initiate the refund. If the original method cannot receive the refund, we will contact you to agree on a reasonable alternative.",
  },
  {
    title: "8. Your legal rights",
    content: "This policy adds a clear process for our customers and is not intended to waive consumer rights. Kenyan consumer law may provide cancellation, refund, repair, or replacement rights depending on how an agreement was made, what was disclosed, and what was supplied. The applicable law prevails if it gives you a stronger right than this policy. See the Kenya Law publication of the Consumer Protection Act and seek independent advice if you need help applying it to a particular dispute.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-16 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-xl border border-[#E8DFD1] bg-white p-8 shadow-sm sm:p-12">
        <header className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#805400]">{BUSINESS.name}</p>
          <h1 className="mb-4 font-serif text-3xl font-semibold text-[#1F2E27] sm:text-4xl">Refund and Cancellation Policy</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#716860]">Effective October 2026</p>
        </header>
        <p className="mb-8 leading-relaxed text-[#3D3530]">We understand that funeral arrangements can change quickly. This policy explains how to cancel, reschedule, return an item, or request a refund. Your accepted written quote or service agreement will identify the scope, full price, delivery or route charges, dates, and any approved third-party commitments.</p>
        <div className="space-y-8 leading-relaxed text-[#3D3530]">
          {sections.map((section) => <section key={section.title}><h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">{section.title}</h2><p>{section.content}</p></section>)}
        </div>
        <div className="mt-10 border-t border-[#E8DFD1] pt-6 text-sm leading-relaxed text-[#716860]">
          <p>Contact: <a href={`tel:${BUSINESS.phoneLink}`} className="font-semibold underline">{BUSINESS.phoneDisplay}</a> · <a href={`mailto:${BUSINESS.email}`} className="font-semibold underline">{BUSINESS.email}</a></p>
          <p className="mt-2">Hours: {BUSINESS.weekdayHours}; {BUSINESS.saturdayHours}.</p>
          <p className="mt-3">Legal reference: <a href="https://new.kenyalaw.org/akn/ke/act/2012/46/eng%402022-12-31/publication" target="_blank" rel="noreferrer" className="font-semibold underline">Kenya Consumer Protection Act, 2012</a>.</p>
          <p className="mt-3 text-xs">This policy is a customer-facing business policy draft, not a legal opinion. Have a Kenyan consumer-law practitioner review it before treating it as a signed service contract.</p>
        </div>
      </article>
    </div>
  );
}
