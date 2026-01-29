import { BG3CraftingApp } from "./craftingApp.js";
import { RecipeManager } from "./recipeManager.js"; // Импорт менеджера

Hooks.once("init", () => {
    console.log("BG3 Crafting | Init");
    
    // Инициализация настроек менеджера
    RecipeManager.initialize();
});

function appendCraftingHeaderControls(app, controls) {
    const actor = app.document ?? app.actor;
    if (!(actor instanceof Actor)) return;

    controls.push({
        label: "Крафтинг",
        icon: "fa-solid fa-flask",
        onClick: () => new BG3CraftingApp(actor).render(true)
    });
}

Hooks.on("getHeaderControlsActorSheet", appendCraftingHeaderControls);
Hooks.on("getHeaderControlsActorSheetV2", appendCraftingHeaderControls);