const { getDB } = require('../connection');
const recipes = require('../../utils/crafting/recipes');

const getDefaultUserData = (userId) => ({
	// Unique identifier for the user
	userId,

	title: 'None', // Title of the user (e.g., Beginner, Novice, etc.)

	health: 100, // Current health of the user
	maxHealth: 100, // Max health the user can have
	attack: 5, // Attack power of the user
	defense: 0, // Defense power of the user

	// Currency data, used for buying items, upgrades, etc.
	currency: {
		gold: 0, // Regular currency
		bank: 0, // Banked gold or savings, separate from cash on hand
		gems: 0, // Premium or special currency
	},

	// Guild that the user is a part of, if any (can be null if not in a guild)
	guild: null,

	// User's level data, including experience points and skills.
	levelData: {
		ascension: 0, // Number of times the user has ascended
		level: 1, // Current level of the user
		xp: 0, // Current XP of the user
		maxXp: 100, // XP required to level up
		skills: {
			// Foraging skill details
			foraging: {
				level: 1, // Current level of foraging skill
				xp: 0, // XP in the foraging skill
				maxXp: 100, // Max XP to level up for foraging
			},
			// Mining skill details
			mining: {
				level: 1, // Current level of mining skill
				xp: 0, // XP in the mining skill
				maxXp: 100, // Max XP to level up for mining
			},
		},
	},

	// Materials the user collects, categorized by skill (foraging, mining, etc.)
	materials: {
		foraging: {
			oak_wood: 0, // Amount of oak wood collected
			birch_wood: 0, // Amount of birch wood collected
			willow_wood: 0, // Amount of willow wood collected
			maple_wood: 0, // Amount of maple wood collected
			yew_wood: 0, // Amount of yew wood collected
			magic_wood: 0, // Amount of magical wood collected
		},
		mining: {
			stone: 0, // Amount of stone mined
			iron: 0, // Amount of iron mined
			gold: 0, // Amount of gold mined
			diamond: 0, // Amount of diamonds mined
		},
	},

	equippedSword: recipes.sword[0], // The user's currently equipped sword
	equippedAxe: recipes.axe[0], // The user's currently equipped axe
	equippedPickaxe: recipes.pickaxe[0], // The user's currently equipped pickaxe
	equippedArmor: null, // The user's currently equipped armor

	// The last date the user claimed their daily reward
	lastDaily: null,

	// Inventory of items the user owns
	equipment: {}, // Gear that the user can equip (e.g., armor, weapons)
	items: {}, // Other items, consumables, or miscellaneous inventory

	// Collectibles the user has obtained, categorized by type
	collectables: {
		artifacts: {}, // Items used for specific actions like fighting a boss or unlocking quests
		relics: {}, // Items that grant passive stats or abilities
	},

	// Achievements the user has unlocked (e.g., completing challenges or milestones)
	achievements: [],

	// Codes the user has already redeemed
	redeemedCodes: [],
});

const getCollection = () => getDB().collection('userData');

/**
 * Ensures user data is complete with defaults.
 * @param {Object} userData - The user data to be checked.
 * @param {string} userId - The user's unique ID.
 * @returns {Object} - The combined user data with defaults applied.
 */
const ensureDefaults = (userData, userId) => ({
	...getDefaultUserData(userId),
	...userData,
	levelData: {
		...getDefaultUserData(userId).levelData,
		...userData.levelData,
	},
});

/**
 * Fetches user data from the database or creates it if not found.
 * @param {string} userId - The user's unique ID.
 * @returns {Object} - The user's data.
 */
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

/**
 * Updates a specific field in the user data.
 * @param {string} userId - The user's unique ID.
 * @param {string} field - The field to be updated.
 * @param {*} value - The value to set the field to.
 */
const updateUserData = async (userId, field, value) => {
	try {
		const collection = getCollection();
		let userData = await getUserData(userId);
		userData[field] = value;
		const updatedData = ensureDefaults(userData, userId);
		await collection.updateOne({ userId }, { $set: updatedData });
	} catch (error) {
		console.error('Error updating user data:', error);
		throw error;
	}
};

/**
 * Fetches all user data from the database.
 * @returns {Array<Object>} - An array of all users' data with defaults applied.
 */
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

/**
 * Resets all user data to default values.
 * @param {string} userId - The user's unique ID.
 */
const resetUserData = async ($userId) => {
	try {
		const collection = getCollection();
		const userData = getDefaultUserData(userId);
		await collection.updateOne({ userId: $userId }, { $set: userData });
	} catch (error) {
		console.error('Error resetting user data:', error);
		throw error;
	}
};

module.exports = {
	getUserData,
	updateUserData,
	getAllUserData,
	getDefaultUserData,
	resetUserData,
};
