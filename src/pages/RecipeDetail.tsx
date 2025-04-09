import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Recipe, Ingredient } from "../types/database.types";
import Loading from "../components/Loading/Loading";
import Error from "../components/Error/Error";
import { useAuth } from "../contexts/AuthContext";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecipeDetails();
    }
  }, [id]);

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching recipe details for ID:", id);

      // Fetch recipe details
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (recipeError) {
        console.error("Error fetching recipe details:", recipeError);
        throw recipeError;
      }

      console.log("Recipe details fetched successfully:", recipeData);
      if (recipeData) setRecipe(recipeData);

      // Fetch ingredients
      console.log("Fetching ingredients for recipe ID:", id);
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from("ingredients")
        .select("*")
        .eq("recipe_id", id);

      if (ingredientsError) {
        console.error("Error fetching ingredients:", ingredientsError);
        throw ingredientsError;
      }

      console.log("Ingredients fetched successfully:", ingredientsData);
      if (ingredientsData) setIngredients(ingredientsData);
    } catch (error) {
      console.error("Error in fetchRecipeDetails:", error);
      setError("Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    setIsDeleting(true);
    try {
      // First delete all ingredients
      const { error: ingredientsError } = await supabase
        .from("ingredients")
        .delete()
        .eq("recipe_id", id);

      if (ingredientsError) throw ingredientsError;

      // Then delete the recipe
      const { error: recipeError } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id);

      if (recipeError) throw recipeError;

      navigate("/recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setError("Failed to delete recipe");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!recipe) return <Error message="Recipe not found" />;

  const isOwner = session?.user?.id === recipe.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-20 left-4 z-10 flex space-x-2">
        <button
          onClick={() => navigate(-1)}
          className="bg-yellow-400 text-white p-2 rounded-full shadow-lg hover:bg-yellow-500 transition-colors"
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        {isOwner && (
          <>
            <button
              onClick={() => navigate(`/recipe/${id}/edit`)}
              className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
              aria-label="Edit recipe"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              aria-label="Delete recipe"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </>
        )}
      </div>
      {/* Hero Section */}
      <div className="relative h-[400px] mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${recipe.img_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "400px",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {recipe.name}
            </h1>
            <div className="flex items-center justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{recipe.servings} servings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700">{recipe.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Instructions</h2>
              <div className="prose max-w-none">{recipe.instructions}</div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8 sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
              <ul className="space-y-3">
                {ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      {ingredient.additional_info && (
                        <span className="text-gray-500">
                          {" "}
                          ({ingredient.additional_info})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
