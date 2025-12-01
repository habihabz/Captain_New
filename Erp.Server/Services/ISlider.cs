using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface ISlider
    {
        DbResult createOrUpdateSlider(Slider slider);
        DbResult deleteSlider(int id);
        Slider getSlider(int id);
        List<Slider> getSliders();
    }
}