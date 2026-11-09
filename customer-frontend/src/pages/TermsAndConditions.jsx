import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShoppingBag,
  Truck,
  CreditCard,
  RefreshCw,
  Clock,
  ShieldAlert,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function TermsAndConditions() {
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
          <Scale size={14} />
          <span>Customer Terms & Purchase Agreement</span>
        </div>
        <h1 className="legal-header-title">Terms & Conditions</h1>
        <p className="legal-header-subtitle">
          Please review the rules, terms of sale, delivery practices, and cancellation policies that govern your use of the FastDelivery grocery shopping service.
        </p>
        <div className="legal-header-meta">
          <span><strong>Effective Date:</strong> November 2026</span>
          <span><strong>Last Updated:</strong> November 05, 2026</span>
          <span><strong>Applicable Laws:</strong> Consumer Protection Act, 2019 & Indian Contract Act, 1872</span>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="legal-content-card">
        {/* Section 1: Agreement to Terms */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <FileText size={20} className="legal-section-icon" />
            1. Agreement to Terms
          </h2>
          <p className="legal-text">
            These Terms & Conditions constitute a legally binding agreement between you ("Customer", "User", or "you") and <strong>FastDelivery</strong> ("we", "us", or "our"), governing your access to and purchase of groceries, fresh produce, and consumer goods through our website and mobile application.
          </p>
          <p className="legal-text">
            By creating an account, browsing our catalog, or placing an order, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must cease using the platform immediately.
          </p>
          <div className="legal-callout-box">
            <div className="legal-callout-title">
              <AlertTriangle size={16} color="var(--primary)" />
              Business Entity Identification
            </div>
            <p className="legal-text" style={{ fontSize: '0.88rem', margin: 0 }}>
              Operating Brand: <strong>FAST DELIVERY</strong>
              <br />
              Store Base: 13 No Sandelerbill, P.O- Amberia, P.S- Hingalganj, PIN-743435, West Bengal, India.
            </p>
          </div>
        </section>

        {/* Section 2: Website Usage Rules & Eligibility */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <CheckCircle2 size={20} className="legal-section-icon" />
            2. Eligibility & Website Usage Rules
          </h2>
          <p className="legal-text">
            To register an account and place orders on FastDelivery:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>You must be at least 18 years of age or accessing under the supervision and consent of a parent or legal guardian.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>You agree to use the service solely for personal, non-commercial grocery consumption within our operational delivery boundaries.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>You must not engage in fraudulent ordering, abusive chargebacks, scraping, reverse engineering, or intentional disruption of server operations.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: Account Registration & Security */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <ShieldAlert size={20} className="legal-section-icon" />
            3. Customer Account Registration & Responsibilities
          </h2>
          <p className="legal-text">
            Customers must register with a valid email, mobile phone number, and password. You are strictly responsible for:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>Maintaining the secrecy of your login credentials and preventing unauthorized access to your account.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>Providing truthful, accurate, and complete delivery information (including landmarks and contact numbers).</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>Promptly updating any changes to your delivery address or contact number before placing a new order.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Product Availability, Pricing & Descriptions */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <ShoppingBag size={20} className="legal-section-icon" />
            4. Product Descriptions, Availability & Pricing
          </h2>
          <p className="legal-text">
            We strive to display accurate descriptions, categories and prices for all grocery items. However, please note:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Fresh Produce & Perishables:</strong> Fresh vegetables, fruits, eggs, and dairy are agricultural products. Natural variations in size, color, weight, and seasonal appearance may occur relative to digital catalog photographs.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Stock Availability:</strong> Inventory levels fluctuate rapidly. In the rare event that an ordered item becomes unexpectedly out of stock, we will notify you and adjust your final bill or refund the item if prepaid.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Pricing in INR:</strong> All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes (GST) unless explicitly noted.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Technical Pricing Errors:</strong> If an item is mistakenly listed at an incorrect price due to an IT error, we reserve the right to cancel the order with prior customer notice and refund the amount paid.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 5: Shopping Cart & Order Placement */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <ShoppingBag size={20} className="legal-section-icon" />
            5. Shopping Cart & Order Placement
          </h2>
          <p className="legal-text">
            Adding an item to your digital shopping cart does not reserve or guarantee its inventory. Stock is reserved only once you complete the checkout workflow and your order status is registered as <strong>Placed</strong>.
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Minimum Order Value:</strong> <span> ₹151 minimum - as determined by store management</span>.
              </span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Delivery Fee:</strong> Delivery charges (if applicable) are clearly displayed on the Cart and Checkout summary screens prior to payment confirmation.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 6: Operating Hours, Order Confirmation & Cancellation */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Clock size={20} className="legal-section-icon" />
            6. Store Operating Hours & Order Cancellation
          </h2>
          <div className="legal-callout-box">
            <div className="legal-callout-title">
              <Clock size={16} color="var(--primary)" />
              Daily Operational Delivery Hours: 07:00 AM – 11:00 PM IST
            </div>
            <p className="legal-text" style={{ fontSize: '0.88rem', margin: 0 }}>
              <strong>Important Operating Notice:</strong> Delivery service is actively available from <strong>7:00 AM to 11:00 PM</strong> daily. Orders placed after 11:00 PM may get cancelled or scheduled for delivery the following morning, depending on store inventory and partner availability.
            </p>
          </div>
          <p className="legal-text" style={{ marginTop: '0.75rem' }}>
            <strong>Cancellation Rules:</strong>
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Cancellation by Customer:</strong> Self-cancellation from the app or website is currently unavailable once an order is placed.
              </span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Cancellation by FastDelivery:</strong> We reserve the right to cancel orders in unforeseen events, including severe weather, unserviceable delivery locations, safety hazards, non-availability of products, or inability to reach the customer via phone. If prepaid, a full refund will be processed promptly.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 7: Payment Methods */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <CreditCard size={20} className="legal-section-icon" />
            7. Payment Methods & Terms
          </h2>
          <p className="legal-text">
            FastDelivery provides two secure payment methods:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Cash on Delivery (COD):</strong> You must pay the full invoiced amount in cash in Indian currency directly to the delivery partner upon arrival at your doorstep before receiving your package.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Online Payment (Razorpay):</strong> Supports UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit Cards, and Debit Cards. All electronic transactions are verified through Razorpay's PCI-DSS compliant infrastructure.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Payment Failures:</strong> In case of transaction timeout or debit without order confirmation, the acquiring bank and Razorpay typically reverse the amount to your source account within 3 to 7 banking days.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 8: Delivery Policies */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Truck size={20} className="legal-section-icon" />
            8. Delivery Policies & Doorstep Terms
          </h2>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Service Delivery Areas:</strong> Doorstep deliveries are currently provided in Hingalganj, Hasnabad, and Basirhat in North 24 Parganas, West Bengal.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Estimated Delivery Times:</strong> 20 hours. Actual delivery duration may vary based on weather conditions, traffic disruptions, distance, and road conditions.
              </div>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <div>
                <strong>Customer Presence & Handover:</strong> The customer or an authorized recipient must be available at the specified address and reachable by phone. If our delivery partner arrives and is unable to reach you after multiple phone attempts, the order may be marked failed.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 9: Returns, Replacements & Refunds */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <RefreshCw size={20} className="legal-section-icon" />
            9. Returns, Refunds & Replacement Policy
          </h2>
          <p className="legal-text">
            Because groceries include highly perishable produce and food items, return terms are categorized by product type:
          </p>
          <div className="legal-table-responsive">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Return / Issue Reporting Window</th>
                  <th>Remedy Provided</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Fresh Fruits & Vegetables</strong></td>
                  <td>At the time of delivery </td>
                  <td>Replacement for spoiled or damaged items.</td>
                </tr>
                <tr>
                  <td><strong>Packaged Groceries & Staples</strong></td>
                  <td><i> at the time of delivery</i></td>
                  <td>Return/refund if packaging is broken, unsealed, or past expiry date.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="legal-text" style={{ marginTop: '0.75rem' }}>
            <strong>Refund Settlement Timeline:</strong>
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Prepaid Orders (Razorpay):</strong> Approved refunds are credited directly back to the original source method (UPI/Card/Bank/cash via delivery boy) within <strong>5 to 7 business days</strong> as per standard banking protocol.
              </span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Cash on Delivery (COD) Orders:</strong> Refunds for verified damaged items will be processed directly to your bank account via UPI transfer or cash via delivery boy within <strong>5 to 7 business days</strong> after verification.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 10: Damaged or Incorrect Products */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <AlertTriangle size={20} className="legal-section-icon" />
            10. Reporting Damaged, Missing, or Incorrect Products
          </h2>
          <p className="legal-text">
            If an item in your order is missing, damaged during transit, or incorrect:
          </p>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            <li>Please contact our support team immediately at <strong>+91 9800157525</strong> or via WhatsApp.</li>
            <li>Share a clear photograph of the damaged or incorrect item along with your Order Number.</li>
            <li>Our support team will inspect the issue and initiate a replacement or refund according to our policy.</li>
          </ol>
        </section>

        {/* Section 11: Limitation of Liability */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <ShieldAlert size={20} className="legal-section-icon" />
            11. Limitation of Liability
          </h2>
          <p className="legal-text">
            To the maximum extent permitted by applicable Indian law:
          </p>
          <ul className="legal-list">
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>FastDelivery provides the website, app, and catalog on an "as-is" and "as-available" basis without warranties of any kind, whether express or implied.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>FastDelivery shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from delays, service interruptions, or product handling.</span>
            </li>
            <li className="legal-list-item">
              <span className="legal-list-bullet" />
              <span>
                <strong>Liability Cap:</strong> In any circumstance, our aggregate liability arising out of or related to an order shall be strictly capped at the <strong>total monetary amount actually paid by you for that specific order</strong>.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 12: Governing Law & Jurisdiction */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Scale size={20} className="legal-section-icon" />
            12. Governing Law & Jurisdiction
          </h2>
          <p className="legal-text">
            These Terms & Conditions and any disputes arising out of or in connection with them shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>.
          </p>
          <p className="legal-text">
            Any legal disputes related to this website or app will be handled through mediation or arbitration first. If a court process is required, it must take place exclusively in the courts of Kolkata or North 24 Parganas, West Bengal, India.
          </p>
        </section>

        {/* Section 13: Changes to Terms */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <Sparkles size={20} className="legal-section-icon" />
            13. Modifications to Terms & Conditions
          </h2>
          <p className="legal-text">
            FastDelivery reserves the right to amend, update, or revise these Terms at any time without prior individual notice. Any revised Terms will be posted directly to this URL with a refreshed "Last Updated" timestamp. Your continued use of the platform after updates indicates your acceptance.
          </p>
        </section>

        {/* Section 14: Customer Support & Contact */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            <HelpCircle size={20} className="legal-section-icon" />
            14. Customer Support & Contact Information
          </h2>
          <p className="legal-text">
            For questions, order assistance, or policy inquiries, please contact our customer desk:
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
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-brand)', display: 'block' }}>Store Address</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4, display: 'block' }}>
                  13 No Sandelerbill, P.O- Amberia, P.S- Hingalganj, PIN-743435, West Bengal, India
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

