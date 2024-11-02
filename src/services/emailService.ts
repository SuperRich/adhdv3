import emailjs from '@emailjs/browser';

interface EmailData {
  subject: string;
  body: string;
}

// Initialize EmailJS with your public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

export const emailService = {
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: 'richyhunter.rh@gmail.com',
          subject: data.subject,
          message: data.body,
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to send email');
      }

      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  },
};