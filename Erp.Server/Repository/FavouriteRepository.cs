using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class FavouriteRepository : IFavourite
    {
        private DBContext db;

        public FavouriteRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateFavourite(Favourite favourite)
        {
            var f_id = new SqlParameter("f_id", favourite.f_id + "");
            var f_product = new SqlParameter("f_product", favourite.f_product + "");
            var f_cre_by = new SqlParameter("f_cre_by", favourite.f_cre_by + "");

            var dbresult = db.Set<DbResult>()
                .FromSqlRaw("EXEC dbo.createOrUpdateFavourite @f_id,@f_product,@f_cre_by;",
                    f_id, f_product, f_cre_by)
                .ToList()
                .FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public DbResult deleteFavourite(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var dbresult = db.Set<DbResult>()
                .FromSqlRaw("EXEC dbo.deleteFavourite @id;", _id)
                .ToList()
                .FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public Favourite getFavourite(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var fav = db.Set<Favourite>()
                .FromSqlRaw("EXEC dbo.getFavourite @id;", _id)
                .ToList()
                .FirstOrDefault() ?? new Favourite();

            return fav;
        }

        public List<Favourite> getFavourites(RequestParams requestParams)
        {
            var country = new SqlParameter("country", requestParams.country + "");
            var user = new SqlParameter("user", requestParams.user + "");

            var favs = db.Set<Favourite>()
                .FromSqlRaw("EXEC dbo.getFavourites @country,@user;", country, user)
                .ToList();

            return favs;
        }
    }
}