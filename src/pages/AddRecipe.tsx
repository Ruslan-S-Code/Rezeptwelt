import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

interface Category {
  id: string;
  name: string;
}

interface Ingredient {
  name: string;
  quantity_unit: string;
  additional_info: string;
}

const AddRecipe = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    servings: "",
    instructions: "",
    img_url: "",
    category_id: "",
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity_unit: "", additional_info: "" },
  ]);

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
    fetchCategories();
  }, [session, navigate]);

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

      // Сначала создаем рецепт
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            servings: parseInt(formData.servings),
            instructions: formData.instructions.trim(),
            img_url: formData.img_url.trim() || null,
            category_id: formData.category_id,
            user_id: session.user.id,
          },
        ])
        .select()
        .single();

      if (recipeError) {
        console.error("Recipe creation error details:", recipeError);
        throw new Error(`Failed to create recipe: ${recipeError.message}`);
      }

      if (!recipeData) {
        throw new Error("No recipe data returned");
      }

      // Добавляем ингредиенты
      const ingredientsToInsert = ingredients.map((ingredient) => {
        const [quantity, unit] = ingredient.quantity_unit.trim().split(/\s+/);
        return {
          recipe_id: recipeData.id,
          name: ingredient.name.trim(),
          quantity: parseFloat(quantity) || 0,
          unit: unit || "",
          additional_info: ingredient.additional_info.trim() || null,
        };
      });

      const { error: ingredientsError } = await supabase
        .from("ingredients")
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        throw new Error(
          `Failed to add ingredients: ${ingredientsError.message}`
        );
      }

      setSuccess("Recipe added successfully!");
      setFormData({
        name: "",
        description: "",
        servings: "",
        instructions: "",
        img_url: "",
        category_id: "",
      });
      setIngredients([{ name: "", quantity_unit: "", additional_info: "" }]);

      // Перенаправляем на страницу рецепта
      navigate(`/recipe/${recipeData.id}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the recipe"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Recipe</h1>

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
                  Beschreiben Sie kurz, worum es sich bei diesem Rezept handelt
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
                          Menge und Maßeinheit (z.B. 200g, 1.5l, 3 Stk, 2 EL, 1
                          TL)
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
                Image URL (optional)
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? "Adding..." : "Add Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;
