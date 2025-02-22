const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} = require('discord.js');
const DataService = require('../../database/repositories/userDataRepositories');

const buttonConfig = [
	{ id: 'profile', label: '👤 Profile' },
	{ id: 'level', label: '📈 Level & Skills' },
	{ id: 'inventory', label: '🎒 Inventory' },
	{ id: 'materials', label: '🌲 Materials' },
	// { id: 'quests', label: '🧩 Quests' },
	// { id: 'collectibles', label: '🔮 Collectibles' },
	// { id: 'achievements', label: '🏆 Achievements' },
	// { id: 'settings', label: '⚙️ Settings' },
];

const foragingMaterialsConfig = [
	{ name: 'oak_wood', emoji: `<:oak_wood:1341904056259448966>` },
	{ name: 'birch_wood', emoji: `<:birch_wood:1341904088383750247>` },
	{ name: 'willow_wood', emoji: `<:willow_wood:1342351006620581949>` },
	{ name: 'maple_wood', emoji: `<:maple_wood:1342351062102970418>` },
	{ name: 'yew_wood', emoji: `<:yew_wood:1342351098391822398>` },
	{ name: 'magic_wood', emoji: `<:magic_wood:1342351131187347456>` },
];

const miningMaterialsConfig = [
	{ name: 'stone', emoji: `<:stone:1342351818650288218>` },
	{ name: 'iron', emoji: `<:iron:1342351842985640007>` },
	{ name: 'gold', emoji: `<:gold:1342351864439635988>` },
	{ name: 'diamond', emoji: `<:diamond:1342351882433069166>` },
];

const createButtons = (selectedId) => {
	return buttonConfig
		.filter(({ id }) => id !== undefined)
		.map(({ id, label }) =>
			new ButtonBuilder()
				.setCustomId(id)
				.setLabel(label)
				.setStyle(
					id === selectedId
						? ButtonStyle.Primary
						: ButtonStyle.Secondary
				)
		);
};

const createActionRows = (selectedId) => {
	const buttons = createButtons(selectedId);
	const rows = [];

	for (let i = 0; i < buttons.length; i += 5) {
		const rowButtons = buttons.slice(i, i + 5);
		if (rowButtons.length)
			rows.push(new ActionRowBuilder().addComponents(rowButtons));
	}

	return rows;
};

const generateEmbed = (customId, data, user) => {
	const embed = new EmbedBuilder()
		.setColor(0xffffff)
		.setThumbnail(user.displayAvatarURL({ dynamic: true }))
		.setFooter({
			text: user.username,
			iconURL: user.displayAvatarURL({ dynamic: true }),
		});

	let description = '';

	switch (customId) {
		case 'profile':
			embed.setTitle('Your Profile');
			embed.addFields([
				{
					name: 'Stats',
					value: `> - <:health:1342617828548677673> Health: \`${
						data.health || 0
					}/${
						data.maxHealth || 0
					}\`\n> - <:defense:1342618085605113958> Defense: \`${
						data.defense || 0
					}\`\n> - <:attack:1342615977438875738> Attack: \`${
						data.attack || 0
					}\``,
					inline: false,
				},
				{
					name: 'Social',
					value: `> - 🏛️ Guild: \`${data.guild || 'None'}\``,
					inline: false,
				},
				{
					name: 'Equipped Gear',
					value: `> - ${
						data.equippedSword?.emoji ||
						'<:Removed:1338951500524949546>'
					} Sword: \`${data.equippedSword?.name || 'None'}\`\n> - ${
						data.equippedAxe?.emoji ||
						'<:Removed:1338951500524949546>'
					} Axe: \`${data.equippedAxe?.name || 'None'}\`\n> - ${
						data.equippedPickaxe?.emoji ||
						'<:Removed:1338951500524949546>'
					} Pickaxe: \`${
						data.equippedPickaxe?.name || 'None'
					}\`\n> - ${
						data.equippedArmor?.emoji ||
						'<:Removed:1338951500524949546>'
					} Armor: \`${data.equippedAmor?.name || 'None'}\``,
					inline: false,
				},
				{
					name: 'Economy',
					value: `> - <:goldcoin:1342628581909463195> Gold: \`$${
						data.currency?.gold || 0
					}\`\n> - <:bank:1342627676078473298> Bank: \`$${
						data.currency?.bank || 0
					}\`\n> - <:gem:1342628565107216531> Gems: \`${
						data.currency?.gems || 0
					}\``,
					inline: false,
				},
			]);

			description = `> ## Title: ${data.title}`;
			break;

		case 'level':
			embed.setTitle('Your Level & Skills');
			description = `> 🔻 **Ascension**: \`${
				data.levelData?.ascension || 0
			}\`\n`;
			description += `> 🔹 **Level**: \`${
				data.levelData?.level || 1
			}\`\n`;
			description += `>   - **XP**: \`${data.levelData?.xp || 0}/${
				data.levelData?.maxXp || 100
			}\`\n\n`;
			description += `> **Skills**:\n`;
			description += `> - **🌳 Foraging**: \`Level ${
				data.levelData?.skills?.foraging?.level || 1
			}\` - \`${data.levelData?.skills?.foraging?.xp || 0}/${
				data.levelData?.skills?.foraging?.maxXp || 100
			} XP\`\n`;
			description += `> - **⛏️ Mining**: \`Level ${
				data.levelData?.skills?.mining?.level || 1
			}\` - \`${data.levelData?.skills?.mining?.xp || 0}/${
				data.levelData?.skills?.mining?.maxXp || 100
			} XP\`\n\n`;
			break;

		case 'materials':
			embed.setTitle('Your Materials');
			description = `> 🌲 **Foraging**:\n`;
			description +=
				foragingMaterialsConfig
					.map(({ name, emoji }) =>
						data.materials?.foraging?.[name]
							? `> - ${emoji} ${name
									.split('_')
									.map(
										(word) =>
											word.charAt(0).toUpperCase() +
											word.slice(1)
									)
									.join(' ')}: \`${
									data.materials.foraging[name]
							  }\``
							: ''
					)
					.filter(Boolean)
					.join('\n') || '> - None';

			description += `\n\n> 🪨 **Mining**:\n`;
			description +=
				miningMaterialsConfig
					.map(({ name, emoji }) =>
						data.materials?.mining?.[name]
							? `> - ${emoji} ${
									name.charAt(0).toUpperCase() + name.slice(1)
							  }: \`${data.materials.mining[name]}\``
							: ''
					)
					.filter(Boolean)
					.join('\n') || '> - None';
			break;

		case 'inventory':
			embed.setTitle('Your Inventory');
			description = `> **Equipment**:\n`;
			const equipment = data.equipment || {};
			const equipmentItems = Object.keys(equipment).filter(
				(itemName) => equipment[itemName]?.equippable === true
			);
			description += equipmentItems.length
				? equipmentItems
						.map(
							(i) =>
								`> - \`${i}\` - ${
									equipment[i]?.durability || 0
								} Uses Left`
						)
						.join('\n')
				: '> - None';

			description += `\n\n> **Items**:\n`;
			const items = data.items || {};
			const itemEntries = Object.keys(items).filter(
				(itemName) => items[itemName]?.equippable === false
			);
			description += itemEntries.length
				? itemEntries
						.map(
							(i) =>
								`> - \`${i}\` - ${
									items[i]?.durability || 0
								} Uses Left`
						)
						.join('\n')
				: '> - None';
			break;
	}

	embed.setDescription(description);
	return embed;
};

module.exports = {
	data: {
		name: 'profile',
		description: 'View your profile',
	},

	run: async ({ interaction }) => {
		const userId = interaction.user.id;
		await interaction.deferReply();

		try {
			const userData = await DataService.getUserData(userId);
			const defaultTab = 'profile';

			const embed = generateEmbed(defaultTab, userData, interaction.user);
			const components = createActionRows(defaultTab);

			const response = await interaction.editReply({
				embeds: [embed],
				components,
			});

			const collector = response.createMessageComponentCollector({
				time: 600000, // 10 Minutes; Max: 15 Minutes (900000)
			});

			collector.on('collect', async (buttonInteraction) => {
				if (buttonInteraction.user.id !== userId) return;

				const selectedTab = buttonInteraction.customId;
				const updatedEmbed = generateEmbed(
					selectedTab,
					userData,
					interaction.user
				);
				const updatedComponents = createActionRows(selectedTab);

				await buttonInteraction.update({
					embeds: [updatedEmbed],
					components: updatedComponents,
				});
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: 'An error occurred while processing your request.',
			});
		}
	},
};
