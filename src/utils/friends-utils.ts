import type { FriendLink } from "@/types/config";

export function getSortedFriendTags(friends: FriendLink[]): string[] {
	const tagWeights = new Map<string, number>();

	for (const friend of friends) {
		for (const tag of friend.tags ?? []) {
			tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + friend.weight);
		}
	}

	return [...tagWeights.entries()]
		.sort(([tagA, weightA], [tagB, weightB]) => {
			const weightDiff = weightB - weightA;
			return weightDiff === 0 ? tagA.localeCompare(tagB) : weightDiff;
		})
		.map(([tag]) => tag);
}
