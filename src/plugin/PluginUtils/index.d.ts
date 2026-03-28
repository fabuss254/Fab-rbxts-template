import Signal from "shared/Librairies/Externals/goodsignal";

export namespace PluginUtils {
	export const plugin: Plugin;

	// MANAGER TYPING

	type Manager = {
		Widgets: { [WidgetName: string]: DockWidgetPluginGui };
		MakeWidget: (WidgetName: string, WidgetInfo: DockWidgetPluginGuiInfo) => DockWidgetPluginGui;
		Require: (script: ModuleScript) => unknown;
		ClearCache: () => void;
		ClearCacheForModule: (module: ModuleScript) => void;
		GetRootInstance: () => Frame;
	};

	export const Manager: Manager;

	// APP TYPING

	type App = {
		Widget: DockWidgetPluginGui;
		UI: Frame;
	};

	export const App: App;

	// UTILS TYPING
	export const ReloadModulesThatChanged: () => void;
	export const OnReloadModuleSpecific: Signal<(module: ModuleScript) => void>;
	export const OnReloadModuleTriggered: Signal<() => void>;
}
