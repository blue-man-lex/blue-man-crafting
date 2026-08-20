export const SCRIBING_ITEMS = {
    // Сырье для чернил
    ink_cuttlefish_raw: "Compendium.blue-man-crafting.BG3.Item.lK6rcoSMWFEjCn9n",
    ink_notic_raw: "Compendium.blue-man-crafting.BG3.Item.2CznniYDk2T4oom9",
    ink_nashaar_raw: "Compendium.blue-man-crafting.BG3.Item.733PHCUB2aMcdNmP",
    ink_oculus_raw: "Compendium.blue-man-crafting.BG3.Item.b8uYVsj2jfty9ADb",
    ink_void_raw: "Compendium.blue-man-crafting.BG3.Item.RvM9WZ8KdtSafvd0",
    
    // Готовые чернила
    ink_cuttlefish: "Compendium.blue-man-crafting.BG3.Item.H6MO9IsbBfbNMAM8",
    ink_notic: "Compendium.blue-man-crafting.BG3.Item.DHfAyN2ASp1DlFZS",
    ink_nashaar: "Compendium.blue-man-crafting.BG3.Item.31BdxaEe76Ta1hkS",
    ink_oculus: "Compendium.blue-man-crafting.BG3.Item.1EsvwJrOLAfR1jbN",
    ink_void: "Compendium.blue-man-crafting.BG3.Item.2V8wV2XenWyV0pVh",
    
    // Компоненты свитков
    blank_scroll: "Compendium.blue-man-crafting.BG3.Item.ArmT6lKsqHu6rgg0",
    comp_spell_essence: "Compendium.blue-man-crafting.BG3.Item.BUpFA9fRivIU2fEB",
    comp_purify_dust: "Compendium.blue-man-crafting.BG3.Item.ZgL6QzfTlOFDAzyZ",
    comp_condition_dust: "Compendium.blue-man-crafting.BG3.Item.RrgfI1yH4N4DmW28",
    
    // Готовые свитки
    scroll_elemental_1: "Compendium.blue-man-crafting.BG3.Item.wbLbykJONzznylCl",
    scroll_elemental_2: "Compendium.blue-man-crafting.BG3.Item.DZyiw4tz4qe6xvc1",
    scroll_elemental_3: "Compendium.blue-man-crafting.BG3.Item.Jyaw9LZWLmchrq5Y",
    scroll_elemental_4: "Compendium.blue-man-crafting.BG3.Item.HiZ1pIzx5VmANYZb",
    scroll_identify: "Compendium.blue-man-crafting.BG3.Item.0Exm7ziMybCfPSTi",
    scroll_spell_scribing: "Compendium.blue-man-crafting.BG3.Item.PXv5j5cq6RjFwhYy",
    scroll_purification: "Compendium.blue-man-crafting.BG3.Item.UmKwJX7tdSjSYQYY",
    scroll_conditions: "Compendium.blue-man-crafting.BG3.Item.OoU7mg9Sd5nGycd5"
};

export const SCRIBING_CATEGORIES = {
    "scribing": {
        name: "Начертание",
        global: true,
        subcategories: {
            "scrolls": { name: "Свитки", items: [] },
            "inks": { name: "Чернила", items: [] }
        }
    }
};

export const SCRIBING_RECIPES = [
    // === РЕЦЕПТЫ НАЧЕРТАНИЯ (ЧЕРНИЛА) ===
    
    {
        name: "Чернила Каракатицы",
        type: "inks",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.ink_cuttlefish_raw, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.ink_cuttlefish, qty: 1 }
    },
    {
        name: "Чернила из вытяжки глаза Нотика",
        type: "inks",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.ink_notic_raw, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.ink_notic, qty: 1 }
    },
    {
        name: "Нашаарские чернила",
        type: "inks",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.ink_nashaar_raw, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.ink_nashaar, qty: 1 }
    },
    {
        name: "Чернила Окулуса",
        type: "inks",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.ink_oculus_raw, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.ink_oculus, qty: 1 }
    },
    {
        name: "Чернила пустоты",
        type: "inks",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.ink_void_raw, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.ink_void, qty: 1 }
    },
    
    // === РЕЦЕПТЫ СВИТКОВ ===
    
    {
        name: "Мощь стихий+1",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.ink_notic, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_elemental_1, qty: 1 }
    },
    {
        name: "Мощь стихий+2",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.ink_oculus, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_elemental_2, qty: 1 }
    },
    {
        name: "Мощь стихий+3",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.ink_void, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_elemental_3, qty: 1 }
    },
    {
        name: "Мощь стихий+4",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.ink_nashaar, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_elemental_4, qty: 1 }
    },
    {
        name: "Свиток опознания",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.ink_cuttlefish, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_identify, qty: 1 }
    },
    {
        name: "Свиток начертания заклинания",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.comp_spell_essence, qty: 1 },
            slot3: { type: "item", uuid: SCRIBING_ITEMS.ink_cuttlefish, qty: 3 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_spell_scribing, qty: 1 }
    },
    {
        name: "Свиток очищения",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.comp_purify_dust, qty: 1 },
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_purification, qty: 1 }
    },
    {   name: "Свиток состояний",
        type: "scrolls",
        input: {
            slot1: { type: "item", uuid: SCRIBING_ITEMS.blank_scroll, qty: 1 },
            slot2: { type: "item", uuid: SCRIBING_ITEMS.ink_void, qty: 1 },
            slot3: { type: "item", uuid: SCRIBING_ITEMS.comp_condition_dust, qty: 1 }
        },
        result: { uuid: SCRIBING_ITEMS.scroll_conditions, qty: 1 }
    }
];

export const SCRIBING_DLC = {
    id: 'scribing',
    name: 'Начертание',
    version: '1.0.0',
    description: 'Система начертания для создания свитков и чернил.',
    categories: SCRIBING_CATEGORIES,
    recipes: SCRIBING_RECIPES
};
