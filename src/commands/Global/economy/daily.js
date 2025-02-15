const DataService = require('../../../database/repositories/userDataRepositories');

module.exports = {
	data: { name: 'daily', description: 'Claim your daily reward' },

	run: async ({ interaction }) => {
		const userId = interaction.user.id;

		let userData = await DataService.getUserData(userId);

		const cooldownTime = 24 * 60 * 60 * 1000;

		if (userData.lastDaily) {
			const timeDifference = Date.now() - userData.lastDaily;

			if (timeDifference < cooldownTime) {
				const remainingTime = cooldownTime - timeDifference;
				const hours = Math.floor(remainingTime / (60 * 60 * 1000));
				const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

				return interaction.reply({
					embeds: [
						{
							title: '',
							description: `<:Removed:1338951500524949546> You have already claimed your daily reward. Come back in **${hours}h ${minutes}m**.`,
							color: 0xffffff,
						},
					],
				});
			}
		}

		await interaction.deferReply();

		try {
			const rewardAmount = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

			userData.balance = (userData.balance || 0) + rewardAmount;
			userData.lastDaily = Date.now();

			await DataService.updateUserData(userId, 'balance', userData.balance);
			await DataService.updateUserData(userId, 'lastDaily', userData.lastDaily);

			await interaction.editReply({
				embeds: [
					{
						title: '<:Added:1338951944890482758> Daily Reward Claimed',
						description: `* 💸 You received **$${rewardAmount}** as your daily reward\n* 💰 You now have **$${userData.balance}**`,
						color: 0xffffff,
						footer: {
							text: interaction.user.username,
							icon_url: interaction.user.displayAvatarURL(),
						},
					},
				],
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
