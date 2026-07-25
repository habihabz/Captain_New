using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;


namespace Erp.Server.Repository
{
    public class AddressRepository : IAddress
    {
        private DBContext db;
        public AddressRepository(DBContext _db)
        {
            db = _db;
        }

        public DbResult createOrUpdateAddress(Address address)
        {
            var ad_id = new SqlParameter("ad_id", address.ad_id + "");
            var ad_name = new SqlParameter("ad_name", address.ad_name + "");
            var ad_address = new SqlParameter("ad_address", address.ad_address + "");
            var ad_pincode = new SqlParameter("ad_pincode", address.ad_pincode + "");
            var ad_phone = new SqlParameter("ad_phone", address.ad_phone + "");
            var ad_is_default_yn = new SqlParameter("ad_is_default_yn", address.ad_is_default_yn + "");
            var ad_cre_by = new SqlParameter("ad_cre_by", address.ad_cre_by + "");
          
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateAddress @ad_id,@ad_name,@ad_address,@ad_pincode,@ad_phone,@ad_is_default_yn,@ad_cre_by;",
                ad_id, ad_name, ad_address, ad_pincode, ad_phone, ad_is_default_yn, ad_cre_by).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public DbResult deleteAddress(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deleteAddress @id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public Address getAddress(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var address = db.Set<Address>().FromSqlRaw("EXEC dbo.getAddress @id;", _id).ToList().FirstOrDefault() ?? new Address();
            return address;
        }

        public List<Address> getAddresses(RequestParams requestParams)
        {
            var user = new SqlParameter("user", requestParams.user + "");
            var addresss = db.Set<Address>().FromSqlRaw("EXEC dbo.getAddresses @user;", user).ToList();
            return addresss;
        }

        public List<Address> getMyAddresses(RequestParams requestParams)
        {
            var user = new SqlParameter("user", requestParams.user + "");
            var addresss = db.Set<Address>().FromSqlRaw("EXEC dbo.getMyAddresses @user;", user).ToList();
            return addresss;
        }
    }
}
