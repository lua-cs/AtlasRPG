const {
    getUserData,
    updateUserData,
    getAllUserData,
} = require('../models/userData');

class UserDataRepository {
    static async getUserData(userId) {
        return await getUserData(userId);
    }

    static async updateUserData(userId, field, value) {
        return await updateUserData(userId, field, value);
    }

    static async getAllUserData() {
        return await getAllUserData();
    }
}

module.exports = UserDataRepository;
