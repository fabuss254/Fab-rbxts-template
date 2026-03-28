import { _FL } from "./LibUtils";

export namespace ClassUtils {
	export function GetSuper(Class: object): object | undefined {
		Class = _FL(Class);
		return _FL((getmetatable(Class) as { __index: object }).__index);
	}

	type AnyClass = new (...args: any[]) => any;
	export function GetClassFromInstance<T = unknown>(Instance: unknown): T {
		return _FL((getmetatable(_FL(Instance as AnyClass)) as { __index: { __forceload?: () => unknown } }).__index) as T;
	}

	export function GetClassName(Class: object): string {
		return (getmetatable(_FL(Class)) as { __tostring: () => string }).__tostring();
	}

	export function DoClassExtendFrom<T extends object>(Class: object, Super: T): Class is T {
		let CurrentClass: object | undefined = Class;
		while (CurrentClass) {
			if (CurrentClass === _FL(Super)) return true;
			CurrentClass = GetSuper(CurrentClass);
		}
		return false;
	}

	export function DoClassInstanceExtendFrom<T extends AnyClass>(Class: object, Super: T): Class is InstanceType<T> {
		let CurrentClass: object | undefined = Class;
		while (CurrentClass) {
			if (ClassUtils.GetClassFromInstance(CurrentClass) === _FL(Super)) return true;
			CurrentClass = GetSuper(CurrentClass);
		}
		return false;
	}

	type MethodKeys<T> = {
		[K in keyof T]: T[K] extends Callback ? K : never;
	}[keyof T]; // Retrieve all keys of T that are methods (functions)
	type AddThisToFunction<F, TInstance> = F extends (...Args: infer P) => infer R ? (self: TInstance, ...Args: P) => R : never; // Transform a function type F into one that has an additional first parameter of type TInstance (the "this" context)

	export function GetClassMethod<T extends AnyClass, K extends MethodKeys<InstanceType<T>>>(
		Class: T,
		MethodName: K,
	): AddThisToFunction<InstanceType<T>[K], InstanceType<T>> {
		Class = _FL(Class);

		const Method = rawget(Class, MethodName) as InstanceType<T>[K] | undefined;
		assert(Method, `Method ${MethodName as string} not found in class ${GetClassName(Class)}`);
		return Method;
	}
}
