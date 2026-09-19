export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <h1 className="text-4xl mb-6" style={{ color: "var(--color-ink)", fontWeight: 600 }}>
        About ShopEZ
      </h1>
      <p className="text-neutral-600 leading-relaxed mb-4">
        ShopEZ started with a simple idea: everyday clothing shouldn't be complicated to shop for. No
        overwhelming choice, no guesswork on sizing — just well-made basics in the sizes and colors
        that actually fit real people.
      </p>
      <p className="text-neutral-600 leading-relaxed">
        Every piece in our catalog is chosen for how it wears day to day, not just how it photographs.
        We keep our range focused so you can actually find what you're looking for.
      </p>
    </div>
  );
}