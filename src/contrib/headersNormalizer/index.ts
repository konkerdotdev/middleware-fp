import * as P from '@konker.dev/effect-ts-prelude';

import type { Handler } from '../../index';
import { transformInput, transformOutput } from './lib';
import type {
  WithNormalizedInputHeaders,
  WithNormalizedOutputHeaders,
  WithPossibleInputHeaders,
  WithPossibleOutputHeaders,
} from './types';

const TAG = 'headerNormalizer';

export const middleware =
  <I, O, E, R>({ normalizeRequestHeaders = true, normalizeResponseHeaders = true } = {}) =>
  (
    wrapped: Handler<I & WithNormalizedInputHeaders, O & WithPossibleOutputHeaders, E, R>
  ): Handler<I & WithPossibleInputHeaders, O & WithNormalizedOutputHeaders, E, R> =>
  (i: I & WithPossibleInputHeaders) => {
    return P.pipe(
      P.Effect.succeed(i),
      P.Effect.tap(P.Effect.logDebug(`[${TAG}] IN`)),
      P.Effect.map(transformInput(normalizeRequestHeaders)),
      P.Effect.flatMap(wrapped),
      P.Effect.map(transformOutput(normalizeResponseHeaders)),
      P.Effect.tap(P.Effect.logDebug(`[${TAG}] OUT`))
    );
  };
