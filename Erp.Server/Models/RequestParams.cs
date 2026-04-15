namespace Erp.Server.Models
{
    public class RequestParams
    {
        public int id { get; set; }
        public string name { get; set; } =string.Empty;
        public string type { get; set; } = string.Empty;
        public int country { get; set; } = 0;
        public int user { get; set; } = 0;
        public string details { get; set; } = string.Empty;
        public int status { get; set; } = 0;
        public int color { get; set; } = 0;
        public string others { get; set; } = string.Empty;
        public decimal amount { get; set; } = 0;
        public string paymentId { get; set; } = string.Empty;
        public string startDate { get; set; } = string.Empty;
        public string endDate { get; set; } = string.Empty;
        public string completedYn { get; set; } = string.Empty;
        public string refundId { get; set; } = string.Empty;
    }
}
