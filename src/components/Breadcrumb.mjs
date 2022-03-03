import Component from "../core/Component.mjs";

export default class Breadcrumb extends Component {
  render() {
    return `
      <div class="Path" data-id="/">root</div>
      ${this.state.path
        .map(([id, name]) => `<div class="Path" data-id=${id}>${name}</div>`)
        .join("")}`;
  }

  setEvent() {
    const { openBreadcrumb } = this.state;
    this.target.addEventListener("click", openBreadcrumb);
  }
}
