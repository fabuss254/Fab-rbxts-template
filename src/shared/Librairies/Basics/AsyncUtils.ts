import { Players } from "@rbxts/services";

export namespace AsyncUtils {
	const NameByUserIdCache: Map<number, string> = new Map();
	const UserIdByNameCache: Map<string, number> = new Map();

	export const GetUsernameByUserId = (userId: number): Promise<string> => {
		if (userId < 0) return Promise.resolve("Player" + userId);
		if (NameByUserIdCache.has(userId)) return Promise.resolve(NameByUserIdCache.get(userId) as string);

		return new Promise((resolve, reject) => {
			const Username = Players.GetNameFromUserIdAsync(userId);
			NameByUserIdCache.set(userId, Username);
			UserIdByNameCache.set(Username, userId);

			resolve(Username);
		});
	};

	export function GetUsernameByUserIdNow(UserId: number) {
		if (!NameByUserIdCache.has(UserId)) {
			GetUsernameByUserId(UserId); // Call this to cache to result for later
		}

		return NameByUserIdCache.get(UserId);
	}

	export const GetUserIdByUsername = (username: string): Promise<number> => {
		if (UserIdByNameCache.has(username)) return Promise.resolve(UserIdByNameCache.get(username) as number);

		return new Promise((resolve, reject) => {
			const UserId = Players.GetUserIdFromNameAsync(username);
			UserIdByNameCache.set(username, UserId);
			NameByUserIdCache.set(UserId, username);

			resolve(UserId);
		});
	};

	export const GetUserThumbnail = (
		UserId: number,
		ThumbnailType: Enum.ThumbnailType = Enum.ThumbnailType.HeadShot,
		ThumbnailSize = Enum.ThumbnailSize.Size420x420,
	): Promise<string> => {
		return new Promise<string>((res) => {
			const [Thumbnail] = Players.GetUserThumbnailAsync(math.max(UserId, 1), ThumbnailType, ThumbnailSize);
			res(Thumbnail);
		});
	};
}
