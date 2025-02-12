module.exports = {
	data: { name: 'ping', description: '❓ Check bot latency' },
	run: async ({ interaction }) => {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		interaction.editReply(`## Pong!\nLatency is **${sent.createdTimestamp - interaction.createdTimestamp}ms**.`);
	},
};
