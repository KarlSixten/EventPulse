import { readable } from "svelte/store";

export const BASE_URL = readable(import.meta.env.VITE_BASE_URL || "http://localhost:8080");

export const STRIPE_PUBLISHABLE_KEY = readable(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);