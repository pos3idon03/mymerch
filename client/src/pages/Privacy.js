import React from 'react';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
          
          <h3>1.1 Personal Information</h3>
          <ul>
            <li>Name and contact information</li>
            <li>Payment information</li>
            <li>Account credentials</li>
            <li>Communication preferences</li>
          </ul>
          
          <h3>1.2 Analytics and Usage Data</h3>
          <p>With your consent, we collect analytics data to improve our website and services:</p>
          <ul>
            <li><strong>Session Information:</strong> Session ID, start/end times, duration</li>
            <li><strong>Page Views:</strong> URLs visited, page titles, visit counts</li>
            <li><strong>Traffic Sources:</strong> Referrer information (Facebook, Instagram, LinkedIn, Google, etc.)</li>
            <li><strong>Geographic Data:</strong> Approximate country and city based on IP address</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze website usage and performance</li>
            <li>Detect and prevent fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2>3. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies to collect information about your browsing activities and to remember your preferences.</p>
          
          <h3>3.1 Types of Cookies We Use</h3>
          <ul>
            <li><strong>Necessary Cookies:</strong> Required for the website to function properly</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website (only with consent)</li>
          </ul>
          
          <h3>3.2 Analytics Cookies</h3>
          <p>With your explicit consent, we use analytics cookies to:</p>
          <ul>
            <li>Track page views and user sessions</li>
            <li>Analyze traffic sources and user behavior</li>
            <li>Measure website performance and identify areas for improvement</li>
            <li>Understand geographic distribution of our visitors</li>
          </ul>
          
          <p><strong>Note:</strong> Analytics cookies are only set after you provide explicit consent. You can withdraw this consent at any time.</p>
        </section>

        <section>
          <h2>4. Data Sharing and Disclosure</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
          
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li>With service providers who assist in our operations</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          
          <p>However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2>6. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Withdraw consent for analytics cookies</li>
            <li>Opt out of marketing communications</li>
            <li>Request data portability</li>
          </ul>
          
          <h3>6.1 Managing Analytics Consent</h3>
          <p>You can manage your analytics cookie preferences:</p>
          <ul>
            <li>Use the cookie consent banner to accept or reject analytics cookies</li>
            <li>Clear your browser cookies to remove existing analytics data</li>
            <li>Contact us to request deletion of your analytics data</li>
          </ul>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy.</p>
          
          <p><strong>Analytics Data:</strong> We retain analytics data for up to 2 years, after which it is automatically deleted. You can request earlier deletion at any time.</p>
        </section>

        <section>
          <h2>8. International Data Transfers</h2>
          <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information.</p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
          <ul>
            <li>Email: privacy@mymerch.gr</li>
            <li>Phone: +30 XXX XXX XXXX</li>
            <li>Address: [Your Business Address]</li>
          </ul>
        </section>

        <section>
          <h2>12. GDPR Compliance</h2>
          <p>If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):</p>
          <ul>
            <li>Right to be informed about data processing</li>
            <li>Right of access to your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Rights related to automated decision making</li>
          </ul>
          
          <p>To exercise these rights, please contact us using the information provided above.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy; 