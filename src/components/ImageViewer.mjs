import Component from "../core/Component.mjs";

export default class ImageViewer extends Component {
  template() {
    // Method Overriding for Modal
    this.target.insertAdjacentHTML("afterbegin", this.render());
  }

  render() {
    const { visible, filepath } = this.state;

    if (!visible) {
      this.target.querySelector(".ImageViewer")?.remove();
      return "";
    }

    return `
      <div class="Modal ImageViewer">
        <div class="content">
        <img src=https://fe-dev-matching-2021-03-serverlessdeploymentbuck-t3kpj3way537.s3.ap-northeast-2.amazonaws.com/public${filepath}>
      </div>
    `;
  }

  setEvent() {
    const $modal = this.target;

    $modal.addEventListener("click", ({ target }) => {
      const isOverlayClicked = target.className === "Modal ImageViewer";

      if (isOverlayClicked) {
        this.state.setImageVisible(false);
      }
    });

    document.addEventListener("keyup", (e) => {
      e.stopImmediatePropagation();

      if (e.key === "Escape") {
        this.state.setImageVisible(false);
      }
    });
  }
}
