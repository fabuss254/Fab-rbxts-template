import { createRemotes, remote, Server } from "@rbxts/remo";

export default createRemotes({
	PlayerLoaded: remote<Server, []>(),
});
