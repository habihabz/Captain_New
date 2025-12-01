using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class Cart: ProductForExtend
    { 
    
        [Key]
        [Display(Name = "Id")]
        public int c_id { get; set; }

        [Display(Name = "Product")]
        public int? c_product { get; set; } = 0;

        [Display(Name = "Size")]
        public int? c_size { get; set; } = 0;

        [Display(Name = "Size")]
        public string? c_size_name { get; set; } = "";

        [Display(Name = "color")]
        public int? c_color { get; set; } = 0;

        [Display(Name = "Quantity")]
        public int? c_qty { get; set; } =0;

        [Display(Name = "Price")]
        public decimal? c_price { get; set; } = 0;

        [Display(Name = "Created By")]
        public int? c_cre_by { get; set; }

        [Display(Name = "Created By")]
        public string? c_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime  c_cre_date { get; set; } = DateTime.Now;

    }
}
