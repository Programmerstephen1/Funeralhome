import React, { useEffect } from 'react';
import { BUSINESS } from '../config/business';

const sections = [
  {
    title: 'Information you provide',
    content: 'Consultation requests may include your name, email address, phone number, and the service details you choose to share. An account stores your email address, a password hash, verification status, and any first name, last name, phone number, or profile image URL you add. The site can also process order, eulogy, review, and payment information when those features are used.',
  },
  {
    title: 'How information is used',
    content: 'The operator uses submitted details to respond to enquiries, manage accounts, provide requested site features, and process payments. Do not submit identity documents, health information, or other sensitive personal information through general enquiry forms.',
  },
  {
    title: 'Where information is stored',
    content: 'Consultations and account data are stored in the application database. Email copies of consultations and account messages are sent only when the operator has configured email delivery. Uploaded images are re-encoded and stored by the application. Account deletion removes the account and linked records handled by the deletion process, and removes tracked uploads; payment amount and status are retained for audit, with account email and phone removed. Older untracked uploads may not be associated with an account for deletion.',
  },
  {
    title: 'Browser-only features',
    content: 'Cart contents, some booking drafts, and memorial workspaces such as tribute content, journal entries, and gallery selections are stored in this browser. They are not currently synchronized to an account or backed up by the website, and clearing browser storage or using another device can make them unavailable. Avoid entering information into these features that you need the operator to retain or protect.',
  },
  {
    title: 'Payments and other services',
    content: 'M-Pesa payment requests are handled through Safaricom Daraja. A transaction record includes payment amount, phone number, email, status, and payment references so the payment can be matched to its result. Location search suggestions are requested from OpenStreetMap Nominatim. Sign-in may use Google when configured. Hosting, database, and email providers may process information in the locations where their systems operate.',
  },
  {
    title: 'Retention and your choices',
    content: 'Consultation records do not currently have an automatic expiry period. Payment amount and status records are retained after account deletion, while direct account email and phone are removed from those records. You can contact the operator to ask about access, correction, objection, or deletion, subject to records that must be retained for a legitimate purpose.',
  },
];

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F6F0] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#E8DFD1] bg-white p-8 shadow-sm sm:p-12">
        <header className="mb-10 text-center">
          <h1 className="mb-4 font-serif text-3xl font-semibold text-[#1F2E27] sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#716860]">Last updated: October 2026</p>
        </header>

        <div className="space-y-8 leading-relaxed text-[#3D3530]">
          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">About this notice</h2>
            <p>This notice describes the current behaviour of {BUSINESS.name}. Features and storage arrangements may change; contact the operator if you need clarification before submitting personal information.</p>
          </section>

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">Your rights</h2>
            <p>You can contact the operator to ask about your information or make a request. The Kenya Data Protection Act describes data subject rights including being informed, access, objection, correction, and deletion in applicable circumstances. Read the <a href="https://www.odpc.go.ke/rights-of-a-data-subject/" target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">Office of the Data Protection Commissioner’s rights overview</a>.</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-[#1F2E27]">Contact</h2>
            <p>For privacy questions or requests about information you have submitted, call <a href={`tel:${BUSINESS.phoneLink}`} className="font-semibold underline underline-offset-2">{BUSINESS.phoneDisplay}</a> or email <a href={`mailto:${BUSINESS.email}`} className="font-semibold underline underline-offset-2">{BUSINESS.email}</a>. The business is based in {BUSINESS.address} and lists its service area as {BUSINESS.serviceArea}.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
