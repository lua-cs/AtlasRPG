const DataService = require('../../../database/repositories/userDataRepositories');

module.exports = {
	data: {
		name: 'unequip',
		description: 'Unequip your currently equipped item',
	},

	run: async ({ interaction }) => {
		const userId = interaction.user.id;

		await interaction.deferReply();

		try {
			const userData = await DataService.getUserData(userId);

			if (!userData.equippedItem) {
				await interaction.editReply(`### <:Removed:1338951500524949546> You do not have anything equipped.`);
				return;
			}

			const equippedItem = userData.equippedItem;
			userData.inventory[equippedItem.name] = equippedItem;
			userData.equippedItem = null;

			await DataService.updateUserData(userId, 'equippedItem', userData.equippedItem);
			await DataService.updateUserData(userId, 'inventory', userData.inventory);

			const unequipEmbed = createUnequipEmbed(interaction.user, equippedItem);
			await interaction.editReply({ embeds: [unequipEmbed] });
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		}
	},
};

function createUnequipEmbed(user, item) {
	return {
		title: `**<:Added:1338951944890482758> ${item.name} Unequipped**`,
		color: 0xffffff,
		description: `You've unequipped your **${item.name}**.`,
		fields: [
			{
				name: 'Item Details',
				value: `* Durability: **${item.durability}**` + `${item.choppingSpeed !== undefined && item.choppingSpeed !== null ? `\n* Chopping Speed: **${item.choppingSpeed}**` : ''}`,
			},
		],
		footer: {
			text: user.username,
			icon_url: user.displayAvatarURL(),
		},
	};
}
