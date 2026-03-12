# 📚 Система Активностей в D&D 5e для Foundry VTT

## 🏗️ **Обзор архитектуры**

На основе анализа кода системы dnd5e, активности - это мощная система для определения действий, которые может выполнять предмет.

## 📍 **Где хранятся активности**

Активности хранятся в предметах в поле `system.activities`:

```javascript
// Структура предмета с активностями
item.system.activities = {
  "activityId1": { /* данные активности */ },
  "activityId2": { /* данные активности */ }
}
```

## 🎯 **Типы активностей (CONFIG.DND5E.activityTypes)**

```javascript
DND5E.activityTypes = {
  attack: { documentClass: AttackActivity },      // Атака оружием
  cast: { documentClass: CastActivity },          // Применение заклинания
  check: { documentClass: CheckActivity },        // Проверка характеристики
  damage: { documentClass: DamageActivity },      // Нанесение урона
  enchant: { documentClass: EnchantActivity },    // Зачарование предметов
  forward: { documentClass: ForwardActivity },    // Перенаправление действия
  heal: { documentClass: HealActivity },          // Лечение
  order: { documentClass: OrderActivity },        // Отдача приказа
  save: { documentClass: SaveActivity },          // Спасбросок
  summon: { documentClass: SummonActivity },      // Призыв существ
  transform: { documentClass: TransformActivity }, // Трансформация
  utility: { documentClass: UtilityActivity }     // Вспомогательные действия
}
```

## 🔧 **Методы создания активностей**

### **1. Через метод предмета:**
```javascript
// Создание новой активности
await item.createActivity(type, data, { renderSheet: true });

// Пример создания атаки
await item.createActivity("attack", {
  name: "Удар мечом",
  damage: { 
    parts: [["1d8 + @mod", "slashing"]] 
  }
});

// Пример создания заклинания
await item.createActivity("cast", {
  name: "Огненный шар",
  spell: { 
    uuid: "Compendium.dnd5e.spells.Item.abc123" 
  }
});
```

### **2. При создании предмета (автоматически):**
```javascript
// В ItemDataModel._onCreate
async onCreateActivities(data, options, userId) {
  // Если у предмета есть Cast активности, создаются кэшированные заклинания
  const spells = (await Promise.all(
    this.activities.getByType("cast").map(a => !a.cachedSpell && a.getCachedSpellData())
  )).filter(_ => _);
  
  if (spells.length) {
    this.parent.actor.createEmbeddedDocuments("Item", spells);
  }
}
```

### **3. Через обновление предмета:**
```javascript
// Прямое обновление поля activities
await item.update({
  [`system.activities.${activityId}`]: activityData
});
```

## 🗑️ **Методы удаления активностей**

### **1. Через метод предмета:**
```javascript
// Удаление активности по ID
await item.deleteActivity(activityId);

// Что происходит внутри:
async deleteActivity(id) {
  const activity = this.system.activities?.get(id);
  if (!activity) return this;
  
  // Закрываем все приложения связанные с активностью
  await Promise.allSettled(
    activity.constructor._apps.get(activity.uuid)?.map(a => a.close()) ?? []
  );
  
  // Удаляем активность из предмета
  return this.update({ [`system.activities.-=${id}`]: null });
}
```

### **2. При удалении предмета:**
```javascript
// В ItemDataModel._onDelete
onDeleteActivities(options, userId) {
  if ((userId !== game.user.id) || !this.parent.isEmbedded) return;
  
  // Очистка кэшированных заклинаний
  const spellIds = this.activities.getByType("cast")
    .map(a => a.cachedSpell?.id)
    .filter(_ => _);
    
  if (spellIds.length) {
    this.parent.actor.deleteEmbeddedDocuments("Item", spellIds);
  }
}
```

## 📊 **Полная структура данных активности**

```javascript
{
  // Базовые поля
  _id: "randomID()",           // Уникальный ID активности
  type: "attack",             // Тип активности
  name: "Название",          // Название активности
  img: "path/to/icon.svg",    // Иконка активности
  sort: 0,                   // Порядок сортировки
  
  // Активация
  activation: {
    type: "action",           // action, bonus, reaction, legendary, etc.
    cost: 1,                 // Стоимость действия
    condition: ""              // Условие активации
  },
  
  // Потребление ресурсов
  consumption: {
    targets: [],              // Цели потребления (uses, itemUses, etc.)
    spellSlot: true,         // Требует слот заклинания
    scaling: {
      allowed: false,        // Разрешить скалирование
      max: "formula"         // Формула максимума
    }
  },
  
  // Описание
  description: {
    chatFlavor: "Текст в чате"  // Описание для чата
  },
  
  // Длительность
  duration: {
    value: 1,                // Значение
    units: "minute",          // Единицы: round, minute, hour, day
    concentration: false       // Требует концентрацию
  },
  
  // Эффекты
  effects: [],                // Массив примененных эффектов
  
  // Дистанция
  range: {
    value: 5,                // Дистанция
    units: "ft",             // Единицы: ft, mile, self, touch
    override: false           // Переопределить стандартную дистанцию
  },
  
  // Цели
  target: {
    value: 1,                // Количество целей
    type: "creature",         // Тип цели
    prompt: true,             // Запрашивать цели
    override: false           // Переопределить стандартные цели
  },
  
  // Использования
  uses: {
    spent: 0,                // Потрачено использований
    max: "3",                // Максимум (формула или число)
    recovery: []              // Условия восстановления
  },
  
  // Видимость
  visibility: {
    requireAttunement: false,    // Требует настройки
    requireIdentification: false, // Требует идентификации
    requireMagic: false,        // Требует магический предмет
    level: {                   // Ограничения по уровню
      min: 0,
      max: 20
    }
  }
}
```

## 🔌 **Система полей активностей**

### **ActivitiesField:**
```javascript
class ActivitiesField extends MappingField {
  constructor(options) {
    super(new ActivityField(), options);
  }
  
  initialize(value, model, options) {
    const activities = Object.values(super.initialize(value, model, options));
    activities.sort((a, b) => a.sort - b.sort);
    return new ActivityCollection(model, activities);
  }
}
```

### **ActivityField:**
```javascript
class ActivityField extends foundry.data.fields.ObjectField {
  static recursive = true;
  
  getModel(value) {
    return CONFIG.DND5E.activityTypes[value.type]?.documentClass ?? null;
  }
}
```

## 🎯 **Практические примеры использования**

### **Создание меча с атакой:**
```javascript
const sword = await Item.create({
  name: "Длинный меч",
  type: "weapon",
  system: {
    activities: {
      "abc123": {
        _id: "abc123",
        type: "attack",
        name: "Удар",
        activation: { type: "action", cost: 1 },
        damage: {
          parts: [["1d8 + @mod", "slashing"]],
          versatile: "1d10 + @mod"
        },
        range: { value: 5, units: "ft" },
        target: { value: 1, type: "creature" }
      }
    }
  }
});
```

### **Создание свитка с заклинанием:**
```javascript
const scroll = await Item.create({
  name: "Свиток огненного шара",
  type: "consumable",
  system: {
    activities: {
      "def456": {
        _id: "def456",
        type: "cast",
        name: "Применить свиток",
        activation: { type: "action", cost: 1 },
        consumption: {
          targets: [{ type: "itemUses", target: "system.uses.value" }],
          spellSlot: false
        },
        spell: {
          uuid: "Compendium.dnd5e.spells.Item.fireball"
        }
      }
    }
  }
});
```

### **Программное использование активностей:**
```javascript
// Получение активностей предмета
const activities = item.system.activities;
const attackActivities = activities.getByType("attack");
const castActivities = activities.getByType("cast");

// Использование активности
const activity = attackActivities[0];
await activity.use(); // Выполнить активность

// Проверка доступности
if (activity.canUse) {
  console.log("Активность доступна для использования");
}
```

## 🚀 **Ключевые особенности системы**

1. **Гибкость** - каждая активность может иметь уникальные параметры
2. **Автоматизация** - создание кэшированных заклинаний для Cast активностей
3. **Интеграция** - seamless работа с чатом, эффектами и ресурсами
4. **Масштабируемость** - поддержка скалирования и потребления различных ресурсов
5. **Видимость** - тонкая настройка отображения для разных пользователей

## 📝️ **Рекомендации для разработки**

1. **Используйте типизированные классы** - каждая активность имеет свой класс
2. **Проверяйте canUse** - перед использованием активности
3. **Работайте с коллекциями** - используйте getByType() для фильтрации
4. **Обрабатывайте потребление** - правильно настраивайте uses/consumption
5. **Интегрируйте с чатом** - используйте стандартные шаблоны сообщений

Эта система позволяет создавать сложные и интерактивные предметы для D&D 5e в Foundry VTT!
