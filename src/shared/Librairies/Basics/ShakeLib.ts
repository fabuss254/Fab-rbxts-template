import { TweenService } from "@rbxts/services";
import { GetRandom } from "./Common";

export namespace ShakeLib {
	// @outline TYPES

	type ShakeInstance = {
		StartTime: number;
		FadeIn: number;
		Enveloppe: number;
		FadeOut: number;
		Frequency: number;
		MaxRotation: number;

		RNGs?: number[];
	};

	// @outline VARIABLES

	const CurrentShakes: Map<number, ShakeInstance> = new Map();

	// @outline PUBLIC FUNCTIONS

	export function PerformShake(
		RotationMagnitude: number,
		FadeIn: number,
		Enveloppe: number,
		FadeOut: number,
		Frequence: number = 40,
	): number {
		// Create the instance
		const Shake: ShakeInstance = {
			StartTime: os.clock(),
			FadeIn,
			Enveloppe,
			FadeOut,
			Frequency: Frequence,
			MaxRotation: RotationMagnitude,
		};

		// Retrieve a unique ID for the shake
		let ID = GetRandom().NextNumber(0, 0xffffff);
		while (CurrentShakes.has(ID)) {
			ID = GetRandom().NextNumber(0, 0xffffff);
		}

		// Add the shake to the current shakes
		CurrentShakes.set(ID, Shake);
		return ID;
	}

	export function PerformShakeByDistance(
		Position: Vector3,
		MinDistance: number,
		MaxDistance: number,
		RotationMagnitude: number,
		FadeIn: number,
		Enveloppe: number,
		FadeOut: number,
		Frequence: number = 30,
	) {
		const Camera = game.GetService("Workspace").CurrentCamera!;
		const Distance = Camera.CFrame.Position.sub(Position).Magnitude;
		if (Distance > MaxDistance) return;

		const Alpha = 1 - math.clamp((Distance - MinDistance) / (MaxDistance - MinDistance), 0, 1);
		return PerformShake(RotationMagnitude * Alpha, FadeIn, Enveloppe, FadeOut, Frequence);
	}

	export function StopShakeByID(ID: number) {
		CurrentShakes.delete(ID);
	}

	export function IsActive(ID: number): boolean {
		return CurrentShakes.has(ID);
	}

	export function AnyShakeActive(): boolean {
		return CurrentShakes.size() > 0;
	}

	export function GetShakeRotationCF(): CFrame {
		const CurAngles = { X: 0, Y: 0, Z: 0 };

		CurrentShakes.forEach((Shake, ID) => {
			const Elapsed = os.clock() - Shake.StartTime;
			let Alpha = 0;

			if (Elapsed > Shake.FadeIn + Shake.Enveloppe + Shake.FadeOut) {
				CurrentShakes.delete(ID);
				return;
			} else if (Elapsed < Shake.FadeIn) {
				Alpha = TweenService.GetValue(math.clamp(Elapsed / Shake.FadeIn, 0, 1), Enum.EasingStyle.Quad, Enum.EasingDirection.In);
			} else if (Elapsed < Shake.FadeIn + Shake.Enveloppe) {
				Alpha = 1;
			} else if (Elapsed < Shake.FadeIn + Shake.Enveloppe + Shake.FadeOut) {
				Alpha = TweenService.GetValue(
					math.clamp(1 - (Elapsed - Shake.FadeIn - Shake.Enveloppe) / Shake.FadeOut, 0, 1),
					Enum.EasingStyle.Quad,
					Enum.EasingDirection.Out,
				);
			}

			// Setting Multiplier
			//Alpha *= Settings.GetSettingValue("Shake Intensity") / 100;

			// Randomness
			let RNGs = Shake.RNGs;
			if (!RNGs) {
				RNGs = [GetRandom().NextNumber(), GetRandom().NextNumber(), GetRandom().NextNumber()];
				Shake.RNGs = RNGs;
			}

			CurAngles.X += Shake.MaxRotation * Alpha * math.noise((Elapsed + RNGs[0]) * Shake.Frequency, ID / 100, 0.1) * 2;
			CurAngles.Y += Shake.MaxRotation * Alpha * math.noise((Elapsed + RNGs[1]) * Shake.Frequency, ID / 100, 0.2) * 2;
			CurAngles.Z += Shake.MaxRotation * Alpha * math.noise((Elapsed + RNGs[2]) * Shake.Frequency, ID / 100, 0.3) * 2;
		});

		return CFrame.fromEulerAnglesYXZ(CurAngles.Y, CurAngles.X, CurAngles.Z);
	}
}
