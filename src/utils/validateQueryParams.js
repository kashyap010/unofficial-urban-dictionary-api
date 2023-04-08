function validateQueryParams(params) {
	const validParams = {
		term: (value) => value.trim().length > 0,
		strict: (value) => value === "false" || value === "true",
		limit: (value) => value === "none" || (!isNaN(value) && value > 0),
		matchCase: (value) => value === "false" || value === "true",
		character: (value) => /^([A-Z*]|new)$/.test(value),
		page: (value) => value === "false" || (!isNaN(value) && value >= 1),
		multiPage: (value) =>
			value === "false" ||
			(/^\d+-\d+$/.test(value) &&
				value.split("-").every((p) => parseInt(p) >= 1)),
	};

	for (const [param, value] of Object.entries(params)) {
		if (!validParams[param] || !validParams[param](value)) {
			return {
				valid: false,
				message: `Invalid value for query parameter '${param}'`,
			};
		}
	}

	const { multiPage } = params;
	if (multiPage !== "false") {
		const [start, end] = multiPage.split("-").map((p) => parseInt(p));
		if (end < start) {
			return {
				valid: false,
				message: "Ending page must be greater than or equal to starting page",
			};
		}
	}

	return {
		valid: true,
	};
}

module.exports = validateQueryParams;
