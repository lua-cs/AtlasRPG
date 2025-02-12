const { MongoClient } = require('mongodb');
const { uri } = require('../config/config');

let client;
let database;

const connectDB = async () => {
	try {
		client = new MongoClient(uri);
		database = client.db();
		console.log('MongoDB connected successfully.');
	} catch (err) {
		console.error('Error connecting to MongoDB:', err);
		process.exit(1);
	}
};

const getDB = () => {
	if (!database) {
		throw new Error('Database not connected');
	}
	return database;
};

module.exports = { connectDB, getDB };
