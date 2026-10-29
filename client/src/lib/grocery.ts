import { useMemo, useSyncExternalStore } from "react";
import { recipes, isSectionHeader, type Recipe } from "@/lib/recipes";

// ---------------------------------------------------------------------------
// Ingredient merging
// ---------------------------------------------------------------------------

const QUANTITY = /^[\d\s/½¼¾⅓⅔⅛.\-–]+/;
const UNIT = /^(cups?|c|tablespoons?|tbsps?|teaspoons?|tsps?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|l|cans?|cloves?|stalks?|servings?|bunch(es)?|pinch(es)?|handfuls?|slices?|pieces?)\.?\s+/;

// Prep words and sizes that don't change what you buy.
const DESCRIPTORS = [
  "finely", "roughly", "thinly", "freshly", "fresh", "chopped", "diced", "minced",
  "sliced", "crumbled", "cooked", "uncooked", "drained", "rinsed", "seeded",
  "shredded", "grated", "large", "medium", "small", "extra virgin",
  "light-tasting", "light", "neutral", "ground", "leftover", "frozen", "dry",
  "parboiled", "canned",
];
const DESCRIPTOR_RE = new RegExp(`(^|\\s)(${DESCRIPTORS.join("|")})(?=\\s|$)`, "g");

// Maps a cleaned-up ingredient (or the start of a raw line) to the name to shop for.
const ALIASES: Record<string, string> = {
  "juice and zest of 1 lemon": "lemon",
  "lemon juice": "lemon",
  "lime juice": "lime",
  "garlic clove": "garlic",
  "clove garlic": "garlic",
  "green onion/scallion": "green onions",
  "green onion": "green onions",
  "chicken breast": "chicken",
  "garbanzo bean": "chickpeas",
  "kale/arugula": "kale or arugula",
  "grain": "rice",
  "jalapeño pepper": "jalapeño",
  "cracked pepper": "black pepper",
  "sea salt": "salt",
  "diamond crystal kosher salt": "salt",
  "kosher salt": "salt",
  "oil": "neutral oil",
  "feta cheese": "feta",
  "parmesan cheese": "parmesan",
};

function singularize(word: string): string {
  if (/(ss|us|is)$/.test(word)) return word;
  if (/oes$/.test(word)) return word.slice(0, -2);
  if (/ies$/.test(word)) return word.slice(0, -3) + "y";
  if (/s$/.test(word)) return word.slice(0, -1);
  return word;
}

/** Strips quantity, units, and prep notes: "2 cloves garlic, minced" -> "garlic". */
function cleanIngredient(line: string): string {
  let s = line.replace(/ /g, " ").toLowerCase().trim();
  for (const [prefix, name] of Object.entries(ALIASES)) {
    if (s.startsWith(prefix + " ") || s.startsWith(prefix + ",")) return name;
  }
  s = s.replace(/\([^)]*\)/g, " ");
  s = s.split(/,| or | for /)[0];
  // Run twice for lines like "1 can 15 oz corn".
  for (let i = 0; i < 2; i++) {
    s = s.replace(QUANTITY, "").replace(UNIT, "").replace(/^of\s+/, "");
  }
  s = s.replace(DESCRIPTOR_RE, " ").replace(/\s+/g, " ").trim();
  return ALIASES[s] ?? ALIASES[singularizeLast(s)] ?? s;
}

function singularizeLast(name: string): string {
  const words = name.split(" ");
  words[words.length - 1] = singularize(words[words.length - 1]);
  return words.join(" ");
}

export interface GroceryItem {
  /** Stable key used to remember whether this item is checked. */
  key: string;
  name: string;
  recipes: Recipe[];
  /** The original ingredient lines, so amounts are still visible. */
  lines: { recipe: Recipe; text: string }[];
}

export function buildGroceryList(selected: Recipe[]): GroceryItem[] {
  const items = new Map<string, GroceryItem>();

  for (const recipe of selected) {
    for (const line of recipe.ingredients) {
      if (!line.trim() || isSectionHeader(line)) continue;
      const name = cleanIngredient(line) || line.trim().toLowerCase();
      const key = singularizeLast(name);

      let item = items.get(key);
      if (!item) {
        item = { key, name, recipes: [], lines: [] };
        items.set(key, item);
      }
      if (!item.recipes.includes(recipe)) item.recipes.push(recipe);
      item.lines.push({ recipe, text: line.replace(/ /g, " ").trim() });
    }
  }

  return Array.from(items.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Saved grocery run (persisted in this browser only)
// ---------------------------------------------------------------------------

const STORAGE_KEY = "recipestack-grocery-run";

interface GroceryRunState {
  recipeIds: string[];
  checked: string[];
}

const EMPTY_RUN: GroceryRunState = { recipeIds: [], checked: [] };

function loadRun(): GroceryRunState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_RUN;
    const parsed = JSON.parse(stored) as Partial<GroceryRunState>;
    return {
      // Ignore recipes that have since been removed from the data file.
      recipeIds: (parsed.recipeIds ?? []).filter((id) => recipes.some((r) => r.id === id)),
      checked: parsed.checked ?? [],
    };
  } catch {
    return EMPTY_RUN;
  }
}

function saveRun(run: GroceryRunState | null) {
  try {
    if (run) localStorage.setItem(STORAGE_KEY, JSON.stringify(run));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (e.g. private mode); progress just won't persist.
  }
}

// One shared copy of the run for every component, written to storage
// synchronously so it survives navigating away right after a change.
let currentRun: GroceryRunState = loadRun();
const listeners = new Set<() => void>();

function setRun(run: GroceryRunState) {
  currentRun = run;
  saveRun(run.recipeIds.length > 0 ? run : null);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep multiple tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      currentRun = loadRun();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const startRun = (recipeIds: string[]) => setRun({ ...currentRun, recipeIds });

const toggleItem = (key: string) =>
  setRun({
    ...currentRun,
    checked: currentRun.checked.includes(key)
      ? currentRun.checked.filter((k) => k !== key)
      : [...currentRun.checked, key],
  });

const completeRun = () => setRun(EMPTY_RUN);

export function useGroceryRun() {
  const run = useSyncExternalStore(subscribe, () => currentRun);

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => run.recipeIds.includes(r.id)),
    [run.recipeIds],
  );
  const checked = useMemo(() => new Set(run.checked), [run.checked]);

  return {
    isActive: run.recipeIds.length > 0,
    selectedRecipes,
    checked,
    startRun,
    toggleItem,
    completeRun,
  };
}
