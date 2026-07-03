import { getMailerTransporter } from "../config/mailer.js";
import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";

/**
 * Log an email send event to the database for audit.
 */
const logEmail = async ({ to, subject, body, status = "SENT" }) => {
  try {
    await prisma.emailNotification.create({ data: { to, subject, body, status } });
  } catch (err) {
    console.warn("Failed to log email to DB:", err.message);
  }
};

export const sendInterestEmail = async ({
  ownerEmail, ownerName, tenantName, tenantEmail, tenantPhone, listingTitle, compatibilityScore,
}) => {
  const subject = `✨ New Tenant Interest in "${listingTitle}"`;
  const body = `${tenantName} expressed interest. Score: ${compatibilityScore}%. Contact: ${tenantPhone} / ${tenantEmail}`;
  try {
    const transporter = await getMailerTransporter();
    const info = await transporter.sendMail({
      from: '"Rent & Flatmate Finder" <noreply@rentfinder.com>',
      to: ownerEmail,
      subject,
      text: `Hello ${ownerName}, ${body}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; color: #1e293b; background-color: #ffffff;">
          <h2 style="color: #6366f1; font-size: 20px; margin-top: 0;">New Tenant Interest Received!</h2>
          <p>Hello <strong>${ownerName}</strong>,</p>
          <p>A tenant has expressed interest in your room listing <strong>"${listingTitle}"</strong>.</p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #f1f5f9;">
            <p style="margin: 0 0 8px 0;"><strong>Tenant Details:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Name: ${tenantName}</li>
              <li>Email: ${tenantEmail}</li>
              <li>Phone: ${tenantPhone}</li>
            </ul>
          </div>
          <div style="background: #e0e7ff; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; border: 1px solid #c7d2fe;">
            <p style="margin: 0; font-size: 14px; color: #4338ca;">AI Compatibility Score</p>
            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #4f46e5;">${compatibilityScore}%</p>
          </div>
          <p>Please log in to your dashboard to review this request and open the chat portal.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">This is an automated notification from Rent & Flatmate Finder.</p>
        </div>
      `,
    });
    console.log(`✉️  Notification email sent. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    await logEmail({ to: ownerEmail, subject, body, status: "SENT" });
    return info;
  } catch (error) {
    console.error("Failed to send interest notification email:", error);
    await logEmail({ to: ownerEmail, subject, body, status: "FAILED" });
  }
};

export const sendAcceptEmail = async ({
  tenantEmail, tenantName, ownerName, ownerEmail, ownerPhone, listingTitle,
}) => {
  const subject = `🎉 Interest Accepted for "${listingTitle}"!`;
  const body = `${ownerName} accepted your interest in "${listingTitle}". Contact: ${ownerEmail} / ${ownerPhone}`;
  try {
    const transporter = await getMailerTransporter();
    const info = await transporter.sendMail({
      from: '"Rent & Flatmate Finder" <noreply@rentfinder.com>',
      to: tenantEmail,
      subject,
      text: `Congratulations ${tenantName}, ${body}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; color: #1e293b; background-color: #ffffff;">
          <h2 style="color: #10b981; font-size: 20px; margin-top: 0;">🎉 Great News! Interest Request Accepted</h2>
          <p>Hello <strong>${tenantName}</strong>,</p>
          <p><strong>${ownerName}</strong> has accepted your interest request for <strong>"${listingTitle}"</strong>!</p>
          <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #dcfce7;">
            <p style="margin: 0 0 8px 0; color: #166534;"><strong>Owner Contact Info:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #1e293b;">
              <li>Name: ${ownerName}</li>
              <li>Email: ${ownerEmail}</li>
              <li>Phone: ${ownerPhone}</li>
            </ul>
          </div>
          <p>A chat room has been opened for you both in the app. Log in to your dashboard to start real-time messaging with the owner!</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">This is an automated notification from Rent & Flatmate Finder.</p>
        </div>
      `,
    });
    console.log(`✉️  Notification email sent. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    await logEmail({ to: tenantEmail, subject, body, status: "SENT" });
    return info;
  } catch (error) {
    console.error("Failed to send acceptance notification email:", error);
    await logEmail({ to: tenantEmail, subject, body, status: "FAILED" });
  }
};

export const sendRejectEmail = async ({ tenantEmail, tenantName, listingTitle }) => {
  const subject = `Update on your interest request for "${listingTitle}"`;
  const body = `Your request for "${listingTitle}" was not accepted.`;
  try {
    const transporter = await getMailerTransporter();
    const info = await transporter.sendMail({
      from: '"Rent & Flatmate Finder" <noreply@rentfinder.com>',
      to: tenantEmail,
      subject,
      text: `Hello ${tenantName}, unfortunately ${body} Keep looking!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; color: #1e293b; background-color: #ffffff;">
          <h2 style="color: #64748b; font-size: 20px; margin-top: 0;">Update on Listing Status</h2>
          <p>Hello <strong>${tenantName}</strong>,</p>
          <p>We wanted to let you know that your interest request for <strong>"${listingTitle}"</strong> has been processed, but the owner has declined or selected another tenant.</p>
          <p>Don't worry! There are plenty of other rooms available. Open the app to browse listings with high compatibility ratings.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">This is an automated notification from Rent & Flatmate Finder.</p>
        </div>
      `,
    });
    console.log(`✉️  Notification email sent. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    await logEmail({ to: tenantEmail, subject, body, status: "SENT" });
    return info;
  } catch (error) {
    console.error("Failed to send rejection notification email:", error);
    await logEmail({ to: tenantEmail, subject, body, status: "FAILED" });
  }
};
