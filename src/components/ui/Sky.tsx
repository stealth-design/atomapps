/**
 * The sky both the contact page and the CCPA request page sit on.
 *
 * CSS, not a photograph. The reference uses a cloud plate we have no
 * equivalent of, so it is built from the brand blue (#2774c1) as a linear wash
 * with four soft radial highlights over it.
 *
 * Plain `absolute inset-0`, no negative z-index: the section around this
 * paints its own `bg` first, and a negative-z child would sit *behind* that
 * opaque colour rather than over it — which is what flattened it to one solid
 * blue. DOM order does the stacking instead, so the washes land over the base
 * and the content, which is `relative`, lands over them.
 */
export function Sky() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #1d5fa8 0%, #2774c1 38%, #5aa0dd 72%, #a8cdec 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(52% 40% at 6% 16%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 66%)",
            "radial-gradient(40% 34% at 94% 6%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 64%)",
            "radial-gradient(64% 44% at 84% 88%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0) 70%)",
            "radial-gradient(46% 30% at 30% 100%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 68%)",
          ].join(","),
        }}
      />
    </>
  );
}
