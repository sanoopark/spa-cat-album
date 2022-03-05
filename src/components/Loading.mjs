import Component from "../core/Component.mjs";

export default class Loading extends Component {
  template() {
    // Method Overriding for Modal
    this.target.insertAdjacentHTML("afterbegin", this.render());
  }

  render() {
    const { isLoading } = this.state;

    if (!isLoading) {
      this.target.querySelector(".Loading")?.remove();
      return "";
    }

    return `
      <div class="Modal Loading">
        <div class="content">
          <img src="./assets/nyan-cat.gif" />
        </div>
      </div>
    `;
  }
}
