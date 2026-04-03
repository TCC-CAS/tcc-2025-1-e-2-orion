const nodemailer = require('nodemailer');
require('dotenv').config();

const emailService = {
    transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }),

    async sendPasswordResetEmail(email, resetToken) {
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
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
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Message ID: ', result.messageId);
            return true;
        } catch (error) {
            console.log(error.message)
            return false;
        }
    }
};

module.exports = emailService;