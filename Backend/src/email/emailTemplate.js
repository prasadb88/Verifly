export function createNewUserWelcomeTemplate(name, clientURL) {
    const brandName = "Verifly";
    const primaryColor = "#007BFF"; // Primary blue
    const accentColor = "#28a745"; // Success green (for verification/trust checkmark)
    const linkColor = "#5B86E5";

    // --- Template Subject and Content ---
    const subject = `Welcome to ${brandName}, ${name}! Your Trusted Car Marketplace is Ready.`;

    const content = `
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">

        <div style="background: linear-gradient(to right, ${primaryColor}, ${linkColor}); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to ${brandName}!</h1>
          <p style="color: white; opacity: 0.8; margin-top: 10px; font-size: 16px;">The future of verified car buying is here.</p>
        </div>

        <div style="padding: 35px;">
          <p style="font-size: 18px; color: ${primaryColor};"><strong>Hello ${name},</strong></p>
          <p>Thank you for creating an account with **${brandName}**! We are excited to help you buy or sell cars with complete confidence.</p>

          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${accentColor};">
            <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>What makes us different?</strong></p>
            <ul style="padding-left: 20px; margin: 0; list-style-type: none;">
              <li style="margin-bottom: 10px;">🚗 <strong>AI Damage Reports:</strong> Every car is inspected by our <strong>YOLO</strong> model.</li>
              <li style="margin-bottom: 10px;">✅ <strong>Transparent History:</strong> Official VAHAN/RTO data integrated.</li>
              <li style="margin-bottom: 0;">💬 <strong>Real-time Chat:</strong> Connect directly with verified sellers/buyers.</li>
            </ul>
          </div>

          <p style="margin-bottom: 5px;">Ready to find your next verified ride or list your car for free?</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${clientURL}" style="background-color: ${accentColor}; color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px;">Start Exploring Verified Cars</a>
          </div>

          <p style="margin-top: 25px;">If you have any questions, our support team is ready to assist you!</p>

          <p style="margin-top: 25px; margin-bottom: 0;">Happy driving,<br>The <strong>${brandName}</strong> Team</p>
        </div>

        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee;">
          <p>© ${new Date().getFullYear() + 1} ${brandName}. Trust in Verified Cars.</p>
          <p><a href="${clientURL}/help" style="color: ${linkColor}; text-decoration: none;">Support</a> &bull; <a href="${clientURL}/privacy" style="color: ${linkColor}; text-decoration: none;">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    `;

    const textContent = `
    Welcome to ${brandName}, ${name}!

    Thank you for registering. We connect you to verified car listings powered by AI damage reports and RTO data.

    Start exploring verified cars now: ${clientURL}

    The ${brandName} Team
    `;

    return {
        subject,
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>${content}</html>`,
        text: textContent
    };

}

export function createOTPTemplate(name, otp) {
    const brandName = "Verifly";
    const primaryColor = "#007BFF"; // Primary blue

    const subject = `Your Verification Code for ${brandName}`;

    const content = `
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="background: ${primaryColor}; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 500;">Password Reset</h1>
        </div>
        <div style="padding: 35px; text-align: center;">
          <p style="font-size: 18px; color: ${primaryColor};"><strong>Hello ${name},</strong></p>
          <p>You requested to reset your password. Use the following OTP to verify your identity. This code is valid for 10 minutes.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 25px 0; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: ${primaryColor}; border: 2px dashed ${primaryColor}; display: inline-block;">
            ${otp}
          </div>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee;">
          <p>© ${new Date().getFullYear()} ${brandName}.</p>
        </div>
      </div>
    </body>
    `;

    const textContent = `Your ${brandName} verification code is: ${otp}. It is valid for 10 minutes.`;

    return {
        subject,
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>${content}</html>`,
        text: textContent
    };
}