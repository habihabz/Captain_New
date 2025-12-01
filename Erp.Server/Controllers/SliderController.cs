using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SliderController : ControllerBase
    {
        private readonly ILogger<Slider> logger;
        private readonly ISlider isliders;

        public SliderController(ILogger<Slider> _logger, ISlider _isliders)
        {
            logger = _logger;
            isliders = _isliders;
        }

        // GET ALL SLIDERS
        [HttpPost("getSliders")]
       
        public List<Slider> getSliders()
        {
            return isliders.getSliders();
        }

        // GET ONE SLIDER
        [HttpPost("getSlider")]
      
        public Slider getSlider([FromBody] int id)
        {
            return isliders.getSlider(id);
        }

        [HttpPost("deleteSlider")]
        [Authorize]
        public DbResult deleteSlider([FromBody] int id)
        {
            return isliders.deleteSlider(id);
        }

        // CREATE OR UPDATE SLIDER (WITH IMAGE UPLOAD)
        [HttpPost("createOrUpdateSlider")]
        [Authorize]
        public async Task<DbResult> createOrUpdateSlider([FromForm] Slider slider, IFormFile? image)
        {
            if (image != null && image.Length > 0)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "sliders");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                slider.s_image_url = $"/uploads/sliders/{fileName}";
            }
            else
            {
     
                if (slider.s_id > 0) 
                {
                    var existing = isliders.getSlider(slider.s_id);
                    slider.s_image_url = existing?.s_image_url;
                }
            }

            return isliders.createOrUpdateSlider(slider);
        }

    }
}
