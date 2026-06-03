using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Erp.Server.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IConfiguration configuration, ILogger<NotificationService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            if (string.IsNullOrEmpty(toEmail)) return false;

            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");
                var host = emailSettings["Host"];
                var port = int.Parse(emailSettings["Port"] ?? "587");
                var username = emailSettings["Username"];
                var password = emailSettings["Password"];
                var fromEmail = emailSettings["FromEmail"];

                if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username)) 
                {
                    _logger.LogWarning("Email configuration is missing.");
                    return false;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Captain App", fromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;
                message.Body = new TextPart(TextFormat.Html) { Text = body };

                using var client = new SmtpClient();
                await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.Auto);
                await client.AuthenticateAsync(username, password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {ToEmail}", toEmail, ex.Message);
                return false;
            }
        }

        public async Task<bool> SendWhatsAppAsync(string toPhone, string message)
        {
            if (string.IsNullOrEmpty(toPhone)) return false;

            try
            {
                var metaSettings = _configuration.GetSection("MetaWhatsAppSettings");
                var phoneNumberId = metaSettings["PhoneNumberId"];
                var accessToken = metaSettings["AccessToken"];
                var templateName = metaSettings["TemplateName"];

                if (string.IsNullOrEmpty(phoneNumberId) || string.IsNullOrEmpty(accessToken))
                {
                    _logger.LogWarning("Meta WhatsApp configuration is missing.");
                    return false;
                }

                // Meta API expects the phone number without the '+' sign
                var formattedPhone = toPhone.StartsWith("+") ? toPhone.Substring(1) : toPhone;

                var payload = new
                {
                    messaging_product = "whatsapp",
                    to = formattedPhone,
                    type = "text",
                    text = new { body = message }
                };

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                var content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
                
                var response = await httpClient.PostAsync($"https://graph.facebook.com/v19.0/{phoneNumberId}/messages", content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorDetails = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error sending Meta WhatsApp message: {StatusCode} - {Details}", response.StatusCode, errorDetails);
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception sending Meta WhatsApp message to {ToPhone}", toPhone, ex.InnerException);
                return false;
            }
        }
    }
}
