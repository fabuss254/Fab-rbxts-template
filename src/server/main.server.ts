import { ReplicatedStorage, Workspace } from "@rbxts/services";
import Loader from "shared/Loader";

Workspace.Assets.Parent = ReplicatedStorage;
Workspace.FindFirstChild("StudioOnly")?.Destroy();

Loader();
