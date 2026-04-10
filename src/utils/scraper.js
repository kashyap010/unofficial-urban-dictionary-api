const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { getPreviousDate } = require("../utils/dateUtils");

// Helper function to parse numbers that might contain commas
function parseNumber(str) {
	return Number(str.replace(/,/g, "")) || 0;
}

// Fetch page using persistent Puppeteer browser session
async function fetchWithPuppeteer(url, browser = null) {
	let shouldCloseBrowser = false;
	try {
		if (!browser) {
			browser = await puppeteer.launch({
				headless: "new",
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			});
			shouldCloseBrowser = true;
		}
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
		const html = await page.content();
		await page.close();
		
		if (shouldCloseBrowser) {
			await browser.close();
		}
		return html;
	} catch (e) {
		if (shouldCloseBrowser && browser) await browser.close();
		throw e;
	}
}

function extractDetails($, el) {
	const upvotes = $(el).find('[data-x-text="upCount"]').first().text().trim();
	const downvotes = $(el).find('[data-x-text="downCount"]').first().text().trim();

	return {
		word: $(el).find(".word").prop("innerText"),
		meaning: $(el).find(".meaning").prop("innerText"),
		example: $(el).find(".example").prop("innerText"),
		contributor: $(el).find(".contributor a").prop("innerText"),
		date: $(el).find(".contributor").contents()[2].data.trim(),
		thumbs_up: parseNumber(upvotes),
		thumbs_down: parseNumber(downvotes),
		score: parseNumber(upvotes) - parseNumber(downvotes),
	};
}

async function scraper(
	path,
	{
		term,
		author,
		date,
		strict,
		limit,
		matchCase,
		character,
		scrapeType = "search",
		page,
		multiPage,
	} = {}
) {
	try {
		const baseUrl = "https://www.urbandictionary.com";
		let fixedUrl = `${baseUrl}/${path}`;
		if (scrapeType === "search") fixedUrl += term ? `?term=${term}` : "";
		else if (scrapeType === "browse")
			fixedUrl += /^\d{4}-\d{2}-\d{2}$/.test(character)
				? `?date=${character}`
				: `?character=${character}`;
		else if (scrapeType === "author") fixedUrl += `?author=${author}`;
		else if (scrapeType === "date") fixedUrl += `?date=${date}`;

		// Use Puppeteer to render JavaScript (for vote counts)
		let html;
		let isFirstPage = true;
		try {
			html = await fetchWithPuppeteer(fixedUrl);
		} catch (puppeteerError) {
			const { data } = await axios.get(fixedUrl, { validateStatus: false });
			html = data;
			isFirstPage = false;
		}
		
		let $ = cheerio.load(html);

		if (scrapeType === "search" && !$(".definition").length)
			return { term, data: [] };
		if (scrapeType === "author" && !$(".definition").length)
			return { author, data: [] };

		if (scrapeType === "search" && path != "random.php") {
			const firstWord = $(".definition")
				.first()
				.find(".word")
				.prop("innerText");
			if (firstWord !== term && JSON.parse(matchCase)) return [];
			else if (firstWord !== term) term = firstWord;
		}

		let currentPage, maxPage;
		if (page !== "false") {
			[currentPage, maxPage] =
				multiPage === "false"
					? [page, page].map((i) => parseInt(i))
					: multiPage.split("-").map((i) => parseInt(i)); // single page : override
		} else {

			[currentPage, maxPage] = [1, 1]; 
		}

		const $last = $("div[aria-label='Pagination'] a[aria-label='Last page']");
		const totalPages = $last.attr("href")
			? $last.attr("href").match(/page=(\d+)/)[1]
			: 1;

		const results = [];
		let breakLoop = false;
		let dateChanged = false;
		while (currentPage <= maxPage) {
			if (currentPage > 1 || dateChanged) {
				let url = `${baseUrl}/${path}`;
				if (scrapeType === "search") url += term ? `?term=${term}` : "";
				else if (scrapeType === "browse")
					url += /^\d{4}-\d{2}-\d{2}$/.test(character)
						? `?date=${character}`
						: `?character=${character}`;
				else if (scrapeType === "author") url += `?author=${author}`;
				else if (scrapeType === "date") url += `?date=${date}`;
				url += `&page=${currentPage}`;

				try {
					html = await fetchWithPuppeteer(url);
				} catch (puppeteerError) {
					const { data } = await axios.get(url, { validateStatus: false });
					html = data;
				}
				$ = cheerio.load(html);
			}

			if (scrapeType === "search" || scrapeType === "author") {
				const $definitions = $(".definition");
				$definitions.each((idx, el) => {
					const word = $(el).find(".word").prop("innerText");
					if (
						scrapeType === "author" &&
						JSON.parse(strict) &&
						word.toLowerCase() != term.toLowerCase()
					)
						return;
					else if (
						scrapeType === "author" &&
						JSON.parse(matchCase) &&
						word != term
					)
						return;

					const defn = extractDetails($, el);
					results.push(defn);

					if (
						(limit !== "none" && results.length === parseInt(limit)) ||
						!$definitions.length
					) {
						breakLoop = true;
						return false;
					}
				});
			} else if (scrapeType === "browse" || scrapeType === "date") {
				const $ul = $("main").find("ul").first().children("li");
				if (
					scrapeType !== "date" &&
					/^\d{4}-\d{2}-\d{2}$/.test(character) &&
					!results.length &&
					!$ul.length
				) {
					character = getPreviousDate(character);
					dateChanged = true;
					continue;
				}

				$ul.each((idx, li) => {
					const word = $(li).find("a").text();
					results.push(word);

					if (
						(limit !== "none" && results.length === parseInt(limit)) ||
						!$ul.length
					) {
						breakLoop = true;
						return false;
					}
				});
			}
			if (breakLoop) break;

			dateChanged = false;
			currentPage++;
		}

		let response = {};

		if (scrapeType === "search" && term) response["term"] = term;
		else if (scrapeType === "browse")
			response["character"] = /^\d{4}-\d{2}-\d{2}$/.test(character)
				? "new"
				: character;
		else if (scrapeType === "author") response["author"] = author;
		else if (scrapeType === "date") response["date"] = date;

		response = {
			...response,
			found: results.length ? true : false,
			params: {
				strict,
				limit,
				matchCase,
				character,
				scrapeType,
				page,
				multiPage,
			},
			totalPages,
			data: results,
		};
		return response;
	} catch (e) {
		console.log("Scraping error\n", e);
		return e;
	}
}

module.exports = scraper;
