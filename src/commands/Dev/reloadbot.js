const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
	data: {
		name: 'reloadbot',
		description: '📛 Reloads Bot Commands, Events, Validations.',
		options: [
			{
				name: 'reason',
				type: ApplicationCommandOptionType.String,
				description: 'Reason for the reload (optional)',
				required: false,
			},
		],
	},

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply();

		const reason = interaction.options.getString('reason') || 'No reason provided';

		try {
			const embed = {
				color: 0xffffff,
				title: 'Reloaded Bot Commands, Events, Validations',
				description: `Reason: **${reason}**`,
				footer: {
					text: `Requested by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
				},
			};

			await interaction.followUp('Done! Check <#1339783347500486729>');

			const channel = client.channels.cache.get('1339783347500486729');
			if (channel) {
				await channel.send({ embeds: [embed] });
			}

			await handler.reloadCommands();
			await handler.reloadEvents();
			await handler.reloadValidations();
		} catch (error) {
			console.error(error);
		}
	},

	options: {
		devOnly: true,
	},
};
