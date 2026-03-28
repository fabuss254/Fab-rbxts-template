import { ReplicatedStorage, ServerScriptService } from "@rbxts/services";
import { IsServer } from "./Basics/Common";

export interface I_Feature {
	/** Before game initialization. Used for requiring subsequent modules. (cannot yield) */
	OnPreInit?: () => void;

	/** When the game is initialized (cannot yield) */
	OnInit?: () => void;

	/** When the game is loading all registry file. Used to dynamically register new items. */
	OnRegistryLoad?: () => void;

	/** When the game starts (can yield) */
	OnStart?: () => void;

	/** On heartbeat update */
	OnUpdate?: () => void;

	/** On render update (client only) */
	OnRender?: () => void;

	Priority?: number; // Priority of the feature, used to sort features
}

interface I_Feature_WithName extends I_Feature {
	Name: string;
	Priority: number;
}

const AllFeatures: I_Feature_WithName[] = [];
export function RegisterFeature(FeatureName: string, feature: I_Feature) {
	const FinishedFeature = {
		...feature,
		Name: FeatureName,
	};

	FinishedFeature.Priority = FinishedFeature.Priority ?? 0;
	AllFeatures.push(FinishedFeature as I_Feature_WithName);
}

export function RetrieveAllFeatures(): I_Feature_WithName[] {
	const AllFeaturesArray: I_Feature[] = [];
	ReplicatedStorage.TS.FindFirstChild("Features")
		?.GetDescendants()
		.forEach((feature) => {
			if (!feature.IsA("ModuleScript")) return;
			require(feature);
		});

	if (IsServer()) {
		const FeatureFolder = ServerScriptService.TS.FindFirstChild("ServerFeatures");
		FeatureFolder?.GetDescendants().forEach((feature) => {
			if (!feature.IsA("ModuleScript")) return;
			require(feature);
		});
	}

	AllFeatures.sort((a, b) => a.Priority < b.Priority);
	AllFeatures.forEach((feature) => AllFeaturesArray.push(feature));
	return AllFeaturesArray as I_Feature_WithName[];
}

type AllStages = "InternalStart" | "PreInit" | "Init" | "RegistryLoad" | "Start" | "Running";
let CurrentStage: AllStages = "InternalStart";
export function SetFeatureStage(NewStage: AllStages) {
	CurrentStage = NewStage;
}
export function GetFeatureStage() {
	return CurrentStage;
}
