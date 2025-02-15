const { ApplicationCommandOptionType } = require('discord.js');
const DataService = require('../../../database/repositories/userDataRepositories');
const recipesObject = require('../../../utils/crafting/recipes');

module.exports = {
	data: {
		name: 'inventory',
		description: "Show your or another user's inventory",
		options: [
			{
				name: 'user',
				description: 'User whose inventory to view',
				type: ApplicationCommandOptionType.User,
				required: false,
			},
		],
	},

	run: async ({ interaction }) => {
		const targetUser = interaction.options.getUser('user') || interaction.user;
		const userId = targetUser.id;

		await interaction.deferReply();

		try {
			const userData = await DataService.getUserData(userId);

			const inventoryItems = Object.keys(userData.inventory).map((itemName) => {
				const item = recipesObject.find((r) => r.name === itemName) || {};
				return {
					name: itemName,
					durability: userData.inventory[itemName].durability,
					choppingPower: item.choppingPower,
					equippable: item.equippable,
					materials: Array.isArray(item.materials) ? item.materials : [],
				};
			});

			const equippedItem = userData.equippedItem;
			const inventoryEmbed = createInventoryEmbed(targetUser, inventoryItems, equippedItem, userData.materials, interaction, userData.balance);

			await interaction.editReply({ embeds: [inventoryEmbed] });
		} catch (error) {
			console.error('Error displaying inventory:', error);
			await interaction.editReply({
				content: 'There was an error displaying the inventory.',
				ephemeral: true,
			});
		}
	},
};

function createInventoryEmbed(user, items, equippedItem, materials, interaction, userBalance) {
	const fields = [];

	fields.push({
		name: 'Balance',
		value: `\`\`\`yaml\n$${userBalance}\`\`\``,
		inline: false,
	});

	fields.push({
		name: 'Equipped Item',
		value: equippedItem
			? `\`\`\`yaml\nName: ${equippedItem.name}\nDurability: ${equippedItem.durability}\n` +
			  `${equippedItem.choppingPower !== undefined ? `Chopping Speed: ${equippedItem.choppingPower}\n` : ''}` +
			  `${equippedItem.miningPower !== undefined ? `Mining Power: ${equippedItem.miningPower}\n` : ''}` +
			  '```'
			: '```yaml\nNo item equipped\n```',
		inline: true,
	});

	const materialsString = `\`\`\`yaml\n${Object.keys(materials)
		.map((material) => `${material.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}: ${materials[material]}`)
		.join('\n')}\n\`\`\``;

	fields.push({
		name: 'Materials',
		value: materialsString,
		inline: true,
	});

	const inventoryString = items
		.map(
			(item) =>
				`\`\`\`yaml\nName: ${item.name}\n` +
				`Durability: ${item.durability}\n` +
				`${item.choppingPower !== undefined ? `Chopping Speed: ${item.choppingPower}\n` : ''}` +
				`${item.miningPower !== undefined ? `Mining Power: ${item.miningPower}\n` : ''}` +
				'\n```'
		)
		.join('\n');

	fields.push({
		name: 'Inventory Items',
		value: inventoryString || '```yaml\nYou have nothing in your inventory```',
		inline: false,
	});

	return {
		title: user.id === interaction.user.id ? 'Your Inventory' : `${user.username}'s Inventory`,
		color: 0xffffff,
		description: '',
		fields: fields,
		footer: {
			text: interaction.user.username,
			icon_url: interaction.user.displayAvatarURL(),
		},
	};
}
