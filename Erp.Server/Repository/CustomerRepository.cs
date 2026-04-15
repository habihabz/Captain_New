using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;


namespace Erp.Server.Repository
{
    public class CustomerRepository : ICustomer
    {
        private DBContext db;
        public CustomerRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateCustomer(Customer customer)
        {
            var c_id = new SqlParameter("c_id", customer.c_id + "");
            var c_name = new SqlParameter("c_name", customer.c_name + "");
            var c_phone = new SqlParameter("c_phone", customer.c_phone + "");
            var c_email = new SqlParameter("c_email", customer.c_email + "");
            var c_username = new SqlParameter("c_user_name", customer.c_username + "");
            var c_date_of_birth = new SqlParameter("c_date_of_birth", customer.c_date_of_birth + "");
            var c_agree_terms = new SqlParameter("c_agree_terms", customer.c_agree_terms + "");
            var c_is_get_updates = new SqlParameter("c_is_get_updates", customer.c_is_get_updates + "");
            var c_active_yn = new SqlParameter("c_active_yn", customer.c_active_yn + "");
            var c_cre_by = new SqlParameter("c_cre_by", customer.c_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateCustomer @c_id,@c_name,@c_phone,@c_email," +
                "@c_username,@c_date_of_birth,@c_agree_terms,@c_is_get_updates,@c_active_yn,@c_cre_by;",
                c_id, c_name, c_phone, c_email, c_username, c_date_of_birth, c_agree_terms, c_is_get_updates, c_active_yn, c_cre_by).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult deleteCustomer(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deleteCustomer @id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public Customer getCustomer(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var customer = db.Set<Customer>().FromSqlRaw("EXEC dbo.getCustomer @id;", _id).ToList().FirstOrDefault() ?? new Customer();
            return customer;
        }

        public Customer getCustomerByUsername(string username)
        {
            var _username = new SqlParameter("username", username + "");
            var customer = db.Set<Customer>().FromSqlRaw("EXEC dbo.getCustomerByUsername @username;", _username).ToList().FirstOrDefault() ?? new Customer();
            return customer;
        }

        public DbResult getCustomerLogin(string username, string password)
        {
            var _username = new SqlParameter("username", username + "");
            var _Password = new SqlParameter("password", password + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.getCustomerLogin @username,@password;"
                , _username, _Password).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public IEnumerable<Customer> getCustomers()
        {
            var customers = db.Set<Customer>().FromSqlRaw("EXEC dbo.getCustomers;").ToList();
            return customers;
        }

        public DbResult registerCustomer(Customer customer)
        {
            var c_id = new SqlParameter("c_id", customer.c_id + "");
            var c_name = new SqlParameter("c_name", customer.c_name + "");
            var c_phone = new SqlParameter("c_phone", customer.c_phone + "");
            var c_email = new SqlParameter("c_email", customer.c_email + "");
            var c_username = new SqlParameter("c_username", customer.c_username+"");
            var c_password = new SqlParameter("c_password", customer.c_password + "");
            var c_date_of_birth = new SqlParameter("c_date_of_birth", customer.c_date_of_birth + "");
            var c_agree_terms = new SqlParameter("c_agree_terms", customer.c_agree_terms + "");
            var c_is_get_updates = new SqlParameter("c_is_get_updates", customer.c_is_get_updates + "");
            var c_active_yn = new SqlParameter("c_active_yn", customer.c_active_yn + "");
         

            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.registerCustomer @c_id,@c_name,@c_phone,@c_email," +
                "@c_username,@c_password,@c_date_of_birth,@c_agree_terms,@c_is_get_updates,@c_active_yn;",
                c_id, c_name, c_phone, c_email, c_username, c_password, c_date_of_birth, c_agree_terms, c_is_get_updates, c_active_yn).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult updatePassword(int userId, string newPassword)
        {
            var _userId = new SqlParameter("userId", userId);
            var _newPassword = new SqlParameter("newPassword", newPassword);
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.updateCustomerPassword @userId, @newPassword;", _userId, _newPassword).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }
    }
}
