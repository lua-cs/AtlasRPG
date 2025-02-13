const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
	data: {
		name: 'recipes',
		description: 'View crafting recipes for a specified category',
		options: [
			{
				name: 'category',
				description: 'What category to view',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [{ name: 'Axe', value: 'axe' }],
			},
		],
	},

	run: async ({ interaction }) => {
		const recipesObject = require('../../../utils/crafting/recipes');
		const category = interaction.options.getString('category');

		await interaction.deferReply();

		try {
			const recipes = recipesObject.filter((recipe) => recipe.category === category);

			const recipeEmbed = {
				title: `${category.charAt(0).toUpperCase() + category.slice(1)} Recipes`,
				color: 0xffffff,
				fields: recipes.map((recipe) => ({
					name: recipe.name,
					value:
						`\`\`\`yaml\n` +
						`Durability: ${recipe.durability}\n` +
						`${recipe.choppingSpeed !== undefined && recipe.choppingSpeed !== null ? `Chopping Speed: ${recipe.choppingSpeed}\n` : ''}` +
						`Materials:\n${recipe.materials.map((material) => `  ${material.display}: x${material.amount}`).join('\n')}` +
						`\n\`\`\``,
					inline: true,
				})),
				footer: {
					text: interaction.user.username,
					icon_url: interaction.user.displayAvatarURL(),
				},
			};

			await interaction.editReply({ embeds: [recipeEmbed] });
		} catch (error) {
			console.error(`Error in ${__filename}:`, error);
			await interaction.editReply({
				content: 'There was an error processing your request.',
				ephemeral: true,
			});
		}
	},
};
