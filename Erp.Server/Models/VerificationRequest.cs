namespace Erp.Server.Models
{
    public class VerificationRequest
    {
        public int UserId { get; set; }
        public string Type { get; set; } = string.Empty; 
        public string Target { get; set; } = string.Empty; 
    }
    
    public class VerifyCodeRequest : VerificationRequest
    {
        public string Code { get; set; } = string.Empty;
    }
}
