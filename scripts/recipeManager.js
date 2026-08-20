import { RECIPES, RECIPE_CATEGORIES } from "./gamedata.js";
import { ALCHEMY_DLC } from "./dlc/alchemy.js";
import { BLACKSMITH_DLC } from "./dlc/blacksmith.js";
import { LEATHERWORKER_DLC } from "./dlc/leatherworker.js";
import { SCRIBING_DLC } from "./dlc/scribing.js";
import { COOKING_DLC } from "./dlc/cooking.js";
import { JEWELRY_DLC } from "./dlc/jewelry.js";

const INTERNAL_DLCS = [ALCHEMY_DLC, BLACKSMITH_DLC, LEATHERWORKER_DLC, SCRIBING_DLC, COOKING_DLC, JEWELRY_DLC];

export class RecipeManager {
    static ID = "blue-man-crafting";
    static SETTING = "recipes";
    
    // Хранилище для внешних DLC (через API)
    static dlcCategories = {};
    static dlcRecipes = [];
    static registeredDLCs = [];

    static registerDLC(dlcData) {
        if (!dlcData) return;
        
        if (dlcData.categories) {
            this.dlcCategories = foundry.utils.mergeObject(this.dlcCategories, dlcData.categories);
        }
        
        if (dlcData.recipes && Array.isArray(dlcData.recipes)) {
            this.dlcRecipes = this.dlcRecipes.concat(dlcData.recipes);
        }
        
        this.registeredDLCs.push({
            name: dlcData.name || "Unknown DLC",
            version: dlcData.version || "1.0.0",
            description: dlcData.description || ""
        });
        
        console.log(`BMC: [DLC] Успешно зарегистрировано DLC: ${dlcData.name || "Unknown"} (Рецептов: ${dlcData.recipes?.length || 0})`);
    }

    static async initialize() {
        game.settings.register(this.ID, "craftingMinigame", {
            name: "Мини-игра при крафте",
            hint: "Если включено, перед крафтом появляется мини-игра на тайминг. При провале крафт не происходит.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            requiresReload: false
        });

        game.settings.register(this.ID, "customRecipes", {
            name: "Пользовательские рецепты",
            scope: "world",
            config: false,
            type: Object,
            default: { categories: {}, recipes: [] }
        });

        game.settings.register(this.ID, "activeDLCs", {
            name: "Активные встроенные DLC",
            scope: "world",
            config: false,
            type: Array,
            default: ["alchemy"] // По умолчанию включена алхимия
        });

        game.settings.registerMenu(this.ID, "recipeManagerMenu", {
            name: "Настройка рецептов",
            label: "Редактор рецептов",
            hint: "Добавление и редактирование пользовательских рецептов",
            icon: "fas fa-scroll",
            type: RecipeManagerApp,
            restricted: true
        });
        console.log(`BMC: [INIT] Менеджер рецептов инициализирован.`);
    }

    static getData() {
        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
        const activeDLCs = game.settings.get(RecipeManager.ID, "activeDLCs");

        // 1. Собираем встроенные DLC, которые активированы
        let internalCategories = {};
        let internalRecipes = [];
        const dlcList = INTERNAL_DLCS.map(dlc => {
            const isActive = activeDLCs.includes(dlc.id);
            if (isActive) {
                internalCategories = foundry.utils.mergeObject(internalCategories, dlc.categories);
                internalRecipes = internalRecipes.concat(dlc.recipes);
            }
            return {
                id: dlc.id,
                name: dlc.name,
                version: dlc.version,
                description: dlc.description,
                active: isActive,
                isInternal: true
            };
        });

        // 2. Добавляем внешние DLC (зарегистрированные через API)
        this.registeredDLCs.forEach(dlc => {
            dlcList.push({
                ...dlc,
                active: true, // Внешние всегда активны, если загрузились
                isInternal: false
            });
        });

        // Адаптируем базовые рецепты (встроенные DLC + внешние DLC + остатки gamedata)
        const combinedBaseRecipes = [...RECIPES, ...internalRecipes, ...this.dlcRecipes];
        const adaptedBaseRecipes = combinedBaseRecipes.map(recipe => {
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) return { ...recipe, isCustom: false };
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
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) return { ...recipe, isCustom: true };
            if (recipe.input) {
                const ingredients = [];
                if (recipe.input.slot1 && recipe.input.slot1.type !== 'empty') ingredients.push(recipe.input.slot1);
                if (recipe.input.slot3 && recipe.input.slot3.type !== 'empty') ingredients.push(recipe.input.slot3);
                if (recipe.input.slot2 && recipe.input.slot2.type !== 'empty') ingredients.push(recipe.input.slot2);
                return { ...recipe, ingredients: ingredients, isCustom: true };
            }
            return { ...recipe, isCustom: true };
        });

        // Объединяем категории (Глубокое слияние: База -> Внутренние DLC -> Внешние DLC -> Кастомные)
        let allCategories = foundry.utils.duplicate(RECIPE_CATEGORIES || {});
        allCategories = foundry.utils.mergeObject(allCategories, internalCategories);
        allCategories = foundry.utils.mergeObject(allCategories, this.dlcCategories);
        allCategories = foundry.utils.mergeObject(allCategories, customData.categories || {});

        const allRecipes = [...adaptedBaseRecipes, ...adaptedCustomRecipes];

        return {
            categories: allCategories,
            recipes: allRecipes,
            customRecipes: adaptedCustomRecipes,
            baseRecipes: adaptedBaseRecipes,
            registeredDLCs: dlcList
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

        // 1. По ID (Жесткое совпадение в массиве items)
        if (category.items && Array.isArray(category.items)) {
            const idMatch = category.items.some(catItemId => this._compareUuids(catItemId, itemData));
            if (idMatch) return true;
        }

        // 2. Системные проверки D&D (важно для DLC с оружием/броней)
        if (category.itemType && itemData.type === category.itemType) return true;
        if (category.baseItem && itemData.system?.type?.value === category.baseItem) return true;
        if (itemData.type === categoryId) return true;
        
        // Дополнительная проверка на совпадение ID категории и типа экипировки
        if (itemData.system?.armor?.type === categoryId || itemData.system?.weaponType === categoryId) return true;

        // 3. По ИМЕНИ (Надежное совпадение для алхимии, где тип заложен в названии, н-р: "Суспензия...")
        if (itemData.name && category.name) {
            const catName = category.name.replace(/\(.*\)/, "").trim().toLowerCase();
            const itemName = itemData.name.toLowerCase();

            // Получаем корень категории, убирая типичные окончания русского языка
            let catRoot = catName;
            if (/[аяыийе]$/.test(catRoot)) catRoot = catRoot.slice(0, -1);
            
            if (catRoot.length > 2 && itemName.includes(catRoot)) return true;

            // И наоборот - проверяем вхождение корня предмета в категорию
            let itemRoot = itemName.split(' ')[0];
            if (/[аяыийе]$/.test(itemRoot)) itemRoot = itemRoot.slice(0, -1);
            
            if (itemRoot.length > 2 && catName.includes(itemRoot)) return true;
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
            registeredDLCs: data.registeredDLCs || [],
            counts: {
                recipes: data.customRecipes?.length || 0,
                categories: Object.keys(customData.categories || {}).length,
                dlcs: data.registeredDLCs?.length || 0
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


        // Категории
        html.find('.bmc-add-category').click(this._onAddCategory.bind(this));
        html.find('.bmc-edit-category').click(this._onEditCategory.bind(this));
        html.find('.bmc-delete-category').click(this._onDeleteCategory.bind(this));

        // DLC
        html.find('.bmc-toggle-dlc').click(this._onToggleDLC.bind(this));

        // JSON
        html.find('.bmc-copy-btn').click(this._onCopyJson.bind(this));
        html.find('.bmc-import-btn').click(this._onImportJson.bind(this));

        // Общие
        html.find('.bmc-reset-btn').click(this._onResetAll.bind(this));
        html.find('.bmc-reset-all').click(this._onResetAll.bind(this));
        html.find('.bmc-backup-all').click(this._onBackupAll.bind(this));
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

    async _onToggleDLC(event) {
        const dlcId = event.currentTarget.dataset.id;
        let activeDLCs = game.settings.get(RecipeManager.ID, "activeDLCs");
        
        if (activeDLCs.includes(dlcId)) {
            activeDLCs = activeDLCs.filter(id => id !== dlcId);
        } else {
            activeDLCs.push(dlcId);
        }
        
        await game.settings.set(RecipeManager.ID, "activeDLCs", activeDLCs);
        ui.notifications.info("Настройки DLC обновлены.");
        this.render(true);
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
                                subcategories[subId] = { name: sub.trim(), items: [] };
                            });
                        }

                        const customData = game.settings.get(RecipeManager.ID, "customRecipes");
                        customData.categories = customData.categories || {};
                        customData.categories[categoryId] = {
                            name: categoryName,
                            global: true,
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
                                subcategories[subId] = { name: sub.trim(), items: [] };
                            });
                        }

                        customData.categories[categoryId] = {
                            name: categoryName,
                            global: true,
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
                    <p style="color: #ff6b6b;">Это действие нельзя отменить! Все рецепты в этой категории также будут удалены!</p>
                </div>
            `,
            buttons: {
                delete: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Удалить",
                    callback: async () => {
                        delete customData.categories[categoryId];
                        if (customData.recipes) {
                            customData.recipes = customData.recipes.filter(r => r.categoryId !== categoryId);
                        }
                        await game.settings.set(RecipeManager.ID, "customRecipes", customData);
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