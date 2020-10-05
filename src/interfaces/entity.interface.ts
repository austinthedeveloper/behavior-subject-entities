import {IdSelector} from './id-selector.interface';

export interface EntityObjContainerString<T> {
  [key: string]: T;
}
export type EntityObjContainer<T> = EntityObjContainerString<T>;
export interface EntityOptions<T> {
  key?: IdSelector<T>;
  name?: string;
  plural?: string;
}
export interface EntityUpdate<T> {
  id: string;
  item: Partial<T>;
}
export interface EntityAdd<T> {
  id: string;
  item: T;
}

export interface EntitySnapshot<T> {
  data: EntityObjContainer<T>;
  items: string[];
  activeId: string;
}
