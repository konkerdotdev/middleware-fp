import * as P from '@konker.dev/effect-ts-prelude';

import type { Handler } from '../index';
import type { MiddlewareError } from '../lib/MiddlewareError';
import { toMiddlewareError } from '../lib/MiddlewareError';

const TAG = 'path-parameters-validator';

export type WithPathParameters = {
  pathParameters?: unknown;
};
export type WithValidatedPathParameters<V> = {
  pathParameters: V;
  validatorRawPathParameters: unknown;
};

export const middleware =
  <V>(schema: P.Schema.Schema<V>) =>
  <I extends WithPathParameters, WO, WE, WR>(
    wrapped: Handler<I & WithValidatedPathParameters<V>, WO, WE, WR>
  ): Handler<I, WO, WE | MiddlewareError, WR> =>
  (i: I) =>
    P.pipe(
      P.Effect.succeed(i),
      P.Effect.tap(P.Effect.logDebug(`[${TAG}] IN`)),
      P.Effect.flatMap((i) =>
        P.pipe(i.pathParameters, P.Schema.decodeUnknown(schema, { errors: 'all', onExcessProperty: 'ignore' }))
      ),
      P.Effect.mapError((e) => toMiddlewareError(e)),
      P.Effect.map((validatedPathParameters: V) => ({
        ...i,
        pathParameters: validatedPathParameters,
        validatorRawPathParameters: i.pathParameters,
      })),
      P.Effect.flatMap(wrapped)
    );
