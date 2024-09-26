import type { SnapshotFrom } from 'xstate';

import type { TFormMachine } from '~/internals/machines/form';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TFormMachine>;

export const FormCtx = createContextFromActorRef<TFormMachine>('FormCtx');
