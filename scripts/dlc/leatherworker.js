export const LW_ITEMS = {
    // Сырье (Hides)
    hide_common: "Compendium.blue-man-crafting.BG3.Item.4skX6iWvfrUdVsvR",
    hide_uncommon: "Compendium.blue-man-crafting.BG3.Item.R3HLr9bvznVoX84D",
    hide_rare: "Compendium.blue-man-crafting.BG3.Item.J7o3t8b79ME5LdXX",
    hide_veryrare: "Compendium.blue-man-crafting.BG3.Item.XUw71AQozuxlhrj9",
    hide_epic: "Compendium.blue-man-crafting.BG3.Item.jsuIcwkazY1DteFl",

    // Дубленая кожа (Tanned Leather)
    tanned_common: "Compendium.blue-man-crafting.BG3.Item.ecqFiqgWIoOsAz4V",
    tanned_uncommon: "Compendium.blue-man-crafting.BG3.Item.FLEhIYH7hkq1HfbO",
    tanned_rare: "Compendium.blue-man-crafting.BG3.Item.SypUAZHGxtbHEJNk",
    tanned_veryrare: "Compendium.blue-man-crafting.BG3.Item.UQOubEW2bce1j33r",
    tanned_epic: "Compendium.blue-man-crafting.BG3.Item.vMrZMFln1BkhCNRu",

    // Компоненты
    comp_wax: "Compendium.blue-man-crafting.BG3.Item.58UwpVuGFfhwodbJ",
    comp_straps: "Compendium.blue-man-crafting.BG3.Item.ltW1hdmgtUF4pkxE", // Кожаные ремни
    comp_fabric: "Compendium.blue-man-crafting.BG3.Item.2i0oUTDxhpPWO9sA", // Ткань

    // Доспехи
    arm_padded: "Compendium.blue-man-crafting.BG3.Item.nG41EIx2fFWXh0Rw",
    arm_leather: "Compendium.blue-man-crafting.BG3.Item.2d1sKzEaZLLp4Sf6",
    arm_studded: "Compendium.blue-man-crafting.BG3.Item.PiSsfWUtMkgrc6VH",
    arm_hide: "Compendium.blue-man-crafting.BG3.Item.9plqkrxDT9plNL4C",
    
    // Заклепки для проклепанной кожи
    ingot_iron: "Compendium.blue-man-crafting.BG3.Item.KE6Z8jCA6l0KBDfR"
};

export const LEATHERWORKER_CATEGORIES = {
    "leatherworking": {
        name: "Кожевничество",
        global: true,
        subcategories: {
            "tanning": {
                name: "Дубление",
                items: [
                    LW_ITEMS.tanned_common,
                    LW_ITEMS.tanned_uncommon,
                    LW_ITEMS.tanned_rare,
                    LW_ITEMS.tanned_veryrare,
                    LW_ITEMS.tanned_epic
                ]
            },
            "leather-armor": {
                name: "Кожаные доспехи",
                itemType: "equipment",
                items: []
            }
        }
    }
};

export const LEATHERWORKER_RECIPES = [
    // --- ДУБЛЕНИЕ КОЖИ ---
    {
        name: "Дубление: Обычная кожа",
        type: "tanning",
        input: {
            slot1: { type: "item", uuid: LW_ITEMS.hide_common, qty: 1 },
            slot2: { type: "item", uuid: LW_ITEMS.comp_wax, qty: 1 }
        },
        result: { uuid: LW_ITEMS.tanned_common, qty: 1 }
    },
    {
        name: "Дубление: Укрепленная кожа",
        type: "tanning",
        input: {
            slot1: { type: "item", uuid: LW_ITEMS.hide_uncommon, qty: 1 },
            slot2: { type: "item", uuid: LW_ITEMS.comp_wax, qty: 1 }
        },
        result: { uuid: LW_ITEMS.tanned_uncommon, qty: 1 }
    },
    {
        name: "Дубление: Магическая кожа",
        type: "tanning",
        input: {
            slot1: { type: "item", uuid: LW_ITEMS.hide_rare, qty: 1 },
            slot2: { type: "item", uuid: LW_ITEMS.comp_wax, qty: 1 }
        },
        result: { uuid: LW_ITEMS.tanned_rare, qty: 1 }
    },
    {
        name: "Дубление: Драконья кожа",
        type: "tanning",
        input: {
            slot1: { type: "item", uuid: LW_ITEMS.hide_veryrare, qty: 2 },
            slot2: { type: "item", uuid: LW_ITEMS.comp_wax, qty: 1 }
        },
        result: { uuid: LW_ITEMS.tanned_veryrare, qty: 1 }
    },
    {
        name: "Дубление: Эпическая кожа",
        type: "tanning",
        input: {
            slot1: { type: "item", uuid: LW_ITEMS.hide_epic, qty: 3 },
            slot2: { type: "item", uuid: LW_ITEMS.comp_wax, qty: 2 }
        },
        result: { uuid: LW_ITEMS.tanned_epic, qty: 1 }
    },
    
    // --- ДОСПЕХИ ---
    {
        name: "Чертеж: Кожаные доспехи",
        type: "leather-armor",
        isBlueprint: true,
        variants: [
            {
                name: "Стеганый доспех",
                ingredients: [
                    { type: "category", categoryId: "tanning", qty: 1 },
                    { type: "item", uuid: LW_ITEMS.comp_fabric, qty: 1 }
                ],
                result: { uuid: LW_ITEMS.arm_padded, qty: 1 }
            },
            {
                name: "Кожаный доспех",
                ingredients: [
                    { type: "category", categoryId: "tanning", qty: 2 },
                    { type: "item", uuid: LW_ITEMS.comp_straps, qty: 1 }
                ],
                result: { uuid: LW_ITEMS.arm_leather, qty: 1 }
            },
            {
                name: "Проклепанная кожа",
                ingredients: [
                    { type: "category", categoryId: "tanning", qty: 2 },
                    { type: "item", uuid: LW_ITEMS.comp_straps, qty: 1 },
                    { type: "item", uuid: LW_ITEMS.ingot_iron, qty: 1 }
                ],
                result: { uuid: LW_ITEMS.arm_studded, qty: 1 }
            },
            {
                name: "Шкурный доспех",
                ingredients: [
                    { type: "category", categoryId: "tanning", qty: 3 },
                    { type: "item", uuid: LW_ITEMS.comp_straps, qty: 2 }
                ],
                result: { uuid: LW_ITEMS.arm_hide, qty: 1 }
            }
        ]
    }
];

export const LEATHERWORKER_DLC = {
    id: "leatherworking",
    name: "Кожевничество",
    version: "1.0.0",
    description: "Набор рецептов и категорий для обработки кожи и пошива легкой брони.",
    categories: LEATHERWORKER_CATEGORIES,
    recipes: LEATHERWORKER_RECIPES
};

export const LEATHERWORKER_MATERIALS = {
    [LW_ITEMS.tanned_common]: { prefix: 'Обычный', rarity: 'common', bonus: 0 },
    [LW_ITEMS.tanned_uncommon]: { prefix: 'Укрепленный', rarity: 'uncommon', bonus: 1 },
    [LW_ITEMS.tanned_rare]: { prefix: 'Магический', rarity: 'rare', bonus: 2 },
    [LW_ITEMS.tanned_veryrare]: { prefix: 'Драконий', rarity: 'veryRare', bonus: 3 },
    [LW_ITEMS.tanned_epic]: { prefix: 'Эпический', rarity: 'legendary', bonus: 3 } // Эпическая кожа добавляет спец. свойство в скрипте
};
