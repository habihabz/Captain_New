using Erp.Server.Models;
using Erp.Server.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Erp.Server.Repository
{
    public class SliderRepository : ISlider
    {
        private readonly DBContext db;

        public SliderRepository(DBContext _db)
        {
            db = _db;
        }

        // CREATE OR UPDATE SLIDER
        public DbResult createOrUpdateSlider(Slider slider)
        {
            var s_id = new SqlParameter("s_id", slider.s_id + "");
            var s_title = new SqlParameter("s_title", slider.s_title + "");
            var s_image_url = new SqlParameter("s_image_url", slider.s_image_url + "");
            var s_active_yn = new SqlParameter("s_active_yn", slider.s_active_yn + "");
            var s_cre_by = new SqlParameter("s_cre_by", slider.s_cre_by + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.createOrUpdateSlider @s_id, @s_title, @s_image_url, @s_active_yn, @s_cre_by;",
                s_id, s_title, s_image_url, s_active_yn, s_cre_by
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        // DELETE SLIDER
        public DbResult deleteSlider(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var dbresult = db.Set<DbResult>().FromSqlRaw(
                "EXEC dbo.deleteSlider @id;",
                _id
            ).ToList().FirstOrDefault() ?? new DbResult();

            return dbresult;
        }

        // GET ONE SLIDER
        public Slider getSlider(int id)
        {
            var _id = new SqlParameter("id", id + "");

            var slider = db.Set<Slider>().FromSqlRaw(
                "EXEC dbo.getSlider @id;",
                _id
            ).ToList().FirstOrDefault() ?? new Slider();

            return slider;
        }

        // GET ALL SLIDERS
        public List<Slider> getSliders()
        {
            var sliders = db.Set<Slider>().FromSqlRaw("EXEC dbo.getSliders;").ToList();
            return sliders;
        }
    }
}
