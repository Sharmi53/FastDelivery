import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  MapPin,
  CreditCard,
  Database,
  Lock,
  Clock,
  Eye,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-wrapper">
      {/* Back to Home Button */}
      <Link to="/home" className="legal-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>

      {/* Header Banner */}
      <header className="legal-header">
        <div className="legal-header-badge">
          <ShieldCheck size={14} />
          <span>Legal & Privacy Compliance</span>
        </div>
        <h1 className="legal-header-title">Privacy Policy</h1>
        <p className="legal-header-subtitle">
          How FastDelivery collects, uses, and safeguards your personal data when you shop for groceries through our website and mobile applications.
        </p>
        <div className="legal-header-meta">
          <span><strong>Effective Date:</strong> November 2026</span>
          <span><strong>Last Updated:</strong> November 05, 2026</span>
          <span><strong>Jurisdiction:</strong> India (IT Act, 2000 & DPDP Act, 2023 Rules)</span>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="legal-content-card">
        {/* Section 1: Introduction */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <FileText size={20} className="legal-section-icon" />
            1. Introduction & Overview
          </h2>
          <p className="legal-text">
            Welcome to <strong>FastDelivery</strong> ("we", "our", or "us"). We operate the FastDelivery grocery e-commerce platform, offering fresh fruits, vegetables, dairy, staples, and daily grocery items delivered to customers in our service locations.
          </p>
          <p className="legal-text">
            This Privacy Policy describes the policies and procedures regarding the collection, storage, processing, transfer, and disclosure of personal data when you access or use our website or app (
            <a href="https://fast-delivery-hazel.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              fast-delivery-hazel.vercel.app
            </a>
            ) or our associated mobile application interfaces.
          </p>
          <div className="legal-callout-box">
            <div className="legal-callout-title">
              <AlertTriangle size={16} color="var(--primary)" />
              Corporate Entity & Business Notice
            </div>
            <p className="legal-text" style={{ fontSize: '0.88rem', margin: 0 }}>
              Operating Entity Name: <span>FastDelivery( operated by Amitesh Sarkar, Sole Proprietorship)</span>.
              <br />
              Operational Store Base: 13 No Sandelerbill, P.O- Amberia, P.S- Hingalganj, PIN-743435, North 24 Parganas, West Bengal, India.
            </p>
          </div>
        </section>

        {/* Section 2: Personal Information Collected */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <UserCheck size={20} className="legal-section-icon" />
            2. Personal Information We Collect
          </h2>
          <p className="legal-text">
            To provide efficient order processing, doorstep grocery delivery, and seamless account services, we collect only the necessary data categories:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Account Registration Data:</strong> When registering as a customer, we collect your <strong>full name</strong>, <strong>email address</strong>, and <strong>mobile phone number</strong>. Passwords are never stored in plain text and are securely hashed using cryptographic salts before storage.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Delivery Address & Contact Details:</strong> When placing an order, we collect recipient name, contact phone number, address line, landmark, city, state, and postal PIN code.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>GPS Coordinates:</strong> When you click <em>"Use Current Location"</em> at checkout, the application captures your device's geographical coordinates (latitude and longitude) strictly to pinpoint your delivery address and prevent delivery delays.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Order History & Purchases:</strong> Details of products ordered, quantity, purchase timestamps, order status history (placed, confirmed, out for delivery, delivered), total amounts, delivery fees, and applied discounts.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Customer Inquiries & Feedback:</strong> Name, phone, email, and inquiry messages transmitted when you reach out through our Contact form or customer helpline.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 3: Payment Information */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <CreditCard size={20} className="legal-section-icon" />
            3. Payment-Related Information & Third-Party Gateways
          </h2>
          <p className="legal-text">
            FastDelivery provides two payment mechanisms for grocery orders:
          </p>
          <div className="legal-table-responsive">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Data Processed by FastDelivery</th>
                  <th>Payment Security & Handling</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cash on Delivery (COD)</strong></td>
                  <td>Order total amount and payment settlement confirmation upon delivery.</td>
                  <td>Cash collected in person at your doorstep by our authorized delivery partner.</td>
                </tr>
                <tr>
                  <td><strong>Online Payment (Razorpay)</strong></td>
                  <td>Transaction identifier, payment status (paid/failed), timestamp, and amount.</td>
                  <td>
                    Processed directly by <strong>Razorpay Software Private Limited</strong>, an RBI-authorized payment aggregator compliant with PCI-DSS standards.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="legal-callout-box">
            <div className="legal-callout-title">
              <Lock size={16} color="var(--primary)" />
              Card & Banking Credential Protection
            </div>
            <p className="legal-text" style={{ fontSize: '0.88rem', margin: 0 }}>
              <strong>FastDelivery DOES NOT collect, view, or store</strong> your debit/credit card numbers, expiry dates, CVV/CVC codes, net banking passwords, or UPI PINs on its servers. All online transaction entries are handled exclusively on Razorpay's encrypted checkout interface.
            </p>
          </div>
        </section>

        {/* Section 4: Cookies & Local Storage */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Database size={20} className="legal-section-icon" />
            4. Cookies, Local Storage & Website Usage Data
          </h2>
          <p className="legal-text">
            We use browser <code>localStorage</code> and minimal session identifiers strictly necessary for the technical operation of the e-commerce website:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Authentication Tokens (<code>grocery_user</code>):</strong> Stored locally on your device to keep you securely signed in to your account across browser sessions.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Active Shopping Cart (<code>cartItems</code>):</strong> Stored locally so that items you add to your grocery basket are preserved as you browse across categories.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>No Third-Party Cross-Site Trackers:</strong> FastDelivery does not sell your browsing profiles to advertising brokers or install cross-site tracking spyware.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 5: How Customer Information is Used */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <CheckCircle2 size={20} className="legal-section-icon" />
            5. How Customer Information is Used
          </h2>
          <p className="legal-text">
            Your personal information is processed strictly for legitimate, lawful business purposes:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>To fulfill and dispatch grocery orders to your designated delivery address.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>To enable delivery partners to navigate to your address and contact you upon doorstep arrival.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>To provide order confirmations, live delivery status changes, and customer support.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>To prevent fraudulent orders, duplicate accounts, and unauthorized access.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>To maintain accurate billing, invoicing, and tax records in compliance with Indian accounting laws.</span>
            </li>
          </ul>
        </section>

        {/* Section 6: Third-Party Services & Information Sharing */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Eye size={20} className="legal-section-icon" />
            6. Information Sharing & Third-Party Service Providers
          </h2>
          <p className="legal-text">
            We <strong>do not sell, rent, or trade</strong> your personal information. We disclose necessary data elements only to trusted partners and service providers bound by confidentiality:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Assigned Delivery Partners:</strong> When your order is dispatched, our delivery partner receives your name, phone number, delivery address, and order items solely to complete the delivery.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Payment Gateway (Razorpay):</strong> Receives order values and billing tokens to authorize electronic payments.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Cloud & Database Infrastructure:</strong> Secure cloud database and hosting providers (e.g., Render, Cloudinary for banner/product media) that host backend services under encrypted databases.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Legal Authorities:</strong> We may disclose information if required to do so by applicable Indian law, court order, search warrant, or lawful government directive.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 7: Data Security & Protection */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Lock size={20} className="legal-section-icon" />
            7. Data Security & Protection
          </h2>
          <p className="legal-text">
            We implement administrative, technical, and physical safeguards designed to protect personal information against unauthorized access, loss, alteration, or misuse:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>All web communications are encrypted using standard Hypertext Transfer Protocol Secure (HTTPS/TLS).</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>User passwords are saved in encrypted, one-way hashed formats (bcrypt).</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>Database access is restricted through role-based access controls and authentication tokens.</span>
            </li>
          </ul>
          <div className="legal-callout-box">
            <div className="legal-callout-title">
              <AlertTriangle size={16} color="var(--primary)" />
              Realistic Security Disclaimer
            </div>
            <p className="legal-text" style={{ fontSize: '0.88rem', margin: 0 }}>
              While we employ commercially reasonable security safeguards consistent with industry norms and Rule 8 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, no electronic storage system or transmission over the internet can be guaranteed as 100% impenetrable. We urge customers to keep their account passwords confidential.
            </p>
          </div>
        </section>

        {/* Section 8: Data Retention & Deletion */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Clock size={20} className="legal-section-icon" />
            8. Data Retention & Account Deletion
          </h2>
          <p className="legal-text">
            We retain personal information for the period necessary to fulfill the purposes outlined in this policy:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Active Account Data:</strong> Maintained for as long as your customer account remains registered and active.
              </span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Order Records:</strong> Retained for tax, accounting, dispute resolution, and regulatory audit purposes (standard period of 60 days to 3 years as mandated by local tax/statutory regulations).
              </span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Account Deletion Requests:</strong> Customers may request account closure and personal data erasure by emailing our support desk at <code>amiteshsarkar1992@gmail.com</code>. Upon verification, active personal data will be deleted, subject to legal retention obligations.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 9: Customer Privacy Rights */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <HelpCircle size={20} className="legal-section-icon" />
            9. Your Privacy Rights & Choices
          </h2>
          <p className="legal-text">
            Under applicable Indian data protection principles, you are entitled to the following rights:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Right to Access & Review:</strong> You can view your saved profile information, past orders, and addresses at any time through your account dashboard.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Right to Rectification:</strong> You can edit and update delivery addresses or phone numbers during checkout or by contacting customer support.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Right to Withdraw Consent:</strong> You may withdraw consent for data processing by closing your account, subject to fulfillment of any pending, unfulfilled orders.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Right to Grievance Redressal:</strong> You may submit complaints regarding data privacy directly to our designated Grievance Officer.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 10: Contact Information & Grievance Officer */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Mail size={20} className="legal-section-icon" />
            10. Contact Information & Grievance Redressal
          </h2>
          <p className="legal-text">
            In accordance with the Information Technology Act, 2000 and rules made thereunder, for questions, privacy concerns, or data requests, please contact our support desk:
          </p>
          <div className="legal-contact-grid">
            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <Mail size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-brand)', display: 'block' }}>Email Support</strong>
                <a href="mailto:amiteshsarkar1992@gmail.com" style={{ color: 'var(--primary)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  amiteshsarkar1992@gmail.com
                </a>
              </div>
            </div>

            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <Phone size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-brand)', display: 'block' }}>Helpline & WhatsApp</strong>
                <a href="tel:9800157525" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                  +91 9800157525
                </a>
              </div>
            </div>

            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <MapPin size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-brand)', display: 'block' }}>Operational Store Address</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4, display: 'block' }}>
                  13 No Sandelerbill, P.O- Amberia, P.S- Hingalganj, PIN-743435, West Bengal, India
                </span>
              </div>
            </div>
          </div>

          <div className="legal-callout-box" style={{ marginTop: '1rem' }}>
            <div className="legal-callout-title">
              <ShieldCheck size={16} color="var(--primary)" />
              Designated Grievance Officer (IT Rules, 2021)
            </div>
            <p className="legal-text" style={{ fontSize: '0.88rem', margin: 0 }}>
              Officer Name:  Amitesh Sarkar
              <br />
              Designation: Business Owner
              <br />
              Direct Email: <a href="mailto:amiteshsarkar1992@gmail.com?subject=Attn:%20Grievance%20Officer%20-%20Data%20Privacy"><code>amiteshsarkar1992@gmail.com</code></a>
              <br />
              Response Window: Acknowledgement within 24–48 hours; resolution within 15 working days as required by law.
            </p>
          </div>
        </section>

        {/* Section 11: Policy Updates */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Clock size={20} className="legal-section-icon" />
            11. Updates to this Privacy Policy
          </h2>
          <p className="legal-text">
            We may periodically update this Privacy Policy to reflect modifications to our grocery catalog, technical infrastructure, or legal obligations under Indian law. The revised policy will be posted on this page with an updated "Last Updated" date. We encourage you to review this page periodically.
          </p>
        </section>
      </div>
    </div>
  );
}

