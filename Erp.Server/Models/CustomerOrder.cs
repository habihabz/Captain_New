using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Erp.Server.Models
{
    public class CustomerOrder : ProductForExtend
    {
        [Key]
        public int co_id { get; set; }

        public int? co_customer { get; set; }
        public string? co_customer_name { get; set; } = string.Empty;
        public string? co_customer_phone { get; set; } = string.Empty;
        public string? co_customer_email { get; set; } = string.Empty;
        public int? co_c_address { get; set; }
        public string? co_c_address_details { get; set; } = string.Empty;

        public int? co_status { get; set; }
        public string? co_status_name { get; set; } = string.Empty;

        public int? co_qty { get; set; }

        public int? co_product { get; set; }
        public string? co_product_name { get; set; } = string.Empty;

        public int? co_size { get; set; }
        public string? co_size_name { get; set; } = string.Empty;

        public int? co_color { get; set; }
        public string? co_color_name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal? co_unit_price { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? co_discount_perc { get; set; }

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_discount_amount { get; set; }

        [MaxLength(15)]
        public string? co_promo_code { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_amount { get; set; }

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_gst_perc { get; set; }

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_gst_amount { get; set; }

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_delivery_charge { get; set; }

        [Column(TypeName = "decimal(10,3)")]
        public decimal? co_net_amount { get; set; }
        public string? co_is_canceled { get; set; } = string.Empty;
        public string? co_completed_yn { get; set; } = string.Empty;

        public int? co_cre_by { get; set; }
        public string? co_cre_by_name { get; set; } = string.Empty;

        public string? co_payment_id { get; set; } = string.Empty;
        public string? co_refund_id { get; set; } = string.Empty;
        public DateTime co_cre_date { get; set; } = DateTime.Now;
    }
}