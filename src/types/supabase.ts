export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: number;
                    name: string;
                    image_url: string;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    image_url: string;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    name?: string;
                    image_url?: string;
                    created_at?: string;
                };
            };
            recipes: {
                Row: {
                    id: number;
                    title: string;
                    description: string;
                    image_url: string;
                    category_id: number;
                    preparation_time: string;
                    difficulty: string;
                    servings: number;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    title: string;
                    description: string;
                    image_url: string;
                    category_id: number;
                    preparation_time: string;
                    difficulty: string;
                    servings: number;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    title?: string;
                    description?: string;
                    image_url?: string;
                    category_id?: number;
                    preparation_time?: string;
                    difficulty?: string;
                    servings?: number;
                    created_at?: string;
                };
            };
            ingredients: {
                Row: {
                    id: number;
                    recipe_id: number;
                    name: string;
                    amount: string;
                    unit: string;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    recipe_id: number;
                    name: string;
                    amount: string;
                    unit: string;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    recipe_id?: number;
                    name?: string;
                    amount?: string;
                    unit?: string;
                    created_at?: string;
                };
            };
            steps: {
                Row: {
                    id: number;
                    recipe_id: number;
                    description: string;
                    order_number: number;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    recipe_id: number;
                    description: string;
                    order_number: number;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    recipe_id?: number;
                    description?: string;
                    order_number?: number;
                    created_at?: string;
                };
            };
        };
    };
}
