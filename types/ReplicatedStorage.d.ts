interface ReplicatedStorage extends Instance {
	TS: Folder & {
		Librairies: Folder & {
			Externals: Folder & {
				goodsignal: ModuleScript;
			};
			FeatureHandler: ModuleScript;
			Shortcut: ModuleScript;
			Basics: Folder & {
				Interpolate: ModuleScript;
				NoYield: ModuleScript;
				LibUtils: ModuleScript;
				RandomUtils: ModuleScript;
				NumberSequenceUtils: ModuleScript;
				SpacialQuery: ModuleScript;
				ClassUtils: ModuleScript;
				NumberLib: ModuleScript;
				DebugUtils: ModuleScript;
				RestrictedUtils: ModuleScript;
				InstanceUtils: ModuleScript;
				UILib: ModuleScript;
				TableUtils: ModuleScript;
				Canonizer: ModuleScript;
				Common: ModuleScript;
				AsyncUtils: ModuleScript;
				ShakeLib: ModuleScript;
				SoundLib: ModuleScript;
				Richtext: ModuleScript;
				VFXUtils: ModuleScript;
			};
		};
		Loader: ModuleScript;
		Remotes: ModuleScript;
		Features: Folder & {
			Test: ModuleScript;
		};
		LibUtils: ModuleScript;
	};
	DevPlugin: ModuleScript & {
		Others: Folder;
		PluginUtils: ModuleScript;
		PluginStuff: ModuleScript;
		Pages: Folder;
		Runners: Folder & {
			CamShaking: ModuleScript;
		};
	};
	rbxts_include: Folder & {
		RuntimeLib: ModuleScript;
		Promise: ModuleScript;
		node_modules: Folder & {
			["@rbxts"]: Folder & {
				remo: Folder & {
					src: ModuleScript & {
						getSender: ModuleScript;
						Promise: ModuleScript;
						builder: ModuleScript;
						constants: ModuleScript;
						utils: Folder & {
							compose: ModuleScript;
							testRemote: ModuleScript;
							mockRemotes: ModuleScript;
							unwrap: ModuleScript;
							instances: ModuleScript;
						};
						types: ModuleScript;
						server: ModuleScript & {
							createRemote: ModuleScript;
							createAsyncRemote: ModuleScript;
						};
						container: Configuration;
						client: ModuleScript & {
							createRemote: ModuleScript;
							createAsyncRemote: ModuleScript;
						};
						middleware: Folder & {
							loggerMiddleware: ModuleScript;
							throttleMiddleware: ModuleScript;
						};
						createRemotes: ModuleScript;
					};
				};
				services: ModuleScript;
				maid: Folder & {
					Maid: ModuleScript;
				};
				["compiler-types"]: Folder & {
					types: Folder;
				};
				types: Folder & {
					include: Folder & {
						generated: Folder;
					};
				};
			};
		};
	};
}
