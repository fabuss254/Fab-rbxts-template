export namespace Richtext {
	// @outline TYPES

	type AllFontNames =
		| "Accanthis ADF Std"
		| "Amatic SC"
		| "Arial"
		| "Arial (Legacy)"
		| "Arimo"
		| "Balthazar"
		| "Bangers"
		| "Builder Sans"
		| "Comic Neue Angular"
		| "Creepster"
		| "Denk One"
		| "Fondamento"
		| "Fredoka One"
		| "Gotham SSm"
		| "Grenze Gotisch"
		| "Guru"
		| "Highway Gothic"
		| "Inconsolata"
		| "Indie Flower"
		| "Josefin Sans"
		| "Jura"
		| "Kalam"
		| "Luckiest Guy"
		| "Merriweather"
		| "Michroma"
		| "Montserrat"
		| "Nunito"
		| "Oswald"
		| "Patrick Hand"
		| "Permanent Marker"
		| "Press Start 2P"
		| "Roboto"
		| "Roboto Condensed"
		| "Roboto Mono"
		| "Roman Antique"
		| "Sarpanch"
		| "Source Sans Pro"
		| "Special Elite"
		| "Titillium Web"
		| "Ubuntu"
		| "Zekton";

	// @outline FUNCTIONS

	export function Color(NewColor: Color3, Text: string): string {
		const RGBString = `#${NewColor.ToHex()}`;
		return `<font color="${RGBString}">${Text}</font>`;
	}

	export function Bold(Text: string): string {
		return `<b>${Text}</b>`;
	}

	export function Italic(Text: string): string {
		return `<i>${Text}</i>`;
	}

	export function Underline(Text: string): string {
		return `<u>${Text}</u>`;
	}

	export function StrikeThrough(Text: string): string {
		return `<s>${Text}</s>`;
	}

	export function Size(Size: number, Text: string): string {
		return `<font size="${Size}">${Text}</font>`;
	}

	export function Font(Font: AllFontNames, Text: string): string {
		return `<font face="${Font}">${Text}</font>`;
	}

	export function Weight(Weight: Enum.FontWeight, Text: string): string {
		return `<font weight="${Weight.Name}">${Text}</font>`;
	}

	export function Transparency(Transparency: number, Text: string): string {
		return `<font transparency="${Transparency}">${Text}</font>`;
	}

	export function Stroke(
		Color: Color3,
		Joins: Enum.LineJoinMode,
		Thickness: number,
		Transparency: number,
		Text: string,
	): string {
		const RGBString = `rgb(${math.floor(Color.R * 255 + 0.5)}, ${math.floor(Color.G * 255 + 0.5)}, ${math.floor(Color.B * 255 + 0.5)})`;
		return `<stroke color="${RGBString}" joins="${Joins.Name}" thickness="${Thickness}" transparency="${Transparency}">${Text}</stroke>`;
	}

	export function LineBreak(): string {
		return `<br/>`;
	}

	export function SanitizeForDisplay(Text: string): string {
		return Text.gsub("<", "&lt;")[0].gsub(">", "&gt;")[0];
	}

	export function Sanitize(Text: string): string {
		return Text.gsub("<br/>", "\n")[0].gsub("<[^<>]->", "")[0];
	}

	export function IsRichText(Text: string): boolean {
		return Text !== Richtext.Sanitize(Text);
	}

	export function Mark(NewColor: Color3, Transparency: number, Text: string): string {
		const RGBString = `#${NewColor.ToHex()}`;
		return `<mark color="${RGBString}" transparency="${Transparency}">${Text}</mark>`;
	}

	// PIXEL HUNTER SPECIALS

	export function Highlight1(Text: string): string {
		return `<font color="rgb(255, 244, 125)">${Text}</font>`;
	}

	export function TextToColor(Text: string): Color3 | undefined {
		const SingleNum = tonumber(Text);
		if (SingleNum !== undefined) {
			return Color3.fromRGB(SingleNum, SingleNum, SingleNum);
		}

		if (Text.find(",")[0] !== undefined) {
			const [R, G, B] = Text.split(",").map((x) => tonumber(x) ?? 0);
			return Color3.fromRGB(R, G, B);
		}

		const [Success, Color] = pcall(() => Color3.fromHex(Text));
		if (Success) {
			return Color;
		}
	}
}
