using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IBlog
    {
        DbResult createOrUpdateBlog(Blog blog);
        DbResult deleteBlog(int id);
        Blog getBlog(int id);
        List<Blog> getBlogs();
    }
}