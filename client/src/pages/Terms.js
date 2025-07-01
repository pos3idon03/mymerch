import React from 'react';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <div className="page-header">
          <h1>Terms of Service</h1>
          <p>Last updated: December 2024</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the MyMerch website (mymerch.gr), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on MyMerch's website for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on MyMerch's website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Disclaimer</h2>
            <p>
              The materials on MyMerch's website are provided on an 'as is' basis. MyMerch makes no warranties, expressed or implied, and hereby 
              disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness 
              for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Limitations</h2>
            <p>
              In no event shall MyMerch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
              or due to business interruption) arising out of the use or inability to use the materials on MyMerch's website, even if MyMerch or a 
              MyMerch authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on MyMerch's website could include technical, typographical, or photographic errors. MyMerch does not warrant 
              that any of the materials on its website are accurate, complete or current. MyMerch may make changes to the materials contained on its 
              website at any time without notice.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Links</h2>
            <p>
              MyMerch has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. 
              The inclusion of any link does not imply endorsement by MyMerch of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Modifications</h2>
            <p>
              MyMerch may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be 
              bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Greece and you irrevocably submit to the 
              exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> info@mymerch.gr</p>
              <p><strong>Address:</strong> 123 Business Ave, Suite 100, New York, NY 10001</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </section>
        </div>

        <div className="terms-footer">
          <p>
            This document was last updated on December 2024. We reserve the right to modify these terms at any time. 
            Please check back periodically for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms; 