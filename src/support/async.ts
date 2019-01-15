export async function forEachAsync<T>(data: T[], action: ((e: T) => Promise<void>)) {
    for (const element of data) {
        await action(element);
    }
}
