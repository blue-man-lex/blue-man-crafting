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
        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
        
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
        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
        const updatedData = {
            categories: { ...customData.categories, ...(data.categories || {}) },
            recipes: data.recipes || []
        };
        await game.settings.set(RecipeManager.ID, "customRecipes", updatedData);
        console.log(`BMC: Сохранено ${updatedData.recipes.length} пользовательских рецептов`);
    }

    static async resetCustomData() {
        if (confirm("ВНИМАНИЕ! Это удалит ВСЕ пользовательские рецепты и категории. Продолжить?")) {
            await game.settings.set(RecipeManager.ID, "customRecipes", { categories: {}, recipes: [] });
            console.log("BMC: Все пользовательские рецепты удалены");
            ui.notifications.info("Все пользовательские рецепты удалены");
            return true;
        }
        return false;
    }

    static async exportCustomData() {
        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
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

        console.log(`BMC: getItemDisplayInfo - ищем itemId: ${itemIdToFind}, displayName: ${displayName}`);

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
        console.log(`BMC: findItemDataInCompendiums - ищем targetId: ${targetId}`);
        if (!targetId) return null;
        if (targetId.includes(".") || targetId.includes("Compendium")) {
            try {
                console.log(`BMC: пробуем fromUuid для: ${targetId}`);
                const doc = await fromUuid(targetId);
                if (doc) {
                    console.log(`BMC: найден через fromUuid:`, doc.name);
                    return doc.toObject();
                }
            } catch (e) {
                console.log(`BMC: ошибка fromUuid:`, e);
            }
        }
        const cleanId = targetId.split('.').pop();
        console.log(`BMC: cleanId: ${cleanId}`);
        const worldItem = game.items.get(cleanId);
        if (worldItem) {
            console.log(`BMC: найден в world items:`, worldItem.name);
            return worldItem.toObject();
        }

        console.log(`BMC: ищем в компендиумах...`);
        for (const pack of game.packs) {
            if (pack.documentName !== "Item") continue;
            const index = await pack.getIndex(); 
            const entry = index.find(e => e._id === cleanId);
            if (entry) {
                console.log(`BMC: найден в пакете ${pack.metadata.id}:`, entry.name);
                const doc = await pack.getDocument(entry._id);
                return doc.toObject();
            }
        }
        console.log(`BMC: НЕ НАЙДЕН!`);
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
            template: "modules/blue-man-crafting/templates/gm-manager-enhanced.hbs",
            width: 800, height: 900, resizable: true,
            tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "custom" }]
        });
    }
    
    getData() {
        const data = RecipeManager.getData();
        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
        
        // Получаем только пользовательские категории
        const customCategories = [];
        for (const [catId, catData] of Object.entries(customData.categories || {})) {
            customCategories.push({
                id: catId,
                name: catData.name,
                subcategories: catData.subcategories
            });
        }
        
        return { 
            data: data, 
            readOnly: false,
            customRecipes: data.customRecipes || [],
            customCategories: customCategories,
            counts: {
                recipes: data.customRecipes?.length || 0,
                categories: Object.keys(customData.categories || {}).length
            },
            jsonString: JSON.stringify({
                categories: customData.categories || {},
                recipes: data.customRecipes || []
            }, null, 2)
        };
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        
        // Табы
        html.find('.bmc-tab').click(this._onTabClick.bind(this));
        
        // Рецепты
        html.find('.bmc-add-recipe').click(this._onAddRecipe.bind(this));
        html.find('.bmc-edit-recipe').click(this._onEditRecipe.bind(this));
        html.find('.bmc-delete-recipe').click(this._onDeleteRecipe.bind(this));
        
        // Категории
        html.find('.bmc-add-category').click(this._onAddCategory.bind(this));
        html.find('.bmc-edit-category').click(this._onEditCategory.bind(this));
        html.find('.bmc-delete-category').click(this._onDeleteCategory.bind(this));
        
        // JSON
        html.find('.bmc-copy-btn').click(this._onCopyJson.bind(this));
        html.find('.bmc-import-btn').click(this._onImportJson.bind(this));
        
        // Общие
        html.find('.bmc-reset-btn').click(this._onResetAll.bind(this));
        html.find('.bmc-reset-all').click(this._onResetAll.bind(this));
        html.find('.bmc-backup-all').click(this._onBackupAll.bind(this));
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
    
    _onTabClick(event) {
        const tabName = event.currentTarget.dataset.tab;
        
        // Переключаем табы
        $(event.currentTarget).siblings().removeClass('active');
        $(event.currentTarget).addClass('active');
        
        // Переключаем контент
        $(event.currentTarget).closest('.bmc-tabs').siblings('.bmc-tab-content')
            .find('.bmc-tab-pane').removeClass('active');
        $(`#${tabName}-tab`).addClass('active');
    }
    
    _onAddCategory() {
        const dialog = new Dialog({
            title: "Добавить категорию",
            content: `
                <div style="padding: 10px;">
                    <div style="margin-bottom: 10px;">
                        <label>ID категории (латиницей, без пробелов):</label>
                        <input type="text" id="categoryId" style="width: 100%; background: #333; color: #fff; border: 1px solid #555; padding: 5px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>Название категории:</label>
                        <input type="text" id="categoryName" style="width: 100%; background: #333; color: #fff; border: 1px solid #555; padding: 5px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>Подкатегории (через запятую):</label>
                        <input type="text" id="subcategories" placeholder="Например: Зелья, Эликсиры, Гранаты" style="width: 100%; background: #333; color: #fff; border: 1px solid #555; padding: 5px;">
                    </div>
                </div>
            `,
            buttons: {
                save: {
                    icon: '<i class="fas fa-save"></i>',
                    label: "Сохранить",
                    callback: (html) => {
                        const categoryId = html.find('#categoryId').val().trim();
                        const categoryName = html.find('#categoryName').val().trim();
                        const subcategoriesText = html.find('#subcategories').val().trim();
                        
                        if (!categoryId || !categoryName) {
                            ui.notifications.error("ID и название обязательны!");
                            return;
                        }
                        
                        const subcategories = {};
                        if (subcategoriesText) {
                            subcategoriesText.split(',').forEach(sub => {
                                const subId = sub.trim().toLowerCase().replace(/\s+/g, '-');
                                subcategories[subId] = sub.trim();
                            });
                        }
                        
                        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
                        customData.categories = customData.categories || {};
                        customData.categories[categoryId] = {
                            name: categoryName,
                            subcategories: subcategories
                        };
                        
                        game.settings.set(RecipeManager.ID, "customRecipes", customData);
                        this.render(true);
                        ui.notifications.info(`Категория "${categoryName}" добавлена`);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Отмена"
                }
            },
            default: "save"
        });
        dialog.render(true);
    }
    
    _onEditCategory(event) {
        const categoryId = event.currentTarget.dataset.id;
        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
        const category = customData.categories?.[categoryId];
        
        if (!category) {
            ui.notifications.error("Категория не найдена!");
            return;
        }
        
        const subcategoriesText = Object.entries(category.subcategories || {})
            .map(([id, name]) => name)
            .join(', ');
        
        const dialog = new Dialog({
            title: `Редактировать категорию: ${category.name}`,
            content: `
                <div style="padding: 10px;">
                    <div style="margin-bottom: 10px;">
                        <label>ID категории:</label>
                        <input type="text" id="categoryId" value="${categoryId}" disabled style="width: 100%; background: #333; color: #fff; border: 1px solid #555; padding: 5px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>Название категории:</label>
                        <input type="text" id="categoryName" value="${category.name}" style="width: 100%; background: #333; color: #fff; border: 1px solid #555; padding: 5px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>Подкатегории (через запятую):</label>
                        <input type="text" id="subcategories" value="${subcategoriesText}" style="width: 100%; background: #333; color: #fff; border: 1px solid #555; padding: 5px;">
                    </div>
                </div>
            `,
            buttons: {
                save: {
                    icon: '<i class="fas fa-save"></i>',
                    label: "Сохранить",
                    callback: (html) => {
                        const categoryName = html.find('#categoryName').val().trim();
                        const subcategoriesText = html.find('#subcategories').val().trim();
                        
                        if (!categoryName) {
                            ui.notifications.error("Название обязательно!");
                            return;
                        }
                        
                        const subcategories = {};
                        if (subcategoriesText) {
                            subcategoriesText.split(',').forEach(sub => {
                                const subId = sub.trim().toLowerCase().replace(/\s+/g, '-');
                                subcategories[subId] = sub.trim();
                            });
                        }
                        
                        customData.categories[categoryId] = {
                            name: categoryName,
                            subcategories: subcategories
                        };
                        
                        game.settings.set(RecipeManager.ID, "customRecipes", customData);
                        this.render(true);
                        ui.notifications.info(`Категория "${categoryName}" обновлена`);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Отмена"
                }
            },
            default: "save"
        });
        dialog.render(true);
    }
    
    _onDeleteCategory(event) {
        const categoryId = event.currentTarget.dataset.id;
        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
        const category = customData.categories?.[categoryId];
        
        if (!category) {
            ui.notifications.error("Категория не найдена!");
            return;
        }
        
        const dialog = new Dialog({
            title: "Удалить категорию?",
            content: `
                <div style="padding: 10px;">
                    <p>Вы действительно хотите удалить категорию "<strong>${category.name}</strong>"?</p>
                    <p style="color: #ff6b6b;">Это действие нельзя отменить!</p>
                </div>
            `,
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Удалить",
                    callback: () => {
                        delete customData.categories[categoryId];
                        game.settings.set(RecipeManager.ID, "customRecipes", customData);
                        this.render(true);
                        ui.notifications.info(`Категория "${category.name}" удалена`);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Отмена"
                }
            },
            default: "cancel"
        });
        dialog.render(true);
    }
    
    _onCopyJson() {
        const jsonString = $('#bmc-json-input').val();
        navigator.clipboard.writeText(jsonString).then(() => {
            ui.notifications.info("JSON скопирован в буфер обмена");
        }).catch(() => {
            ui.notifications.error("Ошибка копирования");
        });
    }
    
    _onImportJson() {
        try {
            const jsonString = $('#bmc-json-input').val();
            const data = JSON.parse(jsonString);
            RecipeManager.saveData(data);
            this.render(true);
            ui.notifications.info("Данные импортированы");
        } catch (err) {
            ui.notifications.error("Ошибка импорта: " + err.message);
        }
    }
}