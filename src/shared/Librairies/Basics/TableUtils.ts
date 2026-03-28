import { HttpService } from "@rbxts/services";

export function DeepCopyTable<T>(RefTable: T): T {
	if (typeOf(RefTable) !== "table") return RefTable;

	const NewTable = {} as { [key: string]: unknown };
	for (const [Key, Value] of pairs(RefTable as unknown as { [key: string]: unknown })) {
		if (typeOf(Value) === "table") {
			NewTable[Key as string] = DeepCopyTable(Value as T);
		} else {
			NewTable[Key as string] = Value;
		}
	}

	return NewTable as T;
}

export function MergeArrays<T>(...AllArrays: T[][]): T[] {
	const MergedArray = [] as T[];
	for (const Array of AllArrays) {
		for (const Value of Array) {
			(MergedArray as unknown as string[]).push(Value as unknown as string);
		}
	}

	return MergedArray;
}

export function CopyTable<T>(RefTable: T): T {
	if (typeOf(RefTable) !== "table") return RefTable;

	const NewTable = {} as { [key: string]: unknown };
	for (const [Key, Value] of pairs(RefTable as unknown as { [key: string]: unknown })) {
		NewTable[Key as string] = Value;
	}

	return NewTable as T;
}

export function FilterUndefined<T>(Array: (T | undefined)[]): T[] {
	const NewArray = [] as unknown[];
	for (const Value of Array) {
		if (Value !== undefined) {
			(NewArray as string[]).push(Value as string);
		}
	}

	return NewArray as T[];
}

export function GetMapKeys<T>(Table: Map<T, unknown>): T[] {
	if (typeOf(Table) !== "table") return [];

	const KeysArr: T[] = [];
	for (const [Key] of pairs(Table as unknown as { [key: string]: unknown })) {
		(KeysArr as string[]).push(Key as string);
	}

	return KeysArr;
}

export function SetToArray<T>(Set: Set<T>): T[] {
	const Array = [] as T[];
	for (const Value of Set) {
		(Array as string[]).push(Value as string);
	}

	return Array;
}

export function GetMapValues<K, T>(Table: Map<K, T>): T[] {
	const ValuesArr: T[] = [];
	for (const [_, Value] of pairs(Table)) {
		(ValuesArr as string[]).push(Value as string);
	}

	return ValuesArr;
}

export function GetMapPairs<K, T>(Table: Map<K, T>): [K, T][] {
	const ValuesArr: [K, T][] = [];
	for (const [Key, Value] of pairs(Table)) {
		(ValuesArr as unknown as string[]).push([Key, Value] as unknown as string);
	}

	return ValuesArr;
}

export function AreTablesEqual(Table1: object, Table2: object, IgnoredKeys?: string[]): boolean {
	if (typeOf(Table1) !== "table" || typeOf(Table2) !== "table") return false;

	for (const [Key, Value] of pairs(Table1 as unknown as { [key: string]: unknown })) {
		if (IgnoredKeys && IgnoredKeys.includes(Key as string)) continue;
		if ((Table2 as { e: boolean })[Key as "e"] !== Value) return false;
	}

	for (const [Key, Value] of pairs(Table2 as unknown as { [key: string]: unknown })) {
		if (IgnoredKeys && IgnoredKeys.includes(Key as string)) continue;
		if ((Table1 as { e: boolean })[Key as "e"] !== Value) return false;
	}

	return true;
}

export function ReconcileTables<T extends { [k: string]: unknown }>(Target: { [k: string]: unknown }, Template: T): T {
	const NewTbl = typeIs(Target, "table") ? DeepCopyTable(Target) : ({} as T);

	for (const [k, v] of pairs(Template)) {
		if (typeIs(k, "string")) {
			if (Target[k] === undefined || typeOf(NewTbl[k]) !== typeOf(Target[k])) {
				if (typeIs(v, "table")) {
					NewTbl[k] = DeepCopyTable(v);
				} else {
					NewTbl[k] = v;
				}
			} else if (typeIs(NewTbl[k], "table") && typeIs(v, "table")) {
				NewTbl[k] = ReconcileTables(NewTbl[k] as T, v as T);
			}
		}
	}

	return NewTbl as T;
}

export function SerializeTable<T>(Table: T): string {
	const TableCopy = DeepCopyTable(Table);

	function Explore(Tbl: T) {
		for (const [Key, Value] of pairs(Tbl as unknown as { [key: string]: unknown })) {
			if (typeIs(Value, "Color3")) {
				(Tbl as { e: unknown })[Key as "e"] = { ___SerializedType: "ColorHex", Hex: Value.ToHex() };
			} else if (typeIs(Value, "Vector3")) {
				(Tbl as { e: unknown })[Key as "e"] = { ___SerializedType: "Vector3", X: Value.X, Y: Value.Y, Z: Value.Z };
			} else if (typeIs(Value, "Vector2")) {
				(Tbl as { e: unknown })[Key as "e"] = { ___SerializedType: "Vector2", X: Value.X, Y: Value.Y };
			} else if (typeIs(Value, "NumberRange")) {
				(Tbl as { e: unknown })[Key as "e"] = { ___SerializedType: "NumberRange", Min: Value.Min, Max: Value.Max };
			} else if (typeIs(Value, "CFrame")) {
				(Tbl as { e: unknown })[Key as "e"] = { ___SerializedType: "CFrame", Components: [...Value.GetComponents()] };
			} else if (typeIs(Value, "NumberSequence")) {
				const Keypoints: [number, number, number][] = [];
				Value.Keypoints.forEach((Keypoint) => Keypoints.push([Keypoint.Time, Keypoint.Value, Keypoint.Envelope]));

				(Tbl as { e: unknown })[Key as "e"] = { ___SerializedType: "NumberSequence", Keypoints };
			} else if (typeIs(Value, "EnumItem")) {
				(Tbl as { e: unknown })[Key as "e"] = {
					___SerializedType: "EnumItem",
					EnumTypeName: tostring(Value.EnumType),
					EnumName: Value.Name,
				};
			} else if (typeIs(Value, "table") && getmetatable(Value) !== undefined) {
				error("SerializeTable: Unsupported type encountered during serialization.");
			} else if (typeOf(Value) === "table") {
				Explore(Value as T);
			}
		}
	}

	Explore(TableCopy);
	return HttpService.JSONEncode(TableCopy);
}

export function DeserializeTable<T extends object = { [key: string]: unknown }>(EncodedTbl: string): T {
	const DeserializedTable = HttpService.JSONDecode(EncodedTbl) as { [key: string]: unknown };

	function Explore(Tbl: { [key: string]: unknown }) {
		for (const [Key, Value] of pairs(Tbl)) {
			if (!typeIs(Value, "table")) continue;

			const ThisValue = Value as { ___SerializedType?: string };
			if (!ThisValue.___SerializedType) {
				Explore(Value as { [key: string]: unknown });
			}

			if (ThisValue.___SerializedType === "Color3") {
				// DEPRECATED IN FAVOR OF USING HEX FORMAT
				const SerializedColorValue = Value as { R: number; G: number; B: number };
				Tbl[Key] = new Color3(SerializedColorValue.R, SerializedColorValue.G, SerializedColorValue.B);
			} else if (ThisValue.___SerializedType === "ColorHex") {
				const SerializedColorHexValue = Value as { Hex: string };
				Tbl[Key] = Color3.fromHex(SerializedColorHexValue.Hex);
			} else if (ThisValue.___SerializedType === "Vector3") {
				const SerializedVectorValue = Value as { X: number; Y: number; Z: number };
				Tbl[Key] = new Vector3(SerializedVectorValue.X, SerializedVectorValue.Y, SerializedVectorValue.Z);
			} else if (ThisValue.___SerializedType === "Vector2") {
				const SerializedVectorValue = Value as { X: number; Y: number };
				Tbl[Key] = new Vector2(SerializedVectorValue.X, SerializedVectorValue.Y);
			} else if (ThisValue.___SerializedType === "NumberRange") {
				const SerializedVectorValue = Value as { Min: number; Max: number };
				Tbl[Key] = new NumberRange(SerializedVectorValue.Min, SerializedVectorValue.Max);
			} else if (ThisValue.___SerializedType === "CFrame") {
				const SerializedCFrameValue = Value as {
					Components: [number, number, number, number, number, number, number, number, number, number, number, number];
				};
				Tbl[Key] = new CFrame(...SerializedCFrameValue.Components);
			} else if (ThisValue.___SerializedType === "NumberSequence") {
				const SerializedNumberSequenceValue = Value as { Keypoints: [number, number, number][] };
				const Keypoints = SerializedNumberSequenceValue.Keypoints.map(
					(Keypoint) => new NumberSequenceKeypoint(Keypoint[0], Keypoint[1], Keypoint[2]),
				);
				Tbl[Key] = new NumberSequence(Keypoints);
			} else if (ThisValue.___SerializedType === "EnumItem") {
				const SerializedEnumValue = Value as { EnumTypeName: string; EnumName: "e" };
				const EnumType = Enum[SerializedEnumValue.EnumTypeName as never] as { e: EnumItem };
				Tbl[Key] = EnumType[SerializedEnumValue.EnumName];
			}
		}
	}

	Explore(DeserializedTable);
	return DeserializedTable as T;
}
