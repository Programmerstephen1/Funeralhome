import React, { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E8DFD1] rounded-xl shadow-sm p-8 sm:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1F2E27] mb-4">Terms of Service</h1>
          <p className="text-[#8F847C] text-sm uppercase tracking-widest font-bold">Last Updated: July 2026</p>
        </div>
        
        <div className="space-y-8 text-[#3D3530] leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using the Last Planner Julz Hub platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">2. User Accounts</h2>
            <p>When you create an account with us, whether manually or via third-party Single Sign-On (SSO), you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">3. Memorial Hub Usage</h2>
            <p>Our platform allows users to post tributes, eulogies, and multimedia content. You remain solely responsible for the content you post. We reserve the right to remove any content that violates community standards or legal requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-3">4. Intellectual Property</h2>
            <p>The platform and its original content, features, and functionality are owned by Last Planner Julz Hub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          </section>
        </div>
      </div>
    </div>
  );
}