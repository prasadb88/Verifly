import { resend, sender } from "../lib/resend.js"
import { createNewUserWelcomeTemplate, createOTPTemplate } from "./emailTemplate.js"

export const sendWelcomeEmail = async (email, name, clientURL) => {
    const { subject, html, text } = createNewUserWelcomeTemplate(name, clientURL);
    const { data, error } = await resend.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: [email],
        subject: subject,
        html: html,
        text: text
    })
    if (error) {
        console.log(error)
    }
    else {
        console.log("Email sent successfully", data);

    }
}

export const sendOTPEmail = async (email, name, otp) => {
    const { subject, html, text } = createOTPTemplate(name, otp);
    const { data, error } = await resend.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: [email],
        subject: subject,
        html: html,
        text: text
    })
    if (error) {
        console.log("Error sending OTP email:", error)
    } else {
        console.log("OTP Email sent successfully", data);
    }
}