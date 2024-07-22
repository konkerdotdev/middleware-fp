import * as P from '@konker.dev/effect-ts-prelude';

import type { Handler } from '../index';
import type { MiddlewareError } from '../lib/error';
import { toMiddlewareError } from '../lib/error';

const TAG = 'env-validator';

export type WithValidatedEnv<V> = {
  validatedEnv: V;
};

export const middleware =
  <V>(schema: P.Schema.Schema<V>) =>
  <I, WO, WE, WR>(wrapped: Handler<I & WithValidatedEnv<V>, WO, WE, WR>): Handler<I, WO, WE | MiddlewareError, WR> =>
  (i: I) =>
    P.pipe(
      // Lift the input
      P.Effect.succeed(i),
      // Log before
      P.Effect.tap(P.Effect.logDebug(`[${TAG}] IN`)),
      // Parse the environment according to the given schema and inject into input
      P.Effect.flatMap((_) =>
        P.pipe(process.env, P.Schema.decodeUnknown(schema, { errors: 'all', onExcessProperty: 'ignore' }))
      ),
      P.Effect.mapError(toMiddlewareError),
      P.Effect.map((validatedEnv: V) => ({
        ...i,
        validatedEnv,
      })),
      // Call the next middleware in the stack
      P.Effect.flatMap(wrapped),
      // Log after
      P.Effect.tap(P.Effect.logDebug(`[${TAG}] OUT`))
    );
