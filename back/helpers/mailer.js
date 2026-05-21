const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendDownloadsEmail(toEmail, customerName, orderCode, items) {
  const linksHtml = items
    .map(
      (item) => `
      <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; background-color: #f8fafc;">
        <h4 style="margin: 0 0 6px 0; color: #1e293b;">${item.name}</h4>
        <p style="margin: 0 0 8px 0; font-size: 0.85em; color: #64748b;">Formato: ${item.fileFormat}</p>
        <a href="${item.megaUrl}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 0.9em; box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);">Descargar Vector (MEGA)</a>
      </div>
    `
    )
    .join('');

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Vector Store" <noreply@vectorstore.com>',
    to: toEmail,
    subject: `¡Pago Aprobado! Descarga tus diseños (${orderCode})`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <span style="color: #ffffff; font-size: 2em; font-weight: bold; letter-spacing: 1px;">◆ VectorStore</span>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
          <h2 style="color: #1e293b; margin-top: 0;">¡Hola, ${customerName}!</h2>
          <p>Hemos verificado tu comprobante de pago con éxito. Tu pedido <strong>${orderCode}</strong> ha sido aprobado y tus archivos ya están disponibles para descarga.</p>
          
          <h3 style="margin-top: 28px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b;">Tus Diseños Comprados:</h3>
          ${linksHtml}

          <p style="margin-top: 28px; font-size: 0.85em; color: #64748b; background-color: #f1f5f9; padding: 12px; border-radius: 6px;">
            <strong>Nota:</strong> Guarda este correo para futuras descargas. Si tienes algún inconveniente al descargar tus archivos, no dudes en responder directamente a este correo o escribirnos por WhatsApp.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
          <p style="text-align: center; font-size: 0.8em; color: #94a3b8; margin: 0;">
            © 2026 Vector Store. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendDownloadsEmail,
};
