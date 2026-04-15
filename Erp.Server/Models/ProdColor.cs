using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Erp.Server.Models
{
    public class ProdColor
    {
        [Key]
        [Display(Name = "Color")]
        public int pc_color { get; set; }

        [Display(Name = "Color Name")]
        public string pc_color_name { get; set; } = string.Empty;

     
    }

}
