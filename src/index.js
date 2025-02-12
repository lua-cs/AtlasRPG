const dotenv = require('dotenv');
dotenv.config();

const { Client, GatewayIntentBits } = require('discord.js');
const { CommandKit } = require('commandkit');
const { connectDB } = require('./database/connection');
const { token } = process.env;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

new CommandKit({
	client,
	devGuildIds: ['1337896442051956736'],
	devUserIds: ['1314744238763806772'],
	eventsPath: `${__dirname}/events`,
	commandsPath: `${__dirname}/commands`,
	validationsPath: `${__dirname}/validations`,
	bulkRegister: true,
});

connectDB().catch((err) => {
	console.error('Failed to connect to MongoDB:', err);
	process.exit(1);
});

client.login(token).catch((err) => {
	console.error('Failed to login to Discord:', err);
	process.exit(1);
});
