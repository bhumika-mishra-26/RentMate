import nodemailer from "nodemailer";

let transporter;

export const getMailerTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // 1. If custom SMTP credentials are provided in .env, use them
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      console.log(`✉️  Using Custom SMTP Mailer: ${SMTP_HOST}`);
      return transporter;
    } catch (error) {
      console.error("Failed to initialize custom SMTP transporter, falling back...", error);
    }
  }

  // 2. Fallback: Generate a test SMTP account from Ethereal on the fly
  try {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log(`--------------------------------------------------`);
    console.log(`✉️  No SMTP config found. Ethereal Mailer configured:`);
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log(`--------------------------------------------------`);

    return transporter;
  } catch (error) {
    console.warn("Failed to create Ethereal account, using console logger fallback:", error.message);
    
    // 3. Last resort fallback: Log the email to the server console log
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`\n=== ✉️  AUTOMATED MAIL OUT ===\nFrom: ${mailOptions.from}\nTo: ${mailOptions.to}\nSubject: ${mailOptions.subject}\nText: ${mailOptions.text}\n=============================\n`);
        return { messageId: "console-dummy-id", messageUrl: "https://ethereal.email" };
      }
    };
    return transporter;
  }
};

