export namespace SpacialQuery {
	// @outline PRIVATE_FUNCTIONS

	// @outline FUNCTIONS

	export function IsPointInVolume(
		Point: Vector3,
		VolumeCenter: CFrame,
		VolumeSize: Vector3,
		IgnoreY?: boolean,
	): boolean {
		const RelativePoint = VolumeCenter.PointToObjectSpace(Point);
		const WithinX = RelativePoint.X >= -VolumeSize.X / 2 && RelativePoint.X <= VolumeSize.X / 2;
		const WithinY = IgnoreY || (RelativePoint.Y >= -VolumeSize.Y / 2 && RelativePoint.Y <= VolumeSize.Y / 2);
		const WithinZ = RelativePoint.Z >= -VolumeSize.Z / 2 && RelativePoint.Z <= VolumeSize.Z / 2;
		return WithinX && WithinY && WithinZ;
	}

	export function IsPositionInPart(Pos: Vector3, Part: BasePart, IgnoreY?: boolean): boolean {
		return IsPointInVolume(Pos, Part.CFrame, Part.Size, IgnoreY);
	}
}
