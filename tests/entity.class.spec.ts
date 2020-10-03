import { EntityClass } from '../src/entity.class';

interface mockInterface {
  id: string;
  name: string;
}

function getClass(): EntityClass<mockInterface> {
  return new EntityClass<mockInterface>();
}

describe('Entity Class', () => {
  describe('Options', () => {
    it('Default Options', () => {
      const entity = new EntityClass<any>();
      expect(entity.idSelector({ id: '555', name: 'test' })).toEqual('555');
      expect(entity.entityName).toEqual('Item');
      expect(entity.entityNamePlural).toEqual('Items');
    });
    it('should use a different ID selector', () => {
      const selector = (instance: any) => instance._id;
      const entity = new EntityClass<any>({ key: selector });
      expect(entity.idSelector({ _id: '555', name: 'test' })).toEqual('555');
    });
    it('should change the names used', () => {
      const entity = new EntityClass<any>({ name: 'Test', plural: 'Tests' });
      expect(entity.entityName).toEqual('Test');
      expect(entity.entityNamePlural).toEqual('Tests');
    });
  });
  describe('Adding Items', () => {
    let entity: EntityClass<mockInterface>;
    beforeEach(() => {
      entity = getClass();
      entity.addOne({ id: '1', item: { id: '1', name: 'testing' } });
    });

    it('should add an item to the items array', done => {
      entity.items$.subscribe(items => {
        expect(items.length).toEqual(1);
        done();
      });
    });

    it('should add an item to the items object', done => {
      entity.data$.subscribe(obj => {
        expect(Object.keys(obj).length).toEqual(1);
        done();
      });
    });

    it('should populate the snapshot data', () => {
      const snapshot = entity.snapshot;
      expect(snapshot.items.length).toEqual(1);
      expect(Object.keys(snapshot.data).length).toEqual(1);
    });
  });
  describe('Snapshot', () => {
    it('should return a snapshot', () => {
      const entity = getClass();
      expect(entity.snapshot).toBeDefined();
    });
  });
});
