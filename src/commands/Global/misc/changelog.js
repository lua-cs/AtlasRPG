const { ApplicationCommandOptionType } = require('discord.js');

const updates = [
	{
		name: 'v1.1.0',
		description: `# Update Changelog
> **Date:** February 11, 2025
> **Update Version:** v1.1.0
> **Update Type:** Major
# <:Added:1338951944890482758> New Commands:
1. **/craft <item>**
   - Allows users to craft items using materials from their inventory.
2. **/inventory**
   - Allows users to view their inventory, including currently equipped items, inventory items, and materials.
3. **/equip <item>**
   - Allows users to equip an item from their inventory, removing that item from the user's inventory.
4. **/unequip**
   - Allows users to unequip their currently equipped item and store it back into their inventory.
5. **/recipes <category>**
   - Allows users to view recipes to craft items for a specified category.

# <:Changes:1339074004601802772> Changes Made:
### Materials:
- Added Birch Wood, obtained from chopping a tree with \`/choptree\`.
### Visuals:
- Changed embed colors to match others based on their category.
- Most embeds now utilize <:Added:1338951944890482758> and <:Removed:1338951500524949546> icons.
### Bug Fixes:
- Fixed major bugs, including data loss and data corruption.
- Resolved an issue where user data was not being saved correctly.
- Fixed a bug that caused the bot to crash under certain conditions.
- Addressed performance issues related to database queries.
### Performance Improvements:
- Improved response times for inventory and crafting commands.
- Optimized database interactions to reduce latency.
### Quality of Life (QOL) Updates:
- Optimization tweaks.
- Implemented changes based on user feedback to improve command usability and clarity.`,
	},
	{
		name: 'v1.1.1',
		description: `# Update Changelog
    > **Date:** February 12, 2025
    > **Update Version:** v1.1.1
    > **Update Type:** Minor
    
    # <:Added:1338951944890482758> New Commands:
    1. **/changelog <version>**
      - View an update changelog for recent versions`,
	},
	{
		name: 'v1.2.0',
		description: `# Update Changelog
> **Date:** February 12, 2025
> **Update Version:** v1.2.0
> **Update Type:** Major
# <:Added:1338951944890482758> New Commands:
1. **/ping**
   - Check the bot's latency.

# <:Changes:1339074004601802772> Changes Made:
### Interface:
- **/recipe** command interface has been revamped to use codeblocks for better readability. This change makes it easier to view and understand the crafting recipes.
- **/inventory** command interface has been updated to use codeblocks for better readability. This change improves the clarity of the inventory display.
- Added \`x\` before numbers to signify quantitative amounts in materials. This change helps users quickly identify the quantity of materials they have.
### Bug Fixes:
- Fixed various bugs that were causing instability and performance issues. These fixes include resolving issues with command execution and data retrieval.
### Performance Improvements:
- Added optimizations to enhance command response times and overall bot performance. These improvements ensure a smoother and faster user experience.
## Note:
* The next update will be the **Mining Update**, introducing new features such as **Stone**, **Iron**, **Pickaxes**, and **more**!
`,
	},
	{
		name: 'v1.3.0',
		description: `# Update Changelog
> **Date**: February 14, 2025
> **Update Version**: v1.3.0 *Updates are now displayed differently*
> **Update Type**: Major
# <:Added:1338951944890482758> New Commands:
1. **/mine**
   - Mine some materials with your pickaxe.
2. **/coinflip**
   - Choose between heads and tails to gamble your money for a chance to double it or lose it
3. **/daily**
   - Claim your daily reward of cash every 24 hours

# <:Changes:1339074004601802772> Changes Made:
* New recipe category: **Pickaxes**
* Nerfed wood collection output from \`/choptree\`
* All text commands now use embeds instead of plain text
* Bug fixes and performance issues fixed
* Changed \`/equip\` to now include a dropdown for better readability
* Removed \`/unequip\` command, as it was useless
* Fixed a bug where materials could be duplicated in your inventory
* New Materials: **Stone, Iron, Gold, Diamond**

# Note:
* Next update will introduce **Leveling**, including level-locked recipes and level up rewards, as well as a leaderboard for new-found competitiveness!`,
	},
];

module.exports = {
	data: {
		name: 'changelog',
		description: '❓ View the changelog for recent updates',
		options: [
			{
				name: 'version',
				description: 'Select the update version to view',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: updates.map((update) => ({ name: update.name, value: update.name })),
			},
		],
	},

	run: async ({ interaction }) => {
		const selectedUpdateName = interaction.options.getString('version');
		const selectedUpdate = updates.find((update) => update.name === selectedUpdateName);

		const changelogEmbed = createChangelogEmbed(selectedUpdate, interaction);
		await interaction.reply({
			embeds: [changelogEmbed],
			ephemeral: true,
		});
	},
};

function createChangelogEmbed(update, interaction) {
	return {
		color: 0x007acc,
		title: `Changelog - ${update.name}`,
		description: update.description,
		footer: {
			text: interaction.user.username,
			icon_url: interaction.user.displayAvatarURL(),
		},
	};
}
