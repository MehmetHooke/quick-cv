declare module "expo-file-system" {
  export function moveAsync(options: { from: string; to: string }): Promise<void>;
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
}
