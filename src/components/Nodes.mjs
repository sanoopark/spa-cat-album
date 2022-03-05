import Component from "../core/Component.mjs";

export default class Nodes extends Component {
  render() {
    return `
      <div class="Node GoBack">
        <img src="./assets/prev.png" />
      </div>
      <div class="NodeWrapper">
        ${this.state.documents
          .map(({ id, name, type, filePath }) => {
            if (type === "DIRECTORY") {
              return `
                <div class="Node" data-id=${id} data-type=${type} data-name=${name}>
                  <img src="./assets/directory.png" data-path=${filePath} >
                  <div class="name">${name}</div>
                </div>
              `;
            }
            if (type === "FILE") {
              return `
                <div class="Node" data-id=${id} data-type=${type} data-filepath=${filePath} data-name=${name}>
                  <img src="./assets/file.png">
                  <div>${name}</div>
                </div>
              `;
            }
          })
          .join("")}
      </div>
    `;
  }

  setEvent() {
    const { openNode, goBack } = this.state;
    const $nodeWrapper = this.target.querySelector(".NodeWrapper");
    const $goBack = this.target.querySelector(".GoBack");
    $nodeWrapper.addEventListener("click", openNode);
    $goBack.addEventListener("click", goBack);
  }
}
