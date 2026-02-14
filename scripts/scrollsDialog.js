import { RecipeManager } from "./recipeManager.js";

export class ScrollsDialog extends Application {
    constructor(actor) {
        super({
            id: "bmc-scrolls-dialog",
            title: "Свитки для изучения",
            template: "modules/blue-man-crafting/templates/scrolls-dialog.hbs",
            width: 600,
            height: 500,
            resizable: true,
            classes: ["bmc-scrolls-dialog"]
        });
        this.actor = actor;
    }

    async getData() {
        // Получаем все предметы из инвентаря актера, которые являются рецептами-свитками
        const recipeScrolls = this.actor.items.filter(item => {
            // Проверяем, является ли предмет рецептом через flags
            const recipeFlag = item.getFlag("blue-man-crafting", "recipe");
            return recipeFlag && recipeFlag.name;
        });

        // Получаем информацию о редкости для каждого свитка
        const scrollsData = await Promise.all(recipeScrolls.map(async scroll => {
            // Определяем редкость свитка на основе редкости результата рецепта
            const recipeData = scroll.getFlag("blue-man-crafting", "recipe");
            let rarity = "common"; // по умолчанию
            
            if (recipeData && recipeData.rarity) {
                rarity = recipeData.rarity;
            } else if (recipeData && recipeData.result) {
                // Если редкость не указана напрямую, пробуем получить из результата
                try {
                    const resultInfo = await RecipeManager.getItemDisplayInfo(recipeData.result);
                    rarity = resultInfo.rarity || "common";
                } catch (e) {
                    console.warn("Не удалось определить редкость для свитка:", scroll.name, e);
                }
            }

            return {
                id: scroll.id,
                name: scroll.name,
                img: scroll.img,
                description: scroll.system.description?.value || "",
                recipe: recipeData,
                rarity: rarity
            };
        }));

        return {
            scrolls: scrollsData
        };
    }

    activateListeners(html) {
        const htmlElement = html[0] || html;
        htmlElement.addEventListener('click', this._onClick.bind(this));
    }

    async _updateObject(event) {
        // Этот метод требуется для FormApplication, но нам он не нужен
        return;
    }

    async _onClick(event) {
        const target = event.target.closest('.scroll-item');
        if (!target) return;

        const scrollId = target.dataset.scrollId;
        const scroll = this.actor.items.get(scrollId);
        
        if (!scroll) return;

        try {
            // Получаем данные рецепта из flags
            const recipeData = scroll.getFlag("blue-man-crafting", "recipe");
            
            if (!recipeData) {
                ui.notifications.error("Это не рецепт-свиток!");
                return;
            }

            // Вызываем функцию изучения рецепта из основного приложения
            const craftingApp = game.bmc?.craftingApp;
            
            if (craftingApp) {
                // Создаем событие в том же формате, что и drag&drop
                await craftingApp._onRecipeDiscovery({
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: () => JSON.stringify({
                            type: "Item",
                            uuid: scroll.uuid
                        })
                    }
                });
            }

            // Закрываем диалог свитков
            this.close();
            
        } catch (error) {
            console.error("Ошибка при изучении свитка:", error);
            ui.notifications.error("Не удалось изучить свиток: " + error.message);
        }
    }

    async _updateObject(event) {
        // Этот метод требуется для FormApplication, но нам он не нужен
        return;
    }
}
