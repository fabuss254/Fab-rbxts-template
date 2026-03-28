interface Workspace extends Model {
	Map: Folder & {
		Baseplate: Part & {
			Texture: Texture;
		};
		SpawnLocation: SpawnLocation & {
			Decal: Decal;
		};
	};
	Camera: Camera;
	StudioOnly: Folder;
	Target: Part;
	Debris: Folder;
	TestHead: Model & {
		Head: MeshPart & {
			HatAttachment: Attachment;
			NeckRigAttachment: Attachment;
			FaceFrontAttachment: Attachment;
			FaceControls: FaceControls;
			SurfaceAppearance: SurfaceAppearance;
			HairAttachment: Attachment;
			FaceCenterAttachment: Attachment;
			AvatarPartScaleType: StringValue;
			HeadWrapTarget: WrapTarget;
		};
	};
	Assets: Folder & {
		Sounds: Folder & {
			Sound: Sound;
		};
		UIs: Folder;
		DefaultCharacter: Model & {
			["Left Leg"]: Part & {
				Snap: Snap;
				LeftFootAttachment: Attachment;
			};
			Humanoid: Humanoid & {
				HumanoidDescription: HumanoidDescription;
			};
			["Right Arm"]: Part & {
				RightShoulderAttachment: Attachment;
				RightGripAttachment: Attachment;
			};
			Head: Part & {
				HatAttachment: Attachment;
				HairAttachment: Attachment;
				FaceFrontAttachment: Attachment;
				face: Decal;
				Mesh: SpecialMesh;
				FaceCenterAttachment: Attachment;
			};
			["Right Leg"]: Part & {
				Snap: Snap;
				RightFootAttachment: Attachment;
			};
			Torso: Part & {
				RightCollarAttachment: Attachment;
				WaistCenterAttachment: Attachment;
				BodyBackAttachment: Attachment;
				Neck: Motor6D;
				LeftCollarAttachment: Attachment;
				["Left Shoulder"]: Motor6D;
				["Left Hip"]: Motor6D;
				["Right Hip"]: Motor6D;
				["Right Shoulder"]: Motor6D;
				BodyFrontAttachment: Attachment;
				WaistBackAttachment: Attachment;
				WaistFrontAttachment: Attachment;
				NeckAttachment: Attachment;
			};
			HumanoidRootPart: Part & {
				RootJoint: Motor6D;
				RootAttachment: Attachment;
			};
			["Left Arm"]: Part & {
				LeftGripAttachment: Attachment;
				LeftShoulderAttachment: Attachment;
			};
		};
		SoundGroups: SoundGroup & {
			Others: SoundGroup;
		};
	};
}
