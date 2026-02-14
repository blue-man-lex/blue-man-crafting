import { BG3CraftingApp, setSocket } from "./craftingApp.js";
import { RecipeManager } from "./recipeManager.js"; // Импорт менеджера

// Регистрация socketlib
let socket;

Hooks.once("socketlib.ready", () => {
    console.log("BG3 Crafting | Socketlib ready");
    socket = socketlib.registerModule("blue-man-crafting");
    
    // Передаем socket в craftingApp
    setSocket(socket);
    
    // Регистрируем обработчик для изучения рецептов из свитков
    socket.register("learnRecipeFromScroll", handleLearnRecipeFromScroll);
    
    // Регистрируем обработчик подтверждения изучения (на стороне игрока)
    socket.register("recipeLearnedFromScroll", (data) => {
        if (data.success) {
            ui.notifications.info(`Вы изучили рецепт: ${data.recipeName}`);
            // Обновляем интерфейс если открыт
            if (game.bmc?.craftingApp) {
                game.bmc.craftingApp.render(true);
            }
        } else {
            ui.notifications.error(`Не удалось изучить рецепт: ${data.error}`);
        }
    });
    
    // Регистрируем обработчик обновления интерфейса игрока
    socket.register("updateCraftingUI", (data) => {
        // Просто обновляем интерфейс если открыт, не открываем новый
        const app = game.bmc?.craftingApp;
        if (app && app.rendered) {
            app.render(true);
        }
    });
    
    console.log("BG3 Crafting | Socket handlers registered");
});

// Обработчик изучения рецепта из свитка (выполняется на стороне ГМ)
async function handleLearnRecipeFromScroll(data, socketdata) {
    const { actorId, recipeData, scrollData } = data;
    // В socketlib userId доступен через this.socketdata.userId в контексте вызова
    const userId = this?.socketdata?.userId || socketdata?.userId;
    
    try {
        // Находим актера
        const actor = game.actors.get(actorId);
        if (!actor) {
            console.error(`Actor ${actorId} not found`);
            return { success: false, error: "Актер не найден" };
        }
        
        // Создаем временное приложение, но без рендера
        const tempApp = new BG3CraftingApp(actor);
        // Вызываем обработку рецепта без рендера интерфейса
        await tempApp._processRecipeDiscovery(recipeData, scrollData);
        
        // Уведомляем ГМа
        ui.notifications.info(`Рецепт "${recipeData.name}" добавлен в систему`);
        
        // Если есть userId - отправляем ответ игроку
        if (userId) {
            const user = game.users.get(userId);
            if (user) {
                ui.notifications.info(`Рецепт "${recipeData.name}" изучен игроком ${user.name}`);
                
                socket.executeAsUser("recipeLearnedFromScroll", userId, { 
                    success: true, 
                    recipeName: recipeData.name 
                });
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error in learnRecipeFromScroll:", error);
        return { success: false, error: error.message };
    }
}

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