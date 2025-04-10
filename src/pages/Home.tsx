import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Category } from "../types/database.types";
import Loading from "../components/Loading/Loading";
import Error from "../components/Error/Error";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";

// Import all background images
import back1 from "../assets/images/back.jpg";
import back2 from "../assets/images/back2.jpg";
import back3 from "../assets/images/back3.jpg";
import back4 from "../assets/images/back4.jpg";
import back5 from "../assets/images/back5.jpg";

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("categories").select("*");

      if (error) {
        throw error;
      }

      if (data) {
        console.log("Fetched categories:", data);
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategories = () => {
    console.log("Toggle categories clicked. Current state:", showAllCategories);
    setShowAllCategories(!showAllCategories);
  };

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 6);
  console.log(
    "Displayed categories:",
    displayedCategories.length,
    "of",
    categories.length
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[500px] mb-12">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="h-full w-full"
        >
          <SwiperSlide>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${back1})` }}
            />
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${back2})` }}
            />
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${back3})` }}
            />
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${back4})` }}
            />
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${back5})` }}
            />
          </SwiperSlide>
        </Swiper>
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Lassen Sie sich inspirieren, kochen Sie mit Leidenschaft und
                erleben Sie unvergessliche Momente bei Tisch.
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Discover amazing recipes from around the world
              </p>
              <Link
                to="/recipes"
                className="bg-yellow-600 text-white hover:bg-yellow-700 px-8 py-3 rounded-md text-lg font-medium inline-block"
              >
                Explore Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold mb-8">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              to={`/recipes/${category.id}`}
              className="group relative h-[300px] rounded-lg overflow-hidden shadow-lg"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${category.img_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "300px",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Debug information */}
        <div className="text-center mt-4 text-gray-600">
          Total categories: {categories.length}
        </div>

        {/* Show More/Less button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={toggleCategories}
            className="bg-yellow-600 text-white hover:bg-yellow-700 px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {showAllCategories ? "Weniger anzeigen" : "Mehr anzeigen"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
