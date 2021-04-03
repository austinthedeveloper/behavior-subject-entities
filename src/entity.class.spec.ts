import {EntityClass} from './entity.class';

interface MockInterface {
  id: string;
  name: string;
}
interface MockInterfaceAlt {
  _id: string;
  name: string;
}

function getClass(): EntityClass<MockInterface> {
  return new EntityClass<MockInterface>();
}

describe('Entity Class', () => {
  describe('Options', () => {
    it('Default Options', () => {
      const entity = new EntityClass<MockInterface>();
      expect(entity.idSelector({id: '555', name: 'test'})).toEqual('555');
      expect(entity.entityName).toEqual('Item');
      expect(entity.entityNamePlural).toEqual('Items');
    });
    it('should use a different ID selector', () => {
      const selector = (instance: MockInterfaceAlt) => instance._id;
      const entity = new EntityClass<MockInterfaceAlt>({key: selector});
      expect(entity.idSelector({_id: '555', name: 'test'})).toEqual('555');
    });
    it('should change the names used', () => {
      const entity = new EntityClass<MockInterface>({
        name: 'Test',
        plural: 'Tests',
      });
      expect(entity.entityName).toEqual('Test');
      expect(entity.entityNamePlural).toEqual('Tests');
    });
  });
  describe('Adding Items', () => {
    let entity: EntityClass<MockInterface>;
    beforeEach(() => {
      entity = getClass();
      entity.addOne({id: '1', name: 'testing'});
    });

    it('should add an item to the items array', done => {
      entity.items$.subscribe(items => {
        expect(items.length).toEqual(1);
        done();
      });
    });

    it('should add many items to the items array', done => {
      entity.addMany([
        {id: '2', name: 'testing'},
        {id: '3', name: 'testing'},
      ]);

      entity.items$.subscribe(items => {
        expect(items.length).toEqual(3);
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
  describe('Reading Items', () => {
    let entity: EntityClass<MockInterface>;
    beforeEach(() => {
      entity = getClass();
      entity.addMany([
        {id: '1', name: 'Name 1'},
        {id: '2', name: 'Name 2'},
        {id: '3', name: 'Name 3'},
      ]);
    });

    it('should retrieve one item', done => {
      entity.getOne('1').subscribe(item => {
        expect(entity.idSelector(item)).toEqual('1');
        done();
      });
    });
    it('should retrieve many items', done => {
      const arr = ['1', '2', '3'];
      entity.getMany(arr).subscribe(items => {
        items.forEach((item, index) => {
          expect(entity.idSelector(item)).toEqual(arr[index]);
        });
        done();
      });
    });
  });
  describe('Updating Items', () => {
    let entity: EntityClass<MockInterface>;
    beforeEach(() => {
      entity = getClass();
      addMany(entity);
    });

    it('should update one item', done => {
      entity.updateOne({id: '1', name: 'Test'});
      entity.getOne('1').subscribe(item => {
        expect(item.name).toEqual('Test');
        done();
      });
    });
    it('should update many items', done => {
      entity.updateMany([
        {id: '1', name: 'Test'},
        {id: '2', name: 'Test'},
        {id: '3', name: 'Test'},
      ]);
      entity.getMany(['1', '2', '3']).subscribe(items => {
        items.forEach(item => {
          expect(item.name).toEqual('Test');
        });
        done();
      });
    });
  });
  describe('Removing Items', () => {
    let entity: EntityClass<MockInterface>;
    beforeEach(() => {
      entity = getClass();
      addMany(entity);
    });

    it('should remove one item', done => {
      entity.removeOne('1');
      entity.items$.subscribe(items => {
        expect(items.length).toEqual(2);
        done();
      });
    });
    it('should remove many items', done => {
      entity.removeMany(['1', '2']);
      entity.items$.subscribe(items => {
        expect(items.length).toEqual(1);
        done();
      });
    });
    it('should remove all items', done => {
      entity.removeAll();
      entity.items$.subscribe(items => {
        expect(items.length).toEqual(0);
        done();
      });
    });
  });
  describe('Active Item', () => {
    let entity: EntityClass<MockInterface>;
    beforeEach(() => {
      entity = getClass();
      addMany(entity);
    });
    describe('Init', () => {
      it('should not start with an active id', done => {
        entity.activeId$.subscribe(id => {
          expect(id).toBeFalsy();
          done();
        });
      });
      it('should not start with an active item', done => {
        entity.getActive().subscribe(item => {
          expect(item).toBeFalsy();
          done();
        });
      });
    });

    describe('Setting a value', () => {
      beforeEach(() => {
        entity.setActiveId('1');
      });

      it('should return the active Id', done => {
        entity.activeId$.subscribe(id => {
          expect(id).toEqual('1');
          done();
        });
      });

      it('should return the active object', done => {
        entity.getActive().subscribe(item => {
          expect(item).toBeTruthy();
          done();
        });
      });
    });
  });

  describe('Exists', () => {
    let entity: EntityClass<MockInterface>;
    beforeEach(() => {
      entity = getClass();
      addMany(entity);
    });
    it('should return true when the item exists', () => {
      expect(entity.exists('1')).toBeTruthy();
      expect(entity.exists('2')).toBeTruthy();
      expect(entity.exists('3')).toBeTruthy();
    });
    it('should return false when the item does not exist', () => {
      expect(entity.exists('5')).toBeFalsy();
    });
  });
  describe('Snapshot', () => {
    it('should return a snapshot with no values', () => {
      const entity = getClass();
      expect(entity.snapshot).toBeDefined();
      expect(entity.snapshot.activeId).toBeFalsy();
      expect(entity.snapshot.data).toEqual({});
      expect(entity.snapshot.items.length).toBeFalsy();
    });
    it('should return a snapshot with values', done => {
      const entity = getClass();
      addMany(entity);
      entity.items$.subscribe(() => {
        expect(entity.snapshot).toBeDefined();
        expect(entity.snapshot.activeId).toBeFalsy();
        expect(Object.keys(entity.snapshot.data).length).toEqual(3);
        expect(entity.snapshot.items.length).toEqual(3);
        done();
      });
    });
  });
  describe('Callback functions', () => {
    it('should use the default callback function', () => {
      const result = 0;
      const entity = new EntityClass<MockInterface>();
      entity.addMany([
        {id: '2', name: 'testing'},
        {id: '3', name: 'testing'},
      ]);
      expect(result).toEqual(0);
    });
    it('should add a callback function', () => {
      let result = 0;
      const entity = new EntityClass<MockInterface>({
        callback: snapshot => {
          result = result + 1;
        },
      });
      entity.addMany([
        {id: '2', name: 'testing'},
        {id: '3', name: 'testing'},
      ]);
      expect(result).toEqual(1);
    });
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addMany(entity: EntityClass<any>) {
  entity.addMany([
    {id: '1', item: {id: '1', name: 'Name 1'}},
    {id: '2', item: {id: '2', name: 'Name 2'}},
    {id: '3', item: {id: '3', name: 'Name 3'}},
  ]);
}
