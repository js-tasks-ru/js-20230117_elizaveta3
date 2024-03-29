import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  constructor(
    headerConfig = [],
    {
      url = "",
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },

      isSortLocally = false,
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.loadRange = 10;
    this.params = {
      start: 0,
      end: this.loadRange,
    };
    this.isLoading = false;
    this.scrollBorderY = 300;

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

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initEventListener();
    if (this.sorted.id) {
      await this.sort(this.sorted.id, this.sorted.order);
    } else {
      await this.loadData();
    }
  }

  initEventListener() {
    window.addEventListener("scroll", this.populate);

    this.subElements.header.addEventListener(
      "pointerdown",
      this.sortOnColumnClick
    );
  }

  sortOnColumnClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');
    if (!column) return;
    const fieldValue = column.dataset.id;
    const orderValue = column.dataset.order === "desc" ? "asc" : "desc";
    this.sort(fieldValue, orderValue);
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    window.removeEventListener("scroll", this.populate);
  }

  renderData() {
    this.subElements.body.innerHTML = this.getBody();
  }

  async sort(fieldValue, orderValue = "asc") {
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      await this.sortOnServer(fieldValue, orderValue);
    }

    this.subElements.header
      .querySelectorAll("[data-order]")
      .forEach((element) => {
        element.removeAttribute("data-order");
      });
    this.subElements.header
      .querySelector('[data-id="' + fieldValue + '"]')
      .setAttribute("data-order", orderValue);
  }

  sortOnClient(fieldValue, orderValue = "asc") {
    this.sortData(fieldValue, (orderValue = "asc"));
    this.renderData();
  }

  sortData(fieldValue, orderValue = "asc") {
    const directions = {
      asc: 1,
      desc: -1,
    };
    const order = directions[orderValue];
    if (order === undefined) throw `There is no order for ${orderValur}`;
    const sortType = this.headerConfig
      .filter((column) => column.sortable)
      .find((item) => item.id === fieldValue);

    return [...this.data].sort((a, b) => {
      switch (sortType) {
        case "number":
          return a - b;
        case "string":
          return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
        case "date":
          return new Date(a) - new Date(b);
        default:
          throw new Error(`Неизвестный тип сортировки ${sortType}`);
      }
    });
  }

  async sortOnServer(id, order) {
    this.params.id = id;
    this.params.order = order;
    if (id) this.url.searchParams.set("_sort", id);
    if (order) this.url.searchParams.set("_order", order);
    this.params.start = 0;
    this.params.end = this.loadRange;

    await this.loadData();
    return this.data;
  }

  async loadData() {
    this.url.searchParams.set("_start", this.params.start);
    this.url.searchParams.set("_end", this.params.end);

    try {
      const response = await fetchJson(this.url);
      this.data = response;
      this.renderData();
      return response;
    } catch (err) {
      console.error(err);
    }
  }

  async loadDataPopulate() {
    try {
      const response = await fetchJson(this.url);
      this.data = this.data.concat(response);
      this.renderData();
      this.isLoading = false;
    } catch (err) {
      console.error(err);
    }
  }

  populate = async () => {
    const windowRelativeBottom =
      document.documentElement.getBoundingClientRect().bottom;
    if (
      windowRelativeBottom <
        document.documentElement.clientHeight + this.scrollBorderY &&
      !this.isLoading &&
      !this.isSortLocally
    ) {
      this.isLoading = true;
      this.params.start += this.loadRange;
      this.params.end += this.loadRange;
      this.url.searchParams.set("_start", this.params.start);
      this.url.searchParams.set("_end", this.params.end);
      if (this.params.id) this.url.searchParams.set("_sort", this.params.id);
      if (this.params.order)
        this.url.searchParams.set("_order", this.params.order);

      await this.loadDataPopulate();
    }
  };
}
