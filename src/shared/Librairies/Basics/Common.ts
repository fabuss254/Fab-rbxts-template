import { Players, ReplicatedStorage, RunService, UserInputService, Workspace } from "@rbxts/services";
import { Shortcut } from "../Shortcut";

// @outline VARIABLES

let DeltaTime = 0;

// @outline FUNCTIONS //

// State
export const IsStudio = () => RunService.IsStudio();
export const IsServer = () => RunService.IsServer();
export const IsClient = () => RunService.IsClient();
export const IsProduction = () => game.GameId !== 7123001396;
export const IsDevelopment = () => game.GameId === 7123001396;
export const IsRunning = () => RunService.IsRunning();

// Platform
export const IsMobile = () => !UserInputService.KeyboardEnabled;
export const IsPlugin = () => plugin !== undefined;
export const GetPluginUtils = () => {
	assert(IsPlugin(), "PluginUtils can only be used in a plugin context");
	return (require(ReplicatedStorage.DevPlugin.PluginUtils) as typeof import("plugin/PluginUtils")).PluginUtils;
};

// Axis
export const GetXZVector = () => new Vector3(1, 0, 1);

// Utils
/*
export const GetLocalPlayer = () => {
	assert(!IsServer() && !IsPlugin(), "GetLocalPlayer can only be used in a client context");
	const C_Player = (
		require(ReplicatedStorage.TS.Classes.FindFirstChild("Player") as ModuleScript) as typeof import("shared/Classes/Player")
	).C_Player;
	return C_Player.GetPlayerFromInstance(Players.LocalPlayer)!;
};
*/
export const GetDeltatime = () => DeltaTime;
export const GetPlayerGuis = () => Players.LocalPlayer.FindFirstChild("PlayerGui")! as StarterGui;
export const GetAllAdminUserIds = () => {
	return [Shortcut.CommonUsers.Fab, Shortcut.CommonUsers.VincentJHit, -1];
};

const RNG = new Random(tick() * 1000);
export const GetRandom = () => RNG;

export const GetAssetsFolder = () => {
	if (IsPlugin()) return Workspace.Assets;

	return ReplicatedStorage.FindFirstChild("Assets") as typeof Workspace.Assets;
};

// Internal
export const _NewFrameBegin = (dt: number) => {
	DeltaTime = dt;
};

// Types
export type T_AssetFolder = typeof Workspace.Assets;
export type T_CharacterModel = typeof Workspace.Assets.DefaultCharacter;
