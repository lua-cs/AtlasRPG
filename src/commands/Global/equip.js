const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const DataService = require('../../database/repositories/userDataRepositories');
const recipesObject = require('../../utils/crafting/recipes');

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

			const equipmentItems = Object.keys(userData.equipment).filter(
				(item) => {
					const recipe = recipesObject.find((r) => r.name === item);
					return recipe;
				}
			);

			if (equipmentItems.length === 0) {
				await interaction.editReply({
					embeds: [
						{
							title: '',
							description: `<:Removed:1338951500524949546> You have no tools in your inventory to equip.`,
							color: 0xffffff,
						},
					],
				});
				return;
			}

			const selectMenu = new StringSelectMenuBuilder()
				.setCustomId('equip_item')
				.setPlaceholder('Select an item to equip')
				.addOptions(
					equipmentItems.map((item) => ({
						label: item,
						value: item,
					}))
				);

			const row = new ActionRowBuilder().addComponents(selectMenu);

			await interaction.editReply({
				embeds: [
					{
						color: 0xffffff,
						description:
							'Select an item from your equipment to equip:',
					},
				],
				components: [row],
				ephemeral: true,
			});

			const filter = (i) => i.user.id === userId;
			const collector =
				interaction.channel.createMessageComponentCollector({
					filter,
					time: 600000,
				});

			collector.on('collect', async (menuInteraction) => {
				const item = menuInteraction.values[0];
				const recipe = recipesObject.find((r) => r.name === item);

				if (userData.equippedItem) {
					userData.equipment[userData.equippedItem.name] =
						userData.equippedItem;
				}

				const equippedItem = userData.equipment[item];
				delete userData.equipment[item];
				userData.equippedItem = equippedItem;

				await DataService.updateUserData(
					userId,
					'equippedItem',
					userData.equippedItem
				);
				await DataService.updateUserData(
					userId,
					'equipment',
					userData.equipment
				);

				const equipEmbed = {
					title: `<:Added:1338951944890482758> ${recipe.name} Equipped`,
					color: 0xffffff,
					description: `You've equipped your ${recipe.name}.`,
					fields: [
						{
							name: 'Item Details',
							value:
								'```yaml\n' +
								`${
									recipe.durability !== undefined &&
									recipe.durability !== null
										? `Durability: ${recipe.durability}\n`
										: ''
								}` +
								`${
									recipe.choppingPower !== undefined &&
									recipe.choppingPower !== null
										? `Chopping Power: ${recipe.choppingPower}\n`
										: ''
								}` +
								`${
									recipe.miningPower !== undefined &&
									recipe.miningPower !== null
										? `Mining Power: ${recipe.miningPower}\n`
										: ''
								}` +
								'```',
						},
					],
					footer: {
						text: menuInteraction.user.username,
						icon_url: menuInteraction.user.displayAvatarURL(),
					},
				};

				// Edit the original ephemeral reply to show the equip embed
				await interaction.editReply({
					content: '',
					embeds: [equipEmbed],
					components: [],
					ephemeral: true, // Keep the reply ephemeral
				});

				// Optionally, disable the interaction (no more selections after equipping)
				collector.stop();
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
