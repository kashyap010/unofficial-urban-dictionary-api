const express = require("express");
const path = require("path");
const app = express();
const setupRoutes = require("./routes");

app.use(express.static("public"));

setupRoutes(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
