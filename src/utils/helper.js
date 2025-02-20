const DataService = require('../database/repositories/userDataRepositories');

class xp {
	static calculateXp(item, count, userXpMultiplier, toolMultiplier, xpUpgradeMultiplier, globalXpMultiplier) {
		const xpObj = {
			oak_wood: 10,
			birch_wood: 10,
			stone: 25,
			iron: 35,
			gold: 50,
			diamond: 100,
		};
		const baseXp = xpObj[item] * count;
		const totalXp = baseXp * userXpMultiplier * toolMultiplier * xpUpgradeMultiplier * globalXpMultiplier;
		return Math.ceil(totalXp);
	}

	static async applyXp(xp, userId) {
		const userData = await DataService.getUserData(userId);
		let { xp: currentXp, level, max_xp, prestige } = userData.levelData;
		let { balance } = userData;
		currentXp += xp;
		let levelUpMessage = '';

		while (currentXp >= max_xp) {
			currentXp -= max_xp;
			level++;
			max_xp = 100 * Math.pow(level, 2);
			balance += level * 100;
			levelUpMessage += `\n\n## **:tada: Level Up!**\n- You've leveled up to **Level ${level}** and received **$${level * 100}**!`;
		}

		await DataService.updateUserData(userId, 'levelData', { level, xp: currentXp, max_xp, prestige });
		await DataService.updateUserData(userId, 'balance', balance);

		return levelUpMessage ? `+${xp} XP${levelUpMessage}` : `+${xp} XP`;
	}
}

module.exports = {
	xp,
};
