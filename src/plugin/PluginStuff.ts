import Maid from "@rbxts/maid";
import { HttpService, ReplicatedFirst, ReplicatedStorage, ServerScriptService, StarterPlayer, Workspace } from "@rbxts/services";
import { CopyTable } from "shared/Librairies/Basics/TableUtils";
import Signal from "shared/Librairies/Externals/goodsignal";

const ChangeHistoryService = game.GetService("ChangeHistoryService");
export namespace PluginStuff {
	export const MainMaid = new Maid();
	export const ServerWorldChanged = new Signal<(WorldName: string) => void>();
	export const WindowSizeEvent = new Signal<(Size: Vector2) => void>();

	export function CreateSaveDict<T extends { [Key: string]: AttributeValue }>(SaveFolder: Folder, Template: T): T {
		const Save = CopyTable(Template);

		SaveFolder.GetAttributes().forEach((_, AttributeKey) => {
			Save[AttributeKey as keyof T] = SaveFolder.GetAttribute(AttributeKey) as T[keyof T];
		});

		return setmetatable(
			{},
			{
				__index: Save as unknown as (self: {}, index: unknown) => void,
				__newindex: (_, Key: unknown, Value: unknown) => {
					SaveFolder.SetAttribute(Key as string, Value as AttributeValue);
					(Save as unknown as { e: string })[Key as "e"] = Value as string;
				},
			},
		) as T;
	}

	export namespace PluginCamera {
		let SavedCF: CFrame | undefined = undefined;
		let SavedFocusCF: CFrame | undefined = undefined;

		export const Teleport = (NewCF: CFrame, FocusCF?: CFrame) => {
			const Camera = Workspace.CurrentCamera!;
			if (!SavedCF) {
				SavedCF = Camera.CFrame;
				SavedFocusCF = Camera.Focus;
			}

			Camera.CFrame = NewCF;
			Camera.Focus = FocusCF || NewCF;
		};

		export const Reset = () => {
			if (!SavedCF) return;

			Teleport(SavedCF);
			SavedCF = undefined;
			SavedFocusCF = undefined;
		};
	}

	export function RecordHistory(ActionName: string, Callback: () => void, NoWaypoint?: boolean) {
		if (!NoWaypoint) ChangeHistoryService.SetWaypoint(ActionName);
		const ChangeID = ChangeHistoryService.TryBeginRecording(ActionName, ActionName);
		xpcall(Callback, (Err) => {
			warn(`Error during history recording for action ${ActionName}: ${Err}`);
		});
		if (ChangeID) ChangeHistoryService.FinishRecording(ChangeID, Enum.FinishRecordingOperation.Commit, undefined);
	}

	export namespace PluginAPI {
		// VARIABLES

		const URL = `http://localhost:47591`;
		const OpenRoute = `${URL}/open/${game.GameId}`;

		const InstanceToPath: [Instance, string][] = [];
		InstanceToPath.push([ServerScriptService.TS, "server"]);
		InstanceToPath.push([ReplicatedFirst.TS, "ReplicatedFirst"]);
		InstanceToPath.push([ReplicatedStorage.TS, "shared"]);
		InstanceToPath.push([ReplicatedStorage.DevPlugin, "plugin"]);
		InstanceToPath.push([StarterPlayer.FindFirstChild("StarterPlayerScripts")!.FindFirstChild("TS")!, "client"]);

		// PRIVATE_FUNCTIONS

		function ResolveRobloxToVSDirectory(ScriptInstance: LuaSourceContainer) {
			const InstancePathData = InstanceToPath.find((Pair) => ScriptInstance.IsDescendantOf(Pair[0]));
			assert(InstancePathData, `Cannot find the base path for ${ScriptInstance.GetFullName()}`);

			const Suffix = ScriptInstance.IsA("ModuleScript") ? ".ts" : ScriptInstance.IsA("LocalScript") ? ".client.ts" : ".server.ts";
			let RelativePath = `${ScriptInstance.Name}${Suffix}`;
			let CurObj: Instance = ScriptInstance.Parent!;
			while (CurObj !== InstancePathData[0]) {
				RelativePath = `${CurObj.Name}/${RelativePath}`;
				CurObj = CurObj.Parent!;
			}

			return `${InstancePathData[1]}/${RelativePath}`;
		}

		// FUNCTIONS

		export function OpenEditor(ScriptInstance?: LuaSourceContainer) {
			let Res: RequestAsyncResponse | undefined = undefined;
			if (!ScriptInstance) {
				Res = HttpService.RequestAsync({
					Url: OpenRoute,
					Method: "GET",
				});
			} else {
				const RelativePath = ResolveRobloxToVSDirectory(ScriptInstance);
				Res = HttpService.RequestAsync({
					Url: `${OpenRoute}?q=${HttpService.UrlEncode(RelativePath)}`,
					Method: "GET",
				});
			}

			if (!Res.Success) {
				warn(`Failed to open the editor: ${Res.StatusCode} - ${Res.Body}`);
				return;
			}
		}
	}
}
