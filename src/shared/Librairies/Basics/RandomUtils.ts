import { GetRandom } from "./Common";
import { _FL } from "./LibUtils";
import { CopyTable, GetMapValues } from "./TableUtils";

export namespace RandomUtils {
	// @outline TYPES

	export type T_WeightedRandomTable<T> = typeof WeightedRandomInstance<T>;

	// @outline CLASSES

	class WeightedRandomInstance<T> {
		// PROPERTIES
		private Weights: Map<T, [Weight: number, LuckInfluence: number]> = new Map();

		// CONSTRUCTOR
		constructor() {}

		// PRIVATE METHODS

		// METHODS
		Add(Value: T, Weight: number, LuckInfluence: number = 0) {
			this.Weights.set(Value, [Weight, LuckInfluence]);
			return this;
		}

		Remove(Value: T) {
			this.Weights.delete(Value);

			return this;
		}

		GetWeights(LuckMultiplier: number = 1): [T, number][] {
			const Result: [T, number][] = [];
			for (const [Value, [Weight, LuckInfluence]] of this.Weights) {
				Result.push([Value, math.max(0, Weight + Weight * (LuckInfluence * (LuckMultiplier - 1)))]);
			}
			return Result;
		}

		PrintWeights(LuckMultiplier: number = 1) {
			const Weights = this.GetWeights(LuckMultiplier);
			const TotalWeight = Weights.reduce((a, b) => a + b[1], 0);

			print("--- // Weighted Random Table // ---");
			print("Luck Multiplier: " + LuckMultiplier);
			print("Total Weight: " + TotalWeight);
			Weights.sort((a, b) => b[1] < a[1]);
			Weights.forEach(([Value, Weight]) => {
				print(`${Value}: ${string.format("%.2f", (Weight / TotalWeight) * 100)}% (${Weight})`);
			});
			print("-------------------------------");
		}

		Roll(LuckMultiplier: number = 1): T {
			const Weights = this.GetWeights(LuckMultiplier);
			const TotalWeight = Weights.reduce((a, b) => a + b[1], 0);
			const RandomValue = GetRandom().NextNumber() * TotalWeight;

			let CurrentWeight = 0;
			for (const [Item, Weight] of Weights) {
				CurrentWeight += Weight;
				if (RandomValue <= CurrentWeight) {
					return Item;
				}
			}
			throw error("WeightedRandom: No item selected");
		}
	}

	// @outline FUNCTIONS

	export function CreateWeightedRandomTable<T>() {
		return new WeightedRandomInstance<T>();
	}

	export function SimpleWeightedRandom<T>(WeightTable: Map<T, number>, RNG: Random = GetRandom()): T {
		const TotalWeight = GetMapValues(WeightTable).reduce((a, b) => a + b, 0);
		const RandomValue = RNG.NextNumber() * TotalWeight;

		let CurrentWeight = 0;
		for (const [Item, Weight] of WeightTable) {
			CurrentWeight += Weight;
			if (RandomValue <= CurrentWeight) {
				return Item;
			}
		}
		throw error("WeightedRandom: No item selected");
	}

	export function FromArray<T>(TheArray: T[], RNG = GetRandom()): T {
		return TheArray[RNG.NextInteger(0, TheArray.size() - 1)];
	}

	export function ShuffleArray<T>(TheArray: T[], RNG = GetRandom()): T[] {
		const ArrayCopy = CopyTable(_FL(TheArray));
		for (let i = ArrayCopy.size() - 1; i > 0; i--) {
			const j = RNG.NextInteger(0, i);
			[ArrayCopy[i], ArrayCopy[j]] = [ArrayCopy[j], ArrayCopy[i]];
		}
		return ArrayCopy;
	}
}
