export class RecipeConstructorApp extends FormApplication {
    constructor() {
        super();
        this.ingredients = [];
        this.result = null;
        this.category = null;
        this.subcategory = null;
        this.isNewSubcategory = false;
        
        // 1. Базовые (вшитые) категории
        const baseCategories = {
            "ingredients": { name: "Ингредиенты", subcategories: { "suspension": "Суспензии", "essence": "Эссенции", "salt": "Соли", "ash": "Золы", "vitriol": "Купоросы", "sublimate": "Сублиматы" } },
            "alchemy": { name: "Алхимия", subcategories: { "potions": "Зелья", "elixirs": "Эликсиры", "grenades": "Гранаты", "coatings": "Масла и яды" } },
            "smithing": { name: "Кузнечное дело", subcategories: { "ammunition": "Амуниция", "mechanisms": "Механизмы", "weapons": "Оружие", "armor": "Доспехи" } }, // Обновленные
            "jewelry": { name: "Ювелирное дело", subcategories: { "gem-cutting": "Огранка камня", "enchantment-dust": "Чародейская пыль" } },
            "leatherworking": { name: "Кожевничество", subcategories: { "leather-armor": "Кожаные доспехи", "tanning": "Дубление кожи" } },
            "cooking": { name: "Кулинария", subcategories: { "rations": "Рационы", "feasts": "Пиры" } },
            "tailoring": { name: "Ткачество", subcategories: { "cloth-armor": "Тканевые доспехи", "embroidery": "Вышивка" } },
            "scribing": { name: "Начертание", subcategories: { "scrolls": "Свитки", "inks": "Чернила" } },
            "custom": { name: "Пользовательские", subcategories: { "uncategorized": "Без категории" } }
        };

        // 2. Читаем кастомные подкатегории ГМа напрямую из настроек Foundry
        let customCategories = {};
        try {
            const customData = game.settings.get('blue-man-crafting', 'customRecipes');
            if (customData && customData.categories) {
                customCategories = customData.categories;
            }
        } catch (e) {
            console.warn("BMC: Не удалось прочитать кастомные категории", e);
        }

        // 3. Склеиваем базу и кастом
        this.categories = { ...baseCategories };
        // Глубокое объединение подкатегорий
        for (const [catId, catData] of Object.entries(customCategories)) {
            if (this.categories[catId]) {
                this.categories[catId].subcategories = { 
                    ...this.categories[catId].subcategories, 
                    ...(catData.subcategories || {})
                };
            } else {
                // Добавляем новые глобальные категории
                this.categories[catId] = {
                    name: catData.name,
                    subcategories: catData.subcategories || {}
                };
            }
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "bmc-recipe-constructor",
            title: "Конструктор рецептов",
            template: "modules/blue-man-crafting/templates/recipe-constructor.hbs",
            width: 700,
            height: "auto",
            classes: ["bg3-crafting-app"],
            dragDrop: [{ dropSelector: ".drop-zone" }],
            resizable: false
        });
    }

    getData() {
        let currentSubcategories = {};
        if (this.category && this.categories[this.category]) {
            const subs = this.categories[this.category].subcategories;
            for (const [id, name] of Object.entries(subs)) {
                currentSubcategories[id] = name.name || name;
            }
        }

        return {
            categories: this.categories,
            currentCategory: this.category,
            currentSubcategories: currentSubcategories,
            currentSubcategory: this.subcategory,
            isNewSubcategory: this.isNewSubcategory,
            ingredients: this.ingredients,
            showIngredientDrop: this.ingredients.length < 3,
            result: this.result
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Обработка селектов
        html.find('#categorySelect').change(this._onCategoryChange.bind(this));
        html.find('#subcategorySelect').change(this._onSubcategoryChange.bind(this));
        
        // Обработка кнопок
        html.find('#clearBtn').click(this._onClearAll.bind(this));
        html.find('#createRecipeBtn').click(this._onCreateRecipe.bind(this));

        // Управление ингредиентами
        html.find('.qty-minus').click(this._onChangeQty.bind(this, -1));
        html.find('.qty-plus').click(this._onChangeQty.bind(this, 1));
        html.find('.remove-ingredient').click(this._onRemoveIngredient.bind(this));
        html.find('.remove-result').click(this._onRemoveResult.bind(this));
    }

    _onCategoryChange(event) {
        this.category = event.target.value;
        this.subcategory = null;
        this.isNewSubcategory = false;
        this.render(false);
    }

    _onSubcategoryChange(event) {
        const val = event.target.value;
        if (val === 'new') {
            this.isNewSubcategory = true;
            this.subcategory = null;
        } else {
            this.isNewSubcategory = false;
            this.subcategory = val;
        }
        this.render(false);
    }

    async _onDrop(event) {
        event.preventDefault();
        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (data.type !== 'Item') return;

            const target = event.target.closest('.drop-zone');
            if (!target) return;

            if (target.id === 'ingredientsZone') {
                await this._addIngredient(data);
            } else if (target.id === 'resultZone') {
                await this._setResult(data);
            }
        } catch (e) {
            console.error('Ошибка при обработке drag&drop:', e);
            ui.notifications.error('Не удалось обработать перетаскиваемый элемент');
        }
    }

    async _addIngredient(itemData) {
        const item = await fromUuid(itemData.uuid);
        if (!item) {
            ui.notifications.error('Не удалось найти предмет');
            return;
        }

        if (this.ingredients.length >= 3) {
            ui.notifications.error('Максимум 3 ингредиента!');
            return;
        }

        const existing = this.ingredients.find(i => i.uuid === itemData.uuid);
        if (existing) {
            existing.qty++;
        } else {
            this.ingredients.push({
                uuid: item.uuid,
                name: item.name,
                img: item.img,
                qty: 1,
                slot: this.ingredients.length + 1
            });
        }
        this.render(false);
    }

    async _setResult(itemData) {
        const item = await fromUuid(itemData.uuid);
        if (!item) {
            ui.notifications.error('Не удалось найти предмет');
            return;
        }

        const rarity = item.system?.rarity || "common";
        this.result = {
            uuid: item.uuid,
            name: item.name,
            img: item.img,
            rarity: rarity
        };
        this.render(false);
    }

    _onChangeQty(delta, event) {
        const index = parseInt(event.currentTarget.dataset.index);
        this.ingredients[index].qty = Math.max(1, this.ingredients[index].qty + delta);
        this.render(false);
    }

    _onRemoveIngredient(event) {
        const index = parseInt(event.currentTarget.dataset.index);
        this.ingredients.splice(index, 1);
        // Пересчитываем слоты
        this.ingredients.forEach((ing, idx) => ing.slot = idx + 1);
        this.render(false);
    }

    _onRemoveResult(event) {
        this.result = null;
        this.render(false);
    }

    _onClearAll(event) {
        this.ingredients = [];
        this.result = null;
        this.category = null;
        this.subcategory = null;
        this.isNewSubcategory = false;
        this.render(false);
    }

    _slugifyId(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\p{L}\p{N}-]+/gu, "")
            .slice(0, 64);
    }

    async _onCreateRecipe(event) {
        event.preventDefault();
        
        if (this.ingredients.length === 0) {
            ui.notifications.error('Добавьте хотя бы один компонент');
            return;
        }
        if (!this.result) {
            ui.notifications.error('Укажите результат крафта');
            return;
        }
        if (!this.category) {
            ui.notifications.error('Выберите категорию');
            return;
        }

        let finalSubcategory = this.subcategory;
        let subcategoryName = "";

        if (this.isNewSubcategory) {
            const newName = this.element.find('#newCategoryName').val().trim();
            if (!newName) {
                ui.notifications.error('Введите название новой подкатегории');
                return;
            }
            finalSubcategory = this._slugifyId(newName);
            subcategoryName = newName;

            // Сохраняем новую подкатегорию в настройки
            let customData = game.settings.get('blue-man-crafting', 'customRecipes') || { categories: {} };
            if (!customData.categories) customData.categories = {};
            if (!customData.categories[this.category]) {
                customData.categories[this.category] = { subcategories: {} };
            }
            if (!customData.categories[this.category].subcategories) {
                customData.categories[this.category].subcategories = {};
            }
            
            customData.categories[this.category].subcategories[finalSubcategory] = subcategoryName;
            
            await game.settings.set('blue-man-crafting', 'customRecipes', customData);
            ui.notifications.info(`Подкатегория "${subcategoryName}" успешно создана.`);
        } else {
            if (!finalSubcategory) {
                ui.notifications.error('Выберите подкатегорию');
                return;
            }
            // Получаем имя из списка
            const subs = this.categories[this.category].subcategories;
            subcategoryName = subs[finalSubcategory]?.name || subs[finalSubcategory] || finalSubcategory;
        }

        const categoryName = this.categories[this.category].name;
        const rarity = this.element.find('#raritySelect').val() || "common";

        const scrollIcons = [
            "icons/sundries/documents/blueprint-magical.webp",
            "icons/sundries/documents/blueprint-recipe-magic.webp",
            "icons/sundries/documents/document-brown.webp",
            "icons/sundries/documents/document-scroll-brown.webp",
            "icons/sundries/documents/document-scroll-tan.webp"
        ];
        const randomScrollIcon = scrollIcons[Math.floor(Math.random() * scrollIcons.length)];
        
        const recipeData = {
            name: `Рецепт: ${this.result.name}`,
            type: "consumable",
            img: randomScrollIcon,
            system: {
                description: {
                    value: `<p><strong>Рецепт создания:</strong> ${this.result.name}</p>
                            <p><strong>Категория:</strong> ${categoryName} - ${subcategoryName}</p>
                            <p><strong>Компоненты:</strong></p>
                            <ul>
                                ${this.ingredients.map(i => `<li>${i.name} x${i.qty}</li>`).join('')}
                            </ul>
                            <p><em>Перетащите этот свиток в окно крафта для изучения рецепта.</em></p>`
                },
                rarity: rarity,
                consumableType: "scroll"
            },
            flags: {
                "blue-man-crafting": {
                    recipe: {
                        name: this.result.name,
                        rarity: rarity,
                        type: finalSubcategory, 
                        categoryId: this.category,
                        subcategoryId: finalSubcategory,
                        input: {
                            slot1: this.ingredients.length > 0 ? { type: "item", uuid: this.ingredients[0].uuid, qty: this.ingredients[0].qty } : { type: "empty" },
                            slot2: this.ingredients.length > 1 ? { type: "item", uuid: this.ingredients[1].uuid, qty: this.ingredients[1].qty } : { type: "empty" },
                            slot3: this.ingredients.length > 2 ? { type: "item", uuid: this.ingredients[2].uuid, qty: this.ingredients[2].qty } : { type: "empty" }
                        },
                        result: {
                            uuid: this.result.uuid,
                            qty: 1
                        },
                        ingredients: this.ingredients.map(i => ({ type: "item", uuid: i.uuid, qty: i.qty }))
                    }
                }
            }
        };

        const createAsScroll = this.element.find('#createAsScroll')[0].checked;

        if (createAsScroll) {
            try {
                await Item.create(recipeData);
                ui.notifications.info(`Свиток с рецептом "${this.result.name}" создан!`);
                this.close();
            } catch (error) {
                console.error("Ошибка создания рецепта:", error);
                ui.notifications.error('Не удалось создать рецепт: ' + error.message);
            }
        } else {
            try {
                let customData = game.settings.get('blue-man-crafting', 'customRecipes') || { categories: {}, recipes: [] };
                if (!customData.recipes) customData.recipes = [];
                
                const recipeObj = recipeData.flags["blue-man-crafting"].recipe;
                recipeObj.id = randomID(); // Генерация уникального ID для рецепта
                
                customData.recipes.push(recipeObj);
                await game.settings.set('blue-man-crafting', 'customRecipes', customData);
                
                ui.notifications.info(`Рецепт "${this.result.name}" успешно изучен модулем! Переоткройте окно крафта.`);
                this.close();
            } catch (error) {
                console.error("Ошибка добавления рецепта напрямую:", error);
                ui.notifications.error('Не удалось добавить рецепт: ' + error.message);
            }
        }
    }
}
