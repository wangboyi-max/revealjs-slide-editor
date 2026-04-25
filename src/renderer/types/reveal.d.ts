declare module 'reveal.js' {
  interface RevealOptions {
    controls?: boolean;
    progress?: boolean;
    history?: boolean;
    keyboard?: boolean;
    touch?: boolean;
    loop?: boolean;
    autoSlide?: number;
    transition?: string;
    embedded?: boolean;
    width?: number;
    height?: number;
    margin?: number;
    minScale?: number;
    maxScale?: number;
  }

  interface RevealDeck {
    slide: (index: number) => void;
    layout: () => void;
    sync: () => void;
    destroy: () => void;
  }

  interface RevealApi {
    initialize: (options?: RevealOptions) => Promise<RevealDeck> | RevealDeck;
    layout: () => void;
    sync: () => void;
    destroy: () => void;
  }

  const Reveal: RevealApi;
  export default Reveal;
}
