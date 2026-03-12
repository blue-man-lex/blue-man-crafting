// Макрос для создания конечных рецептов
// Создает свиток с рецептом для конечных предметов (оружие, доспехи, зелья и т.д.)

class FinalRecipeCreator extends Application {
    constructor() {
        super({
            title: "Создание конечного рецепта",
            template: "modules/blue-man-crafting/macros/final-recipe-creator-template.html",
            width: 550,
            height: 1050, // Увеличиваем высоту для 3 компонентов и кнопок
            resizable: false,
            minimizable: false
        });
        
        this.ingredients = [];
        this.result = null;
        this.category = null;
        this.subcategory = null;
        
        // 1. Базовые (вшитые) категории
        const baseCategories = {
            "ingredients": { name: "Ингредиенты", subcategories: { "suspension": "Суспензии", "essence": "Эссенции", "salt": "Соли", "ash": "Золы", "vitriol": "Купоросы", "sublimate": "Сублиматы" } },
            "alchemy": { name: "Алхимия", subcategories: { "potions": "Зелья", "elixirs": "Эликсиры", "grenades": "Гранаты", "coatings": "Масла и яды" } },
            "smithing": { name: "Кузнечное дело", subcategories: { "weapons": "Оружие", "armor": "Доспехи", "tools": "Инструменты" } },
            "jewelry": { name: "Ювелирное дело", subcategories: { "gem-cutting": "Огранка камня", "enchantment-dust": "Чародейская пыль" } },
            "leatherworking": { name: "Кожевничество", subcategories: { "leather-armor": "Кожаные доспехи", "tanning": "Дубление кожи" } },
            "cooking": { name: "Кулинария", subcategories: { "rations": "Рационы", "feasts": "Пиры" } },
            "tailoring": { name: "Ткачество", subcategories: { "cloth-armor": "Тканевые доспехи", "embroidery": "Вышивка" } },
            "scribing": { name: "Начертание", subcategories: { "scrolls": "Свитки", "inks": "Чернила" } },
            "custom": { name: "Пользовательские", subcategories: { "uncategorized": "Без категории" } }
        };

        // 2. Читаем кастомные категории ГМа напрямую из настроек Foundry
        let customCategories = {};
        try {
            const customData = game.settings.get('blue-man-crafting', 'customRecipes');
            if (customData && customData.categories) {
                customCategories = customData.categories;
            }
        } catch (e) {
            console.warn("BMC Macro: Не удалось прочитать кастомные категории", e);
        }

        //3. Склеиваем базу и кастом
        this.categories = { ...baseCategories, ...customCategories };
    }
    
    getData() {
        console.log('BMC: getData вызван, категории:', this.categories);
        return {
            ingredients: this.ingredients,
            result: this.result,
            category: this.category,
            subcategory: this.subcategory,
            categories: this.categories
        };
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        
        // Обработка drag&drop для всех 3 компонентов
        html.find('#ingredient1Zone').on('drop', (e) => this.handleIngredientDrop(e, 1));
        html.find('#ingredient2Zone').on('drop', (e) => this.handleIngredientDrop(e, 2));
        html.find('#ingredient3Zone').on('drop', (e) => this.handleIngredientDrop(e, 3));
        html.find('#resultZone').on('drop', this.handleResultDrop.bind(this));
        html.find('.drop-zone').on('dragover', (e) => e.preventDefault());
        
        // Кнопки показа скрытых зон
        html.find('#showIngredient1Zone').on('click', () => this.showDropZone('ingredient1'));
        html.find('#showIngredient2Zone').on('click', () => this.showDropZone('ingredient2'));
        html.find('#showIngredient3Zone').on('click', () => this.showDropZone('ingredient3'));
        html.find('#showResultZone').on('click', () => this.showDropZone('result'));
        
        // Отладка - проверяем наличие селектов
        console.log('BMC: Найдены селекты:', {
            category: html.find('#categorySelect').length,
            subcategory: html.find('#subcategorySelect').length
        });
        
        // Заполняем категории через JS
        this.populateCategories(html);
        
        // Привязываем обработчики ПОСЛЕ заполнения категорий
        html.find('#categorySelect').on('change', this.handleCategoryChange.bind(this));
        html.find('#subcategorySelect').on('change', this.handleSubcategoryChange.bind(this));
        
        // Устанавливаем текущие значения
        if (this.category) {
            html.find('#categorySelect').val(this.category);
            this.updateSubcategories(this.category);
            if (this.subcategory) {
                html.find('#subcategorySelect').val(this.subcategory);
            }
        }
        
        // Кнопки
        html.find('#createRecipeBtn').on('click', this.createRecipe.bind(this));
        html.find('#clearBtn').on('click', this.clearAll.bind(this));
    }
    
    showDropZone(type) {
        const zone = $(`#${type}Zone`);
        const showButton = $(`#show${type.charAt(0).toUpperCase() + type.slice(1)}Zone`);
        
        zone.removeClass('hidden');
        showButton.hide();
    }
    
    hideDropZone(type) {
        const zone = $(`#${type}Zone`);
        const showButton = $(`#show${type.charAt(0).toUpperCase() + type.slice(1)}Zone`);
        
        zone.addClass('hidden');
        showButton.show();
    }
    
    populateCategories(html) {
        console.log('BMC: Заполнение категорий, данные:', this.categories);
        const categorySelect = html.find('#categorySelect');
        console.log('BMC: Селект категорий найден:', categorySelect.length);
        categorySelect.empty();
        categorySelect.append('<option value="">Выберите категорию...</option>');
        
        for (const [id, category] of Object.entries(this.categories)) {
            const option = `<option value="${id}">${category.name}</option>`;
            categorySelect.append(option);
            console.log(`BMC: Добавлена категория: ${id} -> ${category.name}`);
        }
        
        console.log('BMC: Категории заполнены, всего опций:', categorySelect.find('option').length);
        
        // Добавляем обработчик напрямую здесь
        categorySelect.off('change').on('change', (e) => {
            console.log('BMC: Сработал обработчик выбора категории!');
            const categoryId = e.target.value;
            this.category = categoryId;
            this.subcategory = null; // Сбрасываем подкатегорию
            
            console.log('BMC: Выбрана категория:', categoryId);
            
            // Обновляем список подкатегорий
            this.updateSubcategories(categoryId);
        });
    }
    
    handleCategoryChange(event) {
        const categoryId = event.target.value;
        this.category = categoryId;
        this.subcategory = null; // Сбрасываем подкатегорию
        
        console.log('BMC: Выбрана категория:', categoryId);
        
        // Обновляем список подкатегорий
        this.updateSubcategories(categoryId);
    }
    
    handleSubcategoryChange(event) {
        const subcategoryId = event.target.value;
        this.subcategory = subcategoryId;
    }
    
    updateSubcategories(categoryId) {
        console.log('BMC: Обновление подкатегорий для категории:', categoryId);
        console.log('BMC: Доступные категории:', this.categories);
        
        const subcategorySelect = $('#subcategorySelect');
        subcategorySelect.empty();
        subcategorySelect.append('<option value="">Выберите подкатегорию...</option>');
        
        if (categoryId && this.categories[categoryId]?.subcategories) {
            const subcategories = this.categories[categoryId].subcategories;
            console.log('BMC: Найденные подкатегории:', subcategories);
            for (const [id, name] of Object.entries(subcategories)) {
                const displayName = name.name || name;
                subcategorySelect.append(`<option value="${id}">${displayName}</option>`);
                console.log(`BMC: Добавлена подкатегория: ${id} -> ${displayName}`);
            }
        } else {
            console.log('BMC: Подкатегории не найдены для категории:', categoryId);
        }
    }
    
    async handleIngredientDrop(event, slotNumber) {
        event.preventDefault();
        try {
            const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
            
            if (data.type === 'Item') {
                await this.addIngredient(data, slotNumber);
            }
        } catch (e) {
            console.error('Ошибка при обработке drag&drop:', e);
            ui.notifications.error('Не удалось обработать перетаскиваемый элемент');
        }
    }
    
    async handleResultDrop(event) {
        event.preventDefault();
        try {
            const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
            
            if (data.type === 'Item') {
                await this.setResult(data);
            }
        } catch (e) {
            console.error('Ошибка при обработке drag&drop:', e);
            ui.notifications.error('Не удалось обработать перетаскиваемый элемент');
        }
    }
    
    async addIngredient(itemData, slotNumber) {
        // Получаем полный предмет по UUID
        const item = await fromUuid(itemData.uuid);
        
        if (!item) {
            console.error('Не удалось найти предмет по UUID:', itemData.uuid);
            ui.notifications.error('Не удалось найти предмет');
            return;
        }
        
        console.log('Полученный предмет:', item);
        
        // Находим существующий ингредиент в этом слоте и заменяем его
        const existingIndex = this.ingredients.findIndex(i => i.slot === slotNumber);
        const ingredient = {
            uuid: item.uuid,
            name: item.name,
            img: item.img,
            qty: 1,
            slot: slotNumber
        };
        
        if (existingIndex !== -1) {
            this.ingredients[existingIndex] = ingredient;
        } else {
            this.ingredients.push(ingredient);
        }
        
        // Сортируем по слотам
        this.ingredients.sort((a, b) => a.slot - b.slot);
        
        this.updateIngredientsList();
        
        // Скрываем зону для этого слота
        this.hideDropZone(`ingredient${slotNumber}`);
    }
    
    async setResult(itemData) {
        // Получаем полный предмет по UUID
        const item = await fromUuid(itemData.uuid);
        
        if (!item) {
            console.error('Не удалось найти предмет по UUID:', itemData.uuid);
            ui.notifications.error('Не удалось найти предмет');
            return;
        }
        
        console.log('Полученный предмет (результат):', item);
        
        // Получаем редкость из системы dnd5e
        const rarity = item.system?.rarity || "common";
        
        this.result = {
            uuid: item.uuid,
            name: item.name,
            img: item.img,
            rarity: rarity // Добавляем редкость!
        };
        
        this.updateResultDisplay();
        this.hideDropZone('result');
    }
    
    updateIngredientsList() {
        const listDiv = $('#ingredientsList');
        listDiv.empty();
        
        this.ingredients.forEach((ingredient, index) => {
            const itemDiv = $(`
                <div class="ingredient-item">
                    <img src="${ingredient.img}" alt="${ingredient.name}">
                    <span>${ingredient.name} x${ingredient.qty} (Слот ${ingredient.slot})</span>
                    <div class="qty-controls">
                        <button class="qty-decrease" data-index="${index}">-</button>
                        <span class="qty">${ingredient.qty}</span>
                        <button class="qty-increase" data-index="${index}">+</button>
                    </div>
                    <button class="remove-ingredient" data-index="${index}">×</button>
                </div>
            `);
            
            listDiv.append(itemDiv);
        });
        
        // Обработчики для изменения количества
        listDiv.find('.qty-increase').on('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            this.ingredients[index].qty++;
            this.updateIngredientsList();
        });
        
        listDiv.find('.qty-decrease').on('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (this.ingredients[index].qty > 1) {
                this.ingredients[index].qty--;
                this.updateIngredientsList();
            }
        });
        
        // Обработчики для удаления
        listDiv.find('.remove-ingredient').on('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const slot = this.ingredients[index].slot;
            this.ingredients.splice(index, 1);
            this.updateIngredientsList();
            this.showDropZone(`ingredient${slot}`);
        });
    }
    
    updateResultDisplay() {
        const displayDiv = $('#resultDisplay');
        displayDiv.empty();
        
        if (this.result) {
            const resultDiv = $(`
                <div class="result-item">
                    <img src="${this.result.img}" alt="${this.result.name}">
                    <span>${this.result.name}</span>
                    <button class="remove-result">×</button>
                </div>
            `);
            
            displayDiv.append(resultDiv);
            
            // Обработчик для удаления результата
            resultDiv.find('.remove-result').on('click', () => {
                this.result = null;
                this.updateResultDisplay();
                this.showDropZone('result');
            });
        }
    }
    
    async createRecipe() {
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
        if (!this.subcategory) {
            ui.notifications.error('Выберите подкатегорию');
            return;
        }
        
        const rarity = $('#raritySelect').val();
        
        console.log('Создание свитка с редкостью:', rarity);
        console.log('Значение селекта:', $('#raritySelect').val());
        
        // Рандомная иконка для свитка из папки icons/sundries/documents
        const scrollIcons = [
            "icons/sundries/documents/blueprint-magical.webp",
            "icons/sundries/documents/blueprint-magical-brown.webp",
            "icons/sundries/documents/blueprint-recipe-alchemical.webp",
            "icons/sundries/documents/blueprint-recipe-magic.webp",
            "icons/sundries/documents/document-bound-white-tan.webp",
            "icons/sundries/documents/document-bound-white.webp",
            "icons/sundries/documents/document-brown.webp",
            "icons/sundries/documents/document-gold.webp",
            "icons/sundries/documents/document-scroll-brown.webp",
            "icons/sundries/documents/document-scroll-tan.webp",
            "icons/sundries/documents/document-scroll-white.webp",
            "icons/sundries/documents/document-symbol-skull-tan.webp",
            "icons/sundries/documents/document-symbol-triangle-pink.webp",
            "icons/sundries/documents/document-torn-diagram-tan.webp",
            "icons/sundries/documents/document-tree-brown.webp",
            "icons/sundries/documents/document-worn-symbol-brown.webp",
            "icons/sundries/documents/document-writing-brown.webp",
            "icons/sundries/documents/document-writing-pink.webp",
            "icons/sundries/documents/paper-plain-white.webp",
            "icons/sundries/documents/parchment-plain-tan.webp"
        ];
        const randomScrollIcon = scrollIcons[Math.floor(Math.random() * scrollIcons.length)];
        
        // Получаем названия для отображения
        const categoryName = this.categories[this.category]?.name || this.category;
        const subcategoryName = this.categories[this.category]?.subcategories?.[this.subcategory]?.name || this.subcategory;
        
        // Создание данных рецепта
        const recipeData = {
            name: `Рецепт: ${this.result.name}`,
            type: "consumable",
            img: randomScrollIcon, // Рандомная иконка из папки свитков
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
                rarity: $('#raritySelect').val() || "common", // Берем редкость из селекта!
                consumableType: "scroll"
            },
            flags: {
                "blue-man-crafting": {
                    recipe: {
                        name: this.result.name,
                        rarity: rarity, // Добавляем редкость и в рецепт!
                        type: this.subcategory, // Используем подкатегорию как type
                        categoryId: this.category, // Основная категория
                        subcategoryId: this.subcategory, // Подкатегория для globalCategories
                        input: {
                            slot1: this.ingredients.find(i => i.slot === 1) ? {
                                type: "item",
                                uuid: this.ingredients.find(i => i.slot === 1).uuid,
                                qty: this.ingredients.find(i => i.slot === 1).qty
                            } : { type: "empty" },
                            slot2: this.ingredients.find(i => i.slot === 2) ? {
                                type: "item",
                                uuid: this.ingredients.find(i => i.slot === 2).uuid,
                                qty: this.ingredients.find(i => i.slot === 2).qty
                            } : { type: "empty" },
                            slot3: this.ingredients.find(i => i.slot === 3) ? {
                                type: "item",
                                uuid: this.ingredients.find(i => i.slot === 3).uuid,
                                qty: this.ingredients.find(i => i.slot === 3).qty
                            } : { type: "empty" }
                        },
                        result: {
                            uuid: this.result.uuid,
                            qty: 1
                        },
                        // Добавляем старые поля для совместимости
                        ingredients: this.ingredients.map(i => ({
                            type: "item",
                            uuid: i.uuid,
                            qty: i.qty
                        }))
                    }
                }
            }
        };
        
        // Создание свитка в world items
        try {
            const recipeItem = await Item.create(recipeData);
            ui.notifications.info(`Свиток с рецептом "${this.result.name}" создан!`);
            this.close();
        } catch (error) {
            console.error("Ошибка создания рецепта:", error);
            ui.notifications.error('Не удалось создать рецепт: ' + error.message);
        }
    }
    
    clearAll() {
        this.ingredients = [];
        this.result = null;
        this.category = null;
        this.subcategory = null;
        this.updateIngredientsList();
        this.updateResultDisplay();
        
        // Сбрасываем селекты
        $('#categorySelect').val('');
        $('#subcategorySelect').val('');
        $('#subcategorySelect').empty();
        $('#subcategorySelect').append('<option value="">Выберите подкатегорию...</option>');
        
        // Показываем все drop-зоны
        this.showDropZone('ingredient1');
        this.showDropZone('ingredient2');
        this.showDropZone('ingredient3');
        this.showDropZone('result');
        
        $('#raritySelect').val('common');
    }
}

// Запуск макроса
new FinalRecipeCreator().render(true);
