// TODO: Migrate to Resend API (Fase 3)
export const emailService = {
  async sendDocumentEmail(
    to: string,
    subject: string,
    body: string,
    documentLinks: string[]
  ): Promise<void> {
    // Mock implementation
    console.log('[Email Service] Mock email sent:', {
      to,
      subject,
      body,
      documentLinks,
    });
    
    // En Fase 3, aquí se integrará con Resend API
    // const resend = new Resend(process.env.VITE_RESEND_API_KEY);
    // await resend.emails.send({
    //   from: process.env.VITE_RESEND_FROM_EMAIL,
    //   to,
    //   subject,
    //   html: body,
    // });
  },
};
