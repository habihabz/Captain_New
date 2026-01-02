using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class BlogRepository : IBlog
    {
        private readonly DBContext db;

        public BlogRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateBlog(Blog blog)
        {
            var b_id = new SqlParameter("b_id", blog.b_id + "");
            var b_title = new SqlParameter("b_title", blog.b_title + "");
            var b_description = new SqlParameter("b_description", blog.b_description + "");
            var b_content = new SqlParameter("b_content", blog.b_content + "");
            var b_image_url = new SqlParameter("b_image_url", blog.b_image_url + "");
            var b_active_yn = new SqlParameter("b_active_yn", blog.b_active_yn + "");       
            var b_cre_by = new SqlParameter("b_cre_by", blog.b_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.createOrUpdateBlog @b_id, @b_title, @b_description, @b_content, @b_image_url, @b_active_yn, @b_cre_by;",
                b_id, b_title, b_description, b_content, b_image_url, b_active_yn, b_cre_by
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public DbResult deleteBlog(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.deleteBlog @id;",
                _id
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public Blog getBlog(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var blog = db.Set<Blog>().FromSqlRaw(
                "EXEC dbo.getBlog @id;",
                _id
            ).ToList().FirstOrDefault() ?? new Blog();

            return blog;
        }

        public List<Blog> getBlogs()
        {
            var blogs = db.Set<Blog>().FromSqlRaw(
                "EXEC dbo.getBlogs;"
            ).ToList();

            return blogs;
        }
    }
}
