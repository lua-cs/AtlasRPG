module.exports = {
	data: {
		name: 'links',
		description: '📛 Access important links related to the bot',
	},

	run: ({ interaction }) => {
		interaction.reply({
			embeds: [
				{
					color: 0x007acc,
					title: 'AtlasRPG Official Links',
					description:
						'* [Application Developer Portal](https://discord.com/developers/applications/1337892617236517045)\n' +
						'* [MongoDB Database](https://cloud.mongodb.com/v2/67a7cd1919f3db124bc3e5b7#/metrics/replicaSet/67a7cda66d42050b07ded6ce/explorer/test/userData/find)\n' +
						'* [GitHub Repository](https://github.com/lualocalization/AtlasRPG)',
					footer: {
						text: 'Please refrain from sharing these links. Unauthorized sharing may lead to access revocation.',
					},
				},
			],
			ephemeral: true,
		});
	},

	options: {
		devOnly: true,
	},
};
