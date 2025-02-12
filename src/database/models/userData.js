const { getDB } = require('../connection');

/**
 * Get default user data.
 * @param {string} userId - The user ID.
 * @returns {Object} The default user data.
 */
const getDefaultUserData = (userId) => ({
	userId,
	balance: 0,
	materials: { oak_wood: 0, birch_wood: 0, stone: 0, iron: 0 },
	equippedItem: {
		name: 'Wooden Axe',
		category: 'axe',
		durability: 25,
		choppingSpeed: 10,
		materials: [
			{
				name: 'oak_wood',
				amount: 25,
				display: 'Oak Wood',
			},
		],
	},
	inventory: {},
});

/**
 * Get the user data collection.
 * @returns {Object} The user data collection.
 */
const getCollection = () => {
	const db = getDB();
	return db.collection('userData');
};

/**
 * Get user data by user ID.
 * @param {string} userId - The user ID.
 * @returns {Object} The user data.
 */
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

/**
 * Update user data by user ID.
 * @param {string} userId - The user ID.
 * @param {string} field - The field to update.
 * @param {any} value - The value to set.
 */
const updateUserData = async (userId, field, value) => {
	try {
		const collection = getCollection();
		await collection.updateOne({ userId }, { $set: { [field]: value } });
	} catch (error) {
		console.error('Error updating user data:', error);
		throw error;
	}
};

/**
 * Get all user data.
 * @returns {Array} The list of all user data.
 */
const getAllUserData = async () => {
	try {
		const collection = getCollection();
		return await collection.find().toArray();
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
