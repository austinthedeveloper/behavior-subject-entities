import {EntitySnapshot} from './snapshot.interface';

export type EntityCallback<T> = (model: EntitySnapshot<T>) => void;
