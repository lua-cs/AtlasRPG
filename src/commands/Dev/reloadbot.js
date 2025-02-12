module.exports = {
	data: {
		name: 'reloadbot',
		description: '📛 Reloads Bot Commands, Events, Validations,',
	},

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply();

		await handler.reloadCommands();
		await handler.reloadEvents();
		await handler.reloadValidations();

		const message = await interaction.followUp('Reloaded Bot Commands, Events, Validations.');

		setTimeout(() => {
			message.delete();
		}, 100);
	},

	options: {
		devOnly: true,
	},
};
