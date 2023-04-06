const express = require("express");
const app = express();
const setupRoutes = require("./routes");

setupRoutes(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
