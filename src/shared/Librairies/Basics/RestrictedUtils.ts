import { IsClient, IsServer } from "./Common";

export namespace RestrictedUtils {
	// @outline VARIABLES

	const LockedTable = setmetatable(
		{},
		{
			__index: () => error("Attempt to access a restricted table"),
			__newindex: () => error("Attempt to modify a restricted table"),
			__metatable: "This metatable is locked",
		},
	);

	// @outline FUNCTIONS

	export function RestrictTableToClient<T extends object>(Tbl: T) {
		if (IsClient()) {
			return Tbl;
		} else {
			return LockedTable as T;
		}
	}

	export function RestrictTableToServer<T extends object>(Tbl: T) {
		if (IsServer()) {
			return Tbl;
		} else {
			return LockedTable as T;
		}
	}
}
