import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { escapeHtml, sanitizeField, isValidEmail, isValidPhone, checkRateLimit, getClientIp } from '@/lib/security';

export async function POST(request) {
  try {
    // Rate limit: 5 contact form submissions per hour per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();

    // Sanitize and validate inputs
    const fullName = sanitizeField(body.fullName, 100);
    const phone = sanitizeField(body.phone, 20);
    const email = sanitizeField(body.email, 254);
    const pkg = sanitizeField(body.package, 100);
    const message = sanitizeField(body.message, 5000);
    const trafficSource = sanitizeField(body.trafficSource, 200) || 'Direct';

    if (!fullName || !phone || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Escape all user inputs to prevent XSS in email clients
    const safeName = escapeHtml(fullName);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email);
    const safePkg = escapeHtml(pkg || 'Not selected');
    const safeMessage = message ? escapeHtml(message).replace(/\n/g, '<br>') : '';
    const safeSource = escapeHtml(trafficSource);

    await resend.emails.send({
      from: 'Star Event Rental <info@stareventrentaltx.com>',
      to: 'info@stareventrentaltx.com',
      replyTo: email,
      subject: `New Contact Form - ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #C9A84C; border-bottom: 2px solid #C9A84C; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #333; width: 140px;">Full Name:</td>
              <td style="padding: 8px 12px; color: #555;">${safeName}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px 12px; font-weight: bold; color: #333;">Phone:</td>
              <td style="padding: 8px 12px; color: #555;">${safePhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #333;">Email:</td>
              <td style="padding: 8px 12px; color: #555;">
                <a href="mailto:${safeEmail}" style="color: #C9A84C;">${safeEmail}</a>
              </td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px 12px; font-weight: bold; color: #333;">Package:</td>
              <td style="padding: 8px 12px; color: #555;">${safePkg}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #333;">📍 Traffic Source:</td>
              <td style="padding: 8px 12px; color: #C9A84C; font-weight: bold;">${safeSource}</td>
            </tr>
          </table>
          ${safeMessage ? `
          <div style="margin-top: 20px;">
            <h3 style="color: #333; margin-bottom: 8px;">Message:</h3>
            <p style="background-color: #f5f5f5; padding: 12px; border-radius: 8px; color: #555; line-height: 1.6;">
              ${safeMessage}
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
