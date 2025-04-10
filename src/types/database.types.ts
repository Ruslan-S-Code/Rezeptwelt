export interface Category {
    id: string;
    name: string;
    created_at: string;
    img_url: string | null;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    servings: number;
    instructions: string;
    category_id: string;
    created_at: string;
    img_url: string | null;
    user_id: string;
    is_default: boolean;
    author_name: string;
}

export interface Ingredient {
    id: string;
    recipe_id: string;
    name: string;
    quantity: number;
    unit: string;
    additional_info: string | null;
    created_at: string;
}
