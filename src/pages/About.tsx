import backgroundImage from "../assets/images/back.jpg";

const UberUns = () => {
  return (
    <div>
      {/* Hero секция с фоновым изображением */}
      <div className="relative h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Lassen Sie sich inspirieren, kochen Sie mit Leidenschaft und
                erleben Sie unvergessliche Momente bei Tisch.
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Контентная секция */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            Hallo, wir sind Amanda und Pedro und freuen uns, unsere Arbeit auf
            Rezeptwelt vorstellen zu können. Bei der Erkundung dieser
            erstaunlichen Website haben wir ein gastronomisches Universum voller
            köstlicher Rezepte, nützlicher Tipps und kulinarischer Inspiration
            entdeckt. Rezeptwelt ist ein Ort, an dem sich erfahrene Köche und
            Kochanfänger in ihrer Leidenschaft für das Essen vereinen können.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            Was uns besonders begeistert hat, war die Vielfalt der Rezepte. Von
            traditionellen, gemütlichen Gerichten bis hin zu innovativen
            Kreationen gibt es Optionen für jeden Geschmack und jede
            Gelegenheit. Jedes Rezept wird sorgfältig ausgewählt und getestet,
            um sicherzustellen, dass die Ergebnisse stets schmackhaft sind und
            es sich lohnt, sie zu teilen.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            Neben den Rezepten bietet Rezeptwelt auch nützliche Tipps zur
            Verbesserung der eigenen Kochkünste. Von Zubereitungstechniken bis
            hin zu Vorschlägen für Geschmackskombinationen - die Website lädt
            zum Entdecken und Experimentieren in der Küche ein. Es ist eine
            gemütliche und integrative Umgebung, in der jeder ermutigt wird, in
            die Kunst des Kochens einzutauchen und neue Möglichkeiten zu
            entdecken.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            Kurz gesagt, Rezeptwelt ist ein inspirierender gastronomischer Raum,
            der uns einlädt, unsere Leidenschaft für das Kochen zu entdecken, zu
            kreieren und zu teilen. Wir hoffen, dass unsere Präsentation Ihr
            Interesse geweckt hat, sich mit uns auf diese köstliche Reise in die
            Rezeptwelt zu begeben!
          </p>
        </div>
      </div>
    </div>
  );
};

export default UberUns;
