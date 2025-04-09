import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

interface Category {
  id: string;
  name: string;
}

interface Ingredient {
  id?: string;
  name: string;
  quantity_unit: string;
  additional_info: string;
}

interface FormData {
  name: string;
  description: string;
  servings: string;
  instructions: string;
  img_url: string;
  category_id: string;
}

const EditRecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    servings: "",
    instructions: "",
    img_url: "",
    category_id: "",
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Log form data and ingredients when they change
  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  useEffect(() => {
    console.log("Ingredients updated:", ingredients);
  }, [ingredients]);

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (id && isDataLoaded) {
      localStorage.setItem(`recipe_form_${id}`, JSON.stringify(formData));
    }
  }, [formData, id, isDataLoaded]);

  // Save ingredients to localStorage when they change
  useEffect(() => {
    if (id && isDataLoaded) {
      localStorage.setItem(
        `recipe_ingredients_${id}`,
        JSON.stringify(ingredients)
      );
    }
  }, [ingredients, id, isDataLoaded]);

  useEffect(() => {
    if (!session) {
      navigate("/login");
      return;
    }
    console.log("Component mounted, fetching categories and recipe");
    fetchCategories();
    fetchRecipe();
  }, [session, navigate, id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please try again later.");
    }
  };

  const fetchRecipe = async () => {
    try {
      console.log("Fetching recipe with ID:", id);

      // Fetch recipe details with user_id
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (recipeError) {
        console.error("Error fetching recipe:", recipeError);
        throw recipeError;
      }

      console.log("Recipe data loaded:", recipeData);

      // Check if the recipe belongs to the current user
      if (recipeData.user_id !== session?.user?.id) {
        setError("You don't have permission to edit this recipe");
        navigate("/recipes");
        return;
      }

      // Fetch ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from("ingredients")
        .select("*")
        .eq("recipe_id", id);

      if (ingredientsError) {
        console.error("Error fetching ingredients:", ingredientsError);
        throw ingredientsError;
      }

      console.log("Ingredients data loaded:", ingredientsData);

      // Clear any existing localStorage data for this recipe
      localStorage.removeItem(`recipe_form_${id}`);
      localStorage.removeItem(`recipe_ingredients_${id}`);

      // Set form data from database
      if (recipeData) {
        console.log("Setting form data from database");
        const formDataToSet = {
          name: recipeData.name || "",
          description: recipeData.description || "",
          servings: recipeData.servings ? recipeData.servings.toString() : "",
          instructions: recipeData.instructions || "",
          img_url: recipeData.img_url || "",
          category_id: recipeData.category_id || "",
        };
        console.log("Form data to set:", formDataToSet);
        setFormData(formDataToSet);
      }

      // Set ingredients from database
      if (ingredientsData && ingredientsData.length > 0) {
        console.log("Setting ingredients from database");
        // Convert ingredients to the format used in the form
        const formattedIngredients = ingredientsData.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name || "",
          quantity_unit: `${ingredient.quantity || ""} ${
            ingredient.unit || ""
          }`.trim(),
          additional_info: ingredient.additional_info || "",
        }));
        console.log("Formatted ingredients:", formattedIngredients);
        setIngredients(formattedIngredients);
      } else {
        // If no ingredients found, set a default empty ingredient
        console.log("No ingredients found, setting default empty ingredient");
        setIngredients([{ name: "", quantity_unit: "", additional_info: "" }]);
      }

      // Mark data as loaded
      setIsDataLoaded(true);
      console.log("Data loading completed");
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setError("Failed to load recipe. Please try again later.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity_unit: "", additional_info: "" },
    ]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const validateForm = () => {
    if (!formData.category_id) {
      setError("Please select a category");
      return false;
    }
    if (!formData.name.trim()) {
      setError("Recipe name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.servings) {
      setError("Number of servings is required");
      return false;
    }
    if (!formData.instructions.trim()) {
      setError("Instructions are required");
      return false;
    }
    if (ingredients.length === 0) {
      setError("At least one ingredient is required");
      return false;
    }
    for (const ingredient of ingredients) {
      if (!ingredient.name.trim() || !ingredient.quantity_unit.trim()) {
        setError("All ingredient fields (name, quantity_unit) are required");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("Updating recipe with ID:", id);
      console.log("Form data to update:", formData);
      console.log("Ingredients to update:", ingredients);

      // Update recipe
      const { error: updateError } = await supabase
        .from("recipes")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          servings: parseInt(formData.servings),
          instructions: formData.instructions.trim(),
          img_url: formData.img_url.trim() || null,
          category_id: formData.category_id,
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating recipe:", updateError);
        throw updateError;
      }

      console.log("Recipe updated successfully");

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from("ingredients")
        .delete()
        .eq("recipe_id", id);

      if (deleteError) {
        console.error("Error deleting ingredients:", deleteError);
        throw deleteError;
      }

      console.log("Existing ingredients deleted successfully");

      // Add updated ingredients
      const ingredientsToInsert = ingredients.map((ingredient) => {
        const [quantity, unit] = ingredient.quantity_unit.trim().split(/\s+/);
        return {
          recipe_id: id,
          name: ingredient.name.trim(),
          quantity: parseFloat(quantity) || 0,
          unit: unit || "",
          additional_info: ingredient.additional_info.trim() || " ",
        };
      });

      console.log("Ingredients to insert:", ingredientsToInsert);

      const { error: ingredientsError } = await supabase
        .from("ingredients")
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        console.error("Error inserting ingredients:", ingredientsError);
        throw new Error(
          `Failed to update ingredients: ${ingredientsError.message}`
        );
      }

      console.log("Ingredients inserted successfully");

      // Clear saved form data from localStorage after successful submission
      if (id) {
        localStorage.removeItem(`recipe_form_${id}`);
        localStorage.removeItem(`recipe_ingredients_${id}`);
      }

      setSuccess("Recipe updated successfully!");
      navigate(`/recipe/${id}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the recipe"
      );
    } finally {
      setLoading(false);
    }
  };

  // Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      // We don't clear localStorage here to allow for tab switching
      // The data will be cleared after successful submission
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>

      <button
        type="button"
        onClick={() => {
          console.log("Current form data:", formData);
          console.log("Current ingredients:", ingredients);
          console.log("Is data loaded:", isDataLoaded);
          console.log("Recipe ID:", id);
          console.log("Session:", session);
        }}
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs"
      >
        Debug Info
      </button>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      )}

      {!loading && !isDataLoaded && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      )}

      {!loading && isDataLoaded && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category *
                </label>
                <div className="relative group">
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                    Wählen Sie eine Kategorie für das Rezept (z.B. Suppen,
                    Hauptgerichte, Desserts)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Recipe Name *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                    Geben Sie einen aussagekräftigen Namen für Ihr Rezept ein
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description *
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                    required
                  />
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                    Beschreiben Sie kurz, worum es sich bei diesem Rezept
                    handelt
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Servings *
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    required
                  />
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                    Anzahl der Portionen, die das Rezept ergibt
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Instructions *
                </label>
                <div className="relative group">
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={6}
                    required
                  />
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                    Detaillierte Anleitung zur Zubereitung des Rezepts, Schritt
                    für Schritt
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 text-sm font-bold">
                    Ingredients *
                  </label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                  >
                    + Add Ingredient
                  </button>
                </div>
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <div className="relative group">
                          <input
                            type="text"
                            value={ingredient.name}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Name"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                          />
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                            Name der Zutat (z.B. Mehl, Zucker, Eier)
                          </div>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <div className="relative group">
                          <input
                            type="text"
                            value={ingredient.quantity_unit}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                "quantity_unit",
                                e.target.value
                              )
                            }
                            placeholder="Menge und Einheit (z.B. 200g, 1.5l, 3 Stk)"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                          />
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                            Menge und Maßeinheit (z.B. 200g, 1.5l, 3 Stk, 2 EL,
                            1 TL)
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="relative group">
                          <input
                            type="text"
                            value={ingredient.additional_info}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                "additional_info",
                                e.target.value
                              )
                            }
                            placeholder="Additional info"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                            Zusätzliche Informationen (z.B. fein gehackt,
                            geschält)
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="text-red-500 hover:text-red-700 h-10 w-10 flex items-center justify-center"
                          disabled={ingredients.length === 1}
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <div className="relative group">
                  <input
                    type="url"
                    name="img_url"
                    value={formData.img_url}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -right-2 top-full mt-1">
                    URL eines Bildes für das Rezept (optional)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                // Clear saved form data when canceling
                if (id) {
                  localStorage.removeItem(`recipe_form_${id}`);
                  localStorage.removeItem(`recipe_ingredients_${id}`);
                }
                navigate(`/recipe/${id}`);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditRecipe;
