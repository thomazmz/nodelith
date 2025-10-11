export abstract class ConfigLoader {

  public abstract load(key: string): Promise<string | undefined> | string | undefined

  public static load(key: string): string | undefined  {
    return process.env[key] ?? undefined
  }
}
