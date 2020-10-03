import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IdSelector } from './id-selector.class';

type EntityKey = string | number;
interface EntityObjContainerNumber<F> {
  [key: number]: F;
}
interface EntityObjContainerString<F> {
  [key: string]: F;
}
type EntityObjContainer<F> = EntityObjContainerString<F>;
interface EntityOptions<T> {
  key?: IdSelector<T>;
  name?: string;
  plural?: string;
}
interface EntityUpdate<F> {
  id: string;
  item: Partial<F>;
}
interface EntityAdd<F> {
  id: string;
  item: F;
}
export class EntityClass<F> {
  private data: BehaviorSubject<EntityObjContainer<F>> = new BehaviorSubject<EntityObjContainer<F>>(
    {}
  );
  private items: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private activeId: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public data$ = this.data.asObservable();
  public items$ = this.items.asObservable().pipe(
    map(items =>
      items.reduce((prev: F[], curr: string) => {
        return [...prev, this.data.value[curr]];
      }, [])
    )
  );
  public activeId$ = this.activeId.asObservable();

  /**
   * Proper names used for action calls. Defaults to Item/Items if not set with options
   *
   * @memberof EntityClass
   */
  entityName = '';
  entityNamePlural = '';

  /**
   * This is what is used as the key for the data object. This can be changed by passing a new value in the options parameter
   * '_id' is the default value
   *
   * @memberof EntityClass
   */
  public idSelector!: IdSelector<F>;

  constructor(options: EntityOptions<F> = {}) {
    this.setOptions(options);
    this.setNames(options);
  }

  /**
   * This takes in a set of options to configure the service
   *
   * @private
   * @param {EntityOptions} options
   * @memberof EntityClass
   */
  private setOptions(options: EntityOptions<F> = {}) {
    this.idSelector = options.key || ((instance: any) => instance.id);
  }

  private setNames(options: EntityOptions<F> = {}) {
    this.entityName = options.name || 'Item';
    this.entityNamePlural = options.plural || `${this.entityName}s`;
  }

  /**
   * Get a snapshot of the stored values
   *
   * @readonly
   * @type {{ data: EntityObjContainer<F>; items: string[] }}
   * @memberof EntityClass
   */
  get snapshot(): { data: EntityObjContainer<F>; items: string[]; activeId: string } {
    return {
      data: this.data.value,
      items: this.items.value,
      activeId: this.activeId.value,
    };
  }

  /**
   * Returns a single Entry as an Observable
   *
   * @param {string} id
   * @return {*}  {Observable<F>}
   * @memberof EntityClass
   */
  getOne(id: string): Observable<F> {
    return this.data$.pipe(
      map(data => data[id])
      // map(data => (data ? { ...data } : undefined))
    );
  }
  getMany(ids: string[]): Observable<F[]> {
    return this.data$.pipe(
      map(data => ids.reduce((curr: F[], id: string) => [...curr, data[id]], [])),
      map(data => [...data])
    );
  }

  /**
   * Add a single Entry
   *
   * @param {F} item
   * @memberof EntityClass
   */
  addOne(item: EntityAdd<F>) {
    this.addMany([item]);
  }

  /**
   * Add more than one entry
   *
   * @param {F[]} arr
   * @memberof EntityClass
   */
  addMany(arr: EntityAdd<F>[]) {
    const data = this.snapshot.data;
    let items = this.snapshot.items;
    arr.forEach(({ id, item }) => {
      data[id] = item;
      const existsInArray = items.includes(id);
      if (!existsInArray) {
        items = items.filter(v => v !== id);
        items.push(id);
      }
    });

    this.data.next(data);
    this.items.next(items);
  }

  /**
   * Update one entry
   *
   * @param {Partial<F>} item
   * @memberof EntityClass
   */
  updateOne(item: EntityUpdate<F>) {
    this.updateMany([item]);
  }

  /**
   * Update more than one entry
   *
   * @param {Partial<F>[]} arr
   * @memberof EntityClass
   */
  updateMany(arr: EntityUpdate<F>[]) {
    const data = this.snapshot.data;
    arr.forEach(({ id, item }) => {
      data[id] = { ...data[id], ...item };
    });
    this.data.next(data);
  }

  /**
   * Remove one entry
   *
   * @param {*} id
   * @memberof EntityClass
   */
  removeOne(id: string) {
    this.removeMany([id]);
  }

  /**
   * Remove more than one entry
   *
   * @param {string[]} ids
   * @memberof EntityClass
   */
  removeMany(ids: string[]) {
    const data = this.snapshot.data;
    let items = this.snapshot.items;
    ids.forEach(id => {
      delete data[id];
      items = items.filter(v => v !== id);
    });
    this.data.next(data);
    this.items.next(items);
  }

  setActiveId(id: string) {
    this.activeId.next(id);
  }

  getActive(): Observable<F> {
    return combineLatest([this.data$, this.activeId$]).pipe(
      map(([data, id]) => {
        return { ...data[id] };
      })
    );
  }

  exists(id: string): boolean {
    return this.snapshot.items.includes(id);
  }
}
