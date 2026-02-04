export interface CoreLoader<T> {
  load(key: string): undefined | T | Promise<T | undefined> 
}
