import { type FieldDetails, fieldHasValueSelector } from '~/internals/machines/form';

import { FormCtx } from '../context';
import { useFieldFeedback } from './use-field-feedback';

export function useField({ name }: Partial<Pick<FieldDetails, 'name'>>) {
  const hasValue = FormCtx.useSelector(fieldHasValueSelector(name));
  const { feedback } = useFieldFeedback({ name });

  const shouldBeHidden = false; // TODO: Implement clerk-js utils
  const hasError = feedback ? feedback.type === 'error' : false;

  return {
    hasValue,
    props: {
      'data-hidden': shouldBeHidden ? true : undefined,
      serverInvalid: hasError,
    },
  };
}
