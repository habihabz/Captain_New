using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;


namespace Erp.Server.Repository
{
    public class UserRepository : IUser
    {
        private DBContext db;
        public UserRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateUser(User user)
        {
            var u_id = new SqlParameter("u_id", user.u_id + "");
            var u_name = new SqlParameter("u_name", user.u_name + "");
            var u_username = new SqlParameter("u_username", user.u_username + "");
            var u_password = new SqlParameter("u_password", user.u_password + "");
            var u_email = new SqlParameter("u_email", user.u_email + "");
            var u_is_admin = new SqlParameter("u_is_admin", user.u_is_admin + "");
            var u_active_yn = new SqlParameter("u_active_yn", user.u_active_yn + "");
            var u_role_id = new SqlParameter("u_role_id", user.u_role_id + "");
            var u_cre_by = new SqlParameter("u_cre_by", user.u_cre_by + "");
          
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateUser @u_id,@u_name,@u_username,@u_password,@u_email,@u_role_id,@u_is_admin,@u_active_yn,@u_cre_by;",
                u_id,u_name, u_username, u_password, u_email, u_role_id, u_is_admin, u_active_yn, u_cre_by).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult deleteUser(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deleteUser @id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public User getUser(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var user = db.Set<User>().FromSqlRaw("EXEC dbo.getUser @id;", _id).ToList().FirstOrDefault() ?? new User();
            return user;
        }

        public User getUserByUsername(string username)
        {
            var _username = new SqlParameter("username", username + "");
            var user = db.Set<User>().FromSqlRaw("EXEC dbo.getUserByUsername @username;", _username).ToList().FirstOrDefault() ?? new User();
            return user;
        }

        public List<User> getUsers()
        {
            var users = db.Set<User>().FromSqlRaw("EXEC dbo.getUsers;").ToList();
            return users;
        }

        public DbResult registerUser(User user)
        {
            var u_id = new SqlParameter("u_id", user.u_id + "");
            var u_name = new SqlParameter("u_name", user.u_name + "");
            var u_username = new SqlParameter("u_username", user.u_username + "");
            var u_password = new SqlParameter("u_password", user.u_password + "");
            var u_phone = new SqlParameter("u_phone", user.u_phone + "");
            var u_email = new SqlParameter("u_email", user.u_email + "");
            var u_date_of_birth = new SqlParameter("u_date_of_birth", user.u_date_of_birth + "");
            var u_agree_terms = new SqlParameter("u_agree_terms", user.u_agree_terms + "");
            var u_is_get_updates = new SqlParameter("u_is_get_updates", user.u_is_get_updates + "");
            var u_is_admin = new SqlParameter("u_is_admin", user.u_is_admin + "");
            var u_active_yn = new SqlParameter("u_active_yn", user.u_active_yn + "");
            var u_role_id = new SqlParameter("u_role_id", user.u_role_id + "");
            var u_cre_by = new SqlParameter("u_cre_by", user.u_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw
                ("EXEC dbo.registerUser @u_id,@u_name,@u_username,@u_password,@u_phone,@u_email,@u_date_of_birth,@u_agree_terms,@u_is_get_updates,@u_role_id,@u_is_admin,@u_active_yn,@u_cre_by;",
                u_id, u_name, u_username, u_password, u_phone, u_email, u_date_of_birth, u_agree_terms, u_is_get_updates, u_role_id, u_is_admin, u_active_yn, u_cre_by).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult updatePassword(int userId, string newPassword)
        {
            var _userId = new SqlParameter("userId", userId);
            var _newPassword = new SqlParameter("newPassword", newPassword);
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.updateUserPassword @userId, @newPassword;", _userId, _newPassword).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult updateProfileImage(int userId, string imageUrl)
        {
            try
            {
                var _id = new SqlParameter("id", userId);
                var _image = new SqlParameter("image", imageUrl);
                var rows = db.Database.ExecuteSqlRaw("UPDATE dbo.Users SET u_image_url = @image WHERE u_id = @id", _image, _id);
                return new DbResult { id = rows, message = rows > 0 ? "Success" : "User not found" };
            }
            catch (Exception ex)
            {
                return new DbResult { id = 0, message = ex.Message };
            }
        }
    }
}
