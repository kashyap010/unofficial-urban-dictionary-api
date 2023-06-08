const datePicker = document.getElementById("date-picker");
const endpoints = Array.from(document.querySelectorAll(".endpoint-name"));
const currentEndpoint = document.getElementById("current-endpoint");
const generatedUrl = document.getElementById("generated-url");
const clipboardIconContainer = document.getElementById(
	"clipboard-icon-container"
);
const jsonOutput = document.getElementById("json-output");

const baseUrl = "https://www.unofficialurbandictionaryapi.com/api";
const queryParams = {
	term: "",
	date: "",
	character: "",
	author: "",
	strict: false,
	matchCase: false,
	limit: "none",
	page: 1,
	multiPage: false,
};
const defaultQueryParams = JSON.parse(JSON.stringify(queryParams));

async function fetchMeaning() {
	jsonOutput.innerHTML = "";
	const url = generatedUrl.innerText;
	console.log(url);
	const response = await fetch(url);
	const data = await response.json();
	console.log(data);
	renderjson.set_show_to_level(1);
	jsonOutput.appendChild(renderjson(data));
}

function buildQueryParamString(path) {
	let queryParamString = "?";

	switch (path) {
		case "/search":
			queryParamString += `term=${queryParams.term}&`;
			break;
		case "/browse":
			queryParamString += `character=${queryParams.character}&`;
			break;
		case "/date":
			queryParamString += `date=${queryParams.date}&`;
			break;
		case "/author":
			queryParamString += `author=${queryParams.author}&`;
			break;
		default:
			break;
	}

	for (let [key, value] of Object.entries(queryParams)) {
		if (["term", "date", "character", "author"].includes(key)) continue;

		if (value === "") value = defaultQueryParams[key];

		queryParamString += `${key}=${value}&`;
	}

	return queryParamString;
}

function handleInputChange(elem, type, isCheckbox = false) {
	const value = isCheckbox ? elem.checked : elem.value;
	const path = currentEndpoint.innerText;
	queryParams[type] = value;
	changeGeneratedUrl(path, buildQueryParamString(path));
}

function copyToClipboard() {
	navigator.clipboard.writeText(generatedUrl.innerText);

	const i = clipboardIconContainer.querySelector("i");
	i.classList.remove("fa-copy");
	i.classList.add("fa-clipboard");
	setTimeout(() => {
		i.classList.remove("fa-clipboard");
		i.classList.add("fa-copy");
	}, 3000);
}

function hideExploreElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.explore-${elem}`).classList.add("hidden");
	});
}

function hideQueryParamElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.query-param-${elem}`).classList.add("hidden");
	});
}

function changeQueryParamsLayout(path) {
	switch (path) {
		case "/random":
			hideQueryParamElements([
				"author",
				"date",
				"character",
				"term",
				"strict",
				"matchCase",
			]);
			hideExploreElements([
				"author",
				"date",
				"character",
				"term",
				"strict",
				"matchCase",
			]);
			break;
		case "/search":
			document.querySelector(".query-param-term").classList.remove("hidden");
			hideQueryParamElements(["author", "date", "character"]);
			document.querySelector(".explore-term").classList.remove("hidden");
			hideExploreElements(["author", "date", "character"]);
			break;
		case "/browse":
			document
				.querySelector(".query-param-character")
				.classList.remove("hidden");
			hideQueryParamElements(["author", "date", "term"]);
			document.querySelector(".explore-character").classList.remove("hidden");
			hideExploreElements(["author", "date", "term"]);
			break;
		case "/author":
			document.querySelector(".query-param-author").classList.remove("hidden");
			hideQueryParamElements(["term", "date", "character"]);
			document.querySelector(".explore-author").classList.remove("hidden");
			hideExploreElements(["term", "date", "character"]);
			break;
		case "/date":
			document.querySelector(".query-param-date").classList.remove("hidden");
			hideQueryParamElements(["author", "term", "character"]);
			document.querySelector(".explore-date").classList.remove("hidden");
			hideExploreElements(["author", "term", "character"]);
			break;
	}
}

function changeGeneratedUrl(path, queryParams = "") {
	generatedUrl.innerText = baseUrl + path + queryParams;
}

endpoints.forEach((endpoint) => {
	endpoint.addEventListener("click", function (e) {
		const path = e.target.innerText;
		currentEndpoint.innerText = path;

		changeQueryParamsLayout(path);

		changeGeneratedUrl(path);
	});
});

document.addEventListener("DOMContentLoaded", () => {
	datePicker.max = new Date().toISOString().split("T")[0];
});
