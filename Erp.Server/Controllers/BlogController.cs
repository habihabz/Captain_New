using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly ILogger<Blog> logger;
        private readonly IBlog iblogs;

        public BlogController(ILogger<Blog> _logger, IBlog _iblogs)
        {
            logger = _logger;
            iblogs = _iblogs;
        }

        [HttpPost("getBlogs")]
        public List<Blog> getBlogs()
        {
            return iblogs.getBlogs();
        }

        [HttpPost("getBlog")]
        public Blog getBlog([FromBody] int id)
        {
            return iblogs.getBlog(id);
        }

        [HttpPost("deleteBlog")]
        [Authorize]
        public DbResult deleteBlog([FromBody] int id)
        {
            return iblogs.deleteBlog(id);
        }

        [HttpPost("createOrUpdateBlog")]
        [Authorize]
        public async Task<DbResult> createOrUpdateBlog([FromForm] Blog blog, IFormFile? image)
        {
            if (image != null && image.Length > 0)
            {
                var folderPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "blogs"
                );

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                blog.b_image_url = $"/uploads/blogs/{fileName}";
            }
            else
            {
                if (blog.b_id > 0)
                {
                    var existing = iblogs.getBlog(blog.b_id);
                    blog.b_image_url = existing?.b_image_url;
                }
            }

            return iblogs.createOrUpdateBlog(blog);
        }
    }
}
