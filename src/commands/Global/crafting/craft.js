const { ApplicationCommandOptionType } = require('discord.js');
const DataService = require('../../../database/repositories/userDataRepositories');

module.exports = {
	data: {
		name: 'craft',
		description: 'Craft a specific item',
		options: [
			{
				name: 'item',
				description: 'The specific item to craft',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{ name: 'Wooden Axe', value: 'Wooden Axe' },
					{ name: 'Stone Axe', value: 'Stone Axe' },
					{ name: 'Iron Axe', value: 'Iron Axe' },
				],
			},
		],
	},

	run: async ({ interaction }) => {
		const recipesObject = require('../../../utils/crafting/recipes');
		const item = interaction.options.getString('item');
		const userId = interaction.user.id;

		await interaction.deferReply();

		try {
			const recipe = recipesObject.find((r) => r.name === item);
			if (!recipe) {
				await interaction.editReply(`### <:Removed:1338951500524949546> Recipe for **${item}** not found.`);
				return;
			}

			const userData = await DataService.getUserData(userId);

			if (userData.inventory[item] || (userData.equippedItem && userData.equippedItem.name === item)) {
				await interaction.editReply(`### <:Removed:1338951500524949546> You already have a **${item}** in your inventory or equipped.`);
				return;
			}

			const hasEnoughMaterials = recipe.materials.every((material) => userData.materials[material.name] >= material.amount);

			if (!hasEnoughMaterials) {
				await interaction.editReply(`### <:Removed:1338951500524949546> You do not have enough materials to craft a **${item}**.`);
				return;
			}

			await Promise.all(recipe.materials.map((material) => DataService.updateUserData(userId, `materials.${material.name}`, userData.materials[material.name] - material.amount)));

			const newItem = { [recipe.name]: recipe };
			await DataService.updateUserData(userId, 'inventory', { ...userData.inventory, ...newItem });

			const craftEmbed = createCraftEmbed(interaction.user, recipe);
			await interaction.editReply({ embeds: [craftEmbed] });
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		}
	},
};

function createCraftEmbed(user, recipe) {
	return {
		title: `**<:Added:1338951944890482758> You crafted a ${recipe.name}**`,
		color: 0xffffff,
		description: `Congratulations! You've successfully crafted a **${recipe.name}**.`,
		fields: [
			{
				name: 'Crafting Details',
				value:
					`* Durability: **${recipe.durability}**` +
					`${recipe.choppingSpeed !== undefined && recipe.choppingSpeed !== null ? `\n* Chopping Speed: **${recipe.choppingSpeed}**` : ''}` +
					`\n* Materials:\n${recipe.materials.map((material) => `  * **${material.display}**: **${material.amount}**`).join('\n')}`,
			},
		],
		footer: {
			text: user.username,
			icon_url: user.displayAvatarURL(),
		},
	};
}
