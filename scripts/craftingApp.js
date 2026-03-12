import { RecipeManager } from "./recipeManager.js";
import { ScrollsDialog } from "./scrollsDialog.js";
import { CraftingTooltips } from "./craftingTooltips.js";

// Импортируем socket из main.js
let socket;
export function setSocket(s) {
    socket = s;
}

export class BG3CraftingApp extends Application {
    // Единая карта соответствия подкатегорий их главным категориям
    static SUBCATEGORY_MAP = {
        "potions": "alchemy", "elixirs": "alchemy", "grenades": "alchemy", "coatings": "alchemy",
        "suspension": "ingredients", "essence": "ingredients", "salt": "ingredients", "ash": "ingredients", "vitriol": "ingredients", "sublimate": "ingredients",
        "weapons": "smithing", "armor": "smithing", "tools": "smithing",
        "gem-cutting": "jewelry", "enchantment-dust": "jewelry",
        "leather-armor": "leatherworking", "tanning": "leatherworking",
        "rations": "cooking", "feasts": "cooking",
        "cloth-armor": "tailoring", "embroidery": "tailoring",
        "scrolls": "scribing", "inks": "scribing"
    };

    constructor(actor) {
        // Адаптивная высота: считаем инструменты в инвентаре перед отрисовкой
        let kitCount = 0;
        if (actor && actor.items) {
            const kitKeywords = ["алхимик", "кожевник", "кузнец", "повар", "ткач", "ювелир", "начертатель"];
            kitCount = actor.items.filter(i => 
                kitKeywords.some(kw => i.name.toLowerCase().includes(kw))
            ).length;
        }
        
        // Базовая высота 650 + 48px на каждый инструмент, но не больше высоты экрана браузера (чтобы окно не ушло за монитор)
        const dynamicHeight = Math.min(650 + (kitCount * 48), window.innerHeight - 60);

        super({
            id: "bg3-crafting-app",
            title: "Алхимия и Крафт",
            template: "modules/blue-man-crafting/templates/crafting-window.hbs",
            width: 950,
            height: dynamicHeight,
            resizable: true,
            classes: ["bg3-crafting-app"],
            icon: "fas fa-flask"
        });
        this.actor = actor; 
        this.state = {
            expandedGroups: {},
            expandedSubcategories: {},
            selectedRecipe: null,
            canCraft: false,
            inputs: [null, null, null],
            resultItem: null,
            expandedGroups: { 
                "alchemy": false, 
                "ingredients": false, 
                "smithing": false,
                "jewelry": false,
                "leatherworking": false,
                "cooking": false,
                "tailoring": false
            },
            expandedSubcategories: {
                "potions": false,
                "elixirs": false,
                "grenades": false,
                "coatings": false,
                "suspension": false,
                "essence": false,
                "salt": false,
                "ash": false,
                "vitriol": false,
                "sublimate": false,
                "weapons": false,
                "armor": false,
                "tools": false,
                "gem-cutting": false,
                "enchantment-dust": false,
                "leather-armor": false,
                "tanning": false,
                "rations": false,
                "feasts": false,
                "cloth-armor": false,
                "embroidery": false
            },
            selectedPlayerId: "all" // ID выбранного игрока или "all" для всех
        };

        // Сохраняем ссылку на приложение для доступа из других диалогов
        game.bmc = game.bmc || {};
        game.bmc.craftingApp = this;
        this._scrollPos = 0;
        this._minigame = {
            running: false,
            rafId: null,
            _lastT: null
        };
        this._recipeStatusCache = null;
    }

    async _onDeleteRecipeClick(event) {
        event.stopPropagation(); // Предотвращаем выбор рецепта
        const originalIndex = parseInt(event.currentTarget.dataset.index);

        if (confirm("Удалить этот кастомный рецепт?")) {
            try {
                const data = RecipeManager.getData();

                // Находим рецепт по оригинальному индексу в общем массиве recipes
                const allRecipes = data.recipes || [];
                const targetRecipe = allRecipes[originalIndex];

                if (targetRecipe && targetRecipe.isCustom) {
                    // Ищем индекс этого рецепта в массиве customRecipes
                    const customIndex = data.customRecipes.findIndex(r =>
                        r.name === targetRecipe.name &&
                        r.result?.uuid === targetRecipe.result?.uuid
                    );

                    if (customIndex !== -1) {
                        const recipeName = data.customRecipes[customIndex].name;
                        data.customRecipes.splice(customIndex, 1);
                        await RecipeManager.saveData({ recipes: data.customRecipes });
                        ui.notifications.info(`Рецепт "${recipeName}" удален`);
                        this._recipeStatusCache = null;
                        this.render(true); // Перерисовываем интерфейс
                    }
                }
            } catch (error) {
                console.error('Ошибка при удалении рецепта:', error);
                ui.notifications.error('Не удалось удалить рецепт');
            }
        }
    }

    async _onGMReset(event) {
        event.preventDefault();
        if (confirm("Очистить все пользовательские рецепты? Это действие нельзя отменить!")) {
            try {
                await RecipeManager.saveData({ recipes: [] });
                ui.notifications.info("Все пользовательские рецепты удалены");
                this._recipeStatusCache = null;
                this.render(true);
            } catch (error) {
                console.error('Ошибка при очистке рецептов:', error);
                ui.notifications.error('Не удалось очистить рецепты');
            }
        }
    }

    _captureRecipeListScroll() {
        try {
            // Пытаемся найти элемент в текущем DOM или в this.element
            let el = this.element?.querySelector?.('.recipe-list');
            if (!el) {
                // Если this.element еще не существует, ищем в document
                el = document.querySelector('.recipe-list');
            }

            if (!el) return;

            this._scrollPos = el.scrollTop || 0;
        } catch (e) {
            return;
        }
    }

    _slugifyId(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\p{L}\p{N}-]+/gu, "")
            .slice(0, 64);
    }

    _getFolderPath(folder) {
        if (!folder) return [];
        const names = [];
        let current = folder;
        while (current) {
            if (current.name) names.unshift(String(current.name));
            current = current.folder;
        }
        return names;
    }

    _inferTypeFromFolderPath(folderPathNames) {
        const path = (folderPathNames || []).join("/").toLowerCase();
        if (!path) return null;

        // Ингредиенты
        if (path.includes("суспенз")) return "suspension";
        if (path.includes("эссенц")) return "essence";
        if (path.includes("соль") || path.includes("соли")) return "salt";
        if (path.includes("зол")) return "ash";
        if (path.includes("купорос") || path.includes("витриол")) return "vitriol";
        if (path.includes("сублимат")) return "sublimate";

        // Алхимия
        if (path.includes("зель")) return "potions";
        if (path.includes("эликс")) return "elixirs";
        if (path.includes("гранат") || path.includes("бомб")) return "grenades";
        if (path.includes("масл") || path.includes("яд") || path.includes("токсин")) return "coatings";

        // Кузнечное дело
        if (path.includes("кузнеч") || path.includes("оруж") || path.includes("доспех")) {
            if (path.includes("доспех")) return "armor";
            if (path.includes("инструмент")) return "tools";
            return "weapons"; // fallback
        }

        // Ювелирное
        if (path.includes("ювелир") || path.includes("камн") || path.includes("пыль")) {
            if (path.includes("пыль")) return "enchantment-dust";
            return "gem-cutting";
        }

        // Кожевничество
        if (path.includes("кож") || path.includes("дублен")) {
            if (path.includes("дублен")) return "tanning";
            return "leather-armor";
        }

        // Кулинария
        if (path.includes("кулинар") || path.includes("повар") || path.includes("пир") || path.includes("рацион")) {
            if (path.includes("пир")) return "feasts";
            return "rations";
        }

        // Ткачество
        if (path.includes("ткач") || path.includes("вышив") || path.includes("ткан")) {
            if (path.includes("вышив")) return "embroidery";
            return "cloth-armor";
        }

        // Начертание
        if (path.includes("начертан") || path.includes("свит") || path.includes("чернил")) {
            if (path.includes("чернил")) return "inks";
            return "scrolls";
        }

        return null;
    }

    _inferCategoryFromFolderPath(folderPathNames) {
        const parts = (folderPathNames || []).map(p => String(p || "").trim()).filter(Boolean);
        if (parts.length < 1) return null;

        // 1) Стандартные папки через глобальный маппер
        const knownType = this._inferTypeFromFolderPath(parts);
        if (knownType) {
            const mainCategory = BG3CraftingApp.SUBCATEGORY_MAP[knownType];
            if (mainCategory) {
                return { categoryId: mainCategory, subcategoryId: knownType };
            }
        }

        // 2) Кастомные категории
        const idx = parts.findIndex(p => p && p.toLowerCase && p.toLowerCase() === "крафт");
        if (idx >= 0 && parts[idx + 1] && parts[idx + 2]) {
            const globalName = parts[idx + 1];
            const subName = parts[idx + 2];
            const globalId = this._slugifyId(globalName);
            const subId = this._slugifyId(subName);
            if (globalId && subId) {
                return {
                    categoryId: `custom.${globalId}`,
                    categoryName: globalName,
                    subcategoryId: `custom.${globalId}.${subId}`,
                    subcategoryName: subName
                };
            }
        }

        return null;
    }

    async _inferRecipeTargetFromResultUuid(resultUuid) {
        if (!resultUuid) return null;
        try {
            const doc = await fromUuid(resultUuid);
            const folderPath = this._getFolderPath(doc?.folder);
            return this._inferCategoryFromFolderPath(folderPath);
        } catch (e) {
            return null;
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Initialize tooltips
        this.tooltips = new CraftingTooltips(this);
        this.tooltips.activateListeners(html);

        // Запускаем фоновую асинхронную подгрузку статусов рецептов
        this._applyRecipeStatusesAsync(html);

        // Восстанавливаем позицию скролла после рендера
        if (this._scrollPos > 0) {
            const recipeList = html[0].querySelector('.recipe-list');
            if (recipeList) {
                recipeList.scrollTop = this._scrollPos;
            }
        }

        // Обработчики для аккордеона категорий
        html[0].querySelectorAll('.global-header').forEach(el => {
            el.addEventListener('click', this._onCategoryHeaderClick.bind(this));
        });

        // Обработчики для аккордеона подкатегорий
        html[0].querySelectorAll('.subcategory-header').forEach(el => {
            el.addEventListener('click', this._onSubcategoryHeaderClick.bind(this));
        });

        // Обработчики для рецептов
        html[0].querySelectorAll('.recipe-item').forEach(el => {
            el.addEventListener('click', this._onRecipeClick.bind(this));
        });

        // Обработчики для кнопок ГМ
        html[0].querySelectorAll('.knowledge-toggle').forEach(el => {
            el.addEventListener('click', this._onKnowledgeToggle.bind(this));
        });

        // Обработчики для кнопки изучения рецептов (связываем с функцией свитков)
        html[0].querySelectorAll('.scrolls-trigger').forEach(el => {
            el.addEventListener('click', this._onScrollsClick.bind(this));
        });

        html[0].querySelectorAll('.delete-recipe-btn').forEach(el => {
            el.addEventListener('click', this._onDeleteRecipeClick.bind(this));
        });

        // Обработчики для кнопки крафта
        html[0].querySelectorAll('.main-action').forEach(el => {
            el.addEventListener('click', this._onCraftClick.bind(this));
        });

        // Обработчик для кнопки сброса ГМ
        html[0].querySelector('.gm-reset-btn')?.addEventListener('click', this._onGMReset.bind(this));

        // Обработчики для выпадающего меню игроков
        const dropdownToggle = html[0].querySelector('.dropdown-toggle');
        const dropdownMenu = html[0].querySelector('.dropdown-menu');

        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropdownMenu.parentElement.classList.toggle('show');
            });

            // Обработчики для пунктов меню
            dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', this._onPlayerSelect.bind(this));
            });

            // Закрытие меню при клике вне его
            document.addEventListener('click', (e) => {
                if (!dropdownMenu.parentElement.contains(e.target)) {
                    dropdownMenu.parentElement.classList.remove('show');
                }
            });
        }
    }

    _onPlayerSelect(event) {
        event.preventDefault();
        event.stopPropagation();

        const playerId = event.currentTarget.dataset.playerId;
        const playerName = event.currentTarget.textContent.trim();

        // Обновляем состояние
        this.state.selectedPlayerId = playerId;

        // Обновляем отображение
        const selectedNameElement = document.getElementById('selectedPlayerName');
        if (selectedNameElement) {
            selectedNameElement.textContent = playerName;
        }

        // Обновляем активный класс в меню
        const dropdown = event.currentTarget.closest('.dropdown-menu');
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Закрываем меню
        dropdown.parentElement.classList.remove('show');

        // Перерисовываем интерфейс с новым выбором
        this._recipeStatusCache = null;
        this.render(true);
    }

    _onCategoryHeaderClick(event) {
        event.preventDefault();
        event.stopPropagation();

        // Сначала сохраняем скролл
        this._captureRecipeListScroll();

        const categoryId = event.currentTarget.dataset.group;
        if (!categoryId) return;

        const current = this.state.expandedGroups[categoryId];
        this.state.expandedGroups[categoryId] = current === undefined ? false : !current;
        this.render();
    }

    _onSubcategoryHeaderClick(event) {
        event.preventDefault();
        event.stopPropagation();

        // Сначала сохраняем скролл
        this._captureRecipeListScroll();

        const subcategoryId = event.currentTarget.parentElement?.dataset?.subcategory;
        if (!subcategoryId) return;

        const current = this.state.expandedSubcategories[subcategoryId];
        this.state.expandedSubcategories[subcategoryId] = current === undefined ? false : !current;
        this.render();
    }

    _onRecipeClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this._onSelectRecipe(event);
    }

    async _onScrollsClick(event) {
        event.preventDefault();

        // Открываем диалог свитков
        const scrollsDialog = new ScrollsDialog(this.actor);
        scrollsDialog.render(true);
    }

    async _onKnowledgeToggle(event) {
        event.preventDefault();
        event.stopPropagation(); // Чтобы не срабатывал выбор рецепта при клике на глаз

        const recipeId = event.currentTarget.dataset.id;
        if (!recipeId) return;

        // Сохраняем позицию скролла перед изменениями
        this._captureRecipeListScroll();

        // Определяем для кого меняем видимость
        if (this.state.selectedPlayerId === "all") {
            // Получаем текущее состояние (вкл/выкл) на основе текущего актера ГМа
            const currentActorRecipes = new Set(this.actor.getFlag(RecipeManager.ID, "knownRecipes") || []);
            const isKnowing = !currentActorRecipes.has(recipeId); // Если не было - добавим, если было - удалим

            // 1. Обновляем текущего актера (чтобы интерфейс ГМа обновился корректно)
            if (isKnowing) currentActorRecipes.add(recipeId);
            else currentActorRecipes.delete(recipeId);
            await this.actor.setFlag(RecipeManager.ID, "knownRecipes", Array.from(currentActorRecipes));

            // 2. Находим всех игроков с назначенными персонажами и обновляем их
            const players = game.users.filter(u => !u.isGM && u.character);
            for (const player of players) {
                const playerActor = player.character;
                if (playerActor.id === this.actor.id) continue; // Пропускаем, так как уже обновили выше

                const playerRecipes = new Set(playerActor.getFlag(RecipeManager.ID, "knownRecipes") || []);
                if (isKnowing) playerRecipes.add(recipeId);
                else playerRecipes.delete(recipeId);
                
                await playerActor.setFlag(RecipeManager.ID, "knownRecipes", Array.from(playerRecipes));
            }

            // 3. Отправляем сигнал всем подключенным клиентам обновить интерфейс
            if (socket) {
                socket.executeForEveryone("updateCraftingUI", {
                    recipeId: recipeId,
                    isKnown: isKnowing
                });
            }
        } else {
            // Для конкретного игрока - работаем с его актером
            const selectedUser = game.users.get(this.state.selectedPlayerId);
            if (!selectedUser || !selectedUser.character) {
                ui.notifications.error("Не найден актер для выбранного игрока");
                return;
            }

            const playerActor = selectedUser.character;
            const knownRecipes = new Set(playerActor.getFlag(RecipeManager.ID, "knownRecipes") || []);

            if (knownRecipes.has(recipeId)) {
                knownRecipes.delete(recipeId);
            } else {
                knownRecipes.add(recipeId);
            }

            await playerActor.setFlag(RecipeManager.ID, "knownRecipes", Array.from(knownRecipes));

            // Отправляем обновление интерфейса игроку через socketlib
            if (socket) {
                socket.executeAsUser("updateCraftingUI", this.state.selectedPlayerId, {
                    recipeId: recipeId,
                    isKnown: knownRecipes.has(recipeId)
                });
            }
        }

        // Перерисовываем окно
        this._recipeStatusCache = null;
        this.render(true);
    }

    _onCraftClick(event) {
        event.preventDefault();
        if (this.state.canCraft) {
            this._onCraft(event);
        }
    }

    _getRecipeByIndex(index) {
        const db = RecipeManager.getData();
        return db.recipes?.[index];
    }

    async getData() {
        const db = RecipeManager.getData();
        const rawRecipes = db.recipes || [];
        const isGM = game.user.isGM;

        // ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ: исправляем название "Пыль для зачарования" -> "Чародейская пыль"
        if (db.categories?.jewelry?.subcategories?.['enchantment-dust']) {
            db.categories.jewelry.subcategories['enchantment-dust'].name = "Чародейская пыль";
        }

        // Получаем список изученных рецептов из флагов актера (массив ID)
        let knownRecipes;
        if (isGM && this.state.selectedPlayerId !== "all") {
            // ГМ смотрит рецепты конкретного игрока
            const selectedUser = game.users.get(this.state.selectedPlayerId);
            if (selectedUser?.character) {
                knownRecipes = selectedUser.character.getFlag(RecipeManager.ID, "knownRecipes") || [];
            } else {
                knownRecipes = []; // Если актер не найден, показываем все как неизученные
            }
        } else {
            // Обычная логика - для игрока или ГМа с "Все игроки"
            knownRecipes = this.actor.getFlag(RecipeManager.ID, "knownRecipes") || [];
        }



        const categories = db.categories || {};

        // Добавляем фоллбек категорию для неопределенных рецептов
        if (!categories.custom) {
            categories.custom = {
                name: "Пользовательские",
                global: true,
                subcategories: {
                    "uncategorized": {
                        name: "Без категории",
                        items: []
                    }
                }
            };
        }
        for (const [catId, cat] of Object.entries(categories)) {
            if (!cat?.global) continue;
            if (this.state.expandedGroups[catId] === undefined) this.state.expandedGroups[catId] = false;
            for (const subId of Object.keys(cat.subcategories || {})) {
                if (this.state.expandedSubcategories[subId] === undefined) this.state.expandedSubcategories[subId] = false;
            }
        }

        const globalCategories = Object.entries(categories)
            .filter(([, c]) => c?.global)
            .map(([id, c]) => ({ id, name: c.name, subcategories: Object.entries(c.subcategories || {}).map(([sid, sc]) => ({ id: sid, name: sc.name })) }));

        const subIndex = new Map();
        for (const g of globalCategories) {
            for (const s of g.subcategories) {
                subIndex.set(s.id, s);
            }
        }

        for (const g of globalCategories) {
            for (const s of g.subcategories) {
                s.recipes = s.recipes || []; // Инициализация массива рецептов
            }
        }

        // Распределяем отфильтрованные рецепты по категориям меню
        const fallbackSubId = "uncategorized";

        rawRecipes.forEach((recipe, index) => {
            const r = { ...recipe, originalIndex: index, id: `recipe_${index}`, isGM: isGM };

            const isIngredient = BG3CraftingApp.SUBCATEGORY_MAP[r.type] === "ingredients";
            const isKnown = knownRecipes.includes(r.id) || isIngredient;

            if (isGM || isKnown) {
                r.isKnown = isKnown;
                r.canToggle = isGM && !isIngredient; // Только ГМ может переключать не-ингредиенты

                // Берем статус из кэша (если он уже просчитан в фоне), иначе пусто
                r.craftStatus = (this._recipeStatusCache && this._recipeStatusCache[r.id]) ? this._recipeStatusCache[r.id] : "";

                // В приоритете берем subcategoryId (для кастомных), затем type (для базовых)
                const targetSubId = r.subcategoryId || r.type || fallbackSubId;
                const sub = subIndex.get(targetSubId);
                if (sub) sub.recipes.push(r);
                else {
                    const fallback = subIndex.get(fallbackSubId);
                    if (fallback) fallback.recipes.push(r);
                }
            }
        });

        // Временно отключаем фильтрацию для отладки
        // for (const g of globalCategories) {
        //     g.subcategories = g.subcategories.filter(s => (s.recipes || []).length > 0);
        // }
        // const filteredGlobals = globalCategories.filter(g => g.subcategories.length > 0);
        // const customGlobalCategories = filteredGlobals.filter(g => String(g.id).startsWith("custom."));

        const filteredGlobals = globalCategories;
        const customGlobalCategories = globalCategories.filter(g => String(g.id).startsWith("custom."));

        let hasKit = false;
        if (this.state.selectedRecipe) {
            const recipeCategory = this.state.selectedRecipe.categoryId || this.state.selectedRecipe.type;
            hasKit = this._hasKitForCategory(recipeCategory);
        }
        const craftingKits = this._getCraftingKits();

        // Получаем список игроков для ГМа
        const players = isGM ? game.users.filter(u => !u.isGM && u.character) : [];

        const result = {
            user: game.user,
            actor: this.actor,
            globalCategories: filteredGlobals,
            customGlobalCategories: customGlobalCategories,
            expandedGroups: this.state.expandedGroups,
            expandedSubcategories: this.state.expandedSubcategories,
            selectedRecipe: this.state.selectedRecipe,
            canCraft: this.state.canCraft && hasKit,
            resultItem: this.state.resultItem,
            hasKit: hasKit,
            craftingKits: craftingKits,
            isGM: isGM, // Передаем флаг ГМа в шаблон
            players: players, // Список игроков для выбора
            selectedPlayerId: this.state.selectedPlayerId, // Текущий выбор
            scrollPos: this._scrollPos,
            DEBUG: { filteredGlobals, customGlobalCategories }, // Отладка
            slots: {
                slot1: this.state.inputs[0],
                slot2: this.state.inputs[1],
                slot3: this.state.inputs[2]
            }
        };

        return result;
    }

    async _runCraftMinigame() {
        if (this._minigame.running) return false;
        this._minigame.running = true;

        const zoneWidth = 15 + Math.floor(Math.random() * 15); // 15-30%
        const zoneStart = 10 + Math.floor(Math.random() * (80 - zoneWidth)); // 10..(80-zoneWidth)
        const zoneEnd = zoneStart + zoneWidth;
        const speed = 120; // % per second

        return new Promise((resolve) => {
            const html = `
                <div class="bmc-minigame" data-zone-start="${zoneStart}" data-zone-end="${zoneEnd}">
                    <div class="bmc-minigame-bar">
                        <div class="bmc-minigame-zone" style="left:${zoneStart}%;width:${zoneWidth}%;"></div>
                        <div class="bmc-minigame-runner" style="left:0%"></div>
                    </div>
                    <div class="bmc-minigame-actions">
                        <button type="button" class="bmc-minigame-stop">СТОП</button>
                    </div>
                </div>
            `;

            let resolved = false;

            const dlg = new Dialog({
                title: "Мини-игра: тайминг",
                content: html,
                buttons: {},
                close: () => {
                    console.log('Диалог закрыт');
                    this._stopMinigameRaf();
                    this._minigame.running = false;
                    if (!resolved) {
                        resolved = true;
                        resolve(false);
                    }
                }
            }, {
                classes: ["bmc-minigame-dialog"],
                width: 420,
                zIndex: 99999 // Гарантирует, что окно будет поверх основного приложения
            });

            dlg.render(true);

            // Ждем рендеринга диалога перед запуском анимации
            setTimeout(() => {
                const start = performance.now();
                let dir = 1;
                let pos = 0;
                let stopped = false;

                const tick = (t) => {
                    if (stopped) return;

                    const dt = Math.max(0, (t - (this._minigame._lastT || t)) / 1000);
                    this._minigame._lastT = t;

                    pos += dir * speed * dt;
                    if (pos >= 100) {
                        pos = 100;
                        dir = -1;
                    } else if (pos <= 0) {
                        pos = 0;
                        dir = 1;
                    }

                    const runner = dlg.element?.find?.('.bmc-minigame-runner')?.[0];
                    if (runner) runner.style.left = `${pos}%`;

                    if ((t - start) > 7000) {
                        console.log('Время вышло, провал');
                        stopped = true;
                        this._stopMinigameRaf();
                        this._minigame.running = false;
                        if (!resolved) {
                            resolved = true;
                            resolve(false);
                        }
                        try { dlg.close(); } catch (e) {}
                        return;
                    }

                    this._minigame.rafId = requestAnimationFrame(tick);
                };

                this._minigame.rafId = requestAnimationFrame(tick);

                const stop = () => {
                    if (stopped || resolved) return;
                    stopped = true;
                    resolved = true;

                    const success = pos >= zoneStart && pos <= zoneEnd;
                    console.log(`Нажато СТОП! Позиция: ${pos}%, зона: ${zoneStart}-${zoneEnd}, успех: ${success}`);

                    this._stopMinigameRaf();
                    this._minigame.running = false;

                    try {
                        dlg.close();
                    } catch (e) {}

                    resolve(success);
                };

                const stopBtn = dlg.element?.find?.('.bmc-minigame-stop');
                if (stopBtn?.length) {
                    stopBtn.on('click', stop);
                    console.log('Обработчик кнопки СТОП установлен');
                } else {
                    console.error('Кнопка СТОП не найдена!');
                }
            }, 200);
        });
    }

    _stopMinigameRaf() {
        try {
            if (this._minigame.rafId) cancelAnimationFrame(this._minigame.rafId);
        } catch (e) {
            // ignore
        }
        this._minigame.rafId = null;
        this._minigame._lastT = null;
    }

    async _onSelectRecipe(event) {
        this._captureRecipeListScroll();
        const index = event.currentTarget.dataset.index;
        const allRecipes = RecipeManager.getData().recipes;
        const recipe = allRecipes[index];
        if (!recipe) return;
        this.state.selectedRecipe = recipe;
        await this._prepareRecipeView(recipe);
        this.render(true);
    }

    async _prepareRecipeView(recipe) {
        console.log('Подготовка вида рецепта:', recipe.name);
        this.state.inputs = [null, null, null];
        this.state.resultItem = null;
        this.state.canCraft = false;

        if (recipe.ingredients) {
            let allValid = true;
            const mapping = [0, 2, 1];

            console.log('Ингредиенты рецепта:', recipe.ingredients);

            for (let i = 0; i < recipe.ingredients.length; i++) {
                if (i >= 3) break;
                const req = recipe.ingredients[i];
                const slotIndex = mapping[i];
                const displayInfo = await RecipeManager.getItemDisplayInfo(req);
                const ownedQty = this._countOwnedItems(req, displayInfo.name);
                const reqQty = req.qty || 1;

                const isValid = ownedQty >= reqQty;
                if (!isValid) allValid = false;

                console.log(`Ингредиент ${i}:`, {
                    name: displayInfo.name,
                    required: reqQty,
                    owned: ownedQty,
                    isValid: isValid
                });

                this.state.inputs[slotIndex] = {
                    name: displayInfo.name,
                    img: displayInfo.img,
                    currentQty: ownedQty,
                    requiredQty: reqQty,
                    isValid: isValid,
                    originalReq: req,
                    targetName: displayInfo.name,
                    uuid: req.uuid || req.id,
                    categoryId: req.type === "category" ? req.categoryId : null
                };
            }
            this.state.canCraft = allValid;
            console.log('Можно ли крафтить:', this.state.canCraft);
        }

        if (recipe.result) {
            const resultReq = {
                id: recipe.resultId || recipe.result.uuid,
                uuid: recipe.result.uuid
            };
            const resultInfo = await RecipeManager.getItemDisplayInfo(resultReq);

            this.state.resultItem = {
                name: resultInfo.name,
                img: resultInfo.img,
                rarity: resultInfo.rarity || "common",
                qty: recipe.result.qty || 1,
                uuid: resultReq.uuid
            };
        }
    }

    _countOwnedItems(req, targetName = null) {
        let count = 0;

        for (const item of this.actor.items) {
            const itemData = { 
                uuid: item.uuid, 
                sourceId: item._stats?.compendiumSource || item.flags?.core?.sourceId, 
                name: item.name 
            };

            let matches = false;
            if (req.type === "category" || req.categoryId) {
                const categoryId = req.categoryId || req.type;
                matches = RecipeManager.isItemInCategory(itemData, categoryId);
            } else if (req.id || req.uuid) {
                matches = RecipeManager._compareUuids(req.id || req.uuid, itemData);
            }

            if (!matches && targetName) {
                const name = item.name.toLowerCase();
                const target = targetName.toLowerCase();
                if (name.includes(target) || target.includes(name)) {
                    matches = true;
                }
            }

            if (matches) {
                count += item.system.quantity || 1;
            }
        }
        return count;
    }

    // АСИНХРОННАЯ ФУНКЦИЯ: Точная проверка наличия ингредиентов для списка (как в правой панели)
    async _checkRecipeAvailability(recipe) {
        if (!recipe.ingredients || recipe.ingredients.length === 0) return "";

        let hasAny = false;
        let hasAll = true;

        for (const req of recipe.ingredients) {
            const reqQty = req.qty || 1;
            
            // Асинхронно получаем имя предмета для фоллбэк-проверки
            const displayInfo = await RecipeManager.getItemDisplayInfo(req);
            
            // Передаем имя, чтобы проверка на 100% совпадала с логикой окна крафта
            const owned = this._countOwnedItems(req, displayInfo.name);

            if (owned >= reqQty) {
                hasAny = true;
            } else if (owned > 0) {
                hasAny = true;
                hasAll = false; // Есть хоть сколько-то, но недостаточно
            } else {
                hasAll = false; // Нет вообще
            }
        }

        if (hasAll) return "status-ready";
        if (hasAny) return "status-partial";
        return "";
    }

    // ФОНОВАЯ ЗАГРУЗКА: Проверяет наличие предметов и подкрашивает DOM не подвешивая игру
    async _applyRecipeStatusesAsync(html) {
        if (!this._recipeStatusCache) this._recipeStatusCache = {};
        
        const rawRecipes = RecipeManager.getData().recipes || [];
        const domElement = html[0] || html;
        
        // Выполняем проверки последовательно в фоне, чтобы не спамить базу данных запросами
        for (let index = 0; index < rawRecipes.length; index++) {
            const recipe = rawRecipes[index];
            const rId = `recipe_${index}`;
            
            // Вычисляем только если еще нет в кэше
            if (this._recipeStatusCache[rId] === undefined) {
                this._recipeStatusCache[rId] = await this._checkRecipeAvailability(recipe);
            }
            
            // Как только узнали статус - красим плашку в интерфейсе
            const status = this._recipeStatusCache[rId];
            if (status) {
                const element = domElement.querySelector(`.recipe-item[data-index="${index}"]`);
                if (element) {
                    element.classList.remove('status-ready', 'status-partial'); // сброс старых
                    element.classList.add(status);
                }
            }
        }
    }

    /**
     * Переключает знание рецепта для актера
     * @param {Event} event
     */
    async _onToggleKnowledge(event) {
        event.preventDefault();
        event.stopPropagation(); // Чтобы не срабатывал выбор рецепта при клике на глаз

        const recipeId = event.currentTarget.dataset.id;
        if (!recipeId) return;

        const knownRecipes = new Set(this.actor.getFlag(RecipeManager.ID, "knownRecipes") || []);

        if (knownRecipes.has(recipeId)) {
            knownRecipes.delete(recipeId);
        } else {
            knownRecipes.add(recipeId);
        }

        await this.actor.setFlag(RecipeManager.ID, "knownRecipes", Array.from(knownRecipes));
        this._recipeStatusCache = null;
        this.render(true); // Перерисовываем окно
    }

    /**
     * Проверяет наличие наборов для ремесел у персонажа
     * @returns {Object} Объект с информацией о доступных наборах
     */
    _getCraftingKits() {
        // Определяем все типы наборов и их UUID
        const kitTypes = {
            alchemy: {
                name: "Инструменты алхимика",
                uuid: "Compendium.blue-man-crafting.kit.Item.GrwAotq3pF1ljof5",
                categoryId: "alchemy"
            },
            leatherworking: {
                name: "Инструменты кожевника",
                uuid: "Compendium.blue-man-crafting.kit.Item.MgSUJJl15aYF7cxh",
                categoryId: "leatherworking"
            },
            smithing: {
                name: "Инструменты кузнеца",
                uuid: "Compendium.blue-man-crafting.kit.Item.EMLfF1TSQwrwnwZ2",
                categoryId: "smithing"
            },
            cooking: {
                name: "Инструменты повара",
                uuid: "Compendium.blue-man-crafting.kit.Item.u8w67Me0N38QsB56",
                categoryId: "cooking"
            },
            tailoring: {
                name: "Инструменты ткача",
                uuid: "Compendium.blue-man-crafting.kit.Item.HQ5I0PuakA00M9uf",
                categoryId: "tailoring"
            },
            jewelry: {
                name: "Инструменты ювелира",
                uuid: "Compendium.blue-man-crafting.kit.Item.WRQjHph0kNHxWLa0",
                categoryId: "jewelry"
            },
            scribing: {
                name: "Инструменты каллиграфа",
                uuid: "Compendium.blue-man-crafting.kit.Item.zfIN2pIHxZ2aTTJd",
                categoryId: "scribing"
            }
        };

        const availableKits = {};
        let hasAnyKit = false;

        // Проверяем каждый тип набора
        for (const [kitId, kitInfo] of Object.entries(kitTypes)) {
            const kitUuid = kitInfo.uuid;
            const kitShortId = kitUuid.split('.').pop();

            const hasKit = this.actor.items.some(item => {
                // Проверка по _stats.compendiumSource (самый надежный способ)
                const compendiumSource = item._stats?.compendiumSource;
                if (compendiumSource && compendiumSource.includes(kitShortId)) return true;

                // Резервный способ через flags.core.sourceId (deprecated)
                const sourceId = item.flags?.core?.sourceId;
                if (sourceId && sourceId.includes(kitShortId)) return true;

                // Проверка по имени (резервный метод)
                const name = item.name.toLowerCase();
                const kitName = kitInfo.name.toLowerCase();

                if (name === kitName) return true;
                if (name.includes(kitName)) return true;

                return false;
            });

            availableKits[kitId] = {
                ...kitInfo,
                hasKit: hasKit
            };

            if (hasKit) hasAnyKit = true;
        }

        return {
            hasAnyKit: hasAnyKit,
            kits: availableKits
        };
    }

    /**
     * Получает информацию об инструменте для категории
     * @param {string} categoryId - ID категории
     * @returns {Object|null} Информация об инструменте или null
     */
    _getKitForCategory(categoryId) {
        // У кастомных категорий нет инструментов для износа
        if (categoryId && String(categoryId).startsWith("custom.")) return null;
        
        const kits = this._getCraftingKits();

        // Находим основную категорию
        let mainCategory = categoryId;
        mainCategory = BG3CraftingApp.SUBCATEGORY_MAP[categoryId] || categoryId;

        // Получаем информацию о наборе
        const kitInfo = kits.kits[mainCategory];
        if (!kitInfo || !kitInfo.hasKit) return null;

        // Находим сам предмет в инвентаре
        const kitItem = this.actor.items.find(item => {
            // Проверка по _stats.compendiumSource (самый надежный способ)
            const compendiumSource = item._stats?.compendiumSource;
            const kitShortId = kitInfo.uuid.split('.').pop();

            if (compendiumSource && compendiumSource.includes(kitShortId)) return true;

            // Резервный способ через flags.core.sourceId (deprecated)
            const sourceId = item.flags?.core?.sourceId;
            if (sourceId && sourceId.includes(kitShortId)) return true;

            // Проверка по имени (резервный метод)
            const name = item.name.toLowerCase();
            const kitName = kitInfo.name.toLowerCase();

            if (name === kitName) return true;
            if (name.includes(kitName)) return true;

            return false;
        });

        return {
            ...kitInfo,
            item: kitItem
        };
    }

    /**
     * Получает название категории по ID
     * @param {string} categoryId - ID категории
     * @returns {string} Название категории
     */
    _getCategoryName(categoryId) {
        const categoryNames = {
            "alchemy": "Алхимия",
            "ingredients": "Ингредиенты",
            "smithing": "Кузнечное дело",
            "jewelry": "Ювелирное дело",
            "leatherworking": "Кожевничество",
            "cooking": "Кулинария",
            "tailoring": "Ткачество",
            "potions": "Зелья",
            "elixirs": "Эликсиры",
            "grenades": "Гранаты",
            "coatings": "Масла и яды",
            "suspension": "Суспензии",
            "essence": "Эссенции",
            "salt": "Соли",
            "ash": "Золы",
            "vitriol": "Купоросы",
            "sublimate": "Сублиматы",
            "weapons": "Оружие",
            "armor": "Доспехи",
            "tools": "Инструменты",
            // Новые подкатегории
            "gem-cutting": "Огранка камня",
            "enchantment-dust": "Чародейская пыль",
            "leather-armor": "Доспехи из кожи",
            "tanning": "Дубление",
            "rations": "Рационы",
            "feasts": "Пиры",
            "cloth-armor": "Доспехи из ткани",
            "embroidery": "Вышивка"
        };

        return categoryNames[categoryId] || categoryId;
    }

    /**
     * Проверяет наличие набора для категории ремесел
     * @param {string} categoryId - ID категории ремесел
     * @returns {boolean} true, если набор для категории доступен
     */
    _hasKitForCategory(categoryId) {
        // Кастомные категории не требуют инструментов
        if (categoryId && String(categoryId).startsWith("custom.")) return true;
        
        const kits = this._getCraftingKits();

        // Прямое соответствие категории и набора
        if (kits.kits[categoryId]) {
            return kits.kits[categoryId].hasKit;
        }

        const mainCategory = BG3CraftingApp.SUBCATEGORY_MAP[categoryId];
        if (mainCategory) {
            return kits.kits[mainCategory]?.hasKit || false;
        }

        return false;
    }


    async _onDrop(event) {
        event.preventDefault();

        // Проверяем, был ли drop в discovery-slot
        const discoverySlot = event.target.closest('.discovery-slot');
        if (discoverySlot) {
            await this._onRecipeDiscovery(event);
            return;
        }

        // Стандартная обработка для craft-workspace
        if (!this.state.selectedRecipe) return;
        let data;
        try { data = JSON.parse(event.dataTransfer.getData('text/plain')); } catch (e) { return; }
        if (data.type !== "Item") return;
        ui.notifications.info("Проверка...");
        await this._prepareRecipeView(this.state.selectedRecipe);
        this.render(true);
    }

    async _onRecipeDiscovery(event) {
        event.preventDefault();
        let data;
        try { data = JSON.parse(event.dataTransfer.getData('text/plain')); } catch (e) {
            ui.notifications.error("Неверный формат данных");
            return;
        }

        // Поддержка 2 вариантов:
        // 1) В drop payload уже лежит объект рецепта (name/ingredients/result)
        // 2) В drop payload лежит обычный Item (uuid/id), а рецепт хранится в flags предмета
        let recipeData = null;
        if (data?.name && data?.ingredients && data?.result) {
            recipeData = data;
        } else if (data?.type === "Item" && data?.uuid) {
            try {
                const item = await fromUuid(data.uuid);
                const flaggedRecipe = item?.getFlag(RecipeManager.ID, "recipe");
                if (flaggedRecipe?.name && flaggedRecipe?.ingredients && flaggedRecipe?.result) {
                    recipeData = flaggedRecipe;
                }
            } catch (e) {
                // ignore, handled below
            }
        }

        if (!recipeData) {
            ui.notifications.error("Это не рецепт! Нужен предмет с рецептом.");
            return;
        }

        // Если игрок - отправляем запрос ГМу
        if (!game.user.isGM) {
            try {
                // Регистрируем socketlib если еще не зарегистрирован
                const socket = socketlib.registerModule("blue-man-crafting");

                await socket.executeAsGM("learnRecipeFromScroll", {
                    actorId: this.actor.id,
                    recipeData: recipeData,
                    scrollData: data
                });

                ui.notifications.info("Запрос на изучение рецепта отправлен ГМу");

            } catch (error) {
                console.error("Ошибка при изучении рецепта:", error);
                ui.notifications.error("Не удалось изучить рецепт: " + error.message);
            }
            return;
        }

        // Если ГМ - обрабатываем локально
        await this._processRecipeDiscovery(recipeData, data);
    }

    // Обработка изучения рецепта (выполняется на стороне ГМа)
    async _processRecipeDiscovery(recipeData, scrollData = null) {
        try {
            // Создаем динамические категории для ингредиентов
            const customData = game.settings.get(RecipeManager.ID, "customRecipes");
            const newCategories = { ...customData.categories };

            for (const ingredient of recipeData.ingredients) {
                if (ingredient.type === "category" && ingredient.categoryId) {
                    // Если категории нет, создаем ее
                    if (!newCategories[ingredient.categoryId]) {
                        newCategories[ingredient.categoryId] = {
                            name: this._generateCategoryName(ingredient.categoryId),
                            global: true,
                            subcategories: {
                                "uncategorized": {
                                    name: "Без категории",
                                    items: []
                                }
                            }
                        };
                        ui.notifications.info(`Создана категория: ${newCategories[ingredient.categoryId].name}`);
                    }
                }
            }

            // Сохраняем обновленные категории
            await RecipeManager.saveData({
                categories: newCategories,
                recipes: customData.recipes || []
            });

            // Добавляем рецепт, сохраняя ВСЕ поля из макроса
            const newRecipe = {
                name: recipeData.name,
                type: recipeData.type || "misc",
                categoryId: recipeData.categoryId || null,
                subcategoryId: recipeData.subcategoryId || null,
                ingredients: recipeData.ingredients,
                result: recipeData.result,
                isCustom: true
            };

            // Если макрос передал кастомную категорию, которой еще нет в настройках мира, создаем её
            if (newRecipe.categoryId && newRecipe.categoryId.startsWith('custom.')) {
                if (!newCategories[newRecipe.categoryId]) {
                    // Генерируем красивое имя из ID (custom.nekromantiya -> Nekromantiya)
                    const rawName = newRecipe.categoryId.split('.')[1] || "Custom";
                    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/_/g, ' ');
                    
                    newCategories[newRecipe.categoryId] = {
                        name: formattedName,
                        global: true,
                        subcategories: {}
                    };
                }
                if (newRecipe.subcategoryId && !newCategories[newRecipe.categoryId].subcategories[newRecipe.subcategoryId]) {
                    newCategories[newRecipe.categoryId].subcategories[newRecipe.subcategoryId] = {
                        name: "Основные",
                        items: []
                    };
                }
            }

            // Если type не указан и нет кастомной категории, пытаемся определить цель по папке World Item результата
            if (newRecipe.type === "misc" && !newRecipe.categoryId && newRecipe.result?.uuid) {
                const inferred = await this._inferRecipeTargetFromResultUuid(newRecipe.result.uuid);
                if (inferred?.subcategoryId) {
                    newRecipe.subcategoryId = inferred.subcategoryId;
                    newRecipe.categoryId = inferred.categoryId;
                    // Для старых фиксированных подкатегорий оставляем совместимость через type
                    if (newRecipe.subcategoryId && !newRecipe.subcategoryId.startsWith("custom.")) newRecipe.type = newRecipe.subcategoryId;

                    // Если это кастомная категория - создаем ее в custom categories
                    if (newRecipe.subcategoryId.startsWith("custom.") && inferred.categoryName && inferred.subcategoryName) {
                        const catId = inferred.categoryId;
                        const subId = inferred.subcategoryId;
                        if (!newCategories[catId]) {
                            newCategories[catId] = {
                                name: inferred.categoryName,
                                global: true,
                                subcategories: {}
                            };
                        }
                        if (!newCategories[catId].subcategories) newCategories[catId].subcategories = {};
                        if (!newCategories[catId].subcategories[subId]) {
                            newCategories[catId].subcategories[subId] = {
                                name: inferred.subcategoryName,
                                items: []
                            };
                        }
                    }
                }
            }

            const updatedRecipes = [...(customData.recipes || []), newRecipe];
            await RecipeManager.saveData({
                categories: newCategories,
                recipes: updatedRecipes
            });

            ui.notifications.info(`Изучен рецепт: ${recipeData.name}`);

            // Одноразовый предмет-рецепт: если рецепт был дропнут из инвентаря текущего актера,
            // тратим 1 штуку (или удаляем, если это последняя).
            if (scrollData?.type === "Item" && scrollData?.uuid) {
                try {
                    const droppedItem = await fromUuid(scrollData.uuid);
                    if (droppedItem?.parent?.uuid === this.actor?.uuid) {
                        const currentQty = Number(droppedItem.system?.quantity ?? 1);
                        if (currentQty <= 1) {
                            await this.actor.deleteEmbeddedDocuments("Item", [droppedItem.id]);
                        } else {
                            await this.actor.updateEmbeddedDocuments("Item", [{
                                _id: droppedItem.id,
                                "system.quantity": currentQty - 1
                            }]);
                        }
                    }
                } catch (e) {
                    // ignore item consumption errors
                }
            }

            // Обновляем интерфейс
            this._recipeStatusCache = null;
            this.render(true);

        } catch (err) {
            ui.notifications.error("Ошибка изучения рецепта: " + err.message);
        }
    }

    _generateCategoryName(categoryId) {
        // Генерируем человекочитаемое название из ID
        const names = {
            "smithing": "Кузнечное дело",
            "metal": "Металлы",
            "coal": "Уголь",
            "wood": "Древесина",
            "herb": "Травы",
            "crystal": "Кристаллы",
            "leather": "Кожа",
            "cloth": "Ткани",
            "stone": "Камень",
            "bone": "Кости",
            "oil": "Масла",
            "poison": "Яды",
            "alchemy": "Алхимия",
            "enchanting": "Зачарование",
            "cooking": "Кулинария"
        };

        return names[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    }

    async _onCraft(event) {
        event.preventDefault();
        if (!this.state.canCraft || !this.state.selectedRecipe) return;

        // ПРОВЕРКА НАЛИЧИЯ НАБОРА РЕМЕСЛА ДЛЯ КАТЕГОРИИ РЕЦЕПТА
        const recipe = this.state.selectedRecipe;
        const categoryId = recipe.categoryId || recipe.type;

        if (categoryId && !this._hasKitForCategory(categoryId)) {
            ui.notifications.error(`Для создания "${recipe.name}" необходим набор для категории "${this._getCategoryName(categoryId)}"!`);
            return;
        }

        if (game.settings.get(RecipeManager.ID, "craftingMinigame")) {
            const ok = await this._runCraftMinigame();
            return this._executeCraft(ok);
        }

        return this._executeCraft(true);
    }

    async _executeCraft(minigameSuccess = true) {
        const recipe = this.state.selectedRecipe;

        // ВЫЧИТАНИЕ ЗАРЯДА ИНСТРУМЕНТА ПРИ ПОПЫТКЕ КРАФТА (ДАЖЕ ПРИ ПРОВАЛЕ)
        const categoryId = recipe.categoryId || recipe.type;
        const kitInfo = this._getKitForCategory(categoryId);

        if (kitInfo && kitInfo.item) {
            const currentCharges = kitInfo.item.system.uses.value;
            if (currentCharges > 0) {
                const newCharges = currentCharges - 1;

                await kitInfo.item.update({
                    "system.uses": {
                        value: newCharges,
                        max: kitInfo.item.system.uses.max,
                        spent: kitInfo.item.system.uses.max - newCharges
                    }
                });

                if (newCharges <= 0) {
                    ui.notifications.warn(`Инструменты "${kitInfo.item.name}" полностью изношены и удалены!`);
                    await this.actor.deleteEmbeddedDocuments("Item", [kitInfo.item.id]);
                } else {
                    ui.notifications.info(`Инструменты "${kitInfo.item.name}": ${newCharges}/10 зарядов осталось.`);
                }

                setTimeout(() => {
                    if (this.actor.sheet) this.actor.sheet.render();
                }, 100);
            }
        }

        for (const input of this.state.inputs) {
            if (!input) continue;
            let qtyToConsume = input.requiredQty;
            const itemsToDelete = [];
            const itemsToUpdate = [];

            const candidates = this.actor.items.filter(item => {
                const itemData = { 
                    uuid: item.uuid, 
                    sourceId: item.flags?.core?.sourceId || item._stats?.compendiumSource, 
                    name: item.name 
                };
                let matches = false;
                
                // Проверяем категорию (исправлено на проверку categoryId)
                if (input.originalReq.type === "category" || input.originalReq.categoryId) {
                    const categoryId = input.originalReq.categoryId || input.originalReq.type;
                    matches = RecipeManager.isItemInCategory(itemData, categoryId);
                } 
                // Проверяем точный предмет (исправлено на поддержку uuid)
                else if (input.originalReq.id || input.originalReq.uuid) {
                    matches = RecipeManager._compareUuids(input.originalReq.id || input.originalReq.uuid, itemData);
                }

                // Фолбэк по имени
                if (!matches && input.targetName) {
                     const name = item.name.toLowerCase();
                     const target = input.targetName.toLowerCase();
                     if (name.includes(target) || target.includes(name)) matches = true;
                }
                return matches;
            });

            for (const item of candidates) {
                if (qtyToConsume <= 0) break;
                const itemQty = item.system.quantity;
                if (itemQty <= qtyToConsume) {
                    itemsToDelete.push(item.id);
                    qtyToConsume -= itemQty;
                } else {
                    itemsToUpdate.push({_id: item.id, "system.quantity": itemQty - qtyToConsume});
                    qtyToConsume = 0;
                }
            }
            if (itemsToDelete.length > 0) await this.actor.deleteEmbeddedDocuments("Item", itemsToDelete);
            if (itemsToUpdate.length > 0) await this.actor.updateEmbeddedDocuments("Item", itemsToUpdate);
        }

        try {
            if (!minigameSuccess) {
                ui.notifications.warn("Крафт не удался (мини-игра провалена), ингредиенты и заряд инструмента потрачены");
                // Обязательно обновляем UI, чтобы игрок увидел новые цифры
                this._recipeStatusCache = null;
                await this._prepareRecipeView(this.state.selectedRecipe);
                this.render(true);
                return;
            }

            let resultId = recipe.resultId || (recipe.result ? recipe.result.uuid : null);
            let itemData = await RecipeManager.findItemDataInCompendiums(resultId);
            if (!itemData) {
                itemData = { name: recipe.name, type: "consumable", img: this.state.resultItem?.img };
            }
            itemData = foundry.utils.deepClone(itemData);
            const qtyToAdd = recipe.result?.qty || 1; // Берем количество из рецепта

            // 1. Пытаемся найти существующий предмет в инвентаре
            // Ищем по имени ИЛИ по исходному ID (sourceId), если он есть
            const existingItem = this.actor.items.find(i =>
                i.name === itemData.name &&
                i.type === itemData.type
            );

            if (existingItem) {
                // 2. Если предмет найден, увеличиваем его количество
                const newQty = (existingItem.system.quantity || 1) + qtyToAdd;
                await existingItem.update({"system.quantity": newQty});
                ui.notifications.info(`Обновлено количество: ${existingItem.name} (+${qtyToAdd})`);
            } else {
                // 3. Если предмета нет, создаем новый с правильным количеством
                itemData.system = itemData.system || {};
                itemData.system.quantity = qtyToAdd;
                await this.actor.createEmbeddedDocuments("Item", [itemData]);
                ui.notifications.info(`Создано: ${recipe.name}`);
            }

            await this._prepareRecipeView(this.state.selectedRecipe);
            this.render(true);
        } catch (err) { ui.notifications.error(err.message); }
    }
}
