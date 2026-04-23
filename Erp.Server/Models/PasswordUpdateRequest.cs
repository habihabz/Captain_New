namespace Erp.Server.Models
{
    public class PasswordUpdateRequest
    {
        public int userId { get; set; }
        public string newPassword { get; set; }
    }
}
