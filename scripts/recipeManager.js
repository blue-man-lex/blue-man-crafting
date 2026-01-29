import { RECIPES, RECIPE_CATEGORIES } from "./gamedata.js";

export class RecipeManager {
    static ID = "blue-man-crafting";
    static SETTING = "recipes";

    static async initialize() {
        game.settings.register(this.ID, "enableMinigame", {
            name: "Мини-игра при крафте",
            hint: "Если включено, перед крафтом появляется мини-игра на тайминг. При провале крафт не происходит.",
            scope: "client",
            config: true,
            type: Boolean,
            default: false
        });

        game.settings.register(this.ID, "customRecipes", {
            name: "Пользовательские рецепты",
            scope: "world",
            config: false,
            type: Object,
            default: { categories: {}, recipes: [] }
        });

        game.settings.registerMenu(this.ID, "recipeManagerMenu", {
            name: "Настройка рецептов",
            label: "Редактор рецептов",
            hint: "Добавление и редактирование пользовательских рецептов",
            icon: "fas fa-scroll",
            type: RecipeManagerApp,
            restricted: true
        });
        console.log(`BMC: [INIT] Загружено ${RECIPES.length} базовых рецептов.`);
    }

    static getData() {
        // Получаем пользовательские рецепты
        const customData = game.settings.get(this.ID, "customRecipes");
        
        // Адаптируем базовые рецепты
        const adaptedBaseRecipes = RECIPES.map(recipe => {
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) return recipe;
            if (recipe.input) {
                const ingredients = [];
                if (recipe.input.slot1 && recipe.input.slot1.type !== 'empty') ingredients.push(recipe.input.slot1);
                if (recipe.input.slot3 && recipe.input.slot3.type !== 'empty') ingredients.push(recipe.input.slot3);
                if (recipe.input.slot2 && recipe.input.slot2.type !== 'empty') ingredients.push(recipe.input.slot2);
                return { ...recipe, ingredients: ingredients, isCustom: false };
            }
            return { ...recipe, isCustom: false };
        });

        // Адаптируем пользовательские рецепты
        const adaptedCustomRecipes = (customData.recipes || []).map(recipe => {
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) return recipe;
            if (recipe.input) {
                const ingredients = [];
                if (recipe.input.slot1 && recipe.input.slot1.type !== 'empty') ingredients.push(recipe.input.slot1);
                if (recipe.input.slot3 && recipe.input.slot3.type !== 'empty') ingredients.push(recipe.input.slot3);
                if (recipe.input.slot2 && recipe.input.slot2.type !== 'empty') ingredients.push(recipe.input.slot2);
                return { ...recipe, ingredients: ingredients, isCustom: true };
            }
            return { ...recipe, isCustom: true };
        });

        // Объединяем категории
        const allCategories = { ...RECIPE_CATEGORIES, ...(customData.categories || {}) };

        // Пользовательские рецепты имеют приоритет
        const allRecipes = [...adaptedBaseRecipes, ...adaptedCustomRecipes];
        
        return { 
            categories: allCategories, 
            recipes: allRecipes,
            customRecipes: adaptedCustomRecipes,
            baseRecipes: adaptedBaseRecipes
        };
    }

    static async saveData(data) {
        const customData = game.settings.get(this.ID, "customRecipes");
        const updatedData = {
            categories: { ...customData.categories, ...(data.categories || {}) },
            recipes: data.recipes || []
        };
        await game.settings.set(this.ID, "customRecipes", updatedData);
        console.log(`BMC: Сохранено ${updatedData.recipes.length} пользовательских рецептов`);
    }

    static async resetCustomData() {
        if (confirm("ВНИМАНИЕ! Это удалит ВСЕ пользовательские рецепты и категории. Продолжить?")) {
            await game.settings.set(this.ID, "customRecipes", { categories: {}, recipes: [] });
            console.log("BMC: Все пользовательские рецепты удалены");
            ui.notifications.info("Все пользовательские рецепты удалены");
            return true;
        }
        return false;
    }

    static async exportCustomData() {
        const customData = game.settings.get(this.ID, "customRecipes");
        const blob = new Blob([JSON.stringify(customData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-recipes-backup.json';
        a.click();
        URL.revokeObjectURL(url);
        ui.notifications.info("Резервная копия создана");
    }

    static async getItemDisplayInfo(req) {
        let itemIdToFind = null;
        let displayName = "Неизвестно";
        let defaultImg = "icons/svg/item-bag.svg";
        
        // Значение по умолчанию
        let rarity = "common"; 

        if (req.type === "category" || (req.type && !req.id && !req.uuid)) {
            const catId = req.categoryId || req.type;
            const data = this.getData();
            const cat = this.findCategory(data.categories, catId);
            if (cat) {
                displayName = cat.name; 
                if (cat.items && cat.items.length > 0) itemIdToFind = cat.items[0];
            } else {
                displayName = catId;
            }
        } else {
            itemIdToFind = req.uuid || req.id; 
            displayName = "Предмет"; 
        }

        if (itemIdToFind) {
            const itemData = await this.findItemDataInCompendiums(itemIdToFind);
            if (itemData) {
                return {
                    name: displayName === "Предмет" ? itemData.name : displayName,
                    img: itemData.img || defaultImg,
                    // Достаем редкость из системы dnd5e, если нет - считаем обычным
                    rarity: itemData.system?.rarity || "common" 
                };
            }
        }
        return { name: displayName, img: defaultImg, rarity: rarity };
    }

    static async findItemDataInCompendiums(targetId) {
        if (!targetId) return null;
        if (targetId.includes(".") || targetId.includes("Compendium")) {
            try {
                const doc = await fromUuid(targetId);
                if (doc) return doc.toObject();
            } catch (e) {}
        }
        const cleanId = targetId.split('.').pop();
        const worldItem = game.items.get(cleanId);
        if (worldItem) return worldItem.toObject();

        for (const pack of game.packs) {
            if (pack.documentName !== "Item") continue;
            const index = await pack.getIndex(); 
            const entry = index.find(e => e._id === cleanId);
            if (entry) {
                const doc = await pack.getDocument(entry._id);
                return doc.toObject();
            }
        }
        return null;
    }

    static isItemInCategory(itemData, categoryId) {
        const data = this.getData();
        const category = this.findCategory(data.categories, categoryId);
        if (!category) return false;
        
        // 1. По ID (Жесткое совпадение)
        const idMatch = category.items.some(catItemId => this._compareUuids(catItemId, itemData));
        if (idMatch) return true;

        // 2. По ИМЕНИ (Надежное совпадение)
        // Имя предмета должно СОДЕРЖАТЬ название категории.
        // Пример: Категория "Соль" -> Предмет "Соли чего-то там" -> ОК.
        // Для русского языка убираем окончания (и, ы, а, я)
        if (itemData.name && category.name) {
            const catName = category.name.replace(/\(.*\)/, "").trim().toLowerCase(); // "Соль"
            const itemName = itemData.name.toLowerCase(); // "Соли полыни"
            
            // Получаем корень категории, убирая типичные окончания
            let catRoot = catName;
            if (catRoot.endsWith('и')) catRoot = catRoot.slice(0, -1); // Соли -> Соль
            if (catRoot.endsWith('ы')) catRoot = catRoot.slice(0, -1); // Золы -> Зола  
            if (catRoot.endsWith('а')) catRoot = catRoot.slice(0, -1); // Суспензия -> Суспензи
            if (catRoot.endsWith('я')) catRoot = catRoot.slice(0, -1); // Эссенция -> Эссенци
            
            // Проверяем вхождение корня категории в имя предмета
            if (itemName.includes(catRoot)) return true;
            
            // И наоборот - проверяем вхождение корня предмета в категорию
            // Для случаев когда предмет короче категории
            let itemRoot = itemName.split(' ')[0]; // Берем первое слово
            if (itemRoot.endsWith('и')) itemRoot = itemRoot.slice(0, -1);
            if (itemRoot.endsWith('ы')) itemRoot = itemRoot.slice(0, -1);
            if (itemRoot.endsWith('а')) itemRoot = itemRoot.slice(0, -1);
            if (itemRoot.endsWith('я')) itemRoot = itemRoot.slice(0, -1);
            
            if (catName.includes(itemRoot)) return true;
        }
        return false;
    }

    static findCategory(categories, categoryId) {
        // Сначала ищем в корневых категориях
        if (categories[categoryId]) {
            return categories[categoryId];
        }
        
        // Если не найдено, ищем в подкатегориях глобальных категорий
        for (const [globalCatId, globalCategory] of Object.entries(categories)) {
            if (globalCategory.subcategories && globalCategory.subcategories[categoryId]) {
                return globalCategory.subcategories[categoryId];
            }
        }
        
        return null;
    }

    static _compareUuids(recipeId, itemData) {
        if (!recipeId || !itemData) return false;
        const cleanRecipeId = recipeId.split('.').pop();
        const cleanSourceId = itemData.sourceId ? itemData.sourceId.split('.').pop() : "";
        const cleanUuid = itemData.uuid ? itemData.uuid.split('.').pop() : "";

        if (cleanSourceId === cleanRecipeId) return true;
        if (cleanUuid === cleanRecipeId) return true;
        return false;
    }
}

export class RecipeManagerApp extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "bmc-recipe-manager",
            title: "Редактор рецептов",
            template: "modules/blue-man-crafting/templates/gm-manager.hbs",
            width: 800, height: 900, resizable: true,
            tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "custom" }]
        });
    }
    
    getData() {
        const data = RecipeManager.getData();
        return { 
            data: data, 
            readOnly: false,
            customRecipes: data.customRecipes || [],
            baseRecipes: data.baseRecipes || []
        };
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.add-recipe').click(this._onAddRecipe.bind(this));
        html.find('.edit-recipe').click(this._onEditRecipe.bind(this));
        html.find('.delete-recipe').click(this._onDeleteRecipe.bind(this));
        html.find('.import-recipes').click(this._onImportRecipes.bind(this));
        html.find('.export-recipes').click(this._onExportRecipes.bind(this));
        html.find('.reset-all').click(this._onResetAll.bind(this));
        html.find('.backup-all').click(this._onBackupAll.bind(this));
    }
    
    _onAddRecipe() {
        const newRecipe = {
            name: "Новый рецепт",
            type: "potions",
            ingredients: [
                { type: "category", categoryId: "suspension", qty: 1 }
            ],
            result: { uuid: "", qty: 1 }
        };
        
        const data = RecipeManager.getData();
        data.customRecipes.push(newRecipe);
        RecipeManager.saveData({ recipes: data.customRecipes });
        this.render(true);
    }
    
    _onEditRecipe(event) {
        const index = event.currentTarget.dataset.index;
        // TODO: Открыть диалог редактирования
        ui.notifications.info("Редактирование в разработке");
    }
    
    _onDeleteRecipe(event) {
        const index = event.currentTarget.dataset.index;
        if (confirm("Удалить этот рецепт?")) {
            const data = RecipeManager.getData();
            data.customRecipes.splice(index, 1);
            RecipeManager.saveData({ recipes: data.customRecipes });
            this.render(true);
        }
    }
    
    _onImportRecipes() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const imported = JSON.parse(text);
                    RecipeManager.saveData(imported);
                    this.render(true);
                    ui.notifications.info("Рецепты импортированы");
                } catch (err) {
                    ui.notifications.error("Ошибка импорта: " + err.message);
                }
            }
        };
        input.click();
    }
    
    _onExportRecipes() {
        const data = RecipeManager.getData();
        const exportData = {
            categories: data.customRecipes.length > 0 ? {} : data.categories,
            recipes: data.customRecipes
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-recipes.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    _onResetAll() {
        const success = RecipeManager.resetCustomData();
        if (success) {
            this.render(true);
        }
    }
    
    _onBackupAll() {
        RecipeManager.exportCustomData();
    }
    
    async _updateObject(event, formData) {
        // Обработка формы редактирования
        await RecipeManager.saveData(formData);
    }
}