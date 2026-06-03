using Erp.Server.Models;
using System.Collections.Generic;

namespace Erp.Server.Services
{
    public interface IUser
    {
        DbResult createOrUpdateUser(User user);
        DbResult deleteUser(int id);
        User getUser(int id);
        User getUserByUsername(string username);
        User getUserByEmail(string email);
        List<User> getUsers();
        DbResult registerUser(User user);
        DbResult updatePassword(int userId, string newPassword);
        DbResult updateProfileImage(int userId, string imageUrl);
        DbResult updateUserVerification(int userId, string type);
        DbResult updateProfileDetails(User user);
    }
}
