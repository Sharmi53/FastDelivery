'use strict';
const nodemailer = require('nodemailer');
let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !user || !password) { throw new Error('Email not configured: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be set.'); }
  _transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass: password } });
  return _transporter;
}
function formatDateTime(d) { try { return new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); } catch(e) { return String(d); } }
function buildHtml(d) {
  var rows = (d.items||[]).map(function(item,i) {
    var bg = i%2===0 ? '#f9fafb' : '#ffffff';
    return '<tr style="background:'+bg+'"><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">'+item.productName+'</td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">'+item.quantity+'</td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right;">Rs.'+Number(item.price).toFixed(2)+'</td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">Rs.'+Number(item.subtotal).toFixed(2)+'</td></tr>';
  }).join('');
  var addr = 'Not provided';
  if (d.address) {
    var ap = [d.address.fullName||d.address.full_name, d.address.phone, d.address.addressLine||d.address.address_line, d.address.landmark, d.address.city, d.address.state, d.address.pincode].filter(Boolean);
    addr = ap.join(', ');
  }
  var ml = {cod:'Cash on Delivery (COD)',online:'Online Payment',qr:'QR Code Payment'}[d.paymentMethod] || d.paymentMethod;
  var sc = {placed:'#2563eb',confirmed:'#16a34a',cancelled:'#dc2626'}[d.orderStatus] || '#6b7280';
  var dr = Number(d.discount)>0 ? '<tr><td style="padding:10px 20px;color:#16a34a;">Discount</td><td style="padding:10px 20px;text-align:right;color:#16a34a;">- Rs.'+Number(d.discount).toFixed(2)+'</td></tr>' : '';
  var yr = new Date().getFullYear();
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>New Order</title></head>'
    +'<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;">'
    +'<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;"><tr><td align="center">'
    +'<table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;max-width:620px;">'
    +'<tr><td style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:28px 32px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:22px;">FastDelivery - New Order Received</h1><p style="margin:8px 0 0;color:#bae6fd;font-size:14px;">A customer just placed an order.</p></td></tr>'
    +'<tr><td style="background:#0ea5e9;padding:0 32px 20px;"><table width="100%"><tr><td style="color:#fff;"><strong>Order #:</strong> '+d.orderNumber+'</td><td align="right"><span style="background:#fff;color:'+sc+';padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;">'+((d.orderStatus||'placed').toUpperCase())+'</span></td></tr></table></td></tr>'
    +'<tr><td style="padding:28px 32px;">'
    +'<table width="100%" style="background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;margin-bottom:24px;"><tr><td style="padding:16px 20px;"><h2 style="margin:0 0 12px;font-size:15px;color:#0c4a6e;">CUSTOMER DETAILS</h2>'
    +'<table width="100%" style="font-size:14px;color:#374151;"><tr><td width="40%" style="color:#6b7280;font-weight:600;">Name</td><td>'+(d.customerName||'-')+'</td></tr><tr><td style="color:#6b7280;font-weight:600;">Email</td><td>'+(d.customerEmail||'-')+'</td></tr><tr><td style="color:#6b7280;font-weight:600;">Phone</td><td>'+(d.customerPhone||'-')+'</td></tr><tr><td style="color:#6b7280;font-weight:600;">Order Date</td><td>'+formatDateTime(d.orderDate)+'</td></tr><tr><td style="color:#6b7280;font-weight:600;">Order ID</td><td>#'+d.orderId+'</td></tr></table></td></tr></table>'
    +'<table width="100%" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:24px;"><tr><td style="padding:16px 20px;"><h2 style="margin:0 0 10px;font-size:15px;color:#14532d;">DELIVERY ADDRESS</h2><p style="margin:0;font-size:14px;color:#374151;">'+addr+'</p></td></tr></table>'
    +'<h2 style="margin:0 0 12px;font-size:15px;color:#1e293b;">ORDERED ITEMS</h2>'
    +'<table width="100%" style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;font-size:14px;"><thead><tr style="background:#1e293b;color:#fff;"><th style="padding:10px 14px;text-align:left;">Product</th><th style="padding:10px 14px;text-align:center;">Qty</th><th style="padding:10px 14px;text-align:right;">Price</th><th style="padding:10px 14px;text-align:right;">Subtotal</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'<table width="100%" style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;font-size:14px;"><tr style="background:#f9fafb;"><td style="padding:10px 20px;color:#6b7280;">Subtotal</td><td style="padding:10px 20px;text-align:right;">Rs.'+Number(d.subtotal).toFixed(2)+'</td></tr><tr><td style="padding:10px 20px;color:#6b7280;">Delivery Charge</td><td style="padding:10px 20px;text-align:right;">Rs.'+Number(d.deliveryCharge).toFixed(2)+'</td></tr>'+dr+'<tr style="background:#0ea5e9;"><td style="padding:12px 20px;color:#fff;font-weight:700;">Total Amount</td><td style="padding:12px 20px;text-align:right;color:#fff;font-weight:700;">Rs.'+Number(d.totalAmount).toFixed(2)+'</td></tr></table>'
    +'<table width="100%" style="background:#fefce8;border-radius:8px;border:1px solid #fde68a;"><tr><td style="padding:16px 20px;"><h2 style="margin:0 0 10px;font-size:15px;color:#713f12;">PAYMENT DETAILS</h2><table width="100%" style="font-size:14px;"><tr><td width="40%" style="color:#92400e;font-weight:600;">Method</td><td>'+ml+'</td></tr><tr><td style="color:#92400e;font-weight:600;">Payment Status</td><td>'+((d.paymentStatus||'pending').toUpperCase())+'</td></tr></table></td></tr></table>'
    +'</td></tr><tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;"><p style="margin:0;font-size:12px;color:#94a3b8;">Automated notification from FastDelivery. Do not reply.</p><p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">Copyright '+yr+' FastDelivery.</p></td></tr></table></td></tr></table></body></html>';
}
async function sendAdminNewOrderEmail(orderData) {
  var adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error('ADMIN_EMAIL environment variable is not set.');
  var transporter = getTransporter();
  await transporter.sendMail({ from: '"FastDelivery Notifications" <'+process.env.SMTP_USER+'>', to: adminEmail, subject: 'New Order Placed - Order #'+orderData.orderNumber, html: buildHtml(orderData) });
}
module.exports = { sendAdminNewOrderEmail };
