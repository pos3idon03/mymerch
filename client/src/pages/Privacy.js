import React from 'react';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="container">
        <div className="page-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: December 2024</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Information We Collect</h2>
            <p>
              At MyMerch, we collect information you provide directly to us, such as when you create an account, 
              make a purchase, contact us, or subscribe to our newsletter. This may include:
            </p>
            <ul>
              <li>Name and contact information (email address, phone number, mailing address)</li>
              <li>Account credentials and preferences</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Communication history with our support team</li>
              <li>Information about your business and purchasing needs</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send you important updates about your account or orders</li>
              <li>Improve our products and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except in the following circumstances:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website, processing payments, and providing customer support.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights, property, or safety.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication procedures</li>
              <li>Secure payment processing through trusted partners</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, 
              and understand where our visitors are coming from. You can control cookie settings through your browser preferences.
            </p>
            <p>
              Types of cookies we use:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>6. Your Rights and Choices</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access and review your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, 
              unless a longer retention period is required or permitted by law. When we no longer need your information, 
              we will securely delete or anonymize it.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers 
              comply with applicable data protection laws and implement appropriate safeguards to protect your information.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our website is not intended for children under the age of 16. We do not knowingly collect personal information 
              from children under 16. If you believe we have collected information from a child under 16, please contact us immediately.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. 
              We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> info@mymerch.gr</p>
              <p><strong>Address:</strong> 123 Business Ave, Suite 100, New York, NY 10001</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Data Protection Officer:</strong> privacy@mymerch.gr</p>
            </div>
          </section>
        </div>

        <div className="privacy-footer">
          <p>
            This privacy policy was last updated on December 2024. We are committed to protecting your privacy and will 
            continue to review and improve our data protection practices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 