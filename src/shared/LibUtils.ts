/**
 * Force load a variable, as this template uses a lot of lazy loading
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