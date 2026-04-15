using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;


namespace Erp.Server.Repository
{
    public class ProductRepository : IProduct
    {
        private DBContext db;

        public ProductRepository(DBContext _db)
        {
            db = _db;
        }
        public Product getProduct(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var product = db.Set<Product>().FromSqlRaw("EXEC dbo.getProduct @id;", _id).ToList().FirstOrDefault() ?? new Product();
            return product;
        }

        public List<Product> getProducts()
        {
            var products = db.Set<Product>().FromSqlRaw("EXEC dbo.getProducts;").ToList();
            return products;
        }
        public DbResult createOrUpdateProduct(Product product)
        {
            // Set parameters for stored procedure
            var p_id = new SqlParameter("p_id", product.p_id);
            var p_name = new SqlParameter("p_name", product.p_name ?? (object)DBNull.Value);
            var p_short_name = new SqlParameter("p_short_name", product.p_short_name ?? (object)DBNull.Value);
            var p_description = new SqlParameter("p_description", product.p_description ?? (object)DBNull.Value);
            var p_category = new SqlParameter("p_category", product.p_category);
            var p_sub_category = new SqlParameter("p_sub_category", product.p_sub_category);
            var p_division = new SqlParameter("p_division", product.p_division);
            var p_sub_division = new SqlParameter("p_sub_division", product.p_sub_division);
            var p_active_yn = new SqlParameter("p_active_yn", product.p_active_yn ?? (object)DBNull.Value);
            var p_cre_by = new SqlParameter("p_cre_by", product.p_cre_by ?? (object)DBNull.Value);
            var p_barcodes = new SqlParameter("p_barcodes", product.p_barcodes ?? (object)DBNull.Value);
            var p_sizes = new SqlParameter("p_sizes", product.p_sizes ?? (object)DBNull.Value);
   

            // Call stored procedure with additional parameters
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.createOrUpdateProduct @p_id, @p_name, @p_short_name, @p_description, @p_category, " +
                "@p_sub_category, @p_division, @p_sub_division, @p_active_yn, @p_cre_by, @p_barcodes, @p_sizes;",
                p_id, p_name, p_short_name, p_description, p_category, p_sub_category, p_division, p_sub_division, p_active_yn, p_cre_by,
                p_barcodes, p_sizes)
                .ToList()
                .FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        public DbResult deleteProduct(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deleteProduct @id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public List<Barcode> getBarcodesOfaProduct(int p_id)
        {
            var _p_id = new SqlParameter("p_id", p_id + "");
            var barcodes = db.Set<Barcode>().FromSqlRaw("EXEC dbo.getBarcodesOfaProduct @p_id;", _p_id).ToList();
            return barcodes;
        }

        public List<ProdColor> getColorsOfaProduct(int p_id)
        {
            var _p_id = new SqlParameter("p_id", p_id + "");
            var prodColors = db.Set<ProdColor>().FromSqlRaw("EXEC dbo.getColorsOfaProduct @p_id;", _p_id).ToList();
            return prodColors;
        }

        public List<ProdAttachment> getProdAttachmentsOfaProduct(int p_id)
        {
            var _p_id = new SqlParameter("p_id", p_id + "");
            var prodAttachments = db.Set<ProdAttachment>().FromSqlRaw("EXEC dbo.getProdAttachmentsOfaProduct @p_id;", _p_id).ToList();
            return prodAttachments;
        }

        public List<ProdSize> getSizesOfaProduct(int p_id)
        {
            var _p_id = new SqlParameter("p_id", p_id + "");
            var prodSizes = db.Set<ProdSize>().FromSqlRaw("EXEC dbo.getSizesOfaProduct @p_id;", _p_id).ToList();
            return prodSizes;
        }

        public List<Product> getProductsByCountry(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var products = db.Set<Product>().FromSqlRaw("EXEC dbo.getProductsByCountry @id", _id).ToList();
            return products;
        }

        public Product getProductByCountry(RequestParams requestParams)
        {
            var _id = new SqlParameter("id", requestParams.id + "");
            var _country = new SqlParameter("country", requestParams.country + "");
            var product = db.Set<Product>().FromSqlRaw("EXEC dbo.getProductByCountry @id,@country;", _id, _country).ToList().FirstOrDefault() ?? new Product();
            return product;
        }

        public List<Product> getProductsByFilters(ProductSearchParms productSearchParms)
        {
            var _id = new SqlParameter("id", productSearchParms.id + "");
            var _categories = new SqlParameter("categories", productSearchParms.categories + "");
            var _subcategories = new SqlParameter("subcategories", productSearchParms.subcategories + "");
            var _divisions = new SqlParameter("divisions", productSearchParms.divisions + "");
            var _subdivisions = new SqlParameter("subdivisions", productSearchParms.subdivisions + "");
            var _sizes = new SqlParameter("sizes", productSearchParms.sizes + "");
            var _orderBy = new SqlParameter("orderBy", productSearchParms.orderBy + "");
            var _country = new SqlParameter("country", productSearchParms.country + "");
            var products = db.Set<Product>().FromSqlRaw("EXEC dbo.getProductsByFilters @id,@categories,@subcategories,@divisions,@subdivisions,@sizes,@orderBy,@country;",
                _id, _categories, _subcategories, _divisions, _subdivisions, _sizes, _orderBy,_country).ToList();

            return products;
        }

        public List<ProdAttachment> getProductAttachementsByColor(RequestParams requestParams)
        {
            var _id = new SqlParameter("id", requestParams.id + "");
            var _color = new SqlParameter("color", requestParams.color + "");
       
            var prodAttachments = db.Set<ProdAttachment>().FromSqlRaw("EXEC dbo.getProductAttachementsByColor @id,@color",
                _id, _color).ToList();

            return prodAttachments;
        }

        public DbResult uploadProdAttachements(List<ProdAttachment> prodAttachments)
        {
            var attachmentsJson = JsonConvert.SerializeObject(
                prodAttachments.Select(a => new
                {
                    pa_prod_id = a.pa_prod_id,
                    pa_color = a.pa_color,
                    pa_image_path = a.pa_image_path,
                    pa_cre_by = a.pa_cre_by
                })
            );

            var _prodAttachments = new SqlParameter("@p_attachements", attachmentsJson);

            var dbResult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.uploadProdAttachements @p_attachements",
                _prodAttachments
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbResult;
        }

        public DbResult deleteProductAttachement(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<DbResult>().FromSqlRaw("EXEC dbo.deleteProductAttachement @id;", _id).ToList().FirstOrDefault() ?? new DbResult();
            return dbresult;
        }

        public ProdAttachment getProductAttachment(int id)
        {
            var _id = new SqlParameter("id", id + "");
            var dbresult = db.Set<ProdAttachment>().FromSqlRaw("EXEC dbo.getProductAttachment @id;", _id).ToList().FirstOrDefault() ?? new ProdAttachment();
            return dbresult;
        }
    }

}
