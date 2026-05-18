'use client';

import React, { useEffect } from 'react';

export function VLibrasWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error VLibras is injected globally
      if (window.VLibras) {
        // @ts-expect-error VLibras is injected globally
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div {...{ vw: "true" }} className="enabled">
      <div {...{ "vw-access-button": "true" }} className="active"></div>
      <div {...{ "vw-plugin-wrapper": "true" }}>
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
}
