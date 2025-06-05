/**
 * Force load a variable, as this template uses a lot of lazy loading.
 * You WILL need to use it for variables that are directly required from other module and used in a for loop or straight rawset (like 'Thing.Color = _FL(MyExternalColor)')
 * @param Variable The variable to force load
 * @returns The variable after being force loaded
 */
export function _FL<T>(Variable: T & { __forceLoad?: () => T }): T {
	if (!Variable) return Variable;
	if (typeOf(Variable) !== "table") return Variable;

	if (rawget(Variable, "__forceLoad")) {
		return Variable.__forceLoad!();
	}

	return Variable;
}