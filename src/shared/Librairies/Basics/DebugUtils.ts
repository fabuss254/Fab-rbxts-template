import Maid from "@rbxts/maid";
import { Workspace } from "@rbxts/services";
import NoYield from "./NoYield";

export namespace DebugUtils {
	// @outline PRIVATE_FUNCTIONS

	export function CreateLine(
		Pos1: Vector3,
		Pos2: Vector3,
		Thickness = 0.1,
		Color = new Color3(1, 1, 0),
		AutocleanupTime?: number,
	): BoxHandleAdornment {
		const Line = new Instance("BoxHandleAdornment");
		Line.Adornee = Workspace.Terrain;
		Line.CFrame = CFrame.lookAt(Pos1.add(Pos2).div(2), Pos2);
		Line.ZIndex = 0;
		Line.AlwaysOnTop = true;
		Line.Size = new Vector3(Thickness, Thickness, Pos1.sub(Pos2).Magnitude);
		Line.Color3 = Color;
		Line.Parent = Workspace.Terrain;

		if (AutocleanupTime !== undefined) {
			task.delay(AutocleanupTime, () => Line.Destroy());
		}
		return Line;
	}

	export function CreateBox(CF: CFrame, Size: Vector3, Color = new Color3(1, 1, 1), AutocleanupTime?: number): BoxHandleAdornment {
		const Box = new Instance("BoxHandleAdornment");
		Box.Adornee = Workspace.Terrain;
		Box.CFrame = CF;
		Box.ZIndex = 0;
		Box.AlwaysOnTop = true;
		Box.Color3 = Color;
		Box.Size = Size;
		Box.Parent = Workspace.Terrain;

		if (AutocleanupTime !== undefined) {
			task.delay(AutocleanupTime, () => Box.Destroy());
		}
		return Box;
	}

	function CreateSphere(Pos: Vector3, Radius: number = 0.1, Color = new Color3(1, 1, 0)): SphereHandleAdornment {
		const Sphere = new Instance("SphereHandleAdornment");
		Sphere.Adornee = Workspace.Terrain;
		Sphere.CFrame = new CFrame(Pos);
		Sphere.Radius = Radius;
		Sphere.ZIndex = 0;
		Sphere.AlwaysOnTop = true;
		Sphere.Color3 = Color;
		Sphere.Parent = Workspace.Terrain;

		return Sphere;
	}

	function CreatePlane(CF: CFrame, Size: number, Color = new Color3(0, 0.5, 0)): BoxHandleAdornment {
		const Box = new Instance("BoxHandleAdornment");
		Box.Adornee = Workspace.Terrain;
		Box.CFrame = CF;
		Box.ZIndex = 0;
		Box.AlwaysOnTop = true;
		Box.Color3 = Color;
		Box.Size = new Vector3(Size, Size, 0.01);
		Box.Parent = Workspace.Terrain;

		return Box;
	}

	// @outline FUNCTIONS
	export function CreateAxis(CF: CFrame, Color?: Color3, AutocleanupTime?: number): Maid {
		const CleanupTask = new Maid();

		CleanupTask.GiveTask(CreateLine(CF.Position, CF.Position.add(CF.UpVector.mul(-1)), 0.025, Color ?? new Color3(0.4, 0.4, 0.4)));
		CleanupTask.GiveTask(CreateLine(CF.Position, CF.Position.add(CF.RightVector.mul(-1)), 0.025, Color ?? new Color3(0.4, 0.4, 0.4)));
		CleanupTask.GiveTask(CreateLine(CF.Position, CF.Position.add(CF.LookVector.mul(-1)), 0.025, Color ?? new Color3(0.4, 0.4, 0.4)));

		CleanupTask.GiveTask(CreateLine(CF.Position, CF.Position.add(CF.UpVector), 0.05, Color ?? new Color3(0.5, 1, 0.5)));
		CleanupTask.GiveTask(CreateLine(CF.Position, CF.Position.add(CF.RightVector), 0.05, Color ?? new Color3(1, 0.5, 0.5)));
		CleanupTask.GiveTask(CreateLine(CF.Position, CF.Position.add(CF.LookVector), 0.05, Color ?? new Color3(0.5, 0.5, 1)));

		CleanupTask.GiveTask(CreateBox(CF, Vector3.one.mul(0.05), Color ?? new Color3(1, 0, 1)));

		if (AutocleanupTime !== undefined) {
			task.delay(AutocleanupTime, () => CleanupTask.DoCleaning());
		}
		return CleanupTask;
	}

	export function Raycast(Origin: Vector3, Direction: Vector3, RaycastResult?: RaycastResult, AutocleanupTime?: number): Maid {
		const CleanupTask = new Maid();
		CleanupTask.GiveTask(CreateSphere(Origin, 0.1, new Color3(0, 0, 1)));
		CleanupTask.GiveTask(
			CreateLine(
				Origin,
				RaycastResult ? RaycastResult.Position : Origin.add(Direction),
				0.03,
				RaycastResult ? new Color3(0, 1, 0) : new Color3(1, 0, 0),
			),
		);

		if (RaycastResult) {
			CleanupTask.GiveTask(CreateAxis(CFrame.lookAlong(RaycastResult.Position, RaycastResult.Normal)));
		}

		if (AutocleanupTime !== undefined) {
			task.delay(AutocleanupTime, () => CleanupTask.DoCleaning());
		}
		return CleanupTask;
	}

	export function ProfileCall(ProfileTag: string, Callback: () => void) {
		debug.profilebegin(ProfileTag);
		NoYield(Callback);
		debug.profileend();
	}
}
