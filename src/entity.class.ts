import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface EntityObjContainer<F> {
  [key: string]: F;
}
interface EntityOptions {
  key?: string;
  name?: string;
  plural?: string;
}
export class EntityClass<F> {
  private data: BehaviorSubject<EntityObjContainer<F>> = new BehaviorSubject({});
  private items: BehaviorSubject<string[]> = new BehaviorSubject([]);
  private activeId: BehaviorSubject<string> = new BehaviorSubject(undefined);

  public data$ = this.data.asObservable();
  public items$ = this.items.asObservable().pipe(
    map(items =>
      items.reduce((prev, curr) => {
        return [...prev, this.data.value[curr]];
      }, [])
    )
  );
  public activeId$ = this.activeId.asObservable();

  /**
   * This is what is used as the key for the data object. This can be changed by passing a new value in the options parameter
   * '_id' is the default value
   *
   * @memberof EntityClass
   */
  key = '_id';

  /**
   * Proper names used for action calls. Defaults to Item/Items if not set with options
   *
   * @memberof EntityClass
   */
  entityName;
  entityNamePlural;

  constructor(options: EntityOptions = {}) {
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
  private setOptions(options: EntityOptions = {}) {
    const keys = Object.keys(options);
    keys.forEach(key => (this[key] = options[key]));
  }

  private setNames(options: EntityOptions = {}) {
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
      map(data => data[id]),
      map(data => (data ? { ...data } : undefined))
    );
  }
  getMany(ids: string[]): Observable<F[]> {
    return this.data$.pipe(
      map(data => ids.reduce((curr, id) => [...curr, data[id]], [])),
      map(data => [...data])
    );
  }

  /**
   * Add a single Entry
   *
   * @param {F} item
   * @memberof EntityClass
   */
  addOne(item: F) {
    this.addMany([item]);
  }

  /**
   * Add more than one entry
   *
   * @param {F[]} arr
   * @memberof EntityClass
   */
  addMany(arr: F[]) {
    const data = this.snapshot.data;
    let items = this.snapshot.items;
    arr.forEach(item => {
      const keyValue = item[this.key];
      data[keyValue] = item;
      const existsInArray = items.includes(keyValue);
      if (!existsInArray) {
        items = items.filter(v => v !== keyValue);
        items.push(keyValue);
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
  updateOne(item: Partial<F>) {
    this.updateMany([item]);
  }

  /**
   * Update more than one entry
   *
   * @param {Partial<F>[]} arr
   * @memberof EntityClass
   */
  updateMany(arr: Partial<F>[]) {
    const data = this.snapshot.data;
    arr.forEach(item => {
      data[item[this.key]] = { ...data[item[this.key]], ...item };
    });
    this.data.next(data);
  }

  /**
   * Remove one entry
   *
   * @param {*} id
   * @memberof EntityClass
   */
  removeOne(id) {
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
        return data[id] ? { ...data[id] } : null;
      })
    );
  }

  exists(id: string): boolean {
    return this.snapshot.items.includes(id);
  }
}
