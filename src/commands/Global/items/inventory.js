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
	const fields = items.map((item) => ({
		name: item.name,
		value:
			`* Durability: **${item.durability}**` +
			`${item.choppingSpeed !== undefined && item.choppingSpeed !== null ? `\n* Chopping Speed: **${item.choppingSpeed}**` : ''}` +
			`\n* Equippable: **${item.equippable ? 'Yes' : 'No'}**`,
	}));

	let description = '';

	if (equippedItem) {
		fields.unshift({
			name: 'Equipped Item',
			value:
				`* Name: **${equippedItem.name}**` +
				`\n* Durability: **${equippedItem.durability}**` +
				`${equippedItem.choppingSpeed !== undefined && equippedItem.choppingSpeed !== null ? `\n* Chopping Speed: **${equippedItem.choppingSpeed}**` : ''}`,
		});
	}

	if (fields.length === 0) {
		description = 'Your inventory is empty.';
	}

	const materialsString = Object.keys(materials)
		.map((material) => `* ${material.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}: **${materials[material]}**`)
		.join('\n');

	fields.push({
		name: 'Materials',
		value: materialsString || 'You have no materials.',
	});

	return {
		title: `Your Inventory`,
		color: 0xffffff,
		description: description,
		fields: fields,
		footer: {
			text: user.username,
			icon_url: user.displayAvatarURL(),
		},
	};
}
