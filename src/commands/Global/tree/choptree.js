const { AttachmentBuilder } = require('discord.js');
const DataService = require('../../../database/repositories/userDataRepositories');
const path = require('path');
const activeUsers = new Set();

module.exports = {
	data: { name: 'choptree', description: 'Chop down trees with your axe for wood materials' },

	run: async ({ interaction }) => {
		const userId = interaction.user.id;

		if (activeUsers.has(userId)) {
			return interaction.reply({
				embeds: [
					{
						title: '',
						description: `<:Removed:1338951500524949546> You are already chopping a tree.`,
						color: 0xffffff,
					},
				],
			});
		}

		activeUsers.add(userId);

		await interaction.deferReply();

		try {
			const userData = await DataService.getUserData(userId);
			const equippedItem = userData.equippedItem;

			if (!equippedItem || equippedItem.category !== 'axe') {
				activeUsers.delete(userId);
				return interaction.editReply(`### <:Removed:1338951500524949546> Equip an axe to chop a tree.`);
			}

			const axe = equippedItem;

			const treeType = ['oak_tree', 'birch_tree'][Math.floor(Math.random() * 2)];
			const woodType = `${treeType.split('_')[0]}_wood`;

			const treeImage = new AttachmentBuilder(path.resolve(__dirname, '../../../images', `${treeType}.png`));
			const woodCollected = Math.floor(Math.random() * 5) + 1; // nerfed
			const userMaterials = userData.materials || {};
			const woodAmount = userMaterials[woodType] || 0;

			const progressStep = (axe.choppingPower === Infinity ? 100 : axe.choppingPower) || 10; // 100: replace with highest HP tree
			const estimatedTime = (100 / progressStep) * 1;

			const embed = {
				color: 0x90ee90,
				title: `Chopping ${treeType.charAt(0).toUpperCase() + treeType.slice(1).replace('_tree', '')} Tree..`,
				description: `You have started chopping a **${treeType.charAt(0).toUpperCase() + treeType.slice(1).replace('_tree', '')} Tree** 🌳`,
				fields: [
					{
						name: 'Tree Type',
						value: `${treeType.charAt(0).toUpperCase() + treeType.slice(1).replace('_tree', '')} Tree`,
						inline: true,
					},
					{ name: 'Progress', value: '0%', inline: true },
				],
				footer: {
					text: interaction.user.username,
					icon_url: interaction.user.displayAvatarURL(),
				},
				image: { url: `attachment://${treeType}.png` },
			};

			await interaction.editReply({
				embeds: [embed],
				files: [treeImage],
			});

			for (let progress = progressStep; progress <= 100; progress += progressStep) {
				embed.fields[1].value = progress === 100 ? `DONE (${estimatedTime}s)` : `${progress}%`;
				await interaction.editReply({ embeds: [embed] });

				if (progress === 100) {
					const treeName = `${treeType.charAt(0).toUpperCase()}${treeType.slice(1).replace('_tree', '')}`;

					embed.title = `${treeName} Tree Chopped!`;
					embed.description =
						`🌲 **You've successfully chopped down a ${treeName} Tree!**\n\n` +
						`- 🪵 **Wood Collected:** +${woodCollected} ${treeName} Wood\n` +
						`- 📦 **Total Wood:** ${woodAmount + woodCollected} ${treeName} Wood\n\n` +
						`Your **${axe.name}** has **${axe.durability - 1}** Uses Left`;

					await interaction.editReply({ embeds: [embed] });
					break;
				}

				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			userMaterials[woodType] = woodAmount + woodCollected;

			if (axe.durability !== Infinity && --axe.durability <= 0) {
				userData.equippedItem = null;
				embed.description += `\n## Your **${axe.name}** broke!`;
				await interaction.editReply({ embeds: [embed] });
			}

			await DataService.updateUserData(userId, 'materials', { ...userData.materials, [woodType]: woodAmount + woodCollected });
			await DataService.updateUserData(userId, 'equippedItem', userData.equippedItem);
			activeUsers.delete(userId);
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		} finally {
			activeUsers.delete(userId);
		}
	},
};
