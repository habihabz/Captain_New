using Erp.Server.Models;

namespace Erp.Server.Services
{
    public interface IUser
    {
        DbResult createOrUpdateUser(User user);
        DbResult deleteUser(int id);
        User getUser(int id);
        User getUserByUsername(string username);
        List<User> getUsers();
        DbResult registerUser(User user);
        DbResult updatePassword(int userId, string newPassword);
    }
}
