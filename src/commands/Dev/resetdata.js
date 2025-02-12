const { ApplicationCommandOptionType } = require('discord.js');
const DataService = require('../../database/repositories/userDataRepositories');
const { getDefaultUserData } = require('../../database/models/userData');

module.exports = {
	data: {
		name: 'resetdata',
		description: "Reset a user's data",
		options: [
			{
				name: 'user',
				description: 'The user to reset (optional)',
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
			const defaultUserData = getDefaultUserData(userId);
			await DataService.updateUserData(userId, 'balance', defaultUserData.balance);
			await DataService.updateUserData(userId, 'materials', defaultUserData.materials);
			await DataService.updateUserData(userId, 'equippedItem', defaultUserData.equippedItem);
			await DataService.updateUserData(userId, 'inventory', defaultUserData.inventory);

			await interaction.editReply({
				content: `Successfully reset data for ${targetUser.username}.`,
				ephemeral: true,
			});
		} catch (error) {
			console.error('Error resetting user data:', error);
			await interaction.editReply({
				content: 'There was an error resetting the user data.',
				ephemeral: true,
			});
		}
	},
};
