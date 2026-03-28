export namespace VFXUtils {
	export function EmitAttachment(Att: Instance, CustomEmitCount?: number) {
		Att.GetDescendants()
			.filter((v): v is ParticleEmitter => v.IsA("ParticleEmitter"))
			.forEach((v) => {
				const EmitDuration = v.GetAttribute("EmitDuration") as number | undefined;
				if (EmitDuration && EmitDuration > 0) {
					v.Enabled = true;
					task.delay(EmitDuration, () => {
						v.Enabled = false;
					});
				} else {
					v.Emit(CustomEmitCount ?? (v.GetAttribute("EmitCount") as number) ?? 1);
					v.Enabled = false;
				}
			});
	}
}
