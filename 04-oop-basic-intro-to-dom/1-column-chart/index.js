export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.value = value;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading(value);
    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    if (this.data.length === 0) {
      element
        .querySelector(".column-chart")
        .classList.add("column-chart_loading");
    }
    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  getTemplate() {
    return `
    <div class="column-chart" style="--chart-height:${this.chartHeight} ">
      <div class="column-chart__title">
        Total ${this.label}
        <a href="/${this.label}" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${
          this.formatHeading
        }</div>
        <div data-element="body" class="column-chart__chart">
        ${this.renderColumn(this.data)}
        </div>
      </div>
    </div>
    `;
  }

  renderColumn(data) {
    let result = "";
    if (data.length === 0) {
      return result;
    }
    for (let dataItem of this.getColumnProps(data)) {
      result += `<div style="--value: ${dataItem.value}" data-tooltip="${dataItem.percent}"></div>`;
    }
    return result;
  }

  update(newData) {
    const newColum = this.element.querySelector(".column-chart__chart");
    newColum.innerHTML = this.renderColumn(newData);
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }
}
