import { get, put } from "@vercel/blob";

interface FollowRecord {
  follower: string; // wallet address of the person following
  creator: string; // wallet address being followed
}

const PATHNAME = "store/follows.json";

async function readFollows(): Promise<FollowRecord[]> {
  const result = await get(PATHNAME, { access: "public", useCache: false });
  if (!result) return [];
  const text = await new Response(result.stream).text();
  try {
    return JSON.parse(text) as FollowRecord[];
  } catch {
    return [];
  }
}

async function writeFollows(records: FollowRecord[]): Promise<void> {
  await put(PATHNAME, JSON.stringify(records, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getFollowState(
  follower: string | null,
  creator: string
): Promise<{ count: number; following: boolean }> {
  const all = await readFollows();
  const count = all.filter((f) => f.creator === creator).length;
  const following = follower ? all.some((f) => f.follower === follower && f.creator === creator) : false;
  return { count, following };
}

export async function getFollowingList(follower: string): Promise<string[]> {
  const all = await readFollows();
  return all.filter((f) => f.follower === follower).map((f) => f.creator);
}

export async function getFollowerList(creator: string): Promise<string[]> {
  const all = await readFollows();
  return all.filter((f) => f.creator === creator).map((f) => f.follower);
}

export async function setFollow(
  follower: string,
  creator: string,
  follow: boolean
): Promise<{ count: number; following: boolean }> {
  let all = await readFollows();
  const exists = all.some((f) => f.follower === follower && f.creator === creator);

  if (follow && !exists) all.push({ follower, creator });
  if (!follow && exists) all = all.filter((f) => !(f.follower === follower && f.creator === creator));

  await writeFollows(all);
  const count = all.filter((f) => f.creator === creator).length;
  return { count, following: follow };
}
