import {EntityObjContainer} from './entity.interface';

export interface EntitySnapshot<T> {
  data: EntityObjContainer<T>;
  items: string[];
  populated: T[];
  activeId: string;
}
