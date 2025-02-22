const { ApplicationCommandOptionType } = require('discord.js');
const DataService = require('../../database/repositories/userDataRepositories');

const activeCodes = {
	RELEASE: {
		money: 100,
		gems: 10,
	},
};

module.exports = {
	data: {
		name: 'code',
		description: 'Redeem a code for rewards',
		options: [
			{
				name: 'code',
				description: 'Enter the redemption code',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},

	run: async ({ interaction }) => {
		const userId = interaction.user.id;
		const user = interaction.user;
		const codeInput = interaction.options.getString('code')?.toUpperCase();

		if (!codeInput || !activeCodes[codeInput]) {
			return interaction.reply({
				embeds: [
					{
						color: 0xffffff,
						description:
							'<:Removed:1338951500524949546> The code you entered is either invalid or expired.',
					},
				],
				ephemeral: true,
			});
		}

		const userData = await DataService.getUserData(userId);

		if (userData.redeemedCodes?.includes(codeInput)) {
			return interaction.reply({
				embeds: [
					{
						color: 0xffffff,
						description:
							'<:Removed:1338951500524949546> You have already redeemed this code.',
					},
				],
				ephemeral: true,
			});
		}

		const rewards = activeCodes[codeInput];

		await DataService.updateUserData(userId, 'currency', {
			money: (userData.currency.money || 0) + (rewards.money || 0),
			gems: (userData.currency.gems || 0) + (rewards.gems || 0),
		});

		const updatedRedeemedCodes = [
			...(userData.redeemedCodes || []),
			codeInput,
		];
		await DataService.updateUserData(
			userId,
			'redeemedCodes',
			updatedRedeemedCodes
		);

		return interaction.reply({
			embeds: [
				{
					color: 0xffffff,
					description: `<:Added:1338951944890482758> You have successfully redeemed the code!\n\n> - Money: \`${rewards.money}\`\n> - Gems: \`${rewards.gems}\``,
					footer: {
						text: user.username,
						icon_url: user.displayAvatarURL({ dynamic: true }),
					},
				},
			],
			ephemeral: true,
		});
	},
};
