import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { fullName, phone, email, package: pkg, message } = await request.json();

    if (!fullName || !phone || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Star Event Rental Website" <${process.env.SMTP_USER}>`,
      to: 'info@stareventrentaltx.com',
      replyTo: email,
      subject: `New Contact Form - ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #C9A84C; border-bottom: 2px solid #C9A84C; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #333; width: 140px;">Full Name:</td>
              <td style="padding: 8px 12px; color: #555;">${fullName}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px 12px; font-weight: bold; color: #333;">Phone:</td>
              <td style="padding: 8px 12px; color: #555;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #333;">Email:</td>
              <td style="padding: 8px 12px; color: #555;">
                <a href="mailto:${email}" style="color: #C9A84C;">${email}</a>
              </td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px 12px; font-weight: bold; color: #333;">Package:</td>
              <td style="padding: 8px 12px; color: #555;">${pkg || 'Not selected'}</td>
            </tr>
          </table>
          ${message ? `
          <div style="margin-top: 20px;">
            <h3 style="color: #333; margin-bottom: 8px;">Message:</h3>
            <p style="background-color: #f5f5f5; padding: 12px; border-radius: 8px; color: #555; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          ` : ''}
          <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px; margin-top: 12px;">
            Sent from stareventrentaltx.com contact form
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
