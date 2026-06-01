const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_KEY);

const emailService = {
    async sendPasswordResetEmail(email, resetToken) {
        const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        try {
            const { data, error } = await resend.emails.send({
                from: 'Orion Finanças <onboarding@resend.dev>',
                to: email,
                subject: 'Recuperação de Senha - Orion Finanças',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333; text-align: center;">Recuperação de Senha</h2>

                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0 0 15px 0;">Olá!</p>
                            <p style="margin: 0 0 15px 0;">
                                Recebemos uma solicitação para redefinir sua senha no <strong>Orion Finanças</strong>.
                            </p>
                            <p style="margin: 0 0 15px 0;">
                                Clique no botão abaixo para criar uma nova senha:
                            </p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}" style="
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 15px 30px;
                                    text-decoration: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                    display: inline-block;
                                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                                "> Redefinir Minha Senha</a>
                            </div>

                            <p style="color: #dc3545; font-weight: bold; margin: 20px 0;">
                                Este link expira em 1 hora.
                            </p>

                            <p style="margin: 20px 0 0 0; color: #6c757d; font-size: 14px;">
                                Se você não solicitou esta recuperação, ignore este email.
                                Sua senha permanecerá segura.
                            </p>
                        </div>

                        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

                        <div style="text-align: center; color: #6c757d; font-size: 12px;">
                            <p style="margin: 0;">
                                <strong>Orion Finanças</strong> - Seu controle financeiro pessoal
                            </p>
                            <p style="margin: 5px 0;">
                                Este é um email automático, não responda.
                            </p>
                        </div>
                    </div>
                `
            });

            if (error) {
                console.error('Erro Resend (Reset):', error);
                return { success: false, error: error.message || JSON.stringify(error) };
            }

            console.log('E-mail de reset enviado:', data.id);
            return { success: true };
        } catch (error) {
            console.error('Erro inesperado ao enviar reset:', error);
            return { success: false, error: error.message || String(error) };
        }
    },

    async sendContactEmail(name, email, subject, message) {
        const escape = (str) => String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        const safeName = escape(name);
        const safeEmail = escape(email);
        const safeSubject = escape(subject);
        const safeMessage = escape(message);

        try {
            const { data, error } = await resend.emails.send({
                from: 'Orion Finanças <onboarding@resend.dev>',
                to: process.env.EMAIL_USER,
                reply_to: email,
                subject: `Fale Conosco: ${subject} - ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                        <h2 style="color: #00f2a9;">Nova Mensagem de Contato</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
                            <p><strong>Nome:</strong> ${safeName}</p>
                            <p><strong>E-mail:</strong> ${safeEmail}</p>
                            <p><strong>Assunto:</strong> ${safeSubject}</p>
                            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;">
                            <p><strong>Mensagem:</strong></p>
                            <p style="white-space: pre-wrap;">${safeMessage}</p>
                        </div>
                        <p style="font-size: 12px; color: #6c757d; margin-top: 20px;">
                            Recebido via formulário Fale Conosco - Orion Finanças
                        </p>
                    </div>
                `
            });

            if (error) {
                console.error('Erro Resend (Contato):', error);
                return false;
            }

            console.log('E-mail de contato enviado:', data.id);
            return true;
        } catch (error) {
            console.error('Erro inesperado ao enviar contato:', error);
            return false;
        }
    }
};

module.exports = emailService;