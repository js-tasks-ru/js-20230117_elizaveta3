export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table">
    <div data-element="header" class="sortable-table__header sortable-table__row">
${this.getHeader()}
    </div>
    <div data-element="body" class="sortable-table__body">
${this.getBody()}
    </div>
    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>
  </div>
</div>
    `;
  }

  getHeader() {
    return this.headerConfig
      .map((item) => {
        return `<div class="sortable-table__cell" data-id="${
          item.id
        }" data-sortable="${item.sortable}">
    <span>${item.title}</span>
    ${this.getArrow(item)}
  </div>`;
      })
      .join("");
  }

  getArrow(item) {
    return item.sortable
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
      <span class="sort-arrow"></span>
    </span>`
      : "";
  }

  getBody() {
    return this.data
      .map((item) => {
        const subItems = this.headerConfig
          .map((elem) => {
            if (elem.template) return elem.template(item.images);
            return `<div class="sortable-table__cell">${item[elem.id]}</div>`;
          })
          .join("");

        return `<a href="/products/${item.id}" class="sortable-table__row">
				${subItems}
			</a>`;
      })
      .join("");
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const elem of elements) {
      const name = elem.dataset.element;
      result[name] = elem;
    }
    return result;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  sort(fieldValue, orderValue) {
    let funcCompare;
    let rule = "st";
    for (const column of this.headerConfig) {
      if (column.id === fieldValue && column.sortable) {
        rule = column.sortType;
      }
    }

    if (rule === "number") {
      funcCompare = compareNumber;
    }
    if (rule === "string") {
      funcCompare = compareString;
    }
    if (rule === "date") {
      funcCompare = compareDate;
    }

    this.data.sort((a, b) => {
      if (orderValue === "asc") {
        return funcCompare(a[fieldValue], b[fieldValue]);
      }
      if (orderValue === "desc") {
        return funcCompare(b[fieldValue], a[fieldValue]);
      }
    });

    function compareNumber(a, b) {
      return a - b;
    }
    function compareString(a, b) {
      return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
    }
    function compareDate(a, b) {
      new Date(a) - new Date(b);
    }

    this.subElements.header.innerHTML = this.getHeader();
    this.subElements.body.innerHTML = this.getBody();
  }
}
