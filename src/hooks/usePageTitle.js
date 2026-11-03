// usePageTitle.js — a CUSTOM HOOK that sets the browser tab's title.
//
// A custom hook is just a function whose name starts with "use" and that calls other hooks.
// It lets pages share behaviour: each page writes one line → usePageTitle('Portfolio').
//
// The effect re-runs whenever `title` changes (it's in the dependency array),
// and the cleanup puts the default title back when the page unmounts.

import { useEffect } from 'react';

const APP_NAME = 'PaperTrade';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}
