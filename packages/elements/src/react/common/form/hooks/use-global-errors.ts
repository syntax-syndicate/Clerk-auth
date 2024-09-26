import { globalErrorsSelector } from '~/internals/machines/form';

import { FormCtx } from '../context';

export function useGlobalErrors() {
  const errors = FormCtx.useSelector(globalErrorsSelector);

  return {
    errors,
  };
}
