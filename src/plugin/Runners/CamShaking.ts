import { RunService, Workspace } from "@rbxts/services";
import { PluginStuff } from "plugin/PluginStuff";
import { ShakeLib } from "shared/Librairies/Basics/ShakeLib";

export default () => {
	let LastShakeCF: CFrame = new CFrame();
	PluginStuff.MainMaid.GiveTask(
		RunService.Heartbeat.Connect(() => {
			const Cam = Workspace.CurrentCamera!;
			Cam.CameraType = ShakeLib.AnyShakeActive() ? Enum.CameraType.Custom : Enum.CameraType.Fixed;

			const Shaking = ShakeLib.GetShakeRotationCF();
			Cam.CFrame = Cam.CFrame.mul(LastShakeCF.Inverse()).mul(Shaking);
			LastShakeCF = Shaking;
		}),
	);
};
