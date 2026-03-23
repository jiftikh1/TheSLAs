/**
 * Generates funny, tech-flavored anonymous usernames — Blind-style.
 * Assigned once on first sign-in and stored permanently.
 */

const adjectives = [
  "Async", "Legacy", "Deprecated", "Serverless", "Agile", "Null",
  "Recursive", "Compiled", "Deployed", "Refactored", "Cached", "Forked",
  "Merged", "Containerized", "Stateless", "Immutable", "Distributed",
  "Encrypted", "Verbose", "Blazing", "Rusty", "Turbo", "Lazy", "Eager",
  "Frozen", "Volatile", "Abstract", "Headless", "Monolithic", "Scalable",
  "Flaky", "Hardcoded", "Hotfixed", "Offshore", "On-Call", "Pivoting",
  "Refactoring", "Yolo", "Scrumming", "Over-Engineered", "Optimistic",
  "Pessimistic", "Blocking", "Throttled", "Deprecated", "Production",
  "Staging", "Moonlighting", "Remote", "Senior", "Junior", "Staff",
];

const nouns = [
  "Yak", "Penguin", "Goblin", "Dragon", "Wizard", "Narwhal", "Platypus",
  "Walrus", "Hamster", "Llama", "Falcon", "Otter", "Badger", "Pangolin",
  "Porcupine", "Wombat", "Axolotl", "Capybara", "Quokka", "Lemur",
  "Raccoon", "Tapir", "Manatee", "Armadillo", "Flamingo", "Marmot",
  "Wolverine", "Aardvark", "Blobfish", "Tardigrade", "Cassowary",
];

export function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

/**
 * Generates a username and ensures it's unique in the DB.
 * Retries up to 10 times before appending a number.
 */
export async function generateUniqueUsername(
  checkExists: (username: string) => Promise<boolean>
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateUsername();
    const exists = await checkExists(candidate);
    if (!exists) return candidate;
  }
  // Fallback: append random number
  return `${generateUsername()}${Math.floor(Math.random() * 999)}`;
}
