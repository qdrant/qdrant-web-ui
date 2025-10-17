import { useMemo } from 'react';
import { formatJSON } from '../common/utils';
import { bigIntJSON } from '../common/bigIntJSON';

export const useFormattedJSON = (code) => {
  return useMemo(() => {
    const formatted = formatJSON(code, bigIntJSON);

    return {
      formattedCode: formatted,
    };
  }, [code]);
};
