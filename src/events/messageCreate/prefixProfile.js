module.exports = (message, client) => {
	if (message.author.bot) return;
	if (message.content.toLowerCase() === 'atlas profile') {
		message.channel.send('');
	}
};
