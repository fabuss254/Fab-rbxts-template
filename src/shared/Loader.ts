import { ReplicatedStorage, RunService, StarterGui } from "@rbxts/services";
import { _NewFrameBegin, GetAssetsFolder, GetPlayerGuis, IsClient, IsServer, IsStudio } from "./Librairies/Basics/Common";
import { RetrieveAllFeatures, SetFeatureStage } from "./Librairies/FeatureHandler";
import Remotes from "./Remotes";

function SecureWrap(FeatureName: string, func: () => void) {
	if (IsStudio()) {
		func();
	} else {
		xpcall(func, (err) => {
			warn(`Error in ${FeatureName}: ${err}\n${debug.traceback()}`);
		});
	}
}

export default () => {
	// Run the loading screen first so we can actually show something on the player's screen
	if (IsClient()) {
		// Wait for the server to load
		while (!ReplicatedStorage.GetAttribute("ServerLoaded")) {
			task.wait();
		}

		GetPlayerGuis().ChildAdded.Connect((child) => child.Name === "Freecam" && child.Destroy());
		GetPlayerGuis().FindFirstChild("Freecam")?.Destroy();
	} else {
		// Put all UIs inside ReplicatedStorage
		for (const UI of StarterGui.GetChildren()) {
			if (!UI.IsA("ScreenGui") || UI.Name === "FreecamFork") continue;

			UI.ResetOnSpawn = false;
			UI.Parent = GetAssetsFolder().UIs;
		}
	}

	// Load places module which allow information on what to actually load based on the server we're on

	SetFeatureStage("PreInit");
	// Load all registry files
	ReplicatedStorage.TS.FindFirstChild("Registry")
		?.GetDescendants()
		.filter((v): v is ModuleScript => v.IsA("ModuleScript"))
		.forEach((module) => require(module));

	// Load all classes files
	ReplicatedStorage.TS.FindFirstChild("Classes")
		?.GetDescendants()
		.filter((v): v is ModuleScript => v.IsA("ModuleScript"))
		.forEach((module) => require(module));

	// Load all features and call their respective events
	const AllFeatures = RetrieveAllFeatures();

	// Run all registry load events
	SetFeatureStage("RegistryLoad");
	AllFeatures.forEach((feature) => {
		if (!feature.OnRegistryLoad) return;
		print("[LOADER] Registry loading: " + feature.Name);

		SecureWrap(feature.Name, () => {
			feature.OnRegistryLoad!();
		});
	});

	// Pre-Init all features in sync
	SetFeatureStage("PreInit");
	AllFeatures.forEach((feature) => {
		if (!feature.OnPreInit) return;
		print("[LOADER] Pre-Init: " + feature.Name);

		SecureWrap(feature.Name, () => {
			feature.OnPreInit!();
		});
	});

	// Init all features in sync
	SetFeatureStage("Init");
	AllFeatures.forEach((feature) => {
		if (!feature.OnInit) return;
		print("[LOADER] Init: " + feature.Name);

		SecureWrap(feature.Name, () => {
			feature.OnInit!();
		});
	});

	// If we good, Run all features's start event async
	SetFeatureStage("Start");
	AllFeatures.forEach((feature) => {
		if (!feature.OnStart) return;
		print("[LOADER] Starting: " + feature.Name);

		SecureWrap(feature.Name, () => {
			task.spawn(feature.OnStart!);
		});
	});

	// We now start some run service loops
	SetFeatureStage("Running");
	let FrameHeartbeat = 0;
	RunService.Heartbeat.Connect((dt: number) => {
		_NewFrameBegin(dt);

		FrameHeartbeat++;
		AllFeatures.forEach((feature) => {
			if (!feature.OnUpdate) return;
			SecureWrap(feature.Name, () => {
				let CurrentFrame = FrameHeartbeat;
				debug.profilebegin("OnUpdate " + feature.Name);
				feature.OnUpdate!();
				if (CurrentFrame !== FrameHeartbeat) warn("OnUpdate " + feature.Name + ": Yield detected");
				debug.profileend();
			});
		});
	});

	// If we are on the client, we also want to run the render loop
	if (RunService.IsClient()) {
		let FrameRender = 0;
		RunService.RenderStepped.Connect(() => {
			FrameRender++;
			AllFeatures.forEach((feature) => {
				if (!feature.OnRender) return;

				SecureWrap(feature.Name, () => {
					let CurrentFrame = FrameRender;
					debug.profilebegin("OnRender " + feature.Name);
					feature.OnRender!();
					if (CurrentFrame !== FrameRender) warn("OnRender " + feature.Name + ": Yield detected");
					debug.profileend();
				});
			});
		});
	}

	// Finished loading !
	if (IsServer()) {
		ReplicatedStorage.SetAttribute("ServerLoaded", true);
	} else {
		Remotes.PlayerLoaded.fire();
	}

	print(`${IsClient() ? "Client" : "Server"} has loaded!`);
};
