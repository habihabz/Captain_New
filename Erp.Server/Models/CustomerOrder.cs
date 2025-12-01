using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.ComponentModel.DataAnnotations;

    public class CustomerOrder
    {
        [Key]
        [Display(Name = "Id")]
        public int co_id { get; set; }

        [Display(Name = "Customer")]
        public int? co_customer { get; set; }

        public string? co_customer_name { get; set; } = string.Empty;

        [Display(Name = "Delivery Address")]
        public int? co_d_address { get; set; } = 0;

        public string? co_d_address_details { get; set; } = string.Empty;

        [Display(Name = "Quantity")]
        public int? co_qty { get; set; } = 0;

        [Display(Name = "Amount")]
        public decimal? co_amount { get; set; } = 0;

        [Display(Name = "Status")]
        public int? co_status { get; set; } = 0;

        public string? co_status_name { get; set; } = string.Empty;

        [Display(Name = "Created By")]
        public int? co_cre_by { get; set; }

        public string? co_cre_by_name { get; set; } = string.Empty;

        [DataType(DataType.Date)]
        public DateTime co_cre_date { get; set; } = DateTime.Now;

        // 🔽 Newly added columns
        public int? co_product { get; set; } = 0;

        public string? co_product_name { get; set; } = string.Empty;

        public int? co_size { get; set; } = 0;
        public string? co_size_name { get; set; } = string.Empty;

        public int? co_color { get; set; } = 0;

        public string? co_color_name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal? co_unit_price { get; set; } = 0;

        public int? co_discount { get; set; } = 0;

        [MaxLength(10)]
        public string? co_promo_code { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_gst_perc { get; set; } = 0;

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_gst_amount { get; set; } = 0;

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_delivery_charge { get; set; } = 0;

        [Column(TypeName = "decimal(10,3)")]
        public decimal? cd_net_amount { get; set; } = 0;
    }


}
