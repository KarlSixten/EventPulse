import { readable } from "svelte/store";

export const BASE_URL = readable(import.meta.env.VITE_BASE_URL || "http://localhost:8080");

export const STRIPE_PUBLISHABLE_KEY = readable("pk_test_51RYZ62Rs8LAMvSQRc1IwCKVaDEhqNIjx7krIqLAlG6ocBYAHI3sPoiuDk3HpGldLmHFYxrrWsyFHq9euf0f9mJFC007QlKiRcW")