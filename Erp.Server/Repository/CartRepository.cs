using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;


namespace Erp.Server.Repository
{
    public class CartRepository : ICart
    {
        private DBContext db;
        public CartRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateCart(Cart cart)
        {
            var c_id = new SqlParameter("c_id", cart.c_id + "");
            var c_product = new SqlParameter("c_product", cart.c_product + "");
            var c_size = new SqlParameter("c_size", cart.c_size + "");
            var c_color = new SqlParameter("c_color", cart.c_color + "");
            var c_qty = new SqlParameter("c_qty", cart.c_qty + "");
            var c_cre_by = new SqlParameter("c_cre_by", cart.c_cre_by + "");
          
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateCart @c_id,@c_product,@c_size,@c_color,@c_qty,@c_cre_by;",
                c_id, c_product, c_size, c_color, c_qty, c_cre_by).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult deleteCart(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deleteCart @id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public Cart getCart(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var cart = db.Set<Cart>().FromSqlRaw("EXEC dbo.getCart @id;", _id).ToList().FirstOrDefault() ?? new Cart();
            return cart;
        }

        public List<Cart> getCarts(RequestParams requestParams)
        {
            var country = new SqlParameter("country", requestParams.country + "");
            var user = new SqlParameter("user", requestParams.user + "");
            var carts = db.Set<Cart>().FromSqlRaw("EXEC dbo.getCarts @country,@user;", country, user).ToList();
            return carts;
        }
    }
}
