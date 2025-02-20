const { getDB } = require('../connection');
const recipes = require('../../utils/crafting/recipes');

const getDefaultUserData = (userId) => ({
	userId,
	balance: 0,
	levelData: { level: 1, xp: 0, max_xp: 100, prestige: 0 },
	materials: { oak_wood: 0, birch_wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0 },
	equippedItem: recipes[0],
	lastDaily: null,
	choppingStreak: 0,
	inventory: {},
});

const getCollection = () => getDB().collection('userData');

const ensureDefaults = (userData, userId) => {
	const defaults = getDefaultUserData(userId);
	return { ...defaults, ...userData, levelData: { ...defaults.levelData, ...userData.levelData } };
};

const getUserData = async (userId) => {
	try {
		const collection = getCollection();
		let userData = await collection.findOne({ userId });

		if (!userData) {
			userData = getDefaultUserData(userId);
			await collection.insertOne(userData);
		} else {
			const updatedData = ensureDefaults(userData, userId);
			await collection.updateOne({ userId }, { $set: updatedData });
			userData = updatedData;
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
		let userData = await getUserData(userId); // Ensure the user exists and has defaults
		userData[field] = value;
		const updatedData = ensureDefaults(userData, userId);
		await collection.updateOne({ userId }, { $set: updatedData });
	} catch (error) {
		console.error('Error updating user data:', error);
		throw error;
	}
};

const getAllUserData = async () => {
	try {
		const collection = getCollection();
		const allUsers = await collection.find().toArray();
		return allUsers.map((user) => ensureDefaults(user, user.userId));
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
