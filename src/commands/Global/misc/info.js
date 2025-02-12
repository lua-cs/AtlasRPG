const { version } = require('../../../config/config');

module.exports = {
	data: { name: 'info', description: '❓ Get helpful information about the bot' },
	run: async ({ interaction }) => {
		interaction.reply({
			embeds: [
				{
					title: 'Helpful Info',
					color: 0xffffff,
					description: `Current Version: **${version}**\n* **Birch Wood** currently has no use`,
					footer: {
						text: interaction.user.username,
						icon_url: interaction.user.displayAvatarURL(),
					},
				},
			],
		});
	},
};
