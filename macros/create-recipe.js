// Макрос для создания рецептов реагентов
// Создает свиток с рецептом, который можно изучить в модуле крафта

class RecipeCreator extends Application {
    constructor() {
        super({
            title: "Создание рецепта",
            template: "modules/blue-man-crafting/macros/recipe-creator-template.html",
            width: 550,
            height: 900, // Увеличиваем высоту для кнопок
            resizable: false,
            minimizable: false
        });
        
        this.ingredients = [];
        this.result = null;
        this.category = null;
        this.subcategory = null;
        
        // Получаем категории из модуля
        // Используем прямой доступ к данным модуля через настройки
        let categories = {};
        try {
            // Получаем все данные модуля через RecipeManager
            // RecipeManager доступен глобально после инициализации модуля
            if (window.RecipeManager) {
                categories = window.RecipeManager.getData().categories;
            } else {
                // Пробуем получить через game.modules
                const moduleData = game.modules.get('blue-man-crafting');
                if (moduleData?.scripts) {
                    // Ищем RecipeManager в загруженных скриптах
                    console.log('BMC: Пробуем получить категории через модуль...');
                }
            }
            
            // Если все еще не получили, пробуем эмулировать загрузку
            if (!categories || Object.keys(categories).length === 0) {
                console.log('BMC: Используем резервный метод получения категорий');
                // Загружаем базовые категории напрямую
                categories = {
                    "ingredients": {
                        name: "Ингредиенты",
                        subcategories: {
                            "salt": "Соли",
                            "suspension": "Суспензии",
                            "ash": "Золы",
                            "vitriol": "Купоросы",
                            "sublimate": "Сублиматы",
                            "essence": "Эссенции"
                        }
                    },
                    "alchemy": {
                        name: "Алхимия",
                        subcategories: {
                            "potions": "Зелья",
                            "elixirs": "Эликсиры",
                            "grenades": "Гранаты",
                            "coatings": "Масла и яды"
                        }
                    },
                    "smithing": {
                        name: "Кузнечное дело",
                        subcategories: {
                            "weapons": "Оружие",
                            "armor": "Доспехи",
                            "tools": "Инструменты"
                        }
                    },
                    "jewelry": {
                        name: "Ювелирное дело",
                        subcategories: {
                            "gem-cutting": "Граненые камни",
                            "enchantment-dust": "Чары для зачарования"
                        }
                    },
                    "leatherworking": {
                        name: "Кожевничество",
                        subcategories: {
                            "leather-armor": "Кожаные доспехи",
                            "tanning": "Дубление кожи"
                        }
                    },
                    "cooking": {
                        name: "Кулинария",
                        subcategories: {
                            "rations": "Пайки",
                            "feasts": "Пиршества"
                        }
                    },
                    "tailoring": {
                        name: "Ткачество",
                        subcategories: {
                            "cloth-armor": "Тканевые доспехи",
                            "embroidery": "Вышивка"
                        }
                    }
                };
            }
        } catch (e) {
            console.error('BMC: Ошибка получения категорий:', e);
        }
        
        this.categories = categories;
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
        
        // Обработка drag&drop
        html.find('#ingredientsZone').on('drop', this.handleIngredientDrop.bind(this));
        html.find('#resultZone').on('drop', this.handleResultDrop.bind(this));
        html.find('.drop-zone').on('dragover', (e) => e.preventDefault());
        
        // Кнопки показа скрытых зон
        html.find('#showIngredientsZone').on('click', () => this.showDropZone('ingredients'));
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
        
        // НЕ перерисовываем весь интерфейс - это сбрасывает обработчики
        // this.render(false); 
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
        subcategorySelect.append('<option value="">Выберите подкатегорию</option>');
        
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
    
    handleIngredientDrop(event) {
        event.preventDefault();
        try {
            const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
            
            if (data.type === 'Item') {
                this.addIngredient(data);
            }
        } catch (e) {
            console.error('Ошибка при обработке drag&drop:', e);
            ui.notifications.error('Не удалось обработать перетаскиваемый элемент');
        }
    }
    
    handleResultDrop(event) {
        event.preventDefault();
        try {
            const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
            
            if (data.type === 'Item') {
                this.setResult(data);
            }
        } catch (e) {
            console.error('Ошибка при обработке drag&drop:', e);
            ui.notifications.error('Не удалось обработать перетаскиваемый элемент');
        }
    }
    
    async addIngredient(itemData) {
        // Получаем полный предмет по UUID
        const item = await fromUuid(itemData.uuid);
        
        if (!item) {
            console.error('Не удалось найти предмет по UUID:', itemData.uuid);
            ui.notifications.error('Не удалось найти предмет');
            return;
        }
        
        console.log('Полученный предмет:', item);
        
        const existing = this.ingredients.find(i => i.uuid === itemData.uuid);
        if (existing) {
            existing.qty++;
        } else {
            this.ingredients.push({
                uuid: item.uuid,
                name: item.name,
                img: item.img,
                qty: 1
            });
        }
        this.updateIngredientsList();
        
        // Скрываем drop-зону после добавления первого ингредиента
        if (this.ingredients.length === 1) {
            this.hideDropZone('ingredients');
        }
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
        const list = $('#ingredientsList');
        list.empty();
        
        this.ingredients.forEach((ingredient, index) => {
            const item = $(`
                <div class="ingredient-item">
                    <img src="${ingredient.img}" alt="${ingredient.name}">
                    <span>${ingredient.name}</span>
                    <div class="qty-controls">
                        <button class="qty-minus" data-index="${index}">-</button>
                        <span class="qty">${ingredient.qty}</span>
                        <button class="qty-plus" data-index="${index}">+</button>
                    </div>
                    <button class="remove-ingredient" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
            
            item.find('.qty-minus').on('click', () => this.changeQty(index, -1));
            item.find('.qty-plus').on('click', () => this.changeQty(index, 1));
            item.find('.remove-ingredient').on('click', () => this.removeIngredient(index));
            
            list.append(item);
        });
    }
    
    updateResultDisplay() {
        const display = $('#resultDisplay');
        display.empty();
        
        if (this.result) {
            display.html(`
                <div class="result-item">
                    <img src="${this.result.img}" alt="${this.result.name}">
                    <span>${this.result.name}</span>
                    <button class="remove-result" title="Удалить результат">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
            
            // Добавляем обработчик для кнопки удаления результата
            display.find('.remove-result').on('click', () => this.removeResult());
        }
    }
    
    removeResult() {
        this.result = null;
        this.updateResultDisplay();
        
        // Показываем drop-зону результата обратно
        this.showDropZone('result');
    }
    
    changeQty(index, delta) {
        this.ingredients[index].qty = Math.max(1, this.ingredients[index].qty + delta);
        this.updateIngredientsList();
    }
    
    removeIngredient(index) {
        this.ingredients.splice(index, 1);
        this.updateIngredientsList();
        
        // Показываем drop-зону если удалили все ингредиенты
        if (this.ingredients.length === 0) {
            this.showDropZone('ingredients');
        }
    }
    
    handleCategoryChange(event) {
        const select = $(event.currentTarget);
        const newCategoryInput = $('#newCategoryName');
        
        if (select.val() === 'new') {
            newCategoryInput.show();
        } else {
            newCategoryInput.hide();
            this.category = select.val();
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
        
        // Получаем названия для отображения
        const categoryName = this.categories[this.category]?.name || this.category;
        const subcategoryName = this.categories[this.category]?.subcategories?.[this.subcategory]?.name || this.subcategory;
        
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
            "icons/sundries/documents/document-letter-blue.webp",
            "icons/sundries/documents/document-letter-brown.webp",
            "icons/sundries/documents/document-letter-formal-tan.webp",
            "icons/sundries/documents/document-letter-tan.webp",
            "icons/sundries/documents/document-sealed-beige-red.webp",
            "icons/sundries/documents/document-sealed-brown-red.webp",
            "icons/sundries/documents/document-sealed-red-tan.webp",
            "icons/sundries/documents/document-sealed-red-white.webp",
            "icons/sundries/documents/document-sealed-red-yellow.webp",
            "icons/sundries/documents/document-sealed-signatures-red.webp",
            "icons/sundries/documents/document-sealed-white-orange.webp",
            "icons/sundries/documents/document-sealed-white-red.webp",
            "icons/sundries/documents/document-symbol-circle-brown.webp",
            "icons/sundries/documents/document-symbol-circle-gold-red.webp",
            "icons/sundries/documents/document-symbol-eye.webp",
            "icons/sundries/documents/document-symbol-lightning-brown.webp",
            "icons/sundries/documents/document-symbol-person-brown.webp",
            "icons/sundries/documents/document-symbol-rune-brown.webp",
            "icons/sundries/documents/document-symbol-rune-tan.webp",
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
                rarity: this.result.rarity || "common", // Используем редкость результата!
                consumableType: "scroll"
            },
            flags: {
                "blue-man-crafting": {
                    recipe: {
                        name: this.result.name,
                        type: this.category, // Используем category как type для попадания в правильную подкатегорию
                        input: {
                            slot1: this.ingredients.length > 0 ? {
                                type: "item",
                                uuid: this.ingredients[0].uuid,
                                qty: this.ingredients[0].qty
                            } : { type: "empty" },
                            slot2: this.ingredients.length > 1 ? {
                                type: "item",
                                uuid: this.ingredients[1].uuid,
                                qty: this.ingredients[1].qty
                            } : { type: "empty" },
                            slot3: { type: "empty" }
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
        $('#subcategorySelect').append('<option value="">Выберите подкатегорию</option>');
        
        // Показываем все drop-зоны
        this.showDropZone('ingredients');
        this.showDropZone('result');
        
        $('#raritySelect').val('common');
    }
}

// Запуск макроса
new RecipeCreator().render(true);
