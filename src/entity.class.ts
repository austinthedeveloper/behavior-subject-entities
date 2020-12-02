import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  EntityObjContainer,
  IdSelector,
  EntityOptions,
  EntitySnapshot,
  EntityCallback,
} from './interfaces';

export class EntityClass<T> {
  private data: BehaviorSubject<EntityObjContainer<T>> = new BehaviorSubject<
    EntityObjContainer<T>
  >({});
  private items: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private activeId: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public data$: Observable<EntityObjContainer<T>> = this.data.asObservable();
  public items$: Observable<T[]> = combineLatest([
    this.items.asObservable(),
    this.data$,
  ]).pipe(map(([ids, data]) => this.reduceIds(ids, data)));
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
  public idSelector!: IdSelector<T>;
  private callback!: EntityCallback<T>;

  constructor(options: EntityOptions<T> = {}) {
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
  private setOptions(options: EntityOptions<T>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.idSelector = options.key || ((instance: any) => instance.id);
    this.callback = options.callback || (snapshot => {});
  }

  private setNames(options: EntityOptions<T>) {
    this.entityName = options.name || 'Item';
    this.entityNamePlural = options.plural || `${this.entityName}s`;
  }

  /**
   * Get a snapshot of the stored values
   *
   * @readonly
   * @type {EntitySnapshot<T>}
   * @memberof EntityClass
   */
  get snapshot(): EntitySnapshot<T> {
    return {
      data: this.data.value,
      items: this.items.value,
      populated: this.reduceIds(this.items.value, this.data.value),
      activeId: this.activeId.value,
    };
  }

  /**
   * Returns a single Entry as an Observable
   *
   * @param {string} id
   * @return {*}  {Observable<T>}
   * @memberof EntityClass
   */
  getOne(id: string): Observable<T> {
    return this.data$.pipe(map(data => data[id]));
  }
  /**
   * Returns multiple Entries as an Observable
   *
   * @param {string[]} ids
   * @return {*}  {Observable<T[]>}
   * @memberof EntityClass
   */
  getMany(ids: string[]): Observable<T[]> {
    return this.data$.pipe(map(data => this.reduceIds(ids, data)));
  }

  reduceIds(ids: string[], data: EntityObjContainer<T>): T[] {
    return ids.reduce((curr: T[], id: string) => [...curr, data[id]], []);
  }

  /**
   * Add a single Entry
   *
   * @param {T} item
   * @memberof EntityClass
   */
  addOne(item: T) {
    this.addMany([item]);
  }

  /**
   * Add more than one Entry
   *
   * @param {T[]} arr
   * @memberof EntityClass
   */
  addMany(arr: T[]) {
    const data = this.snapshot.data;
    const items = this.snapshot.items;
    arr.forEach(item => {
      const id = this.idSelector(item);
      data[id] = item;
      if (!items.includes(id)) {
        items.push(id);
      }
    });

    this.items.next(items);
    this.data.next(data);
    this.runCallback();
  }

  /**
   * Update one Entry
   *
   * @param {Partial<T>} item
   * @memberof EntityClass
   */
  updateOne(item: T) {
    this.updateMany([item]);
  }

  /**
   * Update more than one Entry
   *
   * @param {Partial<T>[]} arr
   * @memberof EntityClass
   */
  updateMany(arr: T[]) {
    const data = this.snapshot.data;
    arr.forEach(item => {
      const id = this.idSelector(item);
      data[id] = {...data[id], ...item};
    });
    this.data.next(data);
    this.runCallback();
  }

  /**
   * Remove one Entry
   *
   * @param {*} id
   * @memberof EntityClass
   */
  removeOne(id: string) {
    this.removeMany([id]);
  }

  /**
   * Remove more than one Entry
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
    this.items.next(items);
    this.data.next(data);
    this.runCallback();
  }

  /**
   * Reset the items
   *
   * @memberof EntityClass
   */
  removeAll() {
    this.items.next([]);
    this.data.next({});
  }

  /**
   * Set an Active Entry in the service.
   * Useful alternative to getOne()
   *
   * @param {string} id
   * @memberof EntityClass
   */
  setActiveId(id: string) {
    this.activeId.next(id);
  }

  /**
   * Get the full object when an ActiveId has been set
   * Returns undefined if it can't find it in the BehaviorSubject
   *
   * @return {*}  {(Observable<T | null>)}
   * @memberof EntityClass
   */
  getActive(): Observable<T | null> {
    return combineLatest([this.data$, this.activeId$]).pipe(
      map(([data, id]) => data[id])
    );
  }

  /**
   * Returns true if the Entry exists in the BehaviorSubject
   * Returns false if the Entry does not exist
   *
   * @param {string} id
   * @return {*}  {boolean}
   * @memberof EntityClass
   */
  exists(id: string): boolean {
    return this.snapshot.items.includes(id);
  }

  /**
   * Run the callback function every time data has been changed
   * Add/Remove/Update
   * All Get calls do not call the callback
   *
   * @memberof EntityClass
   */
  runCallback() {
    this.callback(this.snapshot);
  }
}
