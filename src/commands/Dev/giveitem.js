const { ApplicationCommandOptionType } = require('discord.js');
const DataService = require('../../database/repositories/userDataRepositories');
const recipesObject = require('../../utils/crafting/recipes');

module.exports = {
	data: {
		name: 'giveitem',
		description: '📛 Give an item to a user',
		options: [
			{
				name: 'item',
				description: 'The item to give',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: recipesObject.map((recipe) => ({ name: recipe.name, value: recipe.name })),
			},
			{
				name: 'user',
				description: 'The user to give the item to',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
		],
	},

	run: async ({ interaction }) => {
		const item = interaction.options.getString('item');
		const targetUser = interaction.options.getUser('user');
		const userId = targetUser.id;

		await interaction.deferReply();

		try {
			const recipe = recipesObject.find((r) => r.name === item);
			if (!recipe) {
				await interaction.editReply({
					content: `### <:Removed:1338951500524949546> **${item}** cannot be given.`,
					ephemeral: true,
				});
				return;
			}

			const userData = await DataService.getUserData(userId);

			if (userData.inventory[item] || (userData.equippedItem && userData.equippedItem.name === item)) {
				await interaction.editReply(`### <:Removed:1338951500524949546> **${targetUser.username}** already has a **${item}** in their inventory or equipped.`);
				return;
			}

			const newItem = { [recipe.name]: recipe };
			await DataService.updateUserData(userId, 'inventory', { ...userData.inventory, ...newItem });

			const giveItemEmbed = createGiveItemEmbed(interaction.user, targetUser, recipe);
			await interaction.editReply({ embeds: [giveItemEmbed] });
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		}
	},

	options: { devOnly: true },
};

function createGiveItemEmbed(giver, receiver, recipe) {
	return {
		title: `**<:Added:1338951944890482758> ${recipe.name}** Given`,
		color: 0xffffff,
		description: `**${giver.username}** has given **${receiver.username}** a **${recipe.name}**.`,
		fields: [
			{
				name: 'Item Details',
				value:
					`
				* Durability: **${recipe.durability}**` +
					(recipe.choppingPower !== undefined && recipe.choppingPower !== null ? `\n* Chopping Power: **${recipe.choppingPower}**` : '') +
					(recipe.miningPower !== undefined && recipe.miningPower !== null ? `\n* Mining Power: **${recipe.miningPower}**` : ''),
			},
		],
		footer: {
			text: giver.username,
			icon_url: giver.displayAvatarURL(),
		},
	};
}
