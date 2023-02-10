import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  chartHeight = 50;

  constructor({
    url = "",
    range = { from: new Date(), to: new Date() },
    label = "",
    value = 0,
    link = "",
    data = [],
    formatHeading = (data) => data,
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.data = data;
    this.formatHeading = formatHeading;

    this.render();
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnCharts()}
          </div>
        </div>
      </div>
    `;
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  getColumnCharts() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    return this.data
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0);
        return `<div style="--value: ${Math.floor(
          item * scale
        )}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.update(this.range.from, this.range.to);
  }

  async update(from, to) {
    this.element.classList.add("column-chart_loading");
    const startInput = from.toISOString().split("T")[0];
    const endInput = to.toISOString().split("T")[0];
    const url = new URL(
      `${BACKEND_URL}/${this.url}?from=${startInput}&to=${endInput}`
    );

    const response = await fetchJson(url.href);
    this.data = Object.values(response);
    const value = this.data.reduce((acc, value) => (acc += value), 0);
    this.subElements.header.innerHTML = this.formatHeading(Number(value));
    this.subElements.body.innerHTML = this.getColumnCharts(this.data);
    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
    return response;
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
}
