namespace Erp.Server.Models
{
    public class ProductSearchParms
    {
        public int id { get; set; }
        public string categories { get; set; } = string.Empty;
        public string subcategories { get; set; } = string.Empty;
        public string divisions { get; set; } = string.Empty;
        public string subdivisions { get; set; } = string.Empty;
        public string sizes { get; set; } = string.Empty;
        public string orderBy { get; set; } = string.Empty;
        public int country { get; set; } = 0;

    }
}
