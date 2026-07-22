import React, { useEffect } from 'react';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E8DFD1] rounded-xl shadow-sm p-8 sm:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1F2E27] mb-4">Privacy Policy</h1>
          <p className="text-[#8F847C] text-sm uppercase tracking-widest font-bold">Last Updated: July 2026</p>
        </div>
        
        <div className="space-y-8 text-[#3D3530] leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">1. Introduction</h2>
            <p>Welcome to Last Planner Julz Hub. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our platform and tell you about your privacy rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">2. The Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you, including identity data (such as names and user profiles), contact data (emails and phone numbers), and technical data regarding your login sessions (such as OAuth tokens via Google or X).</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your data to provide our funeral planning and memorial hub services, manage payments via M-Pesa, and ensure secure authentication to your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">4. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact our administrative team.</p>
          </section>
        </div>
      </div>
    </div>
  );
}