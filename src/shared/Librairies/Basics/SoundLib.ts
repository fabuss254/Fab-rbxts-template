import { Debris, Workspace } from "@rbxts/services";
import { GetAssetsFolder, GetPluginUtils, GetRandom, IsPlugin, T_AssetFolder } from "./Common";
import { InstanceUtils } from "./InstanceUtils";

export namespace SoundLib {
	// @outline TYPES | Thanks ChatGPT 4o for carrying me to find this typing bullshit

	type GetSoundPath<T> = {
		[K in keyof T]: T[K] extends Sound ? `${K & string}` : T[K] extends Folder ? `${K & string}/${GetSoundPath<T[K]>}` : never;
	}[keyof T];

	type GetAllSoundFolderPaths<T> = {
		[K in keyof T]: T[K] extends Sound
			? `${K & string}` // Base case: If it's a Sound, return just the key
			: T[K] extends Folder // Recursive case: If it's a Folder, return both the folder and nested paths
				? `${K & string}` | `${K & string}/${GetAllSoundFolderPaths<T[K]>}`
				: never;
	}[keyof T];

	type AllKeys<T> = {
		[K in keyof T]: T[K] extends SoundGroup ? K | AllKeys<T[K]> : never;
	}[keyof T];

	export type AllSoundGroupNames = Exclude<AllKeys<T_AssetFolder["SoundGroups"]>, keyof SoundGroup>;
	export type AllSoundPaths = GetSoundPath<T_AssetFolder["Sounds"]>;
	export type AllSoundFolderPaths = Exclude<GetAllSoundFolderPaths<T_AssetFolder["Sounds"]>, AllSoundPaths>;

	// @outline VARIABLES

	let SoundGroupByName: Map<AllSoundGroupNames, SoundGroup> | undefined = undefined;

	const EmptySound = new Instance("Sound");
	EmptySound.Name = "EmptySound";
	EmptySound.Volume = 0;

	// @outline PRIVATE_FUNCTIONS

	// @outline FUNCTIONS

	// @outline Others

	export function IsSoundGroupName(SoundGroupName: string): SoundGroupName is AllSoundGroupNames {
		return GetSoundGroupByName(SoundGroupName as AllSoundGroupNames) !== undefined;
	}

	export function IsSoundPath(SoundPath: string): SoundPath is AllSoundPaths {
		const Instance = InstanceUtils.GetInstanceFromPath(SoundPath);
		return Instance !== undefined && Instance.IsA("Sound");
	}

	export function IsSoundFolderPath(SoundFolderPath: string): SoundFolderPath is AllSoundFolderPaths {
		const Instance = InstanceUtils.GetInstanceFromPath(SoundFolderPath);
		return Instance !== undefined && !Instance.IsA("Sound");
	}

	export function GetSoundGroupByName(SoundGroupName: AllSoundGroupNames): SoundGroup {
		if (!SoundGroupByName) {
			SoundGroupByName = new Map();
			GetAssetsFolder()
				.SoundGroups.GetDescendants()
				.forEach((v) => {
					if (!v.IsA("SoundGroup")) return;
					SoundGroupByName!.set(v.Name as AllSoundGroupNames, v);
				});
		}

		return SoundGroupByName.get(SoundGroupName)!;
	}

	export function CheckPathValidity(Path: string): Path is AllSoundPaths {
		const PathArr: string[] = [...Path.split("/")];
		let CurObj: Instance | undefined = GetAssetsFolder().Sounds;
		for (const ChildName of PathArr) {
			CurObj = CurObj.FindFirstChild(ChildName);
			if (!CurObj) return false;
		}
		return true;
	}

	export function GetSound(SoundName: AllSoundPaths, SoundGroupName: AllSoundGroupNames = "Others"): Sound {
		let FoundSFX = InstanceUtils.GetInstanceFromPath(SoundName);
		if (!FoundSFX) {
			warn(`[SOUNDLIB] Invalid sound path: ${SoundName}`);
			FoundSFX = EmptySound;
		}

		const SFX = FoundSFX.Clone() as Sound;
		SFX.RollOffMode = Enum.RollOffMode.InverseTapered;
		SFX.SoundGroup = GetSoundGroupByName(SoundGroupName);
		SFX.RollOffMaxDistance = 200;
		SFX.RollOffMinDistance = 30;

		return SFX;
	}

	export function GetSoundAttachment(
		SoundName: AllSoundPaths,
		SoundGroupName: AllSoundGroupNames = "Others",
	): Attachment & { Sound: Sound } {
		const Att = new Instance("Attachment");
		Att.Name = `${SoundName.split("/").pop()}_Attachment`;
		Att.Parent = Workspace.Terrain; // Just to avoid errors, will be re-parented when used

		const SFX = GetSound(SoundName, SoundGroupName);
		SFX.Name = "Sound";
		SFX.Parent = Att;

		return Att as Attachment & { Sound: Sound };
	}

	export function GetAllSoundsFromFolder(FolderPath: AllSoundFolderPaths, SoundGroupName: AllSoundGroupNames = "Others"): Sound[] {
		const Folder = InstanceUtils.GetInstanceFromPath(FolderPath) as Folder;
		const Sounds: Sound[] = Folder.GetChildren().filter((Sound) => Sound.IsA("Sound")) as Sound[];

		const SoundsProxy: Sound[] = [];
		Sounds.forEach((Sound) => {
			const SFX = Sound.Clone() as Sound;
			SFX.RollOffMode = Enum.RollOffMode.InverseTapered;
			SFX.SoundGroup = GetSoundGroupByName(SoundGroupName);
			SFX.RollOffMaxDistance = 200;
			SFX.RollOffMinDistance = 50;

			SoundsProxy.push(SFX);
		});

		return SoundsProxy;
	}

	export function GetAllSoundPaths(FolderPath: AllSoundFolderPaths): AllSoundPaths[] {
		const Folder = InstanceUtils.GetInstanceFromPath(FolderPath) as Folder;
		const SoundPaths: AllSoundPaths[] = [];

		Folder.GetChildren().forEach((Child) => {
			if (Child.IsA("Sound")) {
				const Path = InstanceUtils.GetPathFromInstance(Child);
				if (Path) SoundPaths.push(Path as AllSoundPaths);
			}
		});

		return SoundPaths;
	}

	export function GetRandomSoundFromFolder(FolderPath: AllSoundFolderPaths, SoundGroupName: AllSoundGroupNames = "Others"): Sound {
		const AllSounds = GetAllSoundsFromFolder(FolderPath, SoundGroupName);
		return AllSounds[GetRandom().NextInteger(0, AllSounds.size() - 1)];
	}

	export const ListenInPlugin = (SoundInstance: Sound): void => {
		if (!IsPlugin()) return;

		const FirstPart = SoundInstance.Parent;
		if (FirstPart && (FirstPart.IsA("BasePart") || FirstPart.IsA("Attachment"))) {
			const SoundPart = new Instance("Part");
			SoundPart.Anchored = true;
			SoundPart.Size = new Vector3(0.2, 0.2, 0.2);
			SoundPart.CFrame = FirstPart.IsA("BasePart") ? FirstPart.CFrame : (FirstPart as Attachment).WorldCFrame;

			SoundInstance.Parent = SoundPart;
			FirstPart.GetPropertyChangedSignal("CFrame").Connect(
				() => (SoundPart.CFrame = FirstPart.IsA("BasePart") ? FirstPart.CFrame : (FirstPart as Attachment).WorldCFrame),
			);
			SoundInstance.Destroying.Connect(() => SoundPart.Destroy());
			Debris.AddItem(SoundPart, 60);

			SoundInstance = SoundPart as Instance as Sound;
		}

		SoundInstance.Parent = GetPluginUtils().App.UI;
	};
}
