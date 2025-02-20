const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const DataService = require('../../../database/repositories/userDataRepositories');
const recipesObject = require('../../../utils/crafting/recipes');

module.exports = {
	data: {
		name: 'equip',
		description: 'Equip a specific item',
	},

	run: async ({ interaction, client }) => {
		const userId = interaction.user.id;

		await interaction.deferReply({ ephemeral: true });

		try {
			const userData = await DataService.getUserData(userId);
			const inventoryItems = Object.keys(userData.inventory).filter((item) => {
				const recipe = recipesObject.find((r) => r.name === item);
				return recipe && recipe.equippable === true;
			});

			if (inventoryItems.length === 0) {
				await interaction.editReply({
					content: 'You have no equippable items in your inventory.',
					ephemeral: true,
				});
				return;
			}

			const selectMenu = new StringSelectMenuBuilder()
				.setCustomId('equip_item')
				.setPlaceholder('Select an item to equip')
				.addOptions(
					inventoryItems.map((item) => ({
						label: item,
						value: item,
					}))
				);

			const row = new ActionRowBuilder().addComponents(selectMenu);

			await interaction.editReply({
				content: 'Select an equippable item from your inventory:',
				components: [row],
				ephemeral: true,
			});

			const filter = (i) => i.user.id === userId;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async (menuInteraction) => {
				const item = menuInteraction.values[0];
				const recipe = recipesObject.find((r) => r.name === item);

				if (userData.equippedItem) {
					userData.inventory[userData.equippedItem.name] = userData.equippedItem;
				}

				const equippedItem = userData.inventory[item];
				delete userData.inventory[item];
				userData.equippedItem = equippedItem;

				await DataService.updateUserData(userId, 'equippedItem', userData.equippedItem);
				await DataService.updateUserData(userId, 'inventory', userData.inventory);

				const equipEmbed = {
					title: `<:Added:1338951944890482758> ${recipe.name} Equipped`,
					color: 0xffffff,
					description: `You've equipped your ${recipe.name}.`,
					fields: [
						{
							name: 'Item Details',
							value:
								'```yaml\n' +
								`${recipe.durability !== undefined && recipe.durability !== null ? `Durability: ${recipe.durability}\n` : ''}` +
								`${recipe.choppingPower !== undefined && recipe.choppingPower !== null ? `Chopping Power: ${recipe.choppingPower}\n` : ''}` +
								`${recipe.miningPower !== undefined && recipe.miningPower !== null ? `Mining Power: ${recipe.miningPower}\n` : ''}` +
								'```',
						},
					],
					footer: {
						text: menuInteraction.user.username,
						icon_url: menuInteraction.user.displayAvatarURL(),
					},
				};

				await menuInteraction.reply({
					embeds: [equipEmbed],
					ephemeral: false,
				});
			});
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		}
	},
};
