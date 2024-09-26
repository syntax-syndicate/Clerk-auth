import { type FieldDetails, fieldFeedbackSelector } from '~/internals/machines/form';

import { FormCtx } from '../context';

export function useFieldFeedback({ name }: Partial<Pick<FieldDetails, 'name'>>) {
  const feedback = FormCtx.useSelector(fieldFeedbackSelector(name));

  return {
    feedback,
  };
}
