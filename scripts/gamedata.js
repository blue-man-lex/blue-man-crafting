// База данных категорий и рецептов для модуля Blue Man Crafting
// Сформирована на основе журнала "Baldur's Gate 3: Персонажи и расходники"

export const RECIPE_CATEGORIES = {
    // === ГЛОБАЛЬНЫЕ КАТЕГОРИИ ===
    
    // 1. АЛХИМИЯ (готовые продукты: зелья, эликсиры, гранаты, масла и яды)
    "alchemy": {
        name: "Алхимия",
        global: true,
        subcategories: {
            // === ГОТОВЫЕ ПРОДУКТЫ АЛХИМИИ ===
            "potions": {
                name: "Зелья",
                items: [] // Будут добавлены через рецепты
            },
            "elixirs": {
                name: "Эликсиры", 
                items: [] // Будут добавлены через рецепты
            },
            "grenades": {
                name: "Гранаты",
                items: [] // Будут добавлены через рецепты
            },
            "coatings": {
                name: "Масла и яды",
                items: [] // Будут добавлены через рецепты
            }
        }
    },
    
    // 2. ИНГРЕДИЕНТЫ (компоненты для крафта)
    "ingredients": {
        name: "Ингредиенты",
        global: true,
        subcategories: {
            // === СУСПЕНЗИИ (14 шт) ===
            "suspension": {
                name: "Суспензия",
                items: [
                    "Compendium.blue-man-crafting.BG3.Item.XkvepyIypdkgjldc", // Раствор ночной орхидеи
                    "Compendium.blue-man-crafting.BG3.Item.g86ewb0j0fol19Zc", // Суспензия бурого желе
                    "Compendium.blue-man-crafting.BG3.Item.CHRU8ncCuP0B0qtu", // Суспензия глаза гаута
                    "Compendium.blue-man-crafting.BG3.Item.ztnxGwKrEqPQvWFp", // Суспензия глаза нотика
                    "Compendium.blue-man-crafting.BG3.Item.vd96rJkPyGoBQvDb", // Суспензия грязной жижи
                    "Compendium.blue-man-crafting.BG3.Item.lyhsWZftKmvIjCU1", // Жаболюдского вороночника
                    "Compendium.blue-man-crafting.BG3.Item.A69KxYmriq2bwdRj", // Суспензия змеиного яда
                    "Compendium.blue-man-crafting.BG3.Item.jcYV8FtIDU1AVMeC", // Суспензия лакулита
                    "Compendium.blue-man-crafting.BG3.Item.McT9tLB4FOdv637r", // Суспензия паутины
                    "Compendium.blue-man-crafting.BG3.Item.9zRN1x3Cl18QXkcD", // Слизи пурпурного червя
                    "Compendium.blue-man-crafting.BG3.Item.trsRt9lsOhKqS16L", // Спинномозговой жидкости
                    "Compendium.blue-man-crafting.BG3.Item.SaSaQ9g85cw28nQw", // Суспензия тростника
                    "Compendium.blue-man-crafting.BG3.Item.PE2kq1aaCBMAjDG9", // Языка морозной саламандры
                    "Compendium.blue-man-crafting.BG3.Item.zAY4xCQUDZkXtyOs"  // Общий ID Суспензии
                ]
            },
            // === СОЛИ (13 шт) ===
            "salt": {
                name: "Соль",
                items: [
                    "Compendium.blue-man-crafting.BG3.Item.XfVKwbEQOPQB59m5", // Древесной коры
                    "Compendium.blue-man-crafting.BG3.Item.a5ELH5EiRHfX5VBi", // Виридинового кристалла
                    "Compendium.blue-man-crafting.BG3.Item.GLQu12qPRFQvDrKM", // Щупальца падальщицы
                    "Compendium.blue-man-crafting.BG3.Item.FbsJyjXiwQ5IA7Fl", // Зонтика воровского
                    "Compendium.blue-man-crafting.BG3.Item.2djeWwj5w9wJJbWd", // Медной стружки
                    "Compendium.blue-man-crafting.BG3.Item.FBpT4yDod1yLCYrv", // Мускусной лианы
                    "Compendium.blue-man-crafting.BG3.Item.YgCveQn15xnoqvBt", // Ногтей облачного великана
                    "Compendium.blue-man-crafting.BG3.Item.HzlS9nh5NKk6BeiD", // Ногтей холмового великана
                    "Compendium.blue-man-crafting.BG3.Item.45ecUDiGVJaGOrwb", // Полыни
                    "Compendium.blue-man-crafting.BG3.Item.kKqOJhJAKtnHgs92", // Разломника
                    "Compendium.blue-man-crafting.BG3.Item.oi6qkVkuOFWCT7kc", // Трупной розы
                    "Compendium.blue-man-crafting.BG3.Item.uwJLkdEfMz8d4KM9", // Чешуи зорна
                    "Compendium.blue-man-crafting.BG3.Item.prDTaGVmWtfcucio"  // Общий ID Соли
                ]
            },
            // === ЗОЛЫ (11 шт) ===
            "ash": {
                name: "Зола",
                items: [
                    "Compendium.blue-man-crafting.BG3.Item.mASl0C0L8bE6l6WT", // Зола из бальзамина
                    "Compendium.blue-man-crafting.BG3.Item.unoF0PzrI9uh28WP", // Зола из боровика драконьего
                    "Compendium.blue-man-crafting.BG3.Item.LAETEYJmRFIkaerq", // Зола из жал виверн
                    "Compendium.blue-man-crafting.BG3.Item.zQ1YWjrV2ZdVkYAZ", // Зола из клыка варга
                    "Compendium.blue-man-crafting.BG3.Item.b6QOp83Fl0Qjg9MW", // Зола из магмы мефита
                    "Compendium.blue-man-crafting.BG3.Item.IIPKkEGkDRRskcdH", // Зола из огненного янтаря
                    "Compendium.blue-man-crafting.BG3.Item.n3B5r86YJgpbGyY0", // Зола из патагия беса
                    "Compendium.blue-man-crafting.BG3.Item.NjaRtv0S36p7sNJE", // Зола из сушеного феецвета
                    "Compendium.blue-man-crafting.BG3.Item.V4smSu6LpUXKLcDX", // Зола из уха гиены
                    "Compendium.blue-man-crafting.BG3.Item.elwad9XDa8PEEz5Q", // Зола кинжальника
                    "Compendium.blue-man-crafting.BG3.Item.2PQeh1IffAVmAvGn"  // Общий ID Золы
                ]
            },
            // === КУПОРОСЫ (8 шт) ===
            "vitriol": {
                name: "Купорос",
                items: [
                    "Compendium.blue-man-crafting.BG3.Item.6W03cneUMUXkFdPb", // Божественных миазмов
                    "Compendium.blue-man-crafting.BG3.Item.hMKFnrhkd4wIp1Eq", // Гнилостной опухоли
                    "Compendium.blue-man-crafting.BG3.Item.c8tWAmG0MPkBS8IK", // Костегриба
                    "Compendium.blue-man-crafting.BG3.Item.6KjaFPrSDQs28Zty", // Мешочка тенекорня
                    "Compendium.blue-man-crafting.BG3.Item.TD52spmvYuuT9KQV", // Свечи Лолт
                    "Compendium.blue-man-crafting.BG3.Item.pGpGDhiruR1svzkU", // Узорчатого мха
                    "Compendium.blue-man-crafting.BG3.Item.wULaiaGgd6iLrVdR", // Олеандровый
                    "Compendium.blue-man-crafting.BG3.Item.LRaytn5NTuyzU3aQ"  // Общий ID Купороса
                ]
            },
            // === СУБЛИМАТЫ (13 шт) ===
            "sublimate": {
                name: "Сублимат",
                items: [
                    "Compendium.blue-man-crafting.BG3.Item.dI2oiyzyOieUrWSQ", // Белладонны
                    "Compendium.blue-man-crafting.BG3.Item.8kxnkFdDPRFwSkq3", // Ки-ринского волоса
                    "Compendium.blue-man-crafting.BG3.Item.Qza1j4vux29uQJOR", // Замороженных ушей
                    "Compendium.blue-man-crafting.BG3.Item.sp3IY8yoEchgt9Al", // Окровавленного крюка
                    "Compendium.blue-man-crafting.BG3.Item.IRxe0Qvp13wnIDKa", // Осеннего шафрана
                    "Compendium.blue-man-crafting.BG3.Item.rtxTVuLmFSHgdmx2", // Орлиных перьев
                    "Compendium.blue-man-crafting.BG3.Item.oYGXK65kzepWD6fu", // Перьев пегаса
                    "Compendium.blue-man-crafting.BG3.Item.ubrwxE1Y9T3XpQ9f", // Скальпника
                    "Compendium.blue-man-crafting.BG3.Item.2gc2Mb6U7mZ8NN3W", // Спор ускорения
                    "Compendium.blue-man-crafting.BG3.Item.5lcjMBqrJ1959kqE", // Спор яда
                    "Compendium.blue-man-crafting.BG3.Item.UCtyaLiw76OLmPkv", // Чешуи бехира
                    "Compendium.blue-man-crafting.BG3.Item.gydua5WPG1B5cpvI", // Языка безумия
                    "Compendium.blue-man-crafting.BG3.Item.YDBJHrq2Oa5fTOgf"  // Общий ID Сублимата
                ]
            },
            // === ЭССЕНЦИИ (11 шт) ===
            "essence": {
                name: "Эссенция",
                items: [
                    "Compendium.blue-man-crafting.BG3.Item.tU9TwjKvg3EpQQcA", // Глаза бехолдера
                    "Compendium.blue-man-crafting.BG3.Item.aBbcnGJHfHwD8XOm", // Желудевого трюфеля
                    "Compendium.blue-man-crafting.BG3.Item.nDSNoznWmOehO4wR", // Лесного камня
                    "Compendium.blue-man-crafting.BG3.Item.SEAKzcYJHLy2Jx8H", // Ночесвета
                    "Compendium.blue-man-crafting.BG3.Item.Jyk2udvOEH9SSG2b", // Перьев планетара
                    "Compendium.blue-man-crafting.BG3.Item.K2imJSTslyYGgxmv", // Роящейся поганки
                    "Compendium.blue-man-crafting.BG3.Item.TO9PeZTYiXlczoCq", // Рога единорога
                    "Compendium.blue-man-crafting.BG3.Item.i68vfJvigrP7yNkl", // Спор тиммаска
                    "Compendium.blue-man-crafting.BG3.Item.rWqealkZZ8P5LZ4f", // Хвоста гремишки
                    "Compendium.blue-man-crafting.BG3.Item.qw8JCuClSiWWw1vK", // Хрусталика
                    "Compendium.blue-man-crafting.BG3.Item.bzF1OSLDlOCwZjCS"  // Общий ID Эссенции
                ]
            }
        }
    },
    
    // 3. КУЗНЕЧНОЕ ДЕЛО (пустая структура для будущего)
    "smithing": {
        name: "Кузнечное дело",
        global: true,
        subcategories: {
            "weapons": {
                name: "Оружие",
                items: []
            },
            "armor": {
                name: "Доспехи",
                items: []
            },
            "tools": {
                name: "Инструменты",
                items: []
            }
        }
    },
    
    // 4. ЮВЕЛИРНОЕ ДЕЛО
    "jewelry": {
        name: "Ювелирное дело",
        global: true,
        subcategories: {
            "gem-cutting": {
                name: "Огранка камня",
                items: []
            },
            "enchantment-dust": {
                name: "Пыль для зачарования",
                items: []
            }
        }
    },
    
    // 5. КОЖЕВНИЧЕСТВО
    "leatherworking": {
        name: "Кожевничество",
        global: true,
        subcategories: {
            "leather-armor": {
                name: "Доспехи",
                items: []
            },
            "tanning": {
                name: "Дубление",
                items: []
            }
        }
    },
    
    // 6. КУЛИНАРИЯ
    "cooking": {
        name: "Кулинария",
        global: true,
        subcategories: {
            "rations": {
                name: "Рационы",
                items: []
            },
            "feasts": {
                name: "Пиры",
                items: []
            }
        }
    },
    
    // 7. ТКАЧЕСТВО
    "tailoring": {
        name: "Ткачество",
        global: true,
        subcategories: {
            "cloth-armor": {
                name: "Доспехи",
                items: []
            },
            "embroidery": {
                name: "Вышивка",
                items: []
            }
        }
    }
};

export const RECIPES = [
    // === РЕЦЕПТЫ СОЗДАНИЯ ИНГРЕДИЕНТОВ ===
    
    // === СУСПЕНЗИИ ===
    {
        name: "Раствор ночной орхидеи",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.RrgfI1yH4N4DmW28", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.XkvepyIypdkgjldc", qty: 1 }
    },
    {
        name: "Суспензия бурого желе",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.VNHCPKYaZgm3ZofW", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.g86ewb0j0fol19Zc", qty: 1 }
    },
    {
        name: "Суспензия глаза гаута",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.GiZGKvs2SXoxKCIW", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.CHRU8ncCuP0B0qtu", qty: 1 }
    },
    {
        name: "Суспензия глаза нотика",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.7iIjNSZd71oHsT4V", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.ztnxGwKrEqPQvWFp", qty: 1 }
    },
    {
        name: "Суспензия грязной жижи",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.gzobUcztx4UdUqjq", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.vd96rJkPyGoBQvDb", qty: 1 }
    },
    {
        name: "Жаболюдского вороночника",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.9PldKn4kOWKAWkFD", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.lyhsWZftKmvIjCU1", qty: 1 }
    },
    {
        name: "Суспензия змеиного яда",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.FcfMW02pbK2psZDp", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.A69KxYmriq2bwdRj", qty: 1 }
    },
    {
        name: "Суспензия лакулита",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.TzxjN0ieb9UlIFTr", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.jcYV8FtIDU1AVMeC", qty: 1 }
    },
    {
        name: "Суспензия паутины",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.5eQ0zer5DQUKfu35", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.McT9tLB4FOdv637r", qty: 1 }
    },
    {
        name: "Слизи пурпурного червя",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.xGwL3zUECCSp3FxU", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.9zRN1x3Cl18QXkcD", qty: 1 }
    },
    {
        name: "Спинномозговой жидкости",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.fm3Lx3x0iYpiuxfk", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.trsRt9lsOhKqS16L", qty: 1 }
    },
    {
        name: "Суспензия тростника",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.bBIe9LtLXKD2bd7V", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.SaSaQ9g85cw28nQw", qty: 1 }
    },
    {
        name: "Языка морозной саламандры",
        type: "suspension",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.8rDL3HqEXr7qVFfQ", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.PE2kq1aaCBMAjDG9", qty: 1 }
    },

    // === ЭССЕНЦИИ ===
    {
        name: "Эссенция глаза бехолдера",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.SMQcwNm7xvmgXYNM", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.tU9TwjKvg3EpQQcA", qty: 1 }
    },
    {
        name: "Эссенция желудевого трюфеля",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.slLTGoACa1Zjx1E8", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.aBbcnGJHfHwD8XOm", qty: 1 }
    },
    {
        name: "Эссенция лесного камня",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.eUuSeHVWSEghFtD4", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.nDSNoznWmOehO4wR", qty: 1 }
    },
    {
        name: "Эссенция ночесвета",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.vgoQmMsSvEuzPYfO", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.SEAKzcYJHLy2Jx8H", qty: 1 }
    },
    {
        name: "Эссенция перьев планетара",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.IWXGMTrkHe9Qp9An", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.Jyk2udvOEH9SSG2b", qty: 1 }
    },
    {
        name: "Эссенция роящейся поганки",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.uR9xJHmAA4J1it26", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.K2imJSTslyYGgxmv", qty: 1 }
    },
    {
        name: "Эссенция рога единорога",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.j7nbPUrLoNUYDd5O", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.TO9PeZTYiXlczoCq", qty: 1 }
    },
    {
        name: "Эссенция спор тиммаска",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.OYhrJ0Sx4GOkSZFW", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.i68vfJvigrP7yNkl", qty: 1 }
    },
    {
        name: "Эссенция хвоста гремишки",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.HnJAtEmPOACKliK0", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.rWqealkZZ8P5LZ4f", qty: 1 }
    },
    {
        name: "Эссенция хрусталика",
        type: "essence",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.E64qB1Bl9rjO4gxG", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.qw8JCuClSiWWw1vK", qty: 1 }
    },

    // === СОЛИ ===
    {
        name: "Соль древесной коры",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.c273TwbVBT5vu1RO", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.XfVKwbEQOPQB59m5", qty: 1 }
    },
    {
        name: "Соль виринидового кристалла",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.k6ihjADTlxNwiD6E", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.a5ELH5EiRHfX5VBi", qty: 1 }
    },
    {
        name: "Соль щупалец падальщицы",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.pU8xNt2nb4Jxgscg", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.GLQu12qPRFQvDrKM", qty: 1 }
    },
    {
        name: "Соль зонтика воровского",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.7QxCNAOZiBFGQ5Cw", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.FbsJyjXiwQ5IA7Fl", qty: 1 }
    },
    {
        name: "Соль медной стружки",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.0FLIasdQaZQ4i6Gn", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.2djeWwj5w9wJJbWd", qty: 1 }
    },
    {
        name: "Соль мускусной лианы",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.GAUsumjiiiyBP71l", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.FBpT4yDod1yLCYrv", qty: 1 }
    },
    {
        name: "Соль ногтей облачного великана",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.PCtyxcy6CjEICmlB", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.YgCveQn15xnoqvBt", qty: 1 }
    },
    {
        name: "Соль ногтей холмового великана",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.qO5z1yflqBc9ELyR", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.HzlS9nh5NKk6BeiD", qty: 1 }
    },
    {
        name: "Соль полыни",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.RIdMoqh7H8Tx0OWi", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.45ecUDiGVJaGOrwb", qty: 1 }
    },
    {
        name: "Соль разломника",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.BqiNqjKoK1gCDTdC", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.kKqOJhJAKtnHgs92", qty: 1 }
    },
    {
        name: "Соль трупной розы",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.Z4qB7hckv3di6Txy", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.oi6qkVkuOFWCT7kc", qty: 1 }
    },
    {
        name: "Соль чешуи зорна",
        type: "salt",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.BLxtxCF0l4Mw9bpz", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.uwJLkdEfMz8d4KM9", qty: 1 }
    },

    // === ЗОЛЫ ===
    {
        name: "Зола из бальзамина",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.tnciEMq3UmE4R5kh", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.mASl0C0L8bE6l6WT", qty: 1 }
    },
    {
        name: "Зола из боровика драконьего",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.iKLUoJY0HkP8LgAl", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.unoF0PzrI9uh28WP", qty: 1 }
    },
    {
        name: "Зола из жал виверн",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.GSDiUy9fnVLbqOIi", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.LAETEYJmRFIkaerq", qty: 1 }
    },
    {
        name: "Зола из клыка варга",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.G7ABOBjIhBQmXStA", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.zQ1YWjrV2ZdVkYAZ", qty: 1 }
    },
    {
        name: "Зола из магмы мефита",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.3yfpZ1rMOszFuQR5", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.b6QOp83Fl0Qjg9MW", qty: 1 }
    },
    {
        name: "Зола из огненного янтаря",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.ZqzAdF8H5UuF2eiZ", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.IIPKkEGkDRRskcdH", qty: 1 }
    },
    {
        name: "Зола из патагия беса",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.NsIIlGJ1RCchWVry", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.n3B5r86YJgpbGyY0", qty: 1 }
    },
    {
        name: "Зола из сушеного феецвета",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.xSDSHdtdAFlVHLQr", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.NjaRtv0S36p7sNJE", qty: 1 }
    },
    {
        name: "Зола из уха гиены",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.U7i0RrcJHzcg25I8", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.V4smSu6LpUXKLcDX", qty: 1 }
    },
    {
        name: "Зола кинжальника",
        type: "ash",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.aiAuk2LD4HptiPEv", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.elwad9XDa8PEEz5Q", qty: 1 }
    },


    // === КУПОРОСЫ ===
    {
        name: "Божественных миазмов",
        type: "vitriol",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.SIelsZu0Xsi8wBMY", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.6W03cneUMUXkFdPb", qty: 1 }
    },
    {
        name: "Гнилостной опухоли",
        type: "vitriol",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.41yXPV84ZcvvPccg", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.hMKFnrhkd4wIp1Eq", qty: 1 }
    },
    {
        name: "Костегриба",
        type: "vitriol",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.3i91MPGlciCRYReS", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.c8tWAmG0MPkBS8IK", qty: 1 }
    },
    {
        name: "Мешочка тенекорня",
        type: "vitriol",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.uostTl8pJEKNpWYi", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.6KjaFPrSDQs28Zty", qty: 1 }
    },
    {
        name: "Свечи Лолт",
        type: "vitriol",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.V88HzPciMwXUCJej", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.TD52spmvYuuT9KQV", qty: 1 }
    },
    {
        name: "Узорчатого мха",
        type: "vitriol",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.4xy0QOd8MK2bhKv2", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.pGpGDhiruR1svzkU", qty: 1 }
    },
    {
        name: "Олеандровый",
        type: "vitriol",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.HGQTk645ybOH6ZJJ", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.wULaiaGgd6iLrVdR", qty: 1 }
    },


    // === СУБЛИМАТЫ ===
    {
        name: "Белладонны",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.doAPlah1KHnqjYqx", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.dI2oiyzyOieUrWSQ", qty: 1 }
    },
    {
        name: "Ки-ринского волоса",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.oO0MAUNN4J0OvLGG", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.8kxnkFdDPRFwSkq3", qty: 1 }
    },
    {
        name: "Замороженных ушей",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.1GZzhIuJZS0CvQ8R", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.Qza1j4vux29uQJOR", qty: 1 }
    },
    {
        name: "Окровавленного крюка",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.mb0tbchWvlfTXo8J", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.sp3IY8yoEchgt9Al", qty: 1 }
    },
    {
        name: "Осеннего шафрана",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.neF2fT93JE55VyYn", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.IRxe0Qvp13wnIDKa", qty: 1 }
    },
    {
        name: "Орлиных перьев",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.oDobp3vnp8Ph4LuE", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.rtxTVuLmFSHgdmx2", qty: 1 }
    },
    {
        name: "Перьев пегаса",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.ItjqC25szszRZwNE", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.oYGXK65kzepWD6fu", qty: 1 }
    },
    {
        name: "Скальпника",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.AtQhYMG5rLPLW0n8", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.ubrwxE1Y9T3XpQ9f", qty: 1 }
    },
    {
        name: "Спор ускорения",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.i3hDEalVUpTtXb67", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.2gc2Mb6U7mZ8NN3W", qty: 1 }
    },
    {
        name: "Спор яда",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.HY8RflOpEbbliZWJ", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.5lcjMBqrJ1959kqE", qty: 1 }
    },
    {
        name: "Чешуи бехира",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.rpq2pldJu2wSEjTh", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.UCtyaLiw76OLmPkv", qty: 1 }
    },
    {
        name: "Языка безумия",
        type: "sublimate",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.ZdEHOmPd0Y881Qd0", qty: 3 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.gydua5WPG1B5cpvI", qty: 1 }
    },

    // === ГОТОВЫЕ ПРОДУКТЫ АЛХИМИИ ===
    // === ЗЕЛЬЯ ===
    {
        name: "Зелье ангельского сна",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.IWXGMTrkHe9Qp9An", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.oHt1oIkycQTOdEhD", qty: 1 }
    },
    {
        name: "Зелье ангельской передышки",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.j7nbPUrLoNUYDd5O", qty: 3 },
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.mqd80PLHRl05XG6o", qty: 1 }
    },
    {
        name: "Зелье великого лечения",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.tnciEMq3UmE4R5kh", qty: 3 },
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.WoqhR86rz8Bg0tdK", qty: 1 }
    },
    {
        name: "Зелье выдающихся прыжков",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.AtQhYMG5rLPLW0n8", qty: 3 },
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.paw80JJWXYJ1qjKt", qty: 1 }
    },
    {
        name: "Зелье высшего исцеления",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.oO0MAUNN4J0OvLGG", qty: 3 },
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.Gs1cYPHCHTkckp8z", qty: 1 }
    },
    {
        name: "Зелье лечения",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.7QxCNAOZiBFGQ5Cw", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.OUkUvcSEOVHfU29q", qty: 1 }
    },
    {
        name: "Зелье невидимости",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.NsIIlGJ1RCchWVry", qty: 3 },
            slot3: { type: "category", categoryId: "essence", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.9PUm1vTDc5cN6tAy", qty: 1 }
    },
    {
        name: "Зелье общения с животными",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.slLTGoACa1Zjx1E8", qty: 3 },
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.ws17rS1h5YSl4BxT", qty: 1 }
    },
    {
        name: "Зелье «Плавное падение»",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.neF2fT93JE55VyYn", qty: 3 },
            slot3: { type: "category", categoryId: "essence", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.9i2RKqmsIFQLE4Pl", qty: 1 }
    },
    {
        name: "Зелье полета",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.oDobp3vnp8Ph4LuE", qty: 3 },
            slot3: { type: "category", categoryId: "essence", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.dkIGXwhb9mnpwZLl", qty: 1 }
    },
    {
        name: "Зелье превосходного исцеления",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.GAUsumjiiiyBP71l", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.VKnYd34fHhXsOwJu", qty: 1 }
    },
    {
        name: "Зелье скорости",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.U7i0RrcJHzcg25I8", qty: 3 },
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.tBw6FMqIbHTcOY5h", qty: 1 }
    },
    {
        name: "Зелье чтения мыслей",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.bBIe9LtLXKD2bd7V", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.lxQ4faHClZXopW2k", qty: 1 }
    },
    {
        name: "Противоядие",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.RIdMoqh7H8Tx0OWi", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.wWOkIefbTWK9J3iF", qty: 1 }
    },
    {
        name: "Целебное зелье",
        type: "potions",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.BLxtxCF0l4Mw9bpz", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.6fZ9yh0TFjH893uf", qty: 1 }
    },

    // === ЭЛИКСИРЫ ===
    {
        name: "Великий эликсир магического развития",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.TzxjN0ieb9UlIFTr", qty: 3 },
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.NDqbRgydODlT1Fnk", qty: 1 }
    },
    {
        name: "Превосходный эликсир магического развития",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.RrgfI1yH4N4DmW28", qty: 3 },
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.gJmuoqDgPyIwYZK0", qty: 1 }
    },
    {
        name: "Высший эликсир магического развития",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.SMQcwNm7xvmgXYNM", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.XFhvKzAO54XCJw9u", qty: 1 }
    },
    {
        name: "Эликсир бдительности",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.mb0tbchWvlfTXo8J", qty: 3 },
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.UQCQ54qrpeec9t8q", qty: 1 }
    },
    {
        name: "Эликсир бесподобного сосредоточения",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.doAPlah1KHnqjYqx", qty: 3 },
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.AeNbPsLxBNl9limc", qty: 1 }
    },
    {
        name: "Эликсир видения невидимого",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.7iIjNSZd71oHsT4V", qty: 3 },
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.TGZdHdRhmFrZtH1a", qty: 1 }
    },
    {
        name: "Эликсир героизма",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.ItjqC25szszRZwNE", qty: 3 },
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.n4NYDNwr6JfZuZsS", qty: 1 }
    },
    {
        name: "Эликсир дубовой кожи",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.c273TwbVBT5vu1RO", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.D6HvOWLomY7b4k1R", qty: 1 }
    },
    {
        name: "Эликсир злобности",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.uostTl8pJEKNpWYi", qty: 3 },
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.3ncv7NDJvRKH0nm6", qty: 1 }
    },
    {
        name: "Эликсир колосса",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.BqiNqjKoK1gCDTdC", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.wDsYoCCcR9MFSazj", qty: 1 }
    },
    {
        name: "Эликсир кровожадности",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.G7ABOBjIhBQmXStA", qty: 3 },
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.TFKKrCNcpPKYyJOD", qty: 1 }
    },
    {
        name: "Эликсир личинки",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.ZdEHOmPd0Y881Qd0", qty: 3 },
            slot3: { type: "category", categoryId: "essence", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.KMUFmeGOMzQsxzMD", qty: 1 }
    },
    {
        name: "Эликсир магического развития",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.4xy0QOd8MK2bhKv2", qty: 3 },
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.Jy8ZKvfttWKD0K5X", qty: 1 }
    },
    {
        name: "Эликсир некротической устойчивости",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.HGQTk645ybOH6ZJJ", qty: 3 },
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.DQhWX9v5DcHmuza9", qty: 1 }
    },
    {
        name: "Эликсир ночного зрения",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.E64qB1Bl9rjO4gxG", qty: 3 },
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.PuY4rkyV60IrUVvh", qty: 1 }
    },
    {
        name: "Эликсир пронырливости",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.VNHCPKYaZgm3ZofW", qty: 3 },
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.GMUXjyAuDMvrRV3G", qty: 1 }
    },
    {
        name: "Эликсир психической устойчивости",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.fm3Lx3x0iYpiuxfk", qty: 3 },
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.x4xOeC0yzvLHr4jm", qty: 1 }
    },
    {
        name: "Эликсир силы боевого мага",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.GiZGKvs2SXoxKCIW", qty: 3 },
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.9jkikHrCAWz2V9du", qty: 1 }
    },
    {
        name: "Эликсир силы облачного великана",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.PCtyxcy6CjEICmlB", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.aWJ1DL44e6Kux4on", qty: 1 }
    },
    {
        name: "Эликсир силы холмового великана",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.qO5z1yflqBc9ELyR", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.wAjGLpOQgMJoBJnP", qty: 1 }
    },
    {
        name: "Эликсир устойчивости к молнии",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.0FLIasdQaZQ4i6Gn", qty: 3 },
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.JNXwmSs7eVX8hOb0", qty: 1 }
    },
    {
        name: "Эликсир устойчивости к огню",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.iKLUoJY0HkP8LgAl", qty: 3 },
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.ihKWkvernBr55yLC", qty: 1 }
    },
    {
        name: "Эликсир устойчивости к яду",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.gzobUcztx4UdUqjq", qty: 3 },
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.G5uT24n0djrum4Nn", qty: 1 }
    },
    {
        name: "Эликсир универсальной устойчивости",
        type: "elixirs",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.SIelsZu0Xsi8wBMY", qty: 3 },
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.O9fnfOU5sB3iiKeO", qty: 1 }
    },

    // === ГРАНАТЫ (8 шт) ===
    {
        name: "Бомба света очага",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.vgoQmMsSvEuzPYfO", qty: 3 }, // Кусок ночесвета
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.n76VoolLvWocEqWv", qty: 1 }
    },
    {
        name: "Граната спор ускорения",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.i3hDEalVUpTtXb67", qty: 3 }, // Споры ускорения
            slot3: { type: "category", categoryId: "essence", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.W8WFSTDKXldbqqtm", qty: 1 }
    },
    {
        name: "Граната с ядовитыми спорами",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.HY8RflOpEbbliZWJ", qty: 3 }, // Ядовитая спора
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.pfCc44Yj3E8zsBxL", qty: 1 }
    },
    {
        name: "Грибной дурман",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.OYhrJ0Sx4GOkSZFW", qty: 3 }, // Споры тиммаска
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.m0rMYEkQc4JwIgII", qty: 1 }
    },
    {
        name: "Огонь алхимика",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.ZqzAdF8H5UuF2eiZ", qty: 3 }, // Огненный янтарь
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.GSNKxrQo2Fsm9zMq", qty: 1 }
    },
    {
        name: "Паутинная граната",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.5eQ0zer5DQUKfu35", qty: 3 }, // Паутинная железа
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.okhZTXF5hz6IaP7r", qty: 1 }
    },
    {
        name: "Погибель карги",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.xSDSHdtdAFlVHLQr", qty: 3 }, // Засушенный фейский цветок
            slot3: { type: "category", categoryId: "essence", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.lKYqoPWWBpXHLaG3", qty: 1 }
    },
    {
        name: "Слепящая вспышка",
        type: "grenades",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.rpq2pldJu2wSEjTh", qty: 3 }, // Чешуя бехира
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.MV5NMyVHSD0en1JW", qty: 1 }
    },

    // === СОСТАВЫ ДЛЯ ОРУЖИЯ (18 шт) ===
    {
        name: "Злоба",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.V88HzPciMwXUCJej", qty: 3 }, // Свеча Лолт
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.Vdrnl48qc8tBmrgs", qty: 1 }
    },
    {
        name: "Масло воспламенения",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.3yfpZ1rMOszFuQR5", qty: 3 }, // Камень в форме сердца
            slot3: { type: "category", categoryId: "essence", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.HbvwxeJHVnQeSr0L", qty: 1 }
    },
    {
        name: "Масло грозы волшебников",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.HnJAtEmPOACKliK0", qty: 3 }, // Хвост гремишки
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.4Ak2QEjDFCZ5ixFY", qty: 1 }
    },
    {
        name: "Масло замерзания",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.8rDL3HqEXr7qVFfQ", qty: 3 }, // Язык морозной саламандры
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.mvX8ej9vQQZDMW91", qty: 1 }
    },
    {
        name: "Масло миниатюрности",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.eUuSeHVWSEghFtD4", qty: 3 }, // Лесной камень
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.et60ZgqPgqwHls8f", qty: 1 }
    },
    {
        name: "Масло поджога",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.1GZzhIuJZS0CvQ8R", qty: 3 }, // Замороженное ухо
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.kRuRbGbTRt2k5vMH", qty: 1 }
    },
    {
        name: "Масло порчи",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.41yXPV84ZcvvPccg", qty: 3 }, // Гнилостная опухоль
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.W0PdIh10pGbK8LqA", qty: 1 }
    },
    {
        name: "Масло точности",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.aiAuk2LD4HptiPEv", qty: 3 }, // Кинжальник
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.5xOHuh2kj4WoWx4j", qty: 1 }
    },
    {
        name: "Обычный яд",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.3i91MPGlciCRYReS", qty: 3 }, // Костегриб
            slot3: { type: "category", categoryId: "ash", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.RTkf4vf2Yve5755a", qty: 1 }
    },
    {
        name: "Простой токсин",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.9PldKn4kOWKAWkFD", qty: 3 }, // Жаболюдский вороночник
            slot3: { type: "category", categoryId: "sublimate", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.QD3Q0FrijC2sRFPf", qty: 1 }
    },
    {
        name: "Разбавленное масло остроты",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.k6ihjADTlxNwiD6E", qty: 3 }, // Виридиновый кристалл
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.r35pbXd3BZ8564hJ", qty: 1 }
    },
    {
        name: "Слизь гусеницы",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.pU8xNt2nb4Jxgscg", qty: 3 }, // Щупальце гусеницы
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.sKdjIrfy3MptM2mv", qty: 1 }
    },
    {
        name: "Токсин виверны",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.GSDiUy9fnVLbqOIi", qty: 3 }, // Жало виверны
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.P7oclZHT9vZQkbkT", qty: 1 }
    },
    {
        name: "Токсин змеиного зуба",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.FcfMW02pbK2psZDp", qty: 3 }, // Ядовитый клык
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.ElW6bqDogcCwaAdi", qty: 1 }
    },
    {
        name: "Токсин пурпурного червя",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.xGwL3zUECCSp3FxU", qty: 3 }, // Пищевод пурпурного червя
            slot3: { type: "category", categoryId: "vitriol", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.s9F1wZRyV40k8YVY", qty: 1 }
    },
    {
        name: "Яд дроу",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.uR9xJHmAA4J1it26", qty: 3 }, // Роящаяся поганка
            slot3: { type: "category", categoryId: "salt", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.Gw0pQ2thWnYEv4oX", qty: 1 }
    },
    {
        name: "Яд Карабасана",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.QQ2qCGHUX8yJXJGi", qty: 3 }, // Дар Карабасана (Ингредиент)
            slot3: { type: "category", categoryId: "salt", qty: 1 } // Предполагаю Соль, в журнале не указан тип ингредиента, но обычно редкие яды - соль или купорос. Поставил Соль.
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.pC9Ym4kEnVbzaOYd", qty: 1 }
    },
    {
        name: "Яд-чревоточец Тисобальда",
        type: "coatings",
        input: {
            slot1: { type: "item", uuid: "Compendium.blue-man-crafting.BG3.Item.Z4qB7hckv3di6Txy", qty: 3 }, // Трупная роза
            slot3: { type: "category", categoryId: "suspension", qty: 1 }
        },
        result: { uuid: "Compendium.blue-man-crafting.BG3.Item.KeLQD70jq7RavzAd", qty: 1 }
    }
];