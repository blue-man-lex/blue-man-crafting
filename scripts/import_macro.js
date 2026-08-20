// Макрос для автоматического создания папок и предметов из JSON
const defaultJsonPath = "modules/blue-man-crafting/примеры/macro_import_data.json";

new Dialog({
    title: "Массовый импорт предметов",
    content: `
        <form>
            <div class="form-group">
                <label>Путь к JSON файлу:</label>
                <input type="text" id="json-path" value="${defaultJsonPath}" style="width: 100%;" />
            </div>
            <p class="notes">Скрипт автоматически создаст корневую папку "Кузнечное дело" и все подпапки (Руды, Слитки, Топливо), а затем создаст предметы прямо в них.</p>
        </form>
    `,
    buttons: {
        import: {
            icon: '<i class="fas fa-file-import"></i>',
            label: "Импортировать",
            callback: async (html) => {
                const path = html.find("#json-path").val();
                await runImport(path);
            }
        },
        cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Отмена"
        }
    },
    default: "import"
}).render(true);

async function runImport(jsonPath) {
    ui.notifications.info("Начинаем скачивание JSON...");
    let response;
    try {
        response = await fetch(jsonPath);
        if (!response.ok) throw new Error("Файл не найден");
    } catch (e) {
        ui.notifications.error("Ошибка загрузки JSON. Проверьте путь.");
        return;
    }

    const itemsData = await response.json();
    ui.notifications.info(`Загружено ${itemsData.length} предметов. Начинаем создание папок...`);

    // Вспомогательная функция для поиска или создания папки
    async function getOrCreateFolder(folderName, parentFolderId = null) {
        let folder = game.folders.find(f => f.type === "Item" && f.name === folderName && f.folder?.id === parentFolderId);
        if (!folder) {
            folder = await Folder.create({
                name: folderName,
                type: "Item",
                folder: parentFolderId,
                color: "#4a4a4a"
            });
            console.log(`Создана папка: ${folderName}`);
        }
        return folder;
    }

    // Создаем главную папку
    const mainFolder = await getOrCreateFolder("Кузнечное дело");

    let createdCount = 0;

    // Создаем предметы
    for (const data of itemsData) {
        // Определяем подпапку из флага (например "Кузнечное дело/Руды")
        const folderPathString = data.flags?.['blue-man-crafting']?.folderPath;
        let targetFolderId = mainFolder.id;

        if (folderPathString) {
            const subName = folderPathString.split("/")[1]; // Берем "Руды"
            if (subName) {
                const subFolder = await getOrCreateFolder(subName, mainFolder.id);
                targetFolderId = subFolder.id;
            }
        }

        // Присваиваем ID папки
        data.folder = targetFolderId;

        // Создаем предмет
        await Item.create(data);
        createdCount++;
    }

    ui.notifications.info(`Успешно создано ${createdCount} предметов! Теперь вы можете перетащить папку "Кузнечное дело" в компендиум Товаров.`);
}
