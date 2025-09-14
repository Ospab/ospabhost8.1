declare module 'react-dom/client' {
  import * as React from 'react';
  import { ReactNode } from 'react';
  interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  function createRoot(container: Element | DocumentFragment): Root;
  export { createRoot };
}
