'use client';

import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'wagmi/chains';
import '@coinbase/onchainkit/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: 'dark',
          theme: 'base',
        },
      }}
    >
      {children}
    </MiniKitProvider>
  );
}
