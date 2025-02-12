module.exports = {
	uri: process.env.URI,
	token: process.env.TOKEN,
	version: 'v1.1.0', // Version format: MAJOR.MINOR.PATCH
	/**
	 * MAJOR: Major changes that break compatibility (e.g., v2.0.0)
	 * MINOR: New features, but still compatible (e.g., v1.2.0)
	 * PATCH: Small fixes and improvements (e.g., v1.1.1)
	 *
	 * Breaking compatibility means making changes that are not backwards-compatible.
	 * This means that the new version of the software will not work with systems,
	 * configurations, or code that were compatible with previous versions.
	 * Examples of breaking compatibility:
	 * - Removing or renaming existing functions or methods
	 * - Changing the behavior of existing functions
	 * - Changing data formats
	 * - Modifying APIs
	 *
	 * Adding new commands and a new system like fishing would be a MINOR update.
	 * This is because you are adding new functionality in a backwards-compatible manner.
	 * Existing features and commands will continue to work as before.
	 *
	 * Examples of a MAJOR update:
	 * - Removing or renaming existing commands or functions
	 * - Changing the behavior of existing commands or functions
	 * - Modifying the data structure or format
	 * - Changing the API endpoints or parameters
	 * - Rewriting significant parts of the codebase
	 */
};
