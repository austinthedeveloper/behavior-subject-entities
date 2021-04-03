import {EntityCallback} from './callback.interface';
import {IdSelector} from './id-selector.interface';

export interface EntityObjContainerString<T> {
  [key: string]: T;
}
export type EntityObjContainer<T> = EntityObjContainerString<T>;
export interface EntityOptions<T> {
  key?: IdSelector<T>;
  callback?: EntityCallback<T>;
  name?: string;
  plural?: string;
}
