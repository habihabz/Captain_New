using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;

namespace Erp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ILogger<ProductController> logger;
        private readonly IUser iuser;
        private readonly IProduct iproduct;

        public ProductController(ILogger<ProductController> _logger,IUser _iuser,IProduct _iproduct)
        {
            logger = _logger;
            iuser = _iuser;
            iproduct = _iproduct;

        }
        [HttpPost("getProducts")]
        public List<Product> getProducts()
        {
            List<Product> products =new List<Product>();
            products = iproduct.getProducts();
            return products;
        } 
        [HttpPost("getProductsByFilters")]
        public List<Product> getProductsByFilters([FromBody] ProductSearchParms productSearchParms)
        {
            List<Product> products =new List<Product>();
            products = iproduct.getProductsByFilters(productSearchParms);
            return products;
        }
        [HttpPost("getProductsByCountry")]
        public List<Product> getProductsByCountry([FromBody] int id)
        {
            List<Product> products =new List<Product>();
            products = iproduct.getProductsByCountry(id);
            return products;
        }
        [HttpPost("deleteProduct")]
        [Authorize]
        public DbResult deleteProduct([FromBody] int id)
        {
            DbResult dbResult=new DbResult();
            dbResult = iproduct.deleteProduct(id);
            return dbResult;
        }

        [HttpPost("getProduct")]
        [Authorize]
        public Product getProduct([FromBody] int id)
        {
            Product product = new Product();
            product = iproduct.getProduct(id);
            product.p_barcodes = JsonConvert.SerializeObject(iproduct.getBarcodesOfaProduct(product.p_id));
            product.p_sizes = JsonConvert.SerializeObject(iproduct.getSizesOfaProduct(product.p_id));
            product.p_colors = JsonConvert.SerializeObject(iproduct.getColorsOfaProduct(product.p_id));
            product.p_attachements = JsonConvert.SerializeObject(iproduct.getProdAttachmentsOfaProduct(product.p_id));
            return product;
        }

        [HttpPost("getProductByCountry")]
       // [Authorize]
        public Product getProductByCountry([FromBody] RequestParams requestParams)
        {
            Product product = new Product();
            product = iproduct.getProductByCountry(requestParams);
            product.p_barcodes = JsonConvert.SerializeObject(iproduct.getBarcodesOfaProduct(product.p_id));
            product.p_sizes = JsonConvert.SerializeObject(iproduct.getSizesOfaProduct(product.p_id));
            product.p_colors = JsonConvert.SerializeObject(iproduct.getColorsOfaProduct(product.p_id));
            product.p_attachements = JsonConvert.SerializeObject(iproduct.getProdAttachmentsOfaProduct(product.p_id));
            return product;
        }

        [HttpPost("getProductAttachementsByColor")]
        // [Authorize]
        public List<ProdAttachment> getProductAttachementsByColor([FromBody] RequestParams requestParams)
        {
            
           List<ProdAttachment>  prodAttachments =iproduct.getProductAttachementsByColor(requestParams);
            return prodAttachments;
        }

        [HttpPost("createOrUpdateProduct")]
        [Authorize]
        public async Task<DbResult> createOrUpdateProduct([FromForm] IFormCollection form)
        {
            DbResult dbResult = new DbResult();
            var productJson = form["product"].ToString();

            var product = JsonConvert.DeserializeObject<Product>(productJson) ?? new Product();

            List<ProdAttachment> prodAttachments = new List<ProdAttachment>(); 

            var files = form.Files;
            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    ProdAttachment prodAttachment = new ProdAttachment();
  
                    var extension = Path.GetExtension(file.FileName);

            
                    var uniqueFileName = Guid.NewGuid().ToString() + extension;

             
                    var filePath = Path.Combine("wwwroot/uploads/product", uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    prodAttachment.pa_image_path = $"uploads/product/{uniqueFileName}";
                    prodAttachments.Add(prodAttachment);
                }
            }
            product.p_attachements = JsonConvert.SerializeObject(prodAttachments.Select(a => new { pa_image_path = a.pa_image_path, pa_color = a.pa_color }));

            dbResult = iproduct.createOrUpdateProduct(product);
            return dbResult;
        }
        [HttpPost("uploadProdAttachements")]
        [Authorize]
        public async Task<DbResult> uploadProdAttachements([FromForm] IFormCollection form)
        {
            DbResult dbResult = new DbResult();

            int.TryParse(form["product"], out int product);
            int.TryParse(form["color"], out int color);
            int.TryParse(form["user"], out int user);
            List<ProdAttachment> prodAttachments = new List<ProdAttachment>();

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/product");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            foreach (var file in form.Files)
            {
                if (file.Length > 0)
                {
                    var extension = Path.GetExtension(file.FileName);
                    var uniqueFileName = Guid.NewGuid().ToString() + extension;

                    var filePath = Path.Combine(uploadPath, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    prodAttachments.Add(new ProdAttachment
                    {
                        pa_image_path = $"uploads/product/{uniqueFileName}",
                        pa_color = color,
                        pa_prod_id= product,
                        pa_cre_by= user
                    });
                }
            }

            // ✅ call new method instead of create/update product
            dbResult = iproduct.uploadProdAttachements( prodAttachments);

            return dbResult;
        }

        [HttpPost("deleteProductAttachement")]
        [Authorize]
        public DbResult deleteProductAttachement([FromBody] int id)
        {
            DbResult dbResult = new DbResult();

            // 1. Get attachment details (before delete)
            var attachment = iproduct.getProductAttachment(id); // create this method

            if (attachment != null && !string.IsNullOrEmpty(attachment.pa_image_path))
            {
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", attachment.pa_image_path);

                // 2. Delete physical file
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }

            // 3. Delete from DB
            dbResult = iproduct.deleteProductAttachement(id);

            return dbResult;
        }
    }
}
