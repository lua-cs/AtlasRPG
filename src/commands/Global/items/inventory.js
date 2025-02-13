const DataService = require('../../../database/repositories/userDataRepositories');
const recipesObject = require('../../../utils/crafting/recipes');

module.exports = {
	data: {
		name: 'inventory',
		description: 'Show your inventory',
	},

	run: async ({ interaction }) => {
		const userId = interaction.user.id;

		await interaction.deferReply();

		try {
			const userData = await DataService.getUserData(userId);

			const inventoryItems = Object.keys(userData.inventory).map((itemName) => {
				const recipe = recipesObject.find((r) => r.name === itemName);
				return {
					name: recipe.name,
					durability: userData.inventory[itemName].durability,
					choppingSpeed: recipe.choppingSpeed,
					equippable: recipe.equippable,
				};
			});

			const equippedItem = userData.equippedItem;

			const inventoryEmbed = createInventoryEmbed(interaction.user, inventoryItems, equippedItem, userData.materials);
			await interaction.editReply({ embeds: [inventoryEmbed] });
		} catch (error) {
			console.error('Error displaying inventory:', error);
			await interaction.editReply({
				content: 'There was an error displaying your inventory.',
				ephemeral: true,
			});
		}
	},
};

function createInventoryEmbed(user, items, equippedItem, materials) {
	const fields = [];

	if (equippedItem) {
		fields.push({
			name: 'Equipped Item',
			value:
				`\`\`\`yaml\n` +
				`Name: ${equippedItem.name}\n` +
				`Durability: ${equippedItem.durability}\n` +
				`${equippedItem.choppingSpeed !== undefined && equippedItem.choppingSpeed !== null ? `Chopping Speed: ${equippedItem.choppingSpeed}\n` : ''}` +
				`\`\`\``,
			inline: true,
		});
	}

	const materialsString = `\`\`\`yaml\n${Object.keys(materials)
		.map((material) => `${material.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}: ${materials[material]}`)
		.join('\n')}\n\`\`\``;

	fields.push({
		name: 'Materials',
		value: materialsString || 'You have no materials.',
		inline: true,
	});

	const inventoryString = items
		.map(
			(item) =>
				`\`\`\`yaml\n` +
				`Name: ${item.name}\n` +
				`Durability: ${item.durability}\n` +
				`${item.choppingSpeed !== undefined && item.choppingSpeed !== null ? `Chopping Speed: ${item.choppingSpeed}\n` : ''}` +
				`Equippable: ${item.equippable ? 'Yes' : 'No'}\n` +
				`\`\`\``
		)
		.join('\n');

	fields.push({
		name: 'Inventory Items',
		value: inventoryString || 'You have no items.',
		inline: false,
	});

	return {
		title: `Your Inventory`,
		color: 0xffffff,
		description: '',
		fields: fields,
		footer: {
			text: user.username,
			icon_url: user.displayAvatarURL(),
		},
	};
}
