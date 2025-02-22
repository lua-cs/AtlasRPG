const { ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const activeUsers = new Set();

module.exports = {
	data: {
		name: 'reportbug',
		description: 'Report a bug to the developers. Only works in the official AtlasRPG Discord server.',
		options: [
			{
				name: 'bug',
				type: ApplicationCommandOptionType.String,
				description: 'The bug you want to report',
				required: true,
			},
		],
	},
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true });

		const userId = interaction.user.id;

		if (activeUsers.has(userId)) {
			return interaction.editReply({
				content: 'You already reported a bug. Please wait **1 minute** before reporting another bug.',
				ephemeral: true,
			});
		}
		activeUsers.add(userId);

		const bug = interaction.options.getString('bug');

		try {
			const channelId = '1340565586983391264';
			const channel = interaction.client.channels.cache.get(channelId);
			if (channel) {
				const actionMenu = new StringSelectMenuBuilder()
					.setCustomId('action_menu')
					.setPlaceholder('Select an action')
					.addOptions([
						{
							label: 'Approve',
							value: 'approve',
						},
						{
							label: 'Reject',
							value: 'reject',
						},
					]);

				const row = new ActionRowBuilder().addComponents(actionMenu);

				const embed = {
					title: 'Bug Report',
					description: bug,
					color: 0xffffff,
					footer: {
						text: `Reported by ${interaction.user.tag} (${interaction.user.id})`,
						icon_url: interaction.user.displayAvatarURL(),
					},
				};

				const message = await channel.send({
					embeds: [embed],
					components: [row],
				});

				await interaction.editReply({
					content: 'Your bug has been sent to the development team. Please wait **1 minute** before reporting another bug.',
					ephemeral: true,
				});

				const filter = (i) => i.user.id === userId;
				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

				collector.on('collect', async (actionInteraction) => {
					if (actionInteraction.values[0] === 'approve') {
						embed.title = '[APPROVED] Bug Report';
						await actionInteraction.user.send({
							embeds: [
								{
									title: 'Your Bug Report has been approved',
									description: bug,
									color: 0xffffff,
									footer: {
										text: `Thank you for your input!`,
									},
								},
							],
						});
					} else {
						embed.title = '[REJECTED] Bug Report';
						await actionInteraction.user.send({
							embeds: [
								{
									title: 'Your Bug Report has been rejected',
									description: bug,
									color: 0xffffff,
									footer: {
										text: `Thank you for your input!`,
									},
								},
							],
						});
					}

					await message.edit({
						embeds: [embed],
						components: [],
					});

					await actionInteraction.update({
						components: [],
					});
				});
			} else {
				await interaction.editReply({
					content: 'This command only works in the **[Official AtlasRPG Discord Server](https://discord.gg/jNyQdsKpr7)**.',
					ephemeral: true,
				});
			}
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		} finally {
			setTimeout(() => activeUsers.delete(userId), 60000);
		}
	},
};
