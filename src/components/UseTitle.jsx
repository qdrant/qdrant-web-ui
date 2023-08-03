import React from 'react';

export default function useTitle(title) {
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  });
}
