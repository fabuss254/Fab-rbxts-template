import { GetAssetsFolder } from "./Common";

export namespace InstanceUtils {
	export function ReconcileInstances<T extends Instance>(Target: Instance, Template: T): T {
		if (Target.ClassName !== Template.ClassName) error("Target and Template are not the same class.");

		Template.GetChildren().forEach((v) => {
			const TargetChild = Target.FindFirstChild(v.Name);
			if (!TargetChild || TargetChild.ClassName !== v.ClassName) {
				if (TargetChild) TargetChild.Destroy();

				v.Clone().Parent = Target;
			} else {
				ReconcileInstances(TargetChild, v);
			}
		});

		return Target as T;
	}

	export function Weld(Part0: BasePart, Part1: BasePart) {
		const Weld = new Instance("Weld");
		Weld.Part0 = Part0;
		Weld.Part1 = Part1 as BasePart;
		Weld.C1 = (Part1 as BasePart).CFrame.ToObjectSpace(Part0.CFrame);
		Weld.Name = `${Part0.Name} -> ${Part1.Name}`;
		Weld.Parent = Part0;
		return Weld;
	}

	export function WeldModel(Mdl: Model, CustomPrimaryPart?: BasePart) {
		const PrimaryPart = CustomPrimaryPart ?? Mdl.PrimaryPart ?? (Mdl.FindFirstChildWhichIsA("BasePart") as BasePart);
		assert(PrimaryPart, "Model has no PrimaryPart or BasePart.");

		Mdl.GetDescendants()
			.filter((Descendant) => Descendant.IsA("BasePart"))
			.forEach((Part) => {
				if (Part === PrimaryPart) return;

				Weld(PrimaryPart, Part);
			});
	}

	export function GetInstanceFromPath(Path: string, Parent: Instance = GetAssetsFolder().Sounds): Instance | undefined {
		const PathArr: string[] = [...Path.split("/")];
		let CurObj: Instance = Parent;
		PathArr.forEach((ChildName) => {
			if (!CurObj) return;
			CurObj = CurObj.FindFirstChild(ChildName) as Instance;
		});

		return CurObj;
	}

	export function GetPathFromInstance(Instance: Instance, Parent: Instance = GetAssetsFolder().Sounds): string | undefined {
		if (!Instance.IsDescendantOf(Parent)) return;

		let Path = Instance.Name;
		let CurrentObj: Instance | undefined = Instance;
		while (CurrentObj.Parent !== Parent) {
			CurrentObj = CurrentObj.Parent;
			if (!CurrentObj) return undefined;

			Path = `${CurrentObj.Name}/${Path}`;
		}

		return Path;
	}

	export function GetC0ForWorldCFrame(Motor: Motor6D, WorldCFrame: CFrame): CFrame {
		const Part0 = Motor.Part0;
		if (!Part0) return new CFrame();

		// C0 = Part0^-1 * DesiredPart1World * C1
		const Part0ToDesiredPart1 = Part0.CFrame.ToObjectSpace(WorldCFrame);
		const C0 = Part0ToDesiredPart1.mul(Motor.C1);

		return C0;
	}

	export function GetWorldCFrameFromC0(Motor: Motor6D, C0: CFrame = Motor.C0): CFrame {
		const Part0 = Motor.Part0;
		if (!Part0) return new CFrame();

		// DesiredPart1World = Part0 * C0 * C1^-1
		const DesiredPart1World = Part0.CFrame.mul(C0).mul(Motor.C1.Inverse());

		return DesiredPart1World;
	}

	type Path<T> = {
		[K in keyof T]: T[K] extends Instance ? `${K & string}` | `${K & string}/${Path<T[K]>}` : never;
	}[keyof T];
	type ResolvePath<T, P extends string> = P extends `${infer A}/${infer B}`
		? A extends keyof T
			? ResolvePath<T[A], B>
			: never
		: P extends keyof T
			? T[P]
			: never;

	export function GetPotentialInstance<T extends Instance, P extends Path<T>>(Parent: T, Path: P): ResolvePath<T, P> | undefined {
		let Current: Instance | undefined = Parent;
		for (const Segment of Path.split("/")) {
			if (!Current) {
				return undefined;
			}

			Current = Current.FindFirstChild(Segment);
		}
		return Current as ResolvePath<T, P> | undefined;
	}
}
