const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const activeUsers = new Set();
const DataService = require('../../../database/repositories/userDataRepositories');

module.exports = {
	data: {
		name: 'coinflip',
		description: 'Flip a coin for a chance to win or lose',
		options: [
			{
				name: 'selection',
				type: ApplicationCommandOptionType.String,
				description: 'Choose Heads or Tails',
				required: true,
				choices: [
					{ name: 'Heads', value: 'Heads' },
					{ name: 'Tails', value: 'Tails' },
				],
			},
			{
				name: 'amount',
				type: ApplicationCommandOptionType.Integer,
				description: 'Amount to bet',
				required: true,
			},
		],
	},

	run: async ({ interaction }) => {
		const userId = interaction.user.id;

		if (activeUsers.has(userId)) {
			return interaction.reply({
				embeds: [
					{
						title: '',
						description: `<:Removed:1338951500524949546> You are already flipping a coin.`,
						color: 0xffffff,
					},
				],
			});
		}

		activeUsers.add(userId);

		await interaction.deferReply();

		const selection = interaction.options.getString('selection');
		const amount = interaction.options.getInteger('amount');

		try {
			const userData = await DataService.getUserData(userId);
			const userBalance = userData.balance;

			if (userBalance < amount) {
				activeUsers.delete(userId);
				return interaction.editReply({
					embeds: [
						{
							description: `<:Removed:1338951500524949546> You don't have enough money to bet **${amount}** coins.`,
							color: 0xffffff,
						},
					],
				});
			}

			const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
			const outcome = result === selection ? `<:Removed:1338951500524949546> You lost!` : `<:Added:1338951944890482758> You won!`;
			const coinImage =
				result === 'Heads'
					? 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Heads_-_2020_-_Australian_%241.jpg/640px-Heads_-_2020_-_Australian_%241.jpg'
					: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Tails_-_2020_-_Australian_%241.jpg/640px-Tails_-_2020_-_Australian_%241.jpg';

			let newBalance = userBalance;
			result === selection ? (newBalance -= amount) : (newBalance += amount);

			userData.balance = newBalance;
			await DataService.updateUserData(userId, 'balance', newBalance);

			const embed = {
				color: result === selection ? 0xff8c8c : 0x90ee90,
				title: 'Coin Flip Result',
				description: `You flipped the coin...`,
				fields: [
					{
						name: 'Your Selection',
						value: selection,
						inline: true,
					},
					{
						name: 'Result',
						value: result,
						inline: true,
					},
					{
						name: 'Outcome',
						value: outcome,
						inline: true,
					},
					{
						name: 'Bet Amount',
						value: `$${amount}`,
						inline: true,
					},
					{
						name: 'New Balance',
						value: `$${newBalance}`,
						inline: true,
					},
				],
				footer: {
					text: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL(),
				},
				image: {
					url: coinImage,
				},
			};

			await interaction.editReply({
				embeds: [embed],
			});
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				embeds: [
					{
						description: 'There was an error processing your request.',
						color: 0xff0000,
					},
				],
				ephemeral: true,
			});
		} finally {
			activeUsers.delete(userId);
		}
	},
};
