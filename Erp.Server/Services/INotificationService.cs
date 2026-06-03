namespace Erp.Server.Services
{
    public interface INotificationService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body);
        Task<bool> SendWhatsAppAsync(string toPhone, string message);
    }
}
