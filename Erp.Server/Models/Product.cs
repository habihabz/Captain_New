using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class Product
    {
        [Key]
        [Display(Name = "Id")]
        public int p_id { get; set; }

        [Display(Name = "Full Name")]
        public string? p_name { get; set; } = string.Empty;

        [Display(Name = "Short Name")]
        public string? p_short_name { get; set; } = string.Empty;

        [Display(Name = "Description")]
        public string? p_description { get; set; } = string.Empty;

        [Display(Name = "Category")]
        public int p_category { get; set; }

        [Display(Name = "Category Name")]
        public string? p_category_name { get; set; } = string.Empty;

        [Display(Name = "Sub Category")]
        public int p_sub_category { get; set; }

        [Display(Name = "Sub Category Name")]
        public string? p_sub_category_name { get; set; } = string.Empty;

        [Display(Name = "Division")]
        public int p_division { get; set; }

        [Display(Name = "Division Name")]
        public string? p_division_name { get; set; } = string.Empty;

        [Display(Name = "Sub Division")]
        public int p_sub_division { get; set; }

        [Display(Name = "Sub Division Name")]
        public string? p_sub_division_name { get; set; } = string.Empty;

        [Display(Name = "Overall Rating")]
        public decimal? p_overall_rating { get; set; } =0;

        [Display(Name = "Active")]
        public string? p_active_yn { get; set; } = "Y";
        
        [Display(Name = "Price")]
        public decimal? p_price { get; set; }

        [Display(Name = "Created By")]
        public int? p_cre_by { get; set; }

        [Display(Name = "Created By Name")]
        public string? p_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime? p_cre_date { get; set; } = DateTime.Now;

        [NotMapped]
        [Display(Name = "Barcodes")]
        public string p_barcodes { get; set; } = string.Empty;

       
        [Display(Name = "Sizes")]
        public string p_sizes { get; set; } = string.Empty;

 
        [Display(Name = "Colors")]
        public string p_colors { get; set; } = string.Empty;

        
        [Display(Name = "Attachments")]
        public string p_attachements { get; set; } = string.Empty;

        [Display(Name = "Packaging Type")]
        public int? p_packaging_type { get; set; }

        [Display(Name = "Packaging Type Name")]
        public string? p_packaging_type_name { get; set; } = string.Empty;
    }
}
