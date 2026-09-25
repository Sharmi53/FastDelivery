import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Send,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowLeft,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import './ShopContactPage.css';

export default function ShopContactPage() {
  const [copiedField, setCopiedField] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const shopInfo = {
    name: "FAST DELIVERY",
    phone: "9800157525",
    email: "amiteshsarkar1992@gmail.com",
    address: "13 No Sandelerbill. P.O- Amberia. P.S- HINGALGANJ. PIN-743435",
    hours: [
      { days: "Weekdays (Mon - Fri)", time: "07:00 AM – 11:00 PM" },
      { days: "Saturday", time: "07:00 AM – 08:00 PM" },
      { days: "Sunday", time: "07:00 AM – 11:00 PM" }
    ],
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14736.216335198816!2d88.900000!3d22.483333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a01cf90db04f323%3A0x6e8a49c953a60a72!2sHingalganj%2C%20West%20Bengal%20743435!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    googleMapsDirectionsUrl: "https://www.google.com/maps/search/?api=1&query=13+No+Sandelerbill+Amberia+HINGALGANJ+743435"
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const emailPayload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject || 'FAST DELIVERY Customer Inquiry',
      message: formData.message,
      _subject: `[FAST DELIVERY] New Inquiry from ${formData.name} (${formData.phone})`,
      _replyto: formData.email,
      _template: 'table',
      _captcha: 'false'
    };

    // 1. Record inquiry in backend database if running
    try {
      fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).catch(() => {});
    } catch (_) {}

    // 2. Dispatch email directly to amiteshsarkar1992@gmail.com
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${shopInfo.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      const data = await response.json();

      if (response.ok || data.success === 'true' || data.success === true) {
        setFormSubmitted(true);
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      } else {
        // Fallback: open mail client
        window.location.href = `mailto:${shopInfo.email}?subject=${encodeURIComponent(formData.subject || 'FAST DELIVERY Customer Inquiry')}&body=${encodeURIComponent(
          `Customer Name: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        )}`;
        setFormSubmitted(true);
      }
    } catch (err) {
      console.warn('FormSubmit AJAX fallback:', err);
      // Fallback: open mail client
      window.location.href = `mailto:${shopInfo.email}?subject=${encodeURIComponent(formData.subject || 'FAST DELIVERY Customer Inquiry')}&body=${encodeURIComponent(
        `Customer Name: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-root min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs font-medium py-2 px-4 border-b border-slate-800 contact-announcement-bar">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              Fast Delivery Express Support
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3 h-3 text-emerald-400" /> 100% Quality & Freshness Guarantee
            </span>
          </div>
          <div className="text-slate-400 text-[11px] sm:text-xs ml-auto">
            Support Line: <a href={`tel:${shopInfo.phone}`} className="text-white hover:underline font-semibold">{shopInfo.phone}</a>
          </div>
        </div>
      </div>

      {/* Main Clean Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm contact-clean-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center space-x-3 text-inherit no-underline">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20">
              F
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">
                FAST <span className="text-emerald-600">DELIVERY</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">Contact Center</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/home"
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
            <Link
              to="/cart"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Title Header */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 contact-title-header">
        <div className="max-w-7xl mx-auto text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Contact & Location Details
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base">
            Have questions about your delivery, order status, or service coverage? Reach out directly to our store team or drop us a message below.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 contact-main-body">
        
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 contact-cards-grid">
          
          {/* Phone Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between contact-card">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20 contact-card-icon">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Phone Support</h3>
              <p className="text-slate-500 text-xs mt-1">Direct line for instant orders & inquiries</p>
              <address className="not-italic mt-4">
                <a 
                  href={`tel:${shopInfo.phone}`}
                  className="text-lg font-bold text-emerald-600 hover:text-emerald-700 hover:underline block"
                >
                  +91 {shopInfo.phone}
                </a>
              </address>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => copyToClipboard(shopInfo.phone, 'phone')}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedField === 'phone' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Phone Number</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between contact-card">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20 contact-card-icon">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Email Us</h3>
              <p className="text-slate-500 text-xs mt-1">Send us your feedback or general questions</p>
              <address className="not-italic mt-4">
                <a 
                  href={`mailto:${shopInfo.email}`}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline break-all block"
                >
                  {shopInfo.email}
                </a>
              </address>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => copyToClipboard(shopInfo.email, 'email')}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedField === 'email' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Email Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Location Address Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between contact-card">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20 contact-card-icon">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Store Address</h3>
              <p className="text-slate-500 text-xs mt-1">Physical shop & dispatch hub</p>
              <address className="not-italic mt-3 text-xs leading-relaxed text-slate-700 font-medium">
                {shopInfo.address}
              </address>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <a
                href={shopInfo.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 text-center no-underline"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Opening Hours Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between contact-card">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20 contact-card-icon">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Store Hours</h3>
              <p className="text-slate-500 text-xs mt-1">Daily operating hours</p>
              
              <ul className="mt-3 space-y-2 text-xs hours-list">
                {shopInfo.hours.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-slate-700">
                    <span className="font-medium text-slate-500">{item.days}:</span>
                    <span className="font-semibold text-slate-900">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Section: Form & Map Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start form-map-grid">
          
          {/* Contact Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm contact-form-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>
                <p className="text-xs text-slate-500">We typically reply within 15–30 minutes</p>
              </div>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-fadeIn success-box">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-emerald-900">Email Delivered!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Your message has been dispatched directly to <strong>{shopInfo.email}</strong>. Our support team will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 contact-form-fields">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all contact-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9800157525"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all contact-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="amiteshsarkar1992@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all contact-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Order Inquiry, Delivery Area, Feedback..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all contact-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Type your message or delivery query here..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none contact-input"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 contact-submit-btn"
                  style={{ opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending to {shopInfo.email}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Direct Email to {shopInfo.email}</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-400">
                    Prefer your email app?{' '}
                    <a
                      href={`mailto:${shopInfo.email}?subject=${encodeURIComponent(formData.subject || 'FAST DELIVERY Customer Inquiry')}&body=${encodeURIComponent(
                        `Name: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
                      )}`}
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      Click here to email directly
                    </a>
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* Embedded Google Map */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col h-full justify-between contact-map-card">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-900">Find Us On Google Maps</h3>
                </div>
                <a
                  href={shopInfo.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Store Location: <strong className="text-slate-700">{shopInfo.address}</strong>
              </p>
            </div>

            {/* Map Frame */}
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 contact-map-frame">
              <iframe
                title="FAST DELIVERY Location Map"
                src={shopInfo.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400">
                📍 Serving Hingalganj, Amberia & nearby surrounding local pin code zones.
              </span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 contact-footer">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">FAST DELIVERY — Service & Quality Guaranteed</p>
          <p>
            {shopInfo.address} | Phone: {shopInfo.phone}
          </p>
          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} FAST DELIVERY. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
