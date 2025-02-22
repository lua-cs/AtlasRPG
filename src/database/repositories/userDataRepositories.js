const {
	getUserData,
	updateUserData,
	getAllUserData,
	resetUserData,
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

	static async resetUserData() {
		return await resetUserData;
	}
}

module.exports = UserDataRepository;
