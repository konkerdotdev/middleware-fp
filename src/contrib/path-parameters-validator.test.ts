import * as P from '@konker.dev/effect-ts-prelude';

import { Deps, echoCoreInDeps } from '../test/test-common';
import * as unit from './path-parameters-validator';

export type In = { pathParameters?: any };

export const testSchema = P.Schema.Struct({
  foo: P.Schema.Literal('foo_value'),
});

const TEST_IN_1: In = { pathParameters: { foo: 'foo_value' } };
const TEST_IN_2: In = { pathParameters: { foo: 'wam' } };
const TEST_IN_3: In = {};
const TEST_DEPS: Deps = { bar: 'bar' };

describe('middleware/path-parameters-validator', () => {
  it('should work as expected with valid data', async () => {
    const egHandler = P.pipe(echoCoreInDeps(Deps), unit.middleware(testSchema));
    const result = P.pipe(egHandler(TEST_IN_1), P.Effect.provideService(Deps, TEST_DEPS), P.Effect.runPromise);
    await expect(result).resolves.toStrictEqual({
      bar: 'bar',
      pathParameters: { foo: 'foo_value' },
      validatedPathParameters: { foo: 'foo_value' },
    });
  });

  it('should work as expected with invalid data', async () => {
    const egHandler = P.pipe(echoCoreInDeps(Deps), unit.middleware(testSchema));
    const result = P.pipe(egHandler(TEST_IN_2), P.Effect.provideService(Deps, TEST_DEPS), P.Effect.runPromise);
    await expect(result).rejects.toThrow('ParseError');
  });

  it('should work as expected with invalid data', async () => {
    const egHandler = P.pipe(echoCoreInDeps(Deps), unit.middleware(testSchema));
    const result = P.pipe(egHandler(TEST_IN_3), P.Effect.provideService(Deps, TEST_DEPS), P.Effect.runPromise);
    await expect(result).rejects.toThrow('ParseError');
  });
});
