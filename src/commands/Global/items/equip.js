const { ApplicationCommandOptionType } = require('discord.js');
const DataService = require('../../../database/repositories/userDataRepositories');
const recipesObject = require('../../../utils/crafting/recipes');

module.exports = {
	data: {
		name: 'equip',
		description: 'Equip a specific item',
		options: [
			{
				name: 'item',
				description: 'The specific item to equip',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: recipesObject.map((recipe) => ({ name: recipe.name, value: recipe.name })),
			},
		],
	},

	run: async ({ interaction }) => {
		const item = interaction.options.getString('item');
		const userId = interaction.user.id;

		await interaction.deferReply();

		try {
			const recipe = recipesObject.find((r) => r.name === item);
			if (!recipe) {
				await interaction.editReply({
					content: `### <:Removed:1338951500524949546> **${item}** cannot be equipped.`,
					ephemeral: true,
				});
				return;
			}

			const userData = await DataService.getUserData(userId);
			if (!userData.inventory[item]) {
				await interaction.editReply(`### <:Removed:1338951500524949546> You do not have a **${item}** in your inventory.`);
				return;
			}

			if (userData.equippedItem) {
				userData.inventory[userData.equippedItem.name] = userData.equippedItem;
			}

			const equippedItem = userData.inventory[item];
			delete userData.inventory[item];
			userData.equippedItem = equippedItem;

			await DataService.updateUserData(userId, 'equippedItem', userData.equippedItem);
			await DataService.updateUserData(userId, 'inventory', userData.inventory);

			const equipEmbed = createEquipEmbed(interaction.user, recipe);
			await interaction.editReply({ embeds: [equipEmbed] });
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		}
	},
};

function createEquipEmbed(user, recipe) {
	return {
		title: `**<:Added:1338951944890482758> ${recipe.name}** Equipped`,
		color: 0xffffff,
		description: `You've equipped your **${recipe.name}**.`,
		fields: [
			{
				name: 'Item Details',
				value: `* Durability: **${recipe.durability}**` + `${recipe.choppingSpeed !== undefined && recipe.choppingSpeed !== null ? `\n* Chopping Speed: **${recipe.choppingSpeed}**` : ''}`,
			},
		],
		footer: {
			text: user.username,
			icon_url: user.displayAvatarURL(),
		},
	};
}
