import { NextRequest } from 'next/server'
import nodemailer from 'nodemailer'

interface EmailRequest {
  name?: string;
  email?: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as EmailRequest;
    
    // Checking if message exists
    if (!data.message) {
      return new Response(JSON.stringify({ success: false, error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, 
      subject: 'New Contact Message',
      text: `From: ${data.name || 'Anonymous'} \nEmail: ${data.email || 'Not provided'} \n\nMessage: ${data.message}`,
    });
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to send email' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}