import fs from "fs";
import path from "path";
import fse from "fs-extra";
import csv from "csv-parser";

const csvFile = "./websites.csv";
const templateDir = "./react-template";
const buildDir = "./build";

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

const websites = [];

// --- Spintax helper (for Hero section) ---
function randomResolve(text) {
	return text.replace(/\[\[([^\]]+)\]\]/g, (_, group) => {
		const choices = group.split("|").map((s) => s.trim());
		return choices[Math.floor(Math.random() * choices.length)];
	});
}

// --- Replace {{placeholder}} with CSV value ---
function replacePlaceholders(content, row) {
	for (const key in row) {
		const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g"); // spaces handled
		content = content.replace(regex, row[key]);
	}
	content = randomResolve(content);
	return content;
}

// --- Windows-safe copy function (ignore node_modules, .git, package-lock.json) ---
function copyTemplateSafe(src, dest) {
	fse.copySync(src, dest, {
		overwrite: true,
		errorOnExist: false,
		recursive: true,
		filter: (srcPath) => {
			const basename = path.basename(srcPath);
			if (
				basename === "node_modules" ||
				basename === ".git" ||
				basename === "package-lock.json"
			) {
				return false;
			}
			return true;
		},
	});
}

// --- Read CSV and generate apps ---
fs.createReadStream(csvFile)
	.pipe(csv())
	.on("data", (row) => websites.push(row))
	.on("end", () => {
		console.log("CSV loaded:", websites);

		websites.forEach((site) => {
			const siteDir = path.join(buildDir, site.domain);

			// Copy template
			copyTemplateSafe(templateDir, siteDir);

			// Hero section
			const heroPath = path.join(siteDir, "src/HeadingHero.jsx");
			if (fs.existsSync(heroPath)) {
				let heroContent = fs.readFileSync(heroPath, "utf-8");
				heroContent = replacePlaceholders(heroContent, site);
				fs.writeFileSync(heroPath, heroContent);
				console.log(`✅ ${site.domain}: Hero updated`);
			}

			// Contact section
			const contactPath = path.join(siteDir, "src/HeadingContact.jsx");
			if (fs.existsSync(contactPath)) {
				let contactContent = fs.readFileSync(contactPath, "utf-8");
				contactContent = replacePlaceholders(contactContent, site);
				fs.writeFileSync(contactPath, contactContent);
				console.log(`✅ ${site.domain}: Contact updated`);
			}

			console.log(`✅ ${site.domain} build ready!`);
		});

		console.log("🎉 All apps generated successfully!");
	});
