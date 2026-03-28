type SupportedTypes = CFrame | Vector3 | Vector2 | number | Color3 | UDim2;

export namespace Interpolate {
	export function Lerp<T extends SupportedTypes>(p0: T, p1: T, alpha: number): T;
	export function ClampedLerp<T extends SupportedTypes>(p0: T, p1: T, alpha: number): T;
	export function PreciseLerp<T extends SupportedTypes>(p0: T, p1: T, Deltatime: number, Time: number): T;
	export function ClampedPreciseLerp<T extends SupportedTypes>(p0: T, p1: T, Deltatime: number, Time: number): T;
	export function Bezier<T extends SupportedTypes>(p0: T, p1: T, p2: T, alpha: number): T;
	export function CubicBezier<T extends SupportedTypes>(p0: T, p1: T, p2: T, p3: T, alpha: number): T;
	export function EaseCubicBezier(x1: number, y1: number, x2: number, y2: number, alpha: number): number;

	export function GetAlphaInRange(Start: number, End: number, Value: number): number;
}
