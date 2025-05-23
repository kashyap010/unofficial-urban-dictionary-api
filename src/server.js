const express = require("express");
const path = require("path");
const app = express();
const cors = require('cors');
const compression = require('compression')
const setupRoutes = require("./routes");

app.use(cors());

app.use(compression())

app.use(express.static("public"));

setupRoutes(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
