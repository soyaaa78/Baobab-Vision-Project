/**
 * Generates an HTML email receipt styled with Baobab Vision's brand identity.
 *
 * Brand palette:
 *   #FCF7F2  — cream (app background)
 *   #252525  — dark charcoal (primary text / header)
 *   #FFBD6E  — warm gold (primary accent)
 *   #8b5a3c  — brown (secondary accent)
 *   #59C183  — green (Gcash / success)
 *   #f4b06b  — amber gold (table headers, matching AllOrdersPage)
 *
 * Fonts: Red Rose (headings) + Rubik (body) via Google Fonts,
 *        Courier New (order ID, matching AllOrdersPage.css)
 *
 * @param {object} params
 * @param {string}       params.orderId
 * @param {Date|string}  params.orderDate
 * @param {string}       params.customerFirstname
 * @param {string}       params.customerLastname
 * @param {string}       params.paymentMethod   "Pay Cash on Pickup" | "Gcash"
 * @param {string}       params.deliveryMethod  "Pick Up" | "Third-Party Delivery"
 * @param {number}       params.totalAmount
 * @param {Array}        params.products        resolved line items
 *   Each: { name, quantity, unitPrice, colorName, lensLabel, imageUrl }
 * @returns {string} HTML string
 */
const generateReceiptEmail = ({
  orderId,
  orderDate,
  customerFirstname,
  customerLastname,
  paymentMethod,
  deliveryMethod,
  totalAmount,
  products,
}) => {
  const formatCurrency = (n) =>
    Number(n).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formattedDate = new Date(orderDate).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isCOD = paymentMethod === "Pay Cash on Pickup";

  // Badge config differs by payment type
  const badge = isCOD
    ? {
        text: "Order Confirmed &mdash; Awaiting Pickup",
        bg: "#fff8ed",
        color: "#8b5a3c",
        border: "#FFBD6E",
      }
    : {
        text: "Payment Approved",
        bg: "#edfbf4",
        color: "#1e6e42",
        border: "#59C183",
      };

  const productRows = products
    .map((item, i) => {
      const subtotal = item.quantity * item.unitPrice;
      const rowBg = i % 2 === 0 ? "#ffffff" : "#fdfaf6";

      const imgHtml = item.imageUrl
        ? `<img src="${item.imageUrl}" width="64" height="64"
               style="border-radius:10px;object-fit:cover;display:block;border:1px solid #ede8e0;" />`
        : `<div style="width:64px;height:64px;background:#f0ebe3;border-radius:10px;
                       text-align:center;line-height:64px;
                       border:1px solid #e0d9cf;">
             <span style="font-size:10px;color:#a89080;font-family:'Rubik',Arial,sans-serif;line-height:normal;vertical-align:middle;">No Image</span>
           </div>`;

      return `
        <tr style="background:${rowBg};">
          <td style="padding:16px 8px 16px 14px;vertical-align:top;border-bottom:1px solid #ede8e0;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding-right:14px;vertical-align:top;">${imgHtml}</td>
                <td style="vertical-align:top;">
                  <div style="font-family:'Red Rose',Georgia,serif;font-weight:700;font-size:15px;
                               color:#252525;line-height:1.3;margin-bottom:5px;">${item.name}</div>
                  <div style="font-family:'Rubik',Arial,sans-serif;color:#8b7355;font-size:12px;
                               margin-bottom:2px;">
                    <span style="color:#a07840;font-weight:500;">&#9632;</span>&nbsp;Color: ${item.colorName}
                  </div>
                  <div style="font-family:'Rubik',Arial,sans-serif;color:#8b7355;font-size:12px;">
                    <span style="color:#a07840;font-weight:500;">&#9670;</span>&nbsp;Lens: ${item.lensLabel}
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding:16px 8px;text-align:center;vertical-align:middle;
                     font-family:'Rubik',Arial,sans-serif;color:#555555;font-size:14px;
                     border-bottom:1px solid #ede8e0;">${item.quantity}</td>
          <td style="padding:16px 8px;text-align:right;vertical-align:middle;
                     font-family:'Rubik',Arial,sans-serif;color:#666666;font-size:14px;
                     border-bottom:1px solid #ede8e0;">&#8369;${formatCurrency(item.unitPrice)}</td>
          <td style="padding:16px 14px 16px 8px;text-align:right;vertical-align:middle;
                     font-family:'Rubik',Arial,sans-serif;font-weight:700;color:#252525;font-size:14px;
                     border-bottom:1px solid #ede8e0;">&#8369;${formatCurrency(subtotal)}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Baobab Vision — Order Receipt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Red+Rose:wght@400;600;700&family=Rubik:wght@300;400;500;600&display=swap');
    body { margin: 0; padding: 0; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FCF7F2;
             font-family:'Rubik',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#FCF7F2;">
    <tr>
      <td align="center" style="padding:36px 16px 48px;">

        <!-- ═══════════════════════════════════════════ -->
        <!-- CARD                                        -->
        <!-- ═══════════════════════════════════════════ -->
        <table role="presentation" cellpadding="0" cellspacing="0"
               style="width:100%;max-width:600px;background:#ffffff;
                      border-radius:20px;overflow:hidden;
                      border:1px solid #e8e0d5;
                      box-shadow:0 8px 40px rgba(37,37,37,0.10);">

          <!-- ─── GOLD TOP STRIPE ─── -->
          <tr>
            <td style="background:#FFBD6E;height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ─── HEADER ─── -->
          <tr>
            <td style="background:#252525;padding:28px 36px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <!-- Monogram -->
                    <div style="font-family:'Red Rose',Georgia,serif;font-size:13px;
                                font-weight:700;color:#FFBD6E;letter-spacing:4px;
                                text-transform:uppercase;margin-bottom:4px;">Baobab Vision</div>
                    <!-- Brand wordmark -->
                    <div style="font-family:'Red Rose',Georgia,serif;font-size:30px;
                                font-weight:700;color:#ffffff;letter-spacing:1px;
                                line-height:1.1;">Purchase Receipt</div>
                    <!-- Subtitle -->
                    <div style="font-family:'Rubik',Arial,sans-serif;font-size:13px;
                                color:rgba(255,189,110,0.75);margin-top:6px;font-weight:300;
                                font-style:italic;letter-spacing:0.5px;">
                      See the world in style.
                    </div>
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    <!-- BV monogram badge -->
                    <div style="display:inline-block;width:52px;height:52px;
                                background:#FFBD6E;border-radius:50%;
                                text-align:center;line-height:52px;">
                      <span style="font-family:'Red Rose',Georgia,serif;font-size:20px;
                                   font-weight:700;color:#252525;vertical-align:middle;">BV</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── GOLD DIVIDER ─── -->
          <tr>
            <td style="background:linear-gradient(to right,#FFBD6E,#f4b06b,#e8963c);
                       height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ─── GREETING ─── -->
          <tr>
            <td style="padding:30px 36px 0;">
              <div style="font-family:'Red Rose',Georgia,serif;font-size:22px;
                           font-weight:700;color:#252525;margin-bottom:8px;">
                Hi, ${customerFirstname}! &#128075;
              </div>
              <div style="font-family:'Rubik',Arial,sans-serif;font-size:14px;
                           color:#6b7280;line-height:1.6;">
                Thank you for shopping with us. Your order has been received and
                your receipt is below — keep it for your records.
              </div>
            </td>
          </tr>

          <!-- ─── ORDER META CARD ─── -->
          <tr>
            <td style="padding:20px 36px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FCF7F2;border-radius:12px;
                            border:1px solid #e8e0d5;overflow:hidden;">
                <tr>
                  <!-- Order ID -->
                  <td style="padding:16px 20px;width:50%;border-right:1px solid #e8e0d5;
                              vertical-align:top;">
                    <div style="font-family:'Rubik',Arial,sans-serif;font-size:10px;
                                 color:#a07840;text-transform:uppercase;letter-spacing:1px;
                                 font-weight:600;margin-bottom:5px;">Order ID</div>
                    <div style="font-family:'Courier New',Courier,monospace;font-size:14px;
                                 font-weight:700;color:#252525;letter-spacing:0.5px;">${orderId}</div>
                  </td>
                  <!-- Date -->
                  <td style="padding:16px 20px;width:50%;vertical-align:top;">
                    <div style="font-family:'Rubik',Arial,sans-serif;font-size:10px;
                                 color:#a07840;text-transform:uppercase;letter-spacing:1px;
                                 font-weight:600;margin-bottom:5px;">Order Date</div>
                    <div style="font-family:'Rubik',Arial,sans-serif;font-size:14px;
                                 color:#252525;">${formattedDate}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── SECTION LABEL: Items Ordered ─── -->
          <tr>
            <td style="padding:28px 36px 0;">
              <div style="font-family:'Red Rose',Georgia,serif;font-size:13px;
                           font-weight:700;color:#8b5a3c;text-transform:uppercase;
                           letter-spacing:2px;margin-bottom:12px;">Items Ordered</div>

              <!-- Products table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="border-radius:12px;overflow:hidden;
                            border:1px solid #ede8e0;">
                <!-- Table header -->
                <thead>
                  <tr style="background:#f4b06b;">
                    <th style="padding:11px 8px 11px 14px;text-align:left;
                                font-family:'Red Rose',Georgia,serif;font-size:11px;
                                font-weight:700;color:#252525;text-transform:uppercase;
                                letter-spacing:1px;">Product</th>
                    <th style="padding:11px 8px;text-align:center;
                                font-family:'Red Rose',Georgia,serif;font-size:11px;
                                font-weight:700;color:#252525;text-transform:uppercase;
                                letter-spacing:1px;">Qty</th>
                    <th style="padding:11px 8px;text-align:right;
                                font-family:'Red Rose',Georgia,serif;font-size:11px;
                                font-weight:700;color:#252525;text-transform:uppercase;
                                letter-spacing:1px;">Unit Price</th>
                    <th style="padding:11px 14px 11px 8px;text-align:right;
                                font-family:'Red Rose',Georgia,serif;font-size:11px;
                                font-weight:700;color:#252525;text-transform:uppercase;
                                letter-spacing:1px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- ─── GRAND TOTAL ─── -->
          <tr>
            <td style="padding:16px 36px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#252525;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:'Red Rose',Georgia,serif;font-size:14px;
                                    font-weight:600;color:#FFBD6E;text-transform:uppercase;
                                    letter-spacing:1.5px;">Grand Total</td>
                        <td style="text-align:right;">
                          <span style="font-family:'Red Rose',Georgia,serif;font-size:26px;
                                        font-weight:700;color:#ffffff;">
                            &#8369;${formatCurrency(totalAmount)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── ORDER DETAILS ─── -->
          <tr>
            <td style="padding:16px 36px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FCF7F2;border-radius:12px;
                            border:1px solid #e8e0d5;border-left:4px solid #8b5a3c;
                            overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-family:'Rubik',Arial,sans-serif;font-size:10px;
                                 color:#a07840;text-transform:uppercase;letter-spacing:1px;
                                 font-weight:600;margin-bottom:10px;">Order Details</div>

                    <!-- Delivery -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:8px;vertical-align:top;">
                          <span style="font-family:'Rubik',Arial,sans-serif;font-size:12px;
                                        color:#8b7355;">&#128666;</span>
                        </td>
                        <td>
                          <span style="font-family:'Rubik',Arial,sans-serif;font-size:13px;
                                        font-style:italic;color:#6b7280;">${deliveryMethod}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Payment -->
                    <table role="presentation" cellpadding="0" cellspacing="0"
                           style="margin-top:8px;">
                      <tr>
                        <td style="padding-right:8px;vertical-align:top;">
                          <span style="font-family:'Rubik',Arial,sans-serif;font-size:12px;
                                        color:#8b7355;">&#128179;</span>
                        </td>
                        <td>
                          <span style="font-family:'Rubik',Arial,sans-serif;font-size:13px;
                                        font-weight:500;color:#374151;">Payment: ${paymentMethod}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─── FOOTER ─── -->
          <tr>
            <td style="background:#252525;padding:24px 36px;text-align:center;">
              <div style="font-family:'Red Rose',Georgia,serif;font-size:16px;
                           font-weight:700;color:#FFBD6E;letter-spacing:1px;
                           margin-bottom:6px;">Baobab Vision</div>
              <div style="font-family:'Rubik',Arial,sans-serif;font-size:12px;
                           color:rgba(255,255,255,0.55);line-height:1.7;">
                Questions about your order? Reply to this email and we'll help you out.<br />
                This is an automated receipt &mdash; please keep it for your records.
              </div>
              <div style="font-family:'Rubik',Arial,sans-serif;font-size:11px;
                           color:rgba(255,189,110,0.4);margin-top:14px;">
                &copy; ${new Date().getFullYear()} Baobab Vision. All rights reserved.
              </div>
            </td>
          </tr>

          <!-- ─── GOLD BOTTOM STRIPE ─── -->
          <tr>
            <td style="background:#FFBD6E;height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
        <!-- /CARD -->

      </td>
    </tr>
  </table>

</body>
</html>`;
};

module.exports = generateReceiptEmail;
