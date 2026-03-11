import { RecipeManager } from "./recipeManager.js";

export class CraftingTooltips {
    constructor(app) {
        this.app = app;
        this.activeTooltip = null;
        this.activeSlot = null;
    }

    activateListeners(html) {
        html.on('mouseenter', '.item-slot, .result-slot', this._onMouseEnter.bind(this));
        html.on('mouseleave', '.item-slot, .result-slot', this._onMouseLeave.bind(this));
        html.on('mousemove', '.item-slot, .result-slot', this._onMouseMove.bind(this));
    }

    async _onMouseEnter(event) {
        const target = event.currentTarget;
        const uuid = target.dataset.uuid;
        const categoryId = target.dataset.categoryId;
        const itemName = target.dataset.name;
        
        if (!uuid && !categoryId) return; 
        if (this.activeSlot === target) return;

        this.activeSlot = target;
        let itemData = null;

        if (uuid) {
            itemData = await RecipeManager.findItemDataInCompendiums(uuid);
        }

        const newTooltip = document.createElement('div');
        newTooltip.className = 'bmc-craft-tooltip';

        if (itemData) {
            const rarity = itemData.system?.rarity || "common";
            newTooltip.classList.add(`rarity-${rarity.toLowerCase()}`);

            let rawDescription = itemData.system?.description?.value || "<i>Нет описания</i>";
            let enrichedDesc = await TextEditor.enrichHTML(rawDescription, { async: true });

            newTooltip.innerHTML = `
                <div class="tooltip-header">
                    <img class="tooltip-image" src="${itemData.img}" alt="${itemData.name}">
                    <div class="tooltip-info">
                        <div class="item-name">${itemData.name}</div>
                        <div class="item-type">Предмет - ${rarity}</div>
                    </div>
                </div>
                <div class="item-description foundry-enriched">${enrichedDesc}</div>
            `;
        } else if (categoryId) {
            const catName = itemName || (this.app._getCategoryName ? this.app._getCategoryName(categoryId) : categoryId);
            newTooltip.classList.add(`rarity-common`);
            newTooltip.innerHTML = `
                <div class="tooltip-header">
                    <img class="tooltip-image" src="icons/svg/item-bag.svg">
                    <div class="tooltip-info">
                        <div class="item-name">${catName}</div>
                        <div class="item-type">Категория ингредиентов</div>
                    </div>
                </div>
                <div class="item-description foundry-enriched">
                    <p>Для создания подойдет <strong>любой</strong> предмет, относящийся к этой категории.</p>
                </div>
            `;
        } else {
            return;
        }

        this._removeTooltip();
        this.activeTooltip = newTooltip;
        document.body.appendChild(this.activeTooltip);
        this._updateTooltipPosition(event);

        requestAnimationFrame(() => {
            if (this.activeTooltip) this.activeTooltip.classList.add('active');
        });
    }

    _onMouseLeave() {
        this._removeTooltip();
    }

    _onMouseMove(event) {
        this._updateTooltipPosition(event);
    }

    _updateTooltipPosition(event) {
        if (!this.activeTooltip) return;
        const tooltipRect = this.activeTooltip.getBoundingClientRect();
        let left = event.clientX + 15;
        let top = event.clientY + 15;
        if (left + tooltipRect.width > window.innerWidth) left = event.clientX - tooltipRect.width - 15;
        if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 10;
        this.activeTooltip.style.left = `${left}px`;
        this.activeTooltip.style.top = `${top}px`;
    }

    _removeTooltip() {
        if (this.activeTooltip && this.activeTooltip.parentNode) {
            this.activeTooltip.parentNode.removeChild(this.activeTooltip);
        }
        this.activeTooltip = null;
        this.activeSlot = null;
    }
}
