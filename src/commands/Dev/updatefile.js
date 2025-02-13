const { ApplicationCommandOptionType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
	data: {
		name: 'reloadfile',
		description: '📛 Reload a non-command .js file in the src folder',
		options: [
			{
				name: 'file',
				description: 'The file to reload',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			},
		],
	},

	run: async ({ interaction, client, handler }) => {
		const file = interaction.options.getString('file');

		await interaction.deferReply({ ephemeral: true });

		try {
			const filePath = path.resolve(__dirname, '../../', file);
			delete require.cache[require.resolve(filePath)];
			require(filePath);

			handler.reloadCommands();

			await interaction.editReply(`### <:Added:1338951944890482758> **${file}** has been reloaded successfully.`);
		} catch (error) {
			console.error(`Error reloading file ${file}:`, error);
			await interaction.editReply({
				content: 'There was an error reloading the file.',
				ephemeral: true,
			});
		}
	},

	autocomplete: async ({ interaction }) => {
		const focusedValue = interaction.options.getFocused();
		const choices = getJsFiles().filter((file) => file.includes(focusedValue));
		await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
	},

	options: { devOnly: true },
};

function getJsFiles() {
	const baseDir = path.resolve(__dirname, '../../../src');
	const excludeDirs = ['commands'];
	const jsFiles = [];

	function readDir(dir) {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const filePath = path.join(dir, file);
			const stat = fs.statSync(filePath);
			if (stat.isDirectory() && !excludeDirs.includes(path.basename(filePath))) {
				readDir(filePath);
			} else if (stat.isFile() && file.endsWith('.js')) {
				jsFiles.push(path.relative(baseDir, filePath).replace(/\\/g, '/'));
			}
		}
	}

	readDir(baseDir);
	return jsFiles;
}
