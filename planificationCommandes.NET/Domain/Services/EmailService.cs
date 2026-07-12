// Services/EmailService.cs
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Utils;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Domain.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            var imagesFolder = Path.Combine(Directory.GetCurrentDirectory(), "images");
            var logoAppPath = Path.Combine(imagesFolder, "logo_app.png");
            var logoMicPath = Path.Combine(imagesFolder, "logo_mic.jpg");

            var bodyBuilder = new BodyBuilder();

            string cidApp = "";
            string cidMic = "";

            if (File.Exists(logoAppPath))
            {
                var imgApp = bodyBuilder.LinkedResources.Add(logoAppPath);
                imgApp.ContentId = MimeUtils.GenerateMessageId();
                imgApp.ContentDisposition = new ContentDisposition(ContentDisposition.Inline);
                cidApp = imgApp.ContentId;
            }

            if (File.Exists(logoMicPath))
            {
                var imgMic = bodyBuilder.LinkedResources.Add(logoMicPath);
                imgMic.ContentId = MimeUtils.GenerateMessageId();
                imgMic.ContentDisposition = new ContentDisposition(ContentDisposition.Inline);
                cidMic = imgMic.ContentId;
            }

            bodyBuilder.HtmlBody = htmlBody
                .Replace("%%CID_APP%%", $"cid:{cidApp}")
                .Replace("%%CID_MIC%%", $"cid:{cidMic}");

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(
                _configuration["EmailSettings:SenderName"],
                _configuration["EmailSettings:SenderEmail"]));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = subject;
            email.Body = bodyBuilder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _configuration["EmailSettings:Host"],
                int.Parse(_configuration["EmailSettings:Port"]!),
                SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(
                _configuration["EmailSettings:SenderEmail"],
                _configuration["EmailSettings:Password"]);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
        //template de base
        private string GetBaseTemplate(string content)
        {
            return $@"
<!DOCTYPE html>
<html lang='fr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin:0;padding:0;background-color:#e8f0f7;font-family:Arial,Helvetica,sans-serif;'>
<table width='100%' cellpadding='0' cellspacing='0' style='background-color:#e8f0f7;padding:40px 0;'>
    <tr>
        <td align='center'>
            <table width='620' cellpadding='0' cellspacing='0' style='max-width:620px;width:100%;'>

                <!-- HEADER -->
                <tr>
                    <td style='background:linear-gradient(135deg,#0d2d52 0%,#1a4a7a 55%,#1e6f8c 100%);
                               border-radius:16px 16px 0 0;padding:36px 40px 28px 40px;text-align:center;'>

                        <!-- Fluid swoosh divider -->
                        <div style='margin:0 auto 18px auto;width:80%;'>
                            <svg viewBox='0 0 300 18' xmlns='http://www.w3.org/2000/svg' style='width:100%;display:block;'>
                                <path d='M10 14 Q40 2 80 10 Q110 16 140 8 Q170 1 200 10 Q230 17 260 9 Q280 4 295 12'
                                      stroke='#5ab4d6' stroke-width='2.5' fill='none' stroke-linecap='round'/>
                                <path d='M10 14 Q40 2 80 10 Q110 16 140 8 Q170 1 200 10 Q230 17 260 9 Q280 4 295 12'
                                      stroke='rgba(90,180,214,0.3)' stroke-width='6' fill='none' stroke-linecap='round'/>
                                <ellipse cx='22' cy='13' rx='4' ry='6' fill='#4aaa6a' opacity='0.85'
                                         transform='rotate(-15 22 13)'/>
                            </svg>
                        </div>

                        <!-- App logo + title -->
                        <table cellpadding='0' cellspacing='0' style='margin:0 auto;'>
                            <tr>
                                
                                <td style='vertical-align:middle;text-align:left;'>
                                    <h1 style='margin:0;font-size:26px;font-weight:bold;letter-spacing:3px;
                                               color:#ffffff;text-transform:uppercase;font-family:Arial,sans-serif;'>
                                        DENIM <span style='color:#5ab4d6;'>PLANNER</span>
                                    </h1>
                                    <p style='margin:3px 0 0 0;font-size:10px;color:rgba(255,255,255,0.65);
                                              letter-spacing:3px;text-transform:uppercase;'>
                                        Planification des Commandes
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <!-- Accent line -->
                        <div style='margin:20px auto 0 auto;width:60px;height:3px;
                                    background:linear-gradient(90deg,#4aaa6a,#5ab4d6);border-radius:2px;'></div>
                    </td>
                </tr>

                <!-- BODY -->
                <tr>
                    <td style='background:#ffffff;padding:44px 48px;'>
                        {content}
                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style='background:#0d2d52;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;'>
                        
                        <p style='margin:0 0 4px 0;font-size:13px;color:#5ab4d6;
                                  letter-spacing:2px;text-transform:uppercase;font-weight:bold;'>
                            Denim Planner
                        </p>
                        <p style='margin:0 0 6px 0;font-size:11px;color:rgba(255,255,255,0.45);'>
                            © 2025 WICMIC · Tous droits réservés
                        </p>
                        <svg viewBox='0 0 120 8' xmlns='http://www.w3.org/2000/svg'
                             style='display:block;margin:0 auto 8px auto;width:100px;'>
                            <path d='M5 6 Q30 1 60 5 Q90 9 115 3'
                                  stroke='#5ab4d6' stroke-width='1.5' fill='none'
                                  stroke-linecap='round' opacity='0.5'/>
                        </svg>
                        <p style='margin:0;font-size:11px;color:rgba(255,255,255,0.35);'>
                            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>";
        }


        public async Task SendWelcomeEmailAsync(string toEmail, string firstName)
        {
            var subject = "Bienvenue sur Denim Planner";

            var content = $@"
                <h2 style='margin:0 0 8px 0;font-size:26px;color:#0d2d52;font-family:Arial,sans-serif;'>
                    Bonjour, <span style='color:#1e6f8c;'>{firstName}</span>
                </h2>
                <p style='margin:0 0 28px 0;font-size:14px;color:#888;letter-spacing:1px;
                           text-transform:uppercase;border-bottom:2px solid #e8f0f7;padding-bottom:20px;'>
                    Bienvenue dans l'équipe
                </p>

                <p style='margin:0 0 16px 0;font-size:16px;color:#333;line-height:1.7;'>
                    Votre compte a été créé avec succès sur <strong style='color:#0d2d52;'>Denim Planner</strong>.
                    Vous faites maintenant partie de l'équipe de planification des commandes.
                </p>
                <p style='margin:0 0 32px 0;font-size:16px;color:#333;line-height:1.7;'>
                    Connectez-vous dès maintenant pour commencer à gérer vos planifications.
                </p>

                <!-- Feature Badges -->
                <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:32px;'>
                    <tr>
                        <td width='33%' style='padding:4px;'>
                            <div style='background:#f0f6fb;border-radius:10px;padding:16px 12px;
                                        text-align:center;border-left:3px solid #4aaa6a;'>
                                <svg width='28' height='28' viewBox='0 0 24 24' fill='none'
                                     xmlns='http://www.w3.org/2000/svg' style='margin-bottom:8px;'>
                                    <rect x='3' y='4' width='18' height='17' rx='2' stroke='#4aaa6a' stroke-width='2'/>
                                    <line x1='3' y1='9' x2='21' y2='9' stroke='#4aaa6a' stroke-width='2'/>
                                    <line x1='8' y1='2' x2='8' y2='6' stroke='#4aaa6a' stroke-width='2' stroke-linecap='round'/>
                                    <line x1='16' y1='2' x2='16' y2='6' stroke='#4aaa6a' stroke-width='2' stroke-linecap='round'/>
                                    <line x1='7' y1='14' x2='17' y2='14' stroke='#4aaa6a' stroke-width='1.5' stroke-linecap='round'/>
                                    <line x1='7' y1='17' x2='13' y2='17' stroke='#4aaa6a' stroke-width='1.5' stroke-linecap='round'/>
                                </svg>
                                <div style='font-size:10px;color:#0d2d52;font-weight:bold;letter-spacing:1px;'>PLANIFICATION</div>
                            </div>
                        </td>
                        <td width='33%' style='padding:4px;'>
                            <div style='background:#f0f6fb;border-radius:10px;padding:16px 12px;
                                        text-align:center;border-left:3px solid #5ab4d6;'>
                                <svg width='28' height='28' viewBox='0 0 24 24' fill='none'
                                     xmlns='http://www.w3.org/2000/svg' style='margin-bottom:8px;'>
                                    <circle cx='12' cy='12' r='3' stroke='#5ab4d6' stroke-width='2'/>
                                    <path d='M12 2v3M12 19v3M2 12h3M19 12h3' stroke='#5ab4d6' stroke-width='2' stroke-linecap='round'/>
                                    <path d='M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12'
                                          stroke='#5ab4d6' stroke-width='2' stroke-linecap='round'/>
                                </svg>
                                <div style='font-size:10px;color:#0d2d52;font-weight:bold;letter-spacing:1px;'>MACHINES</div>
                            </div>
                        </td>
                        <td width='33%' style='padding:4px;'>
                            <div style='background:#f0f6fb;border-radius:10px;padding:16px 12px;
                                        text-align:center;border-left:3px solid #1a4a7a;'>
                                <svg width='28' height='28' viewBox='0 0 24 24' fill='none'
                                     xmlns='http://www.w3.org/2000/svg' style='margin-bottom:8px;'>
                                    <path d='M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z'
                                          stroke='#1a4a7a' stroke-width='2'/>
                                    <path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2' stroke='#1a4a7a' stroke-width='2'/>
                                    <line x1='12' y1='12' x2='12' y2='16' stroke='#1a4a7a' stroke-width='2' stroke-linecap='round'/>
                                    <line x1='10' y1='14' x2='14' y2='14' stroke='#1a4a7a' stroke-width='2' stroke-linecap='round'/>
                                </svg>
                                <div style='font-size:10px;color:#0d2d52;font-weight:bold;letter-spacing:1px;'>COMMANDES</div>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- CTA -->
                <div style='text-align:center;margin-bottom:32px;'>
                    <a href='http://localhost:4200/auth/login'
                       style='display:inline-block;background:linear-gradient(135deg,#0d2d52,#1e6f8c);
                              color:#ffffff;text-decoration:none;padding:14px 44px;border-radius:8px;
                              font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;'>
                        Se Connecter
                    </a>
                </div>

                <!-- Warning note -->
                <div style='background:#eef5fb;border:1px solid #a8c8e0;border-radius:8px;padding:16px 20px;'>
                    <table cellpadding='0' cellspacing='0'>
                        <tr>
                            <td style='padding-right:12px;vertical-align:top;'>
                                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
                                          stroke='#1a4a7a' stroke-width='2' stroke-linejoin='round'/>
                                    <line x1='12' y1='9' x2='12' y2='13' stroke='#1a4a7a' stroke-width='2' stroke-linecap='round'/>
                                    <circle cx='12' cy='17' r='1' fill='#1a4a7a'/>
                                </svg>
                            </td>
                            <td style='font-size:13px;color:#0d2d52;line-height:1.6;'>
                                <strong>Important :</strong> Si vous n'avez pas demandé la création de ce compte,
                                veuillez contacter votre administrateur immédiatement.
                            </td>
                        </tr>
                    </table>
                </div>";

            await SendEmailAsync(toEmail, firstName, subject, GetBaseTemplate(content));
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string firstName, string resetLink)
        {
            var subject = "Réinitialisation de votre mot de passe - Denim Planner";

            var content = $@"
                <h2 style='margin:0 0 8px 0;font-size:26px;color:#0d2d52;font-family:Arial,sans-serif;'>
                    Bonjour, <span style='color:#1e6f8c;'>{firstName}</span>
                </h2>
                <p style='margin:0 0 28px 0;font-size:14px;color:#888;letter-spacing:1px;
                           text-transform:uppercase;border-bottom:2px solid #e8f0f7;padding-bottom:20px;'>
                    Réinitialisation du mot de passe
                </p>

                <!-- Lock Banner -->
                <div style='background:linear-gradient(135deg,#eef5fb,#dceef8);border:1px solid #a8c8e0;
                            border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;'>
                    <svg width='44' height='44' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'
                         style='margin-bottom:12px;'>
                        <rect x='5' y='11' width='14' height='10' rx='2' stroke='#1e6f8c' stroke-width='2'/>
                        <path d='M8 11V7a4 4 0 018 0v4' stroke='#1e6f8c' stroke-width='2' stroke-linecap='round'/>
                        <circle cx='12' cy='16' r='1.5' fill='#1e6f8c'/>
                    </svg>
                    <p style='margin:0;font-size:15px;color:#0d2d52;font-weight:bold;'>
                        Une demande de réinitialisation a été effectuée
                    </p>
                </div>

                <p style='margin:0 0 16px 0;font-size:16px;color:#333;line-height:1.7;'>
                    Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte
                    <strong style='color:#0d2d52;'>Denim Planner</strong>.
                </p>
                <p style='margin:0 0 32px 0;font-size:16px;color:#333;line-height:1.7;'>
                    Cliquez sur le bouton ci-dessous. Ce lien est valable pendant
                    <strong style='color:#1e6f8c;'>1 heure</strong> seulement.
                </p>

                <!-- CTA -->
                <div style='text-align:center;margin-bottom:32px;'>
                    <a href='{resetLink}'
                       style='display:inline-block;background:linear-gradient(135deg,#1e6f8c,#5ab4d6);
                              color:#ffffff;text-decoration:none;padding:16px 44px;border-radius:8px;
                              font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;'>
                        Réinitialiser mon mot de passe
                    </a>
                </div>

                <!-- Expiry Warning -->
                <div style='background:#f0f6fb;border:1px solid #a8c8e0;border-radius:8px;
                            padding:16px 20px;margin-bottom:16px;'>
                    <table cellpadding='0' cellspacing='0'>
                        <tr>
                            <td style='padding-right:12px;vertical-align:top;'>
                                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <circle cx='12' cy='12' r='10' stroke='#1e6f8c' stroke-width='2'/>
                                    <polyline points='12 6 12 12 16 14' stroke='#1e6f8c' stroke-width='2'
                                              stroke-linecap='round' stroke-linejoin='round'/>
                                </svg>
                            </td>
                            <td style='font-size:13px;color:#0d2d52;line-height:1.6;'>
                                <strong>Ce lien expire dans 1 heure.</strong>
                                Après expiration, vous devrez faire une nouvelle demande.
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Security Note -->
                <div style='background:#edf4f9;border:1px solid #8ab4cc;border-radius:8px;padding:16px 20px;'>
                    <table cellpadding='0' cellspacing='0'>
                        <tr>
                            <td style='padding-right:12px;vertical-align:top;'>
                                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
                                          stroke='#1a4a7a' stroke-width='2' stroke-linejoin='round'/>
                                    <polyline points='9 12 11 14 15 10' stroke='#4aaa6a' stroke-width='2'
                                              stroke-linecap='round' stroke-linejoin='round'/>
                                </svg>
                            </td>
                            <td style='font-size:13px;color:#0d2d52;line-height:1.6;'>
                                <strong>Vous n'avez pas fait cette demande ?</strong>
                                Ignorez cet email. Votre mot de passe restera inchangé.
                            </td>
                        </tr>
                    </table>
                </div>";

            await SendEmailAsync(toEmail, firstName, subject, GetBaseTemplate(content));
        }
    }
}