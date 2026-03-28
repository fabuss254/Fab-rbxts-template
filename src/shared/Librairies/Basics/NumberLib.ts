export namespace NumberLib {
	// @outline VARIABLES

	const Suffixes = [
		"k",
		"M",
		"B",
		"T",
		"qd",
		"Qn",
		"sx",
		"Sp",
		"O",
		"N",
		"de",
		"Ud",
		"DD",
		"tdD",
		"qdD",
		"QnD",
		"sxD",
		"SpD",
		"OcD",
		"NvD",
		"Vgn",
		"UVg",
		"DVg",
		"TVg",
		"qtV",
		"QnV",
		"SeV",
		"SPG",
		"OVG",
		"NVG",
		"TGN",
		"UTG",
		"DTG",
		"tsTG",
		"qtTG",
		"QnTG",
		"ssTG",
		"SpTG",
		"OcTG",
		"NoTG",
		"QdDR",
		"uQDR",
		"dQDR",
		"tQDR",
		"qdQDR",
		"QnQDR",
		"sxQDR",
		"SpQDR",
		"OQDDr",
		"NQDDr",
		"qQGNT",
		"uQGNT",
		"dQGNT",
		"tQGNT",
		"qdQGNT",
		"QnQGNT",
		"sxQGNT",
		"SpQGNT",
		"OQQGNT",
		"NQQGNT",
		"SXGNTL",
	];

	// @outline FUNCTIONS

	export function ToCommas(Num: number): string {
		return tostring(Num).reverse().gsub("%d%d%d", "%1,")[0].reverse().gsub("^,", "")[0];
	}

	export function ToShort(Input: number) {
		const IsNegative = Input < 0;
		Input = math.abs(Input);

		let InputStr = "";

		let Paired = false;
		for (const [i, v] of pairs(Suffixes)) {
			if (Input < 10 ** (3 * i)) {
				Input = Input / 10 ** (3 * (i - 1));
				const IsComplex = tostring(Input).find(".") && tostring(Input).sub(4, 4) !== ".";
				InputStr = tostring(Input).sub(1, (IsComplex && 4) || 3) + (Suffixes[i - 2] || "");
				Paired = true;
				break;
			}
		}

		if (!Paired) {
			const Rounded = math.floor(Input);
			InputStr = tostring(Rounded);
		}

		if (IsNegative) {
			return "-" + InputStr;
		}
		return InputStr;
	}

	export function ShortenTime(TimeInSec: number, ShowFull?: boolean) {
		let FullTime: string[] = [];

		const Days = math.floor(TimeInSec / 86400);
		const Hours = math.floor((TimeInSec % 86400) / 3600);
		const Minutes = math.floor((TimeInSec % 3600) / 60);
		const Seconds = math.floor(TimeInSec % 60);

		// Gets all of the time elements
		if (Days > 0) {
			FullTime.push(Days + "d");
		}

		if (Hours > 0) {
			FullTime.push(Hours + "h");
		}

		if (Minutes > 0) {
			FullTime.push(Minutes + "m");
		}

		if (Seconds > 0) {
			FullTime.push(Seconds + "s");
		}

		if (FullTime.size() === 0) {
			return "0s";
		}

		// Only retrieve the first 2 elements
		if (!ShowFull && FullTime.size() > 2) FullTime = [FullTime[0], FullTime[1]];
		return FullTime.join(" ");
	}

	export function Increment(Value: number, Inc: number, Fn: "floor" | "ceil" | "round" = "round") {
		return math[Fn](Value / Inc) * Inc;
	}
}
