const DataService = require('../../../database/repositories/userDataRepositories');
const activeUsers = new Set();

module.exports = {
	data: { name: 'mine', description: 'Mine materials with your pickaxe for resources' },

	run: async ({ interaction }) => {
		const userId = interaction.user.id;

		if (activeUsers.has(userId)) {
			return interaction.editReply({
				embeds: [
					{
						title: '',
						description: `<:Removed:1338951500524949546> You are already mining.`,
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

			if (!equippedItem || equippedItem.category !== 'pickaxe') {
				activeUsers.delete(userId);
				return interaction.editReply({
					embeds: [
						{
							title: '',
							description: `<:Removed:1338951500524949546> Equip a pickaxe to mine materials.`,
							color: 0xffffff,
						},
					],
				});
			}

			const pickaxe = equippedItem;

			if (!pickaxe.canMine || pickaxe.canMine.length === 0) {
				activeUsers.delete(userId);
				return interaction.editReply('### <:Removed:1338951500524949546> Your pickaxe cannot mine any materials.');
			}

			const possibleMaterials = pickaxe.canMine.filter((material) => Math.random() * 100 <= material.chance);

			const selectedMaterial = possibleMaterials[Math.floor(Math.random() * possibleMaterials.length)];
			const amount = Math.floor(Math.random() * (selectedMaterial.max - selectedMaterial.min + 1)) + selectedMaterial.min;

			const userMaterials = userData.materials || {};
			userMaterials[selectedMaterial.name.toLowerCase()] = (userMaterials[selectedMaterial.name] || 0) + amount;

			const embed = {
				color: 0xb0b0b0,
				title: `Mining Materials...`,
				description: `You have started mining some **${selectedMaterial.name}** ⛏️`,
				fields: [
					{ name: 'Material Type', value: selectedMaterial.name, inline: true },
					{ name: 'Progress', value: '0%', inline: true },
				],
				footer: {
					text: interaction.user.username,
					icon_url: interaction.user.displayAvatarURL(),
				},
			};

			await interaction.editReply({ embeds: [embed] });

			const progressStep = (pickaxe.miningPower === Infinity ? 100 : pickaxe.miningPower) || 10;
			const estimatedTime = (100 / progressStep) * 1;

			for (let progress = progressStep; progress <= 100; progress += progressStep) {
				embed.fields[1].value = progress === 100 ? `DONE (${estimatedTime}s)` : `${progress}%`;
				await interaction.editReply({ embeds: [embed] });

				if (progress === 100) {
					embed.title = `Mining Complete!`;
					embed.description =
						`⛏️ **You've successfully mined some ${selectedMaterial.name}!**\n\n` +
						`* 🪨 **${selectedMaterial.name} Collected:** +${amount} ${selectedMaterial.name}\n` +
						`* 📦 **Total ${selectedMaterial.name}:** ${userMaterials[selectedMaterial.name.toLowerCase()]} ${selectedMaterial.name}\n\n` +
						`Your **${pickaxe.name}** has **${pickaxe.durability - 1}** Uses Left`;

					await interaction.editReply({ embeds: [embed] });
					break;
				}

				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			if (pickaxe.durability !== Infinity && --pickaxe.durability <= 0) {
				userData.equippedItem = null;
				embed.description += `\n## Your **${pickaxe.name}** broke!`;
				await interaction.editReply({ embeds: [embed] });
			}

			console.log(userMaterials);

			await DataService.updateUserData(userId, 'materials', userMaterials);
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
