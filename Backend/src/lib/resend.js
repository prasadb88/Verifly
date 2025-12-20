import { Resend } from "resend";


let resendClient;

const apiKey = process.env.RESEND_API_KEY;

if (apiKey) {
    resendClient = new Resend(apiKey);
} else {
    console.warn("WARNING: RESEND_API_KEY is missing. Emails will not be sent.");
    resendClient = {
        emails: {
            send: async () => ({ error: { message: "Missing RESEND_API_KEY" } })
        }
    };
}

export const resend = resendClient;
export const sender = {
    email: process.env.EMAIL_FROM,
    name: process.env.EMAIL_FROM_NAME
}