<script lang="ts">
import QRCode from "qrcode";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import I18nKey from "../../i18n/i18nKey";
import { i18n } from "../../i18n/translation";

export let title: string;
export let author: string;
export let category: string | null = null;
export let wordCount: number | null = null;
export let pubDate: string;
export let coverImage: string | null = null;
export let url: string;
export let siteTitle: string;
export let avatar: string | null = null;

let showModal = false;
let posterImage: string | null = null;
let generating = false;
let themeColor = "#558e88"; // Default blue

onMount(() => {
	// Get theme color from CSS variable
	const temp = document.createElement("div");
	temp.style.color = "var(--primary)";
	temp.style.display = "none";
	document.body.appendChild(temp);
	const computedColor = getComputedStyle(temp).color;
	document.body.removeChild(temp);

	if (computedColor) {
		themeColor = computedColor;
	}
});

function loadImage(src: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => {
			if (!src.includes("images.weserv.nl")) {
				const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&output=png`;
				const proxyImg = new Image();
				proxyImg.crossOrigin = "anonymous";
				proxyImg.onload = () => resolve(proxyImg);
				proxyImg.onerror = () => {
					resolve(null);
				};
				proxyImg.src = proxyUrl;
			} else {
				resolve(null);
			}
		};
		img.src = src;
	});
}

function getLines(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxLines = Number.POSITIVE_INFINITY,
): string[] {
	const chars = normalizeText(text).split("");
	const lines: string[] = [];
	let currentLine = "";

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		const width = ctx.measureText(currentLine + char).width;
		if (width <= maxWidth || currentLine === "") {
			currentLine += char;
		} else {
			lines.push(currentLine);
			currentLine = char;
		}
	}
	if (currentLine) {
		lines.push(currentLine);
	}
	if (lines.length <= maxLines) return lines;

	const clampedLines = lines.slice(0, maxLines);
	const lastIndex = clampedLines.length - 1;
	clampedLines[lastIndex] = ellipsizeText(
		ctx,
		clampedLines[lastIndex],
		maxWidth,
	);
	return clampedLines;
}

function normalizeText(text: string): string {
	return text.trim().replace(/\s+/g, " ");
}

function ellipsizeText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
): string {
	if (ctx.measureText(text).width <= maxWidth) return text;

	let output = text;
	while (
		output.length > 0 &&
		ctx.measureText(`${output}...`).width > maxWidth
	) {
		output = output.slice(0, -1);
	}
	return output ? `${output}...` : "";
}

function drawTextLine(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
) {
	const output = ellipsizeText(ctx, text, maxWidth);
	if (output) {
		ctx.fillText(output, x, y);
	}
}

function drawRightTextLine(
	ctx: CanvasRenderingContext2D,
	text: string,
	rightX: number,
	y: number,
	maxWidth: number,
) {
	const output = ellipsizeText(ctx, text, maxWidth);
	if (!output) return;

	ctx.save();
	ctx.textAlign = "right";
	ctx.fillText(output, rightX, y);
	ctx.restore();
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function fillRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	drawRoundedRect(ctx, x, y, width, height, radius);
	ctx.fill();
}

function parsePosterDate(): {
	day: string;
	month: string;
	year: string;
} | null {
	try {
		const d = new Date(pubDate);
		if (Number.isNaN(d.getTime())) return null;
		return {
			day: d.getDate().toString().padStart(2, "0"),
			month: (d.getMonth() + 1).toString().padStart(2, "0"),
			year: d.getFullYear().toString(),
		};
	} catch {
		return null;
	}
}

function formatWordCount(): string {
	if (typeof wordCount !== "number" || !Number.isFinite(wordCount)) return "";
	return `${Math.max(0, Math.round(wordCount))} ${i18n(I18nKey.wordsCount)}`;
}

function drawCoverImage(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	const imageRatio = image.width / image.height;
	const targetRatio = width / height;
	let sx: number;
	let sy: number;
	let sourceWidth: number;
	let sourceHeight: number;

	if (imageRatio > targetRatio) {
		sourceHeight = image.height;
		sourceWidth = sourceHeight * targetRatio;
		sx = (image.width - sourceWidth) / 2;
		sy = 0;
	} else {
		sourceWidth = image.width;
		sourceHeight = sourceWidth / targetRatio;
		sx = 0;
		sy = (image.height - sourceHeight) / 2;
	}

	ctx.save();
	drawRoundedRect(ctx, x, y, width, height, radius);
	ctx.clip();
	ctx.drawImage(image, sx, sy, sourceWidth, sourceHeight, x, y, width, height);
	ctx.restore();
}

async function generatePoster() {
	showModal = true;
	if (posterImage) return;

	generating = true;
	try {
		const scale = 2;
		const width = 425 * scale;
		const padding = 26 * scale;

		const qrCodeUrl = await QRCode.toDataURL(url, {
			margin: 1,
			width: 100 * scale,
			color: { dark: "#000000", light: "#ffffff" },
		});
		const [qrImg, coverImg, avatarImg] = await Promise.all([
			loadImage(qrCodeUrl),
			coverImage ? loadImage(coverImage) : Promise.resolve(null),
			avatar ? loadImage(avatar) : Promise.resolve(null),
		]);

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas context not available");

		canvas.width = width;
		canvas.height = 1000 * scale;

		const contentWidth = width - padding * 2;
		const coverX = padding;
		const coverY = padding;
		const coverWidth = contentWidth;
		const coverHeight = (coverImg ? 206 : 150) * scale;
		const coverRadius = 16 * scale;
		const titleX = padding + 14 * scale;
		const titleWidth = contentWidth - 14 * scale;
		const dateObj = parsePosterDate();
		const metaText = [normalizeText(category || ""), formatWordCount()]
			.filter(Boolean)
			.join(" / ");

		ctx.font = `700 ${24 * scale}px 'Roboto', sans-serif`;
		const titleLines = getLines(ctx, title, titleWidth, 3);
		const titleLineHeight = 31 * scale;
		const titleHeight = titleLines.length * titleLineHeight;

		const metaGap = metaText ? 14 * scale : 8 * scale;
		const metaHeight = metaText ? 20 * scale : 0;

		const contentStartY = coverY + coverHeight + 24 * scale;
		const afterTitleY = contentStartY + titleHeight;
		const afterMetaY = afterTitleY + metaGap + metaHeight;
		const dividerY = afterMetaY + 24 * scale;
		const footerY = dividerY + 18 * scale;
		const footerHeight = 82 * scale;

		canvas.height = footerY + footerHeight + padding;

		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (coverImg) {
			ctx.save();
			ctx.shadowColor = "rgba(15, 23, 42, 0.16)";
			ctx.shadowBlur = 16 * scale;
			ctx.shadowOffsetY = 8 * scale;
			ctx.fillStyle = "#ffffff";
			fillRoundedRect(
				ctx,
				coverX,
				coverY,
				coverWidth,
				coverHeight,
				coverRadius,
			);
			ctx.restore();
			drawCoverImage(
				ctx,
				coverImg,
				coverX,
				coverY,
				coverWidth,
				coverHeight,
				coverRadius,
			);
		} else {
			ctx.save();
			const gradient = ctx.createLinearGradient(
				coverX,
				coverY,
				coverX + coverWidth,
				coverY + coverHeight,
			);
			gradient.addColorStop(0, "#f8fafc");
			gradient.addColorStop(1, "#eef2f7");
			ctx.fillStyle = gradient;
			fillRoundedRect(
				ctx,
				coverX,
				coverY,
				coverWidth,
				coverHeight,
				coverRadius,
			);
			ctx.globalAlpha = 0.18;
			ctx.fillStyle = themeColor;
			fillRoundedRect(
				ctx,
				coverX,
				coverY,
				coverWidth,
				coverHeight,
				coverRadius,
			);
			ctx.restore();
		}

		if (dateObj) {
			const dateBoxW = 64 * scale;
			const dateBoxH = 56 * scale;
			const dateBoxX = coverX + 14 * scale;
			const dateBoxY = coverY + coverHeight - dateBoxH - 14 * scale;

			ctx.fillStyle = "rgba(17, 24, 39, 0.48)";
			fillRoundedRect(ctx, dateBoxX, dateBoxY, dateBoxW, dateBoxH, 12 * scale);

			ctx.fillStyle = "#ffffff";
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.font = `700 ${28 * scale}px 'Roboto', sans-serif`;
			ctx.fillText(dateObj.day, dateBoxX + dateBoxW / 2, dateBoxY + 6 * scale);

			ctx.font = `${11 * scale}px 'Roboto', sans-serif`;
			ctx.fillText(
				`${dateObj.year}.${dateObj.month}`,
				dateBoxX + dateBoxW / 2,
				dateBoxY + 38 * scale,
			);
		}

		let drawY = contentStartY;

		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.save();
		ctx.fillStyle = themeColor;
		fillRoundedRect(
			ctx,
			padding,
			drawY + 4 * scale,
			4 * scale,
			Math.max(20 * scale, Math.min(titleHeight - 8 * scale, 58 * scale)),
			2 * scale,
		);
		ctx.restore();

		ctx.font = `700 ${24 * scale}px 'Roboto', sans-serif`;
		ctx.fillStyle = "#111827";
		titleLines.forEach((line) => {
			ctx.fillText(line, titleX, drawY);
			drawY += titleLineHeight;
		});

		if (metaText) {
			drawY += metaGap;
			ctx.font = `500 ${13 * scale}px 'Roboto', sans-serif`;
			ctx.fillStyle = "#667085";
			drawTextLine(ctx, metaText, titleX, drawY, titleWidth);
		}

		ctx.beginPath();
		ctx.strokeStyle = "#edf0f5";
		ctx.lineWidth = 1 * scale;
		ctx.moveTo(padding, dividerY);
		ctx.lineTo(width - padding, dividerY);
		ctx.stroke();

		const qrSize = 62 * scale;
		const qrX = width - padding - qrSize;
		const qrY = footerY + (footerHeight - qrSize) / 2;
		const avatarSize = 52 * scale;
		const avatarX = padding;
		const avatarY = footerY + (footerHeight - avatarSize) / 2;
		const textGroupHeight = 40 * scale;
		const textGroupY = footerY + (footerHeight - textGroupHeight) / 2;

		if (avatarImg) {
			ctx.save();

			ctx.beginPath();
			ctx.arc(
				avatarX + avatarSize / 2,
				avatarY + avatarSize / 2,
				avatarSize / 2,
				0,
				Math.PI * 2,
			);
			ctx.closePath();
			ctx.clip();

			ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
			ctx.restore();

			ctx.beginPath();
			ctx.arc(
				avatarX + avatarSize / 2,
				avatarY + avatarSize / 2,
				avatarSize / 2,
				0,
				Math.PI * 2,
			);
			ctx.strokeStyle = "#f8fafc";
			ctx.lineWidth = 2 * scale;
			ctx.stroke();
		}

		const authorTextX = padding + (avatarImg ? 52 * scale + 14 * scale : 0);
		const footerSiteTitle = normalizeText(siteTitle);
		const siteInfoRightX = qrX - 14 * scale;
		const siteTextWidth = 106 * scale;
		const siteInfoLeftX = siteInfoRightX - siteTextWidth;
		const footerTextWidth = siteInfoLeftX - 18 * scale - authorTextX;
		const labelY = textGroupY;
		const authorY = textGroupY + 22 * scale;

		ctx.textAlign = "left";
		ctx.fillStyle = "#9ca3af";
		ctx.font = `${12 * scale}px 'Roboto', sans-serif`;
		drawTextLine(
			ctx,
			i18n(I18nKey.author),
			authorTextX,
			labelY,
			footerTextWidth,
		);

		ctx.fillStyle = "#1f2937";
		ctx.font = `700 ${18 * scale}px 'Roboto', sans-serif`;
		drawTextLine(ctx, author, authorTextX, authorY, footerTextWidth);

		ctx.fillStyle = "#9ca3af";
		ctx.font = `${12 * scale}px 'Roboto', sans-serif`;
		drawRightTextLine(
			ctx,
			i18n(I18nKey.scanToRead),
			siteInfoRightX,
			textGroupY,
			siteTextWidth,
		);

		ctx.fillStyle = "#1f2937";
		ctx.font = `700 ${16 * scale}px 'Roboto', sans-serif`;
		drawRightTextLine(
			ctx,
			footerSiteTitle || siteTitle,
			siteInfoRightX,
			textGroupY + 22 * scale,
			siteTextWidth,
		);

		ctx.fillStyle = "#ffffff";
		ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
		ctx.shadowBlur = 8 * scale;
		ctx.shadowOffsetY = 2 * scale;
		fillRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 10 * scale);
		ctx.shadowColor = "transparent";
		ctx.strokeStyle = "#edf0f5";
		ctx.lineWidth = 1 * scale;
		drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 10 * scale);
		ctx.stroke();

		const qrInnerSize = 54 * scale;
		const qrPadding = (qrSize - qrInnerSize) / 2;
		if (qrImg) {
			ctx.drawImage(
				qrImg,
				qrX + qrPadding,
				qrY + qrPadding,
				qrInnerSize,
				qrInnerSize,
			);
		}

		posterImage = canvas.toDataURL("image/png");
		generating = false;
	} catch (error) {
		console.error("Failed to generate poster:", error);
		generating = false;
	}
}

function downloadPoster() {
	if (posterImage) {
		const a = document.createElement("a");
		a.href = posterImage;
		a.download = `poster-${title.replace(/\s+/g, "-")}.png`;
		a.click();
	}
}

function closeModal() {
	showModal = false;
}

let copied = false;
function copyLink() {
	navigator.clipboard.writeText(url);
	copied = true;
	setTimeout(() => {
		copied = false;
	}, 2000);
}

function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		},
	};
}
</script>

<!-- Trigger Button -->
<button 
  class="btn-regular rounded-lg h-12 px-6 gap-2 hover:scale-105 active:scale-95 whitespace-nowrap"
  on:click={generatePoster}
  aria-label="Generate Share Poster"
>
  <Icon icon="material-symbols:share" size="md" />
  <span>{i18n(I18nKey.shareArticle)}</span>
</button>



<!-- Modal -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div use:portal class="fixed inset-0 z-9999 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 transition-opacity" on:click={closeModal}>
    <div class="bg-(--card-bg) rounded-(--radius-large) max-w-[440px] w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl transform transition-all border border-(--line-divider)" on:click={(e) => e.stopPropagation()}>
      
      <div class="p-5 sm:p-6 flex justify-center bg-(--btn-plain-bg-hover) min-h-[200px] items-center">
        {#if posterImage}
          <img src={posterImage} alt="Poster" class="max-w-full h-auto shadow-xl rounded-xl" />
        {:else}
           <div class="flex flex-col items-center gap-3">
             <div class="w-8 h-8 border-2 border-black/10 dark:border-white/10 rounded-full animate-spin" style="border-top-color: {themeColor}"></div>
             <span class="text-sm text-50">{i18n(I18nKey.generatingPoster)}</span>
           </div>
        {/if}
      </div>
      
      <div class="p-4 border-t border-(--line-divider) grid grid-cols-2 gap-3">
        <button 
          class="btn-regular h-12 rounded-lg font-medium active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          on:click={copyLink}
        >
          {#if copied}
            <Icon icon="material-symbols:check" size="md" />
            <span>{i18n(I18nKey.copied)}</span>
          {:else}
            <Icon icon="material-symbols:link" size="md" />
            <span>{i18n(I18nKey.copyLink)}</span>
          {/if}
        </button>
        <button 
          class="h-12 text-white dark:text-black/70 rounded-lg font-medium active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95"
          style="background-color: {themeColor};"
          on:click={downloadPoster}
          disabled={!posterImage}
        >
          <Icon icon="material-symbols:download" size="md" />
          {i18n(I18nKey.savePoster)}
        </button>
      </div>
    </div>
  </div>
{/if}
