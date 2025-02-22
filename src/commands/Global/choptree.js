const { ApplicationCommandOptionType } = require('discord.js');
const DataService = require('../../database/repositories/userDataRepositories');
const activeUsers = new Set();

module.exports = {
	data: {
		name: 'choptree',
		description: 'Chop down trees with your axe for wood materials',
		options: [
			{
				name: 'tree',
				description: 'Choose the tree type to chop',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{ name: 'Oak Tree [Level 1]', value: 'oak_tree' },
					{ name: 'Birch Tree [Level 3]', value: 'birch_tree' },
					{ name: 'Willow Tree [Level 5]', value: 'willow_tree' },
					{ name: 'Maple Tree [Level 10]', value: 'maple_tree' },
					{ name: 'Yew Tree [Level 15]', value: 'yew_tree' },
					{ name: 'Magic Tree [Level 20]', value: 'magic_tree' },
				],
			},
		],
	},

	run: async ({ interaction }) => {
		const userId = interaction.user.id;
		const selectedTree = interaction.options.getString('tree');
		const treeLevels = {
			oak_tree: 1,
			birch_tree: 3,
			willow_tree: 5,
			maple_tree: 10,
			yew_tree: 15,
			magic_tree: 20,
		};

		if (activeUsers.has(userId)) {
			return interaction.reply({
				embeds: [
					{
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

			// Check if the user meets the required level for the tree
			if (userData.levelData.level < treeLevels[selectedTree]) {
				activeUsers.delete(userId);
				return interaction.editReply({
					embeds: [
						{
							description: `<:Removed:1338951500524949546> You need to be level ${treeLevels[selectedTree]} to chop this tree.`,
							color: 0xffffff,
						},
					],
				});
			}

			// Ensure the user has an axe equipped
			if (!equippedItem || equippedItem.category !== 'axe') {
				activeUsers.delete(userId);
				return interaction.editReply({
					embeds: [
						{
							description: `<:Removed:1338951500524949546> Equip an axe to chop a tree.`,
							color: 0xffffff,
						},
					],
				});
			}

			const axe = equippedItem;
			const woodMaterial = `${selectedTree.split('_')[0]}_wood`;
			const woodEmoji =
				woodMaterial === 'oak_wood'
					? '<:oak_wood:1341904056259448966>'
					: '<:birch_wood:1341904088383750247>';
			const woodCollected = Math.floor(Math.random() * 5) + 1;
			const woodAmount = userData.materials.foraging[woodMaterial] || 0;
			const progressStep =
				axe.choppingPower === Infinity ? 100 : axe.choppingPower || 10;
			const timeTook = (100 / progressStep) * 1;
			const formattedTreeName = selectedTree
				.replace('_tree', '')
				.replace(/^\w/, (c) => c.toUpperCase());

			let embed = {
				color: 0x90ee90,
				title: `🌳 Chopping ${formattedTreeName} Tree...`,
				description: `You've started chopping a ${formattedTreeName} Tree.`,
				fields: [
					{
						name: 'Equipped Axe',
						value: `${axe.name}`,
						inline: true,
					},
					{ name: 'Progress', value: '0%', inline: true },
				],
				footer: {
					text: interaction.user.username,
					icon_url: interaction.user.displayAvatarURL(),
				},
			};

			await interaction.editReply({ embeds: [embed] });

			// Simulate the chopping process
			for (
				let progress = progressStep;
				progress <= 100;
				progress += progressStep
			) {
				let filledBlocks = Math.floor(progress / 12.5);
				let emptyBlocks = 8 - filledBlocks;
				let progressBar =
					'▓'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
				embed.fields[1].value = `${progressBar} ${progress}%`;

				await interaction.editReply({ embeds: [embed] });

				if (progress === 100) {
					embed.title = `🌳 ${formattedTreeName} Tree Chopped!`;
					embed.description = `You've successfully chopped down the ${formattedTreeName} Tree.`;

					embed.fields = [
						{
							name: `${woodEmoji} Logs Obtained`,
							value: `x${woodCollected} ${formattedTreeName} Wood`,
							inline: true,
						},
						{
							name: '🪓 Axe Durability',
							value:
								axe.durability <= 1
									? `🪓 Your axe broke!`
									: ` ${axe.durability - 1} uses left`,
							inline: true,
						},
						{
							name: '⏱️ Time Taken',
							value: `${timeTook.toFixed(1)} seconds`,
							inline: true,
						},
					];

					axe.durability--;

					if (axe.durability <= 0) {
						userData.equippedItem = null;
					}

					await interaction.editReply({ embeds: [embed] });

					break;
				}

				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Update the collected wood amount
			userData.materials.foraging[woodMaterial] =
				woodAmount + woodCollected;
			await DataService.updateUserData(
				userId,
				'materials',
				userData.materials
			);

			// Level up checks
			let levelUpMessage = null;
			let skillUpMessage = null;

			if (userData.levelData.xp >= userData.levelData.maxXp) {
				userData.levelData.level += 1;
				userData.levelData.xp = 0;
				userData.levelData.maxXp += 50;
				levelUpMessage = `You leveled up to **Level ${userData.levelData.level}!** 🎉`;
			}

			const skill = 'foraging';
			if (
				userData.levelData.skills[skill].xp >=
				userData.levelData.skills[skill].maxXp
			) {
				userData.levelData.skills[skill].level += 1;
				userData.levelData.skills[skill].xp = 0;
				userData.levelData.skills[skill].maxXp += 50;
				skillUpMessage = `Your **${skill}** skill leveled up to **Level ${userData.levelData.skills[skill].level}!** 🎉`;
			}

			if (levelUpMessage || skillUpMessage) {
				let dmEmbed = {
					color: 0x90ee90,
					title: 'Level or Skill Up!',
					description: `${levelUpMessage || ''}\n${
						skillUpMessage || ''
					}\nXP gained: **${userData.levelData.skills[skill].xp}**`,
				};

				const user = await interaction.user.fetch();
				await user.send({ embeds: [dmEmbed] });
			}

			await DataService.updateUserData(
				userId,
				'levelData',
				userData.levelData
			);
			await DataService.updateUserData(
				userId,
				'equippedItem',
				userData.equippedItem
			);
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
