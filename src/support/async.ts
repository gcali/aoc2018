export async function forEachAsync<T>(data: T[], action: ((e: T) => Promise<void>)) {
    for (const element of data) {
        await action(element);
    }
}

export function setTimeoutAsync(callback: () => void, timeout: number): Promise<void> {
    return new Promise<void>((resolve, reject) => setTimeout(() => resolve(), timeout));
}