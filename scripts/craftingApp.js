import { RecipeManager } from "./recipeManager.js";

export class BG3CraftingApp extends Application {
    constructor(actor) {
        super({
            id: "bg3-crafting-app",
            title: "Алхимия и Крафт",
            template: "modules/blue-man-crafting/templates/crafting-window.hbs",
            width: 950,
            height: 700,
            resizable: true,
            classes: ["bg3-crafting-app"],
            icon: "fas fa-flask",
            dragDrop: [{ dragSelector: null, dropSelector: ".craft-workspace" }, { dragSelector: null, dropSelector: ".discovery-slot" }]
        });
        this.actor = actor; 
        this.state = {
            selectedRecipe: null,
            inputs: [null, null, null],
            resultItem: null,
            canCraft: false,
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
            }
        };
        this._scrollPos = 0;
        this._minigame = {
            running: false,
            rafId: null,
            resolve: null
        };
    }

    _captureRecipeListScroll() {
        try {
            const el = this.element?.find?.('.recipe-list')?.[0];
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

        // Кузнечное дело
        if (path.includes("кузнеч")) {
            if (path.includes("доспех")) return "armor";
            if (path.includes("оруж")) return "weapons";
            if (path.includes("инструмент")) return "tools";
            return null;
        }

        // Алхимия
        if (path.includes("алхим")) {
            if (path.includes("зель")) return "potions";
            if (path.includes("эликс")) return "elixirs";
            if (path.includes("гранат")) return "grenades";
            if (path.includes("масл") || path.includes("яд")) return "coatings";
            return null;
        }

        // Ингредиенты
        if (path.includes("ингредиент")) {
            if (path.includes("суспенз")) return "suspension";
            if (path.includes("эссенц")) return "essence";
            if (path.includes("соль")) return "salt";
            if (path.includes("зол")) return "ash";
            if (path.includes("купорос") || path.includes("витриол")) return "vitriol";
            if (path.includes("сублимат")) return "sublimate";
            return null;
        }

        return null;
    }

    _inferCategoryFromFolderPath(folderPathNames) {
        const parts = (folderPathNames || []).map(p => String(p || "").trim()).filter(Boolean);
        if (parts.length < 1) return null;

        // 1) Стандартные папки (существующие категории модуля)
        const knownType = this._inferTypeFromFolderPath(parts);
        if (knownType) {
            if (["potions", "elixirs", "grenades", "coatings"].includes(knownType)) {
                return { categoryId: "alchemy", subcategoryId: knownType };
            }
            if (["suspension", "essence", "salt", "ash", "vitriol", "sublimate"].includes(knownType)) {
                return { categoryId: "ingredients", subcategoryId: knownType };
            }
            if (["weapons", "armor", "tools"].includes(knownType)) {
                return { categoryId: "smithing", subcategoryId: knownType };
            }
        }

        // 2) Кастомные категории по правилу: Крафт/<Категория>/<Подкатегория>
        // Пример: "Крафт/Волшебные палочки/Боевые"
        const idx = parts.findIndex(p => p.toLowerCase() === "крафт");
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
        
        // Используем более надежный метод для предотвращения дублирования обработчиков
        this._boundHandlers = this._boundHandlers || {};
        
        // Удаляем старые обработчики если они существуют
        if (this._boundHandlers.globalClick) {
            html.find('.global-header').off('click', this._boundHandlers.globalClick);
        }
        if (this._boundHandlers.subcategoryClick) {
            html.find('.subcategory-header').off('click', this._boundHandlers.subcategoryClick);
        }
        if (this._boundHandlers.recipeClick) {
            html.find('.recipe-item').off('click', this._boundHandlers.recipeClick);
        }
        if (this._boundHandlers.mainActionClick) {
            html.find('.main-action').off('click', this._boundHandlers.mainActionClick);
        }
        if (this._boundHandlers.gmResetClick) {
            html.find('.gm-reset-btn').off('click', this._boundHandlers.gmResetClick);
        }
        
        // Создаем новые обработчики и сохраняем ссылки на них
        this._boundHandlers.globalClick = (ev) => {
            const groupId = ev.currentTarget.dataset.group;
            this.state.expandedGroups[groupId] = !this.state.expandedGroups[groupId];
            this._captureRecipeListScroll();
            this.render();
        };
        
        this._boundHandlers.subcategoryClick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const subcategoryId = ev.currentTarget.parentElement?.dataset?.subcategory;
            if (!subcategoryId) return;
            const current = this.state.expandedSubcategories[subcategoryId];
            this.state.expandedSubcategories[subcategoryId] = current === undefined ? false : !current;
            this._captureRecipeListScroll();
            this.render();
        };
        
        this._boundHandlers.recipeClick = this._onSelectRecipe.bind(this);
        this._boundHandlers.mainActionClick = (event) => {
            console.log('Кнопка СОЗДАТЬ нажата!', {
                canCraft: this.state.canCraft,
                selectedRecipe: !!this.state.selectedRecipe
            });
            this._onCraft(event);
        };
        this._boundHandlers.gmResetClick = this._onGMReset.bind(this);
        
        // Назначаем новые обработчики
        html.find('.recipe-item').click(this._boundHandlers.recipeClick);
        html.find('.main-action').click(this._boundHandlers.mainActionClick);
        html.find('.gm-reset-btn').click(this._boundHandlers.gmResetClick);
        html.find('.global-header').click(this._boundHandlers.globalClick);
        html.find('.subcategory-header').click(this._boundHandlers.subcategoryClick);
        
        // Обработка drag-over для discovery-slot
        html.find('.discovery-slot').on('dragover', (ev) => {
            ev.preventDefault();
            $(ev.currentTarget).addClass('drag-over');
        });
        
        html.find('.discovery-slot').on('dragleave', (ev) => {
            $(ev.currentTarget).removeClass('drag-over');
        });
        
        if (this._scrollPos > 0) {
            html.find('.recipe-list').scrollTop(this._scrollPos);
        }
        html.find('.recipe-list').scroll((ev) => {
            this._scrollPos = ev.currentTarget.scrollTop;
        });
        
        // Добавляем обработчик для глаза знаний
        html.find('.knowledge-toggle').click(this._onToggleKnowledge.bind(this));
    }

    async getData() {
        const db = RecipeManager.getData();
        const rawRecipes = db.recipes || [];
        const isGM = game.user.isGM;
        
        // Получаем список изученных рецептов из флагов актера (массив ID)
        const knownRecipes = this.actor.getFlag(RecipeManager.ID, "knownRecipes") || [];

        // Группы для сортировки
        const groups = {
            "potions": { id: "potions", label: "Зелья", recipes: [] },
            "elixirs": { id: "elixirs", label: "Эликсиры", recipes: [] },
            "grenades": { id: "grenades", label: "Гранаты", recipes: [] },
            "coatings": { id: "coatings", label: "Масла и яды", recipes: [] },
            "suspension": { id: "suspension", label: "Суспензии", recipes: [] },
            "essence": { id: "essence", label: "Эссенции", recipes: [] },
            "salt": { id: "salt", label: "Соли", recipes: [] },
            "ash": { id: "ash", label: "Золы", recipes: [] },
            "vitriol": { id: "vitriol", label: "Купоросы", recipes: [] },
            "sublimate": { id: "sublimate", label: "Сублиматы", recipes: [] },
            "weapons": { id: "weapons", label: "Оружие", recipes: [] },
            "armor": { id: "armor", label: "Доспехи", recipes: [] },
            "tools": { id: "tools", label: "Инструменты", recipes: [] }
        };

        // Фильтрация и распределение
        rawRecipes.forEach((recipe, index) => {
            const r = { ...recipe, originalIndex: index, id: `recipe_${index}`, isGM: isGM }; // Добавляем уникальный ID и isGM
            
            // Определяем категорию (Ингредиенты или нет)
            // Ингредиенты (suspension, salt, etc) всегда известны
            const isIngredient = ["suspension", "essence", "salt", "ash", "vitriol", "sublimate"].includes(r.type);
            
            // Проверка знаний
            const isKnown = knownRecipes.includes(r.id) || isIngredient;
            
            // Логика отображения:
            // 1. Если ГМ - видим всё, добавляем флаг isKnown для иконки
            // 2. Если Игрок - видим только isKnown
            if (isGM || isKnown) {
                r.isKnown = isKnown;         // Знает ли актер рецепт
                r.canToggle = !isIngredient; // Ингредиенты нельзя "забыть", они базовые
                
                const type = r.type || "misc";
                if (groups[type]) groups[type].recipes.push(r);
                else groups.potions.recipes.push(r); // Фоллбек
            }
        });

        const recipeGroups = Object.values(groups).filter(g => g.recipes.length > 0);

        const categories = db.categories || {};
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
                s.recipes = [];
            }
        }

        // Распределяем отфильтрованные рецепты по категориям меню
        const fallbackSubId = "potions";
        
        rawRecipes.forEach((recipe, index) => {
            const r = { ...recipe, originalIndex: index, id: `recipe_${index}`, isGM: isGM };
            const isIngredient = ["suspension", "essence", "salt", "ash", "vitriol", "sublimate"].includes(r.type);
            const isKnown = knownRecipes.includes(r.id) || isIngredient;

            if (isGM || isKnown) {
                r.isKnown = isKnown;
                r.canToggle = !isIngredient;

                const targetSubId = r.subcategoryId || r.type || fallbackSubId;
                const sub = subIndex.get(targetSubId);
                if (sub) sub.recipes.push(r);
                else {
                    const fallback = subIndex.get(fallbackSubId);
                    if (fallback) fallback.recipes.push(r);
                }
            }
        });

        for (const g of globalCategories) {
            g.subcategories = g.subcategories.filter(s => (s.recipes || []).length > 0);
        }
        const filteredGlobals = globalCategories.filter(g => g.subcategories.length > 0);
        const customGlobalCategories = filteredGlobals.filter(g => String(g.id).startsWith("custom."));

        const hasKit = this._hasAlchemicalKit();
        const craftingKits = this._getCraftingKits();

        return {
            user: game.user,
            actor: this.actor,
            recipeGroups: recipeGroups,
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
            slots: {
                slot1: this.state.inputs[0],
                slot2: this.state.inputs[1],
                slot3: this.state.inputs[2]
            }
        };
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
                width: 420
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
                    targetName: displayInfo.name
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
                qty: recipe.result.qty || 1
            };
        }
    }

    _countOwnedItems(req, targetName = null) {
        let count = 0;
        
        for (const item of this.actor.items) {
            const itemData = { uuid: item.uuid, sourceId: item.flags?.core?.sourceId, name: item.name };
            
            let matches = false;
            if (req.type === "category" || req.categoryId) {
                const categoryId = req.categoryId || req.type;
                matches = RecipeManager.isItemInCategory(itemData, categoryId);
            } else if (req.id) {
                matches = RecipeManager._compareUuids(req.id, itemData);
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

    /**
     * Переключает знание рецепта для актера
     * @param {Event} event 
     */
    async _onToggleKnowledge(event) {
        event.preventDefault();
        event.stopPropagation(); // Чтобы не срабатывал выбор рецепта при клике на глаз

        const recipeId = event.currentTarget.dataset.id;
        const knownRecipes = new Set(this.actor.getFlag(RecipeManager.ID, "knownRecipes") || []);

        if (knownRecipes.has(recipeId)) {
            knownRecipes.delete(recipeId);
        } else {
            knownRecipes.add(recipeId);
        }

        await this.actor.setFlag(RecipeManager.ID, "knownRecipes", Array.from(knownRecipes));
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
        const kits = this._getCraftingKits();
        
        // Находим основную категорию
        let mainCategory = categoryId;
        const categoryMapping = {
            "potions": "alchemy", "elixirs": "alchemy", "grenades": "alchemy", "coatings": "alchemy",
            "suspension": "alchemy", "essence": "alchemy", "salt": "alchemy", "ash": "alchemy",
            "vitriol": "alchemy", "sublimate": "alchemy",
            "weapons": "smithing", "armor": "smithing", "tools": "smithing",
            "gem-cutting": "jewelry", "enchantment-dust": "jewelry",
            "leather-armor": "leatherworking", "tanning": "leatherworking",
            "rations": "cooking", "feasts": "cooking",
            "cloth-armor": "tailoring", "embroidery": "tailoring"
        };
        
        mainCategory = categoryMapping[categoryId] || categoryId;
        
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
            "enchantment-dust": "Пыль для зачарования",
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
        const kits = this._getCraftingKits();
        
        // Прямое соответствие категории и набора
        if (kits.kits[categoryId]) {
            return kits.kits[categoryId].hasKit;
        }
        
        // Соответствие подкатегорий и основных категорий
        const categoryMapping = {
            // Алхимия и все её подкатегории
            "potions": "alchemy",
            "elixirs": "alchemy", 
            "grenades": "alchemy",
            "coatings": "alchemy",
            "suspension": "alchemy",
            "essence": "alchemy",
            "salt": "alchemy",
            "ash": "alchemy",
            "vitriol": "alchemy",
            "sublimate": "alchemy",
            
            // Кузнечное дело и подкатегории
            "weapons": "smithing",
            "armor": "smithing",
            "tools": "smithing",
            
            // Ювелирное дело и подкатегории
            "gem-cutting": "jewelry",
            "enchantment-dust": "jewelry",
            
            // Кожевничество и подкатегории
            "leather-armor": "leatherworking",
            "tanning": "leatherworking",
            
            // Кулинария и подкатегории
            "rations": "cooking",
            "feasts": "cooking",
            
            // Ткачество и подкатегории
            "cloth-armor": "tailoring",
            "embroidery": "tailoring"
        };
        
        const mainCategory = categoryMapping[categoryId];
        if (mainCategory) {
            return kits.kits[mainCategory]?.hasKit || false;
        }
        
        return false;
    }

    /**
     * Проверяет наличие Алхимического набора у персонажа (для обратной совместимости)
     * @returns {boolean} true, если набор найден
     */
    _hasAlchemicalKit() {
        const kits = this._getCraftingKits();
        return kits.kits.alchemy?.hasKit || false;
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
                            items: [] // Пустой список - будет заполняться через name matching
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

            // Добавляем рецепт
            const newRecipe = {
                name: recipeData.name,
                type: recipeData.type || "misc",
                ingredients: recipeData.ingredients,
                result: recipeData.result,
                isCustom: true
            };

            // Если type не указан, пытаемся определить цель по папке World Item результата
            if (newRecipe.type === "misc" && newRecipe.result?.uuid) {
                const inferred = await this._inferRecipeTargetFromResultUuid(newRecipe.result.uuid);
                if (inferred?.subcategoryId) {
                    newRecipe.subcategoryId = inferred.subcategoryId;
                    newRecipe.categoryId = inferred.categoryId;
                    // Для старых фиксированных подкатегорий оставляем совместимость через type
                    if (!newRecipe.subcategoryId.startsWith("custom.")) newRecipe.type = newRecipe.subcategoryId;

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
            if (data?.type === "Item" && data?.uuid) {
                try {
                    const droppedItem = await fromUuid(data.uuid);
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

    async _onGMReset() {
        if (!game.user.isGM) {
            ui.notifications.error("Только для ГМ!");
            return;
        }
        
        const success = await RecipeManager.resetCustomData();
        if (success) {
            this.render(true);
        }
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

        // ПРОВЕРКА ЗАРЯДОВ ИНСТРУМЕНТОВ
        const kitInfo = this._getKitForCategory(categoryId);
        if (kitInfo && kitInfo.hasKit) {
            const charges = kitInfo.item.system.uses.value;
            if (charges <= 0) {
                ui.notifications.error(`Инструменты "${kitInfo.item.name}" изношены! Нужно новые инструменты для крафта.`);
                return;
            }
            
            // Показываем количество оставшихся зарядов
            const remainingCharges = charges - 1;
            ui.notifications.info(`Инструменты "${kitInfo.item.name}": ${remainingCharges}/10 зарядов останется после крафта.`);
        }

        if (game.settings.get(RecipeManager.ID, "enableMinigame")) {
            const ok = await this._runCraftMinigame();
            return this._executeCraft(ok);
        }

        return this._executeCraft(true);
    }

    async _executeCraft(minigameSuccess = true) {
        const recipe = this.state.selectedRecipe;
        
        // ВЫЧИТАНИЕ ЗАРЯДА ИНСТРУМЕНТА ПРИ УСПЕШНОМ КРАФТЕ
        if (minigameSuccess) {
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
                        // Автоматически удаляем инструмент при 0 зарядов
                        await this.actor.deleteEmbeddedDocuments("Item", [kitInfo.item.id]);
                    } else {
                        ui.notifications.info(`Инструменты "${kitInfo.item.name}": ${newCharges}/10 зарядов осталось.`);
                    }
                    
                    // Принудительно обновляем UI через небольшую задержку
                    setTimeout(() => {
                        if (this.actor.sheet) this.actor.sheet.render();
                        this.render();
                    }, 100);
                }
            }
        }
        
        for (const input of this.state.inputs) {
            if (!input) continue;
            let qtyToConsume = input.requiredQty;
            const itemsToDelete = [];
            const itemsToUpdate = [];

            const candidates = this.actor.items.filter(item => {
                const itemData = { uuid: item.uuid, sourceId: item.flags?.core?.sourceId, name: item.name };
                let matches = false;
                if (input.originalReq.type) matches = RecipeManager.isItemInCategory(itemData, input.originalReq.type);
                else if (input.originalReq.id) matches = RecipeManager._compareUuids(input.originalReq.id, itemData);
                
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
                ui.notifications.warn("Крафт не удался (мини-игра провалена), ингредиенты потрачены");
                return;
            }

            let resultId = recipe.resultId || (recipe.result ? recipe.result.uuid : null);
            let itemData = await RecipeManager.findItemDataInCompendiums(resultId);
            if (!itemData) {
                itemData = { name: recipe.name, type: "consumable", img: this.state.resultItem?.img };
            }
            itemData = foundry.utils.deepClone(itemData);
            itemData.system = itemData.system || {};
            itemData.system.quantity = 1;

            await this.actor.createEmbeddedDocuments("Item", [itemData]);
            ui.notifications.info(`Создано: ${recipe.name}`);
            
            await this._prepareRecipeView(this.state.selectedRecipe);
            this.render(true);
        } catch (err) { ui.notifications.error(err.message); }
    }
}
