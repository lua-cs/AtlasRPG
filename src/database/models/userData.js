const { getDB } = require('../connection');
const recipes = require('../../utils/crafting/recipes');

const getDefaultUserData = (userId) => ({
	userId,
	balance: 0,
	materials: { oak_wood: 0, birch_wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0 },
	equippedItem: recipes[0],
	lastDaily: null,
	inventory: {},
});

const getCollection = () => getDB().collection('userData');

const getUserData = async (userId) => {
	try {
		const collection = getCollection();
		let userData = await collection.findOne({ userId });

		if (!userData) {
			userData = getDefaultUserData(userId);
			await collection.insertOne(userData);
		}

		return userData;
	} catch (error) {
		console.error('Error getting user data:', error);
		throw error;
	}
};

const updateUserData = async (userId, field, value) => {
	try {
		const collection = getCollection();
		await collection.updateOne({ userId }, { $set: { [field]: value } });
	} catch (error) {
		console.error('Error updating user data:', error);
		throw error;
	}
};

const getAllUserData = async () => {
	try {
		return await getCollection().find().toArray();
	} catch (error) {
		console.error('Error getting all user data:', error);
		throw error;
	}
};

module.exports = {
	getUserData,
	updateUserData,
	getAllUserData,
	getDefaultUserData,
};
