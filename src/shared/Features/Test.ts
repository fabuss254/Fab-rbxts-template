import { Workspace } from "@rbxts/services";
import { RegisterFeature } from "shared/Librairies/FeatureHandler";

const MAX_EYE_ANGLE = math.rad(30);

function LookAt(Face: FaceControls, TargetPos: Vector3) {
	const Head = Face.Parent as BasePart;
	const RelativePos = Head.CFrame.PointToObjectSpace(TargetPos);

	if (RelativePos.Magnitude === 0) return;
	const Dir = RelativePos.Unit;

	const Yaw = math.atan2(Dir.X, -Dir.Z);
	const Pitch = math.atan2(Dir.Y, math.sqrt(Dir.X * Dir.X + Dir.Z * Dir.Z));

	const NormYaw = math.clamp(Yaw / MAX_EYE_ANGLE, -1, 1);
	const NormPitch = math.clamp(Pitch / MAX_EYE_ANGLE, -1, 1);

	Face.EyesLookRight = math.max(0, NormYaw);
	Face.EyesLookLeft = math.max(0, -NormYaw);
	Face.EyesLookUp = math.max(0, NormPitch);
	Face.EyesLookDown = math.max(0, -NormPitch);
}

RegisterFeature(script.Name, {
	OnUpdate: () => {
		LookAt(Workspace.TestHead.Head.FaceControls, Workspace.Target.Position);
	},
});
