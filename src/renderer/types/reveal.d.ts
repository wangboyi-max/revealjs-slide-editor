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
  }

  interface RevealApi {
    initialize: (options?: RevealOptions) => { slide: (index: number) => void };
  }

  const Reveal: RevealApi;
  export default Reveal;
}
