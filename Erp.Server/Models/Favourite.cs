using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class Favourite : ProductForExtend
    {
        [Key]
        [Display(Name = "Id")]
        public int f_id { get; set; }

        [Display(Name = "Product")]
        public int? f_product { get; set; } = 0;

        [Display(Name = "Created By")]
        public int? f_cre_by { get; set; }

        [Display(Name = "Created By")]
        public string? f_cre_by_name { get; set; } = string.Empty;

        [Display(Name = "Created On")]
        [DataType(DataType.Date)]
        public DateTime f_cre_date { get; set; } = DateTime.Now;
    }
}