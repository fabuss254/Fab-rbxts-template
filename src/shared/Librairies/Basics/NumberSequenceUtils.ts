export namespace NumberSequenceUtils {
	export function GetNumberSequenceValueAtTime(NumberSeq: NumberSequence, Time: number) {
		if (Time <= 0) {
			return NumberSeq.Keypoints[0].Value;
		} else if (Time >= 1) {
			return NumberSeq.Keypoints[NumberSeq.Keypoints.size() - 1].Value;
		}

		for (let i = 0; i < NumberSeq.Keypoints.size() - 1; i++) {
			const CurrentKeypoint = NumberSeq.Keypoints[i];
			const NextKeypoint = NumberSeq.Keypoints[i + 1];

			if (Time >= CurrentKeypoint.Time && Time < NextKeypoint.Time) {
				const Alpha = (Time - CurrentKeypoint.Time) / (NextKeypoint.Time - CurrentKeypoint.Time);
				return CurrentKeypoint.Value + (NextKeypoint.Value - CurrentKeypoint.Value) * Alpha;
			}
		}

		return error("This should never happen.");
	}

	export function ScaleNumberSequence(NumSeq: NumberSequence, Scale: number): NumberSequence {
		const NewKeypoints: NumberSequenceKeypoint[] = [];
		NumSeq.Keypoints.forEach((Key) => {
			NewKeypoints.push(new NumberSequenceKeypoint(Key.Time, Key.Value * Scale, Key.Envelope * Scale));
		});
		return new NumberSequence(NewKeypoints);
	}
}
