// ============================================================
//  WaterTech Engineering — Google Apps Script (Code.gs)
//  Handles form submissions from welcome modal, contact modal,
//  and footer quick inquiry form.
// ============================================================

// ── CONFIG ───────────────────────────────────────────────────
const SHEET_NAME      = "Leads";          // Tab name in your Google Sheet
const NOTIFY_EMAIL    = "hello@watertech.com"; // Where to receive alerts
const SEND_NOTIFY     = true;             // Set false to disable email alerts
const SEND_AUTORELY   = true;             // Auto-reply to the lead's email?

// ── MAIN ENTRY POINT ─────────────────────────────────────────
function doPost(e) {
  try {
    // Parse incoming JSON body
    const params = JSON.parse(e.postData.contents);

    const name    = sanitize(params.name    || "");
    const phone   = sanitize(params.phone   || "");
    const email   = sanitize(params.email   || "");
    const message = sanitize(params.message || "");
    const source  = sanitize(params.source  || "Unknown"); // welcome | contact | footer
    const timestamp = new Date();

    // ── 1. Write to Google Sheet ──────────────────────────────
    saveToSheet({ timestamp, name, phone, email, message, source });

    // ── 2. Notify the team ───────────────────────────────────
    if (SEND_NOTIFY) {
      sendTeamNotification({ timestamp, name, phone, email, message, source });
    }

    // ── 3. Auto-reply to lead (if email provided) ─────────────
    if (SEND_AUTORELY && email) {
      sendAutoReply({ name, email, source });
    }

    return jsonResponse({ status: "success", message: "Lead saved." });

  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return jsonResponse({ status: "error", message: err.message }, 500);
  }
}

// ── SAVE TO SHEET ─────────────────────────────────────────────
function saveToSheet({ timestamp, name, phone, email, message, source }) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  // Auto-create the sheet + header row if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp", "Name", "Phone", "Email", "Message", "Source", "Status"
    ]);

    // Style the header row
    const header = sheet.getRange(1, 1, 1, 7);
    header.setBackground("#1a3c5e");
    header.setFontColor("#ffffff");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);  // Timestamp
    sheet.setColumnWidth(2, 150);  // Name
    sheet.setColumnWidth(3, 130);  // Phone
    sheet.setColumnWidth(4, 200);  // Email
    sheet.setColumnWidth(5, 300);  // Message
    sheet.setColumnWidth(6, 120);  // Source
    sheet.setColumnWidth(7, 100);  // Status
  }

  // Append the new lead row
  sheet.appendRow([
    timestamp,
    name,
    phone,
    email,
    message,
    source,
    "New"           // default status — change to Contacted / Closed manually
  ]);

  // Alternate row shading for readability
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, 7).setBackground("#f0f7ff");
  }
}

// ── TEAM NOTIFICATION EMAIL ───────────────────────────────────
function sendTeamNotification({ timestamp, name, phone, email, message, source }) {
  const subject = `🔔 New Lead from WaterTech Website — ${name}`;
  const body = `
New inquiry received via the WaterTech website.

──────────────────────────────
  Submitted At : ${timestamp.toLocaleString()}
  Source Form  : ${source}
──────────────────────────────
  Name    : ${name}
  Phone   : ${phone}
  Email   : ${email || "Not provided"}
  Message :
  ${message || "No message provided."}
──────────────────────────────

Reply to this lead within 24 hours per our SLA.

View all leads in Google Sheets:
${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
  `.trim();

  MailApp.sendEmail({
    to:      NOTIFY_EMAIL,
    subject: subject,
    body:    body
  });
}

// ── AUTO-REPLY TO LEAD ────────────────────────────────────────
function sendAutoReply({ name, email, source }) {
  const firstName = name.split(" ")[0] || "there";
  const subject   = "We received your inquiry — WaterTech Engineering";
  const body = `
Hi ${firstName},

Thank you for reaching out to WaterTech Engineering!

We've received your inquiry and one of our engineers will get back to you within 24 hours to discuss your water treatment requirements.

In the meantime, feel free to call us directly:
📞 +91-9871151318

Or reply to this email with any additional details about your project.

──────────────────────────────
WaterTech Engineering
25+ Years | 360+ Projects | 275+ Clients
hello@watertech.com | +91-9871151318
──────────────────────────────

This is an automated confirmation. Our team will follow up shortly.
  `.trim();

  MailApp.sendEmail({
    to:      email,
    subject: subject,
    body:    body,
    replyTo: NOTIFY_EMAIL,
    name:    "WaterTech Engineering"
  });
}

// ── HELPERS ───────────────────────────────────────────────────

/** Strip HTML tags and trim whitespace */
function sanitize(value) {
  return String(value).replace(/<[^>]*>/g, "").trim();
}

/** Return a JSON ContentService response */
function jsonResponse(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── TEST FUNCTION (run manually in Apps Script editor) ────────
function testSubmission() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        name:    "Rajesh Kumar",
        phone:   "+91-9000000000",
        email:   "rajesh@example.com",
        message: "Need a 500 KLD RO plant for our refinery.",
        source:  "welcome-modal"
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
