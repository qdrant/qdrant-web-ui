import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../utils/snackbarOptions';

export const useCopyToClipboard = ({
  successMessage = 'Copied to clipboard',
  duration = 1000,
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const successSnackbarOptions = getSnackbarOptions('success', closeSnackbar, duration);
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar(successMessage, successSnackbarOptions);
      return true;
    } catch (err) {
      enqueueSnackbar(err.message, errorSnackbarOptions);
      return false;
    }
  };

  return { copyToClipboard };
};
