import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createNewSaveRecord, metadataFromSnapshot, normalizeSaveRecord } from '../src/save/schema';
import { createSerialTaskQueue } from '../src/game/mobileSession';

type Host = { type: unknown; props: Record<string, unknown> };

async function testFailedStorageReadCanRetryWithoutOverwritingSave() {
  let cursor = 0;
  const hooks: unknown[] = [];
  const deps = new Map<number, readonly unknown[]>();
  const effects: Array<() => void | (() => void)> = [];
  const writes: unknown[] = [];
  let readAttempts = 0;
  const existing = createNewSaveRecord(1);
  const serialized = JSON.stringify(existing);
  const storage = {
    async multiGet(_keys: string[]) {
      readAttempts++;
      // Both save slots try to load. The first attempt cannot reach storage.
      if (readAttempts <= 2) throw new Error('Transient Android database read failure');
      return _keys.map((key: string) => [key, key === '@cart-crown/save/1' ? serialized : null]);
    },
    async setItem(...args: unknown[]) { writes.push(args); },
    async multiSet(...args: unknown[]) { writes.push(args); },
    async multiRemove(...args: unknown[]) { writes.push(args); }
  };

  const jsx = (type: unknown, props: Record<string, unknown> | null, ...children: unknown[]): Host => ({
    type, props: { ...props, ...(children.length ? { children } : {}) }
  });
  const mockReact: any = {
    __esModule: true,
    createElement: jsx,
    createContext: () => ({ Provider: 'SaveContextProvider' }),
    useContext: () => { throw new Error('Not invoked in this provider test'); },
    useState(initial: unknown) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? (initial as () => unknown)() : initial;
      return [hooks[index], (next: any) => {
        hooks[index] = typeof next === 'function' ? next(hooks[index]) : next;
      }];
    },
    useRef(initial: unknown) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    },
    useEffect(effect: () => void | (() => void), next: readonly unknown[] = []) {
      const index = cursor++;
      const old = deps.get(index);
      if (old && old.length === next.length && old.every((value, i) => value === next[i])) return;
      deps.set(index, next);
      effects.push(effect);
    },
    useMemo(make: () => unknown, _deps: readonly unknown[]) {
      cursor++;
      return make();
    }
  };
  mockReact.default = mockReact;

  const file = 'src/save/SaveProvider.tsx';
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React, esModuleInterop: true
    }
  });
  assert.equal((compiled.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
  const mod = { exports: {} as any };
  const requireModule = (name: string): any => {
    if (name === 'react') return mockReact;
    if (name === '@react-native-async-storage/async-storage') return { __esModule: true, default: storage };
    if (name === './schema') return { createNewSaveRecord, metadataFromSnapshot, normalizeSaveRecord };
    if (name === '../game/mobileSession') return { createSerialTaskQueue };
    throw new Error('Unexpected provider dependency: ' + name);
  };
  new Function('require', 'module', 'exports', compiled.outputText)(requireModule, mod, mod.exports);

  function render(): any {
    cursor = 0;
    const tree = mod.exports.SaveProvider({ children: 'Game' });
    assert.equal(tree.type, 'SaveContextProvider');
    for (const effect of effects.splice(0)) effect();
    return tree.props.value;
  }
  const settle = () => new Promise<void>(resolve => setImmediate(resolve));

  let value = render();
  assert.equal(value.ready, false);
  await settle();
  value = render();
  assert.equal(value.loadError, true, 'Rejected reads must show a recoverable error, not hang indefinitely.');
  assert.equal(value.ready, false, 'Failed reads cannot be treated as empty/new save slots.');
  assert.deepEqual(value.slots, [null, null]);
  assert.equal(writes.length, 0, 'Read failure may never clear, initialize or overwrite saved games.');

  value.retryLoad();
  render(); // schedules the new effect, clearing the prior error after commit
  value = render(); // observe React's next render with that cleared state
  assert.equal(value.loadError, false, 'Retry should return to the original loading state.');
  await settle();
  value = render();
  assert.equal(value.ready, true, 'Successful second read should resume the save selector.');
  assert.equal(value.loadError, false);
  assert.equal(value.slots[0]?.slotId, 1, 'Retry must recover the existing slot rather than replacing it.');
  assert.equal(value.slots[1], null);
  assert.equal(writes.length, 0, 'Recovery of a healthy primary slot must not rewrite any data.');

  await value.selectSlot(1);
  value = render();
  assert.equal(value.selectedSlotId, 1, 'User can continue the original saved campaign after retry.');
  assert.ok(value.selectedRecord?.snapshot, 'The restored save must preserve its original snapshot.');

  const screen = readFileSync('src/screens/SaveSelectScreen.tsx', 'utf8');
  assert.ok(screen.includes('Unable to read saved games') && screen.includes('label="Retry loading saves"'),
    'Failed storage reads must present a retry control instead of the endless loading spinner.');
  assert.ok(screen.includes('onPress={retryLoad}') && screen.includes('if (!ready)'),
    'The retry control must be wired to the provider before save slots become interactive.');
  console.log('PASS: storage load rejection stays non-destructive; retry restores the original save and Continue route.');
}

void testFailedStorageReadCanRetryWithoutOverwritingSave().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
