import { GuiService, StarterGui, UserInputService } from "@rbxts/services";
import { GetAssetsFolder, GetPlayerGuis, IsClient, IsPlugin } from "./Common";

export namespace UILib {
	export type T_OriginalUI<T extends AllUINames> = StarterGui[T];

	function IsUIWithinInset(UI: GuiObject): boolean {
		const RootGUI = UI.FindFirstAncestorWhichIsA("ScreenGui");
		if (RootGUI) {
			return RootGUI.IgnoreGuiInset || RootGUI.ScreenInsets === Enum.ScreenInsets.CoreUISafeInsets;
		} else {
			return false;
		}
	}

	function GetButton(UI: GuiObject): GuiButton {
		if (UI.IsA("GuiButton")) return UI;

		const Button = UI.FindFirstChild("AUTO_Interactibility");
		if (Button) return Button as GuiButton;

		const NewButton = new Instance("TextButton");
		NewButton.Name = "AUTO_Interactibility";
		NewButton.BackgroundTransparency = 1;
		NewButton.Size = UDim2.fromScale(1, 1);
		NewButton.Position = UDim2.fromScale(0.5, 0.5);
		NewButton.AnchorPoint = Vector2.one.mul(0.5);
		NewButton.Text = "";
		NewButton.ZIndex = UI.ZIndex + 500;
		NewButton.Parent = UI;
		return NewButton;
	}

	export function GetUIInset(): Vector2 {
		return GuiService.GetGuiInset()[0];
	}

	export function OnButtonClicked(Frame: GuiObject, Callback: (x: number, y: number) => void) {
		const Button = GetButton(Frame);

		let IsIgnoreGUIInset: undefined | boolean = undefined;
		Button.Activated.Connect((Input) => {
			if (Button.GetAttribute("LongPressed")) {
				const Time = Button.GetAttribute("LongPressed") as number;
				Button.SetAttribute("LongPressed", undefined);
				if (os.clock() - Time < 5) return;
			}

			if (IsIgnoreGUIInset === undefined) {
				IsIgnoreGUIInset = IsUIWithinInset(Button);
			}

			const Pos = Input.Position.add(new Vector3(0, GetUIInset().Y, 0));
			Callback(Pos.X, Pos.Y);
		});
	}

	// UI Events
	export function OnButtonPressDown(Frame: GuiObject, Callback: (Pos: Vector2) => void) {
		const Button = GetButton(Frame);

		Button.MouseButton1Down.Connect((x, y) => Callback(new Vector2(x, y)));
	}

	export function OnButtonPressUp(Frame: GuiObject, Callback: (Pos: Vector2) => void) {
		const Button = GetButton(Frame);

		Button.MouseButton1Up.Connect((x, y) => Callback(new Vector2(x, y)));
	}

	export function OnButtonBeginHover(Frame: GuiObject, Callback: () => void) {
		const Button = GetButton(Frame);

		Button.MouseEnter.Connect(Callback);
	}

	export function OnButtonEndHover(Frame: GuiObject, Callback: () => void) {
		const Button = GetButton(Frame);

		Button.MouseLeave.Connect(Callback);
	}

	export function OnButtonLongPress(Frame: GuiObject, Callback: () => void) {
		const Button = GetButton(Frame);

		let HoldTime: number | undefined = undefined;
		const InputBegan = () => {
			const CurTime = os.clock();
			HoldTime = CurTime;

			task.delay(0.35, () => {
				if (HoldTime === CurTime) {
					Button.SetAttribute("LongPressed", os.clock());
					Callback();
				}
			});
		};

		const InputEnded = () => {
			HoldTime = undefined;
		};

		Button.InputEnded.Connect((Input) => InputEnded());
		Button.MouseLeave.Connect(() => InputEnded());
		Button.InputBegan.Connect((Input) => {
			if (Input.UserInputType === Enum.UserInputType.MouseButton1 || Input.UserInputType === Enum.UserInputType.Touch) {
				InputBegan();
			}
		});
	}

	// UI Utils
	export function GetMousePosition(Inset?: boolean): Vector2 {
		return UserInputService.GetMouseLocation().sub(Inset ? GetUIInset() : new Vector2());
	}

	export function IsPositionInUI(UI: GuiObject, Pos: Vector2, ForceInset?: boolean): boolean {
		if ((IsUIWithinInset(UI) && ForceInset !== false) || ForceInset === true) Pos = Pos.sub(GetUIInset());

		const Size = UI.AbsoluteSize;
		const Position = UI.AbsolutePosition;
		return Pos.X >= Position.X && Pos.X <= Position.X + Size.X && Pos.Y >= Position.Y && Pos.Y <= Position.Y + Size.Y;
	}
}

type AllUINames = keyof ExtractMembers<StarterGui, Instance>;
const BindedSetup = new Map<string, (UI: unknown) => void>();

export function GetUI<T extends AllUINames>(UIName: T): NonNullable<StarterGui[T]>;
export function GetUI<T extends AllUINames>(UIName: T, NoLoad: true): StarterGui[T];
export function GetUI<T extends AllUINames>(UIName: T, NoLoad?: false): NonNullable<StarterGui[T]>;
export function GetUI<T extends AllUINames>(UIName: T, NoLoad?: boolean): StarterGui[T] {
	assert(IsClient(), "GetUI can only be used on the client");
	assert(!IsPlugin(), "GetUI cannot be used in plugins");

	const LocalUI = GetPlayerGuis().FindFirstChild(UIName);
	if (LocalUI) return LocalUI as StarterGui[T];

	const OriginalUI = GetAssetsFolder().UIs.FindFirstChild(UIName);
	if (!OriginalUI) return undefined as never;

	const ScreenUI = OriginalUI.Clone() as ScreenGui;
	ScreenUI.Enabled = true;
	ScreenUI.Parent = GetPlayerGuis();
	if (BindedSetup.has(UIName)) BindedSetup.get(UIName)!(ScreenUI);

	return ScreenUI as StarterGui[T];
}

export function GetOriginalUI<T extends AllUINames>(UIName: T): StarterGui[T] {
	if (IsPlugin()) {
		return StarterGui.FindFirstChild(UIName) as StarterGui[T];
	}

	return (GetAssetsFolder().UIs as unknown as StarterGui)[UIName];
}

export function BindToUISetup<T extends AllUINames>(UIName: T, Callback: (UI: StarterGui[T]) => void) {
	BindedSetup.set(UIName, Callback as (UI: unknown) => void);
}
