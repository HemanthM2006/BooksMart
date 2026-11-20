export default function StorefrontHero() {
  return (
    <section className="storefront-hero" id="home">
      <div className="hero-copy">
        <h1>Find your next<br /><em>great read.</em></h1>
        <p>Browse the shelves, peek inside a book, and keep a reading list of your favourites.</p>
        <a href="#books" className="hero-button">Explore the collection <span aria-hidden="true">↗</span></a>
      </div>
      <div className="still-life" aria-hidden="true">
        <div className="halo" />
        <div className="volume volume-back"><i /></div>
        <div className="volume volume-front"><i /><b>Books<br /><em>Mart.</em></b><span>✳</span></div>
        <div className="shelf" />
      </div>
    </section>
  );
}
