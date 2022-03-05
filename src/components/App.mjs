import Component from "../core/Component.mjs";
import Nodes from "./Nodes.mjs";
import ImageViewer from "./ImageViewer.mjs";
import { api } from "../api.mjs";
import { localStorage } from "../storage.mjs";
import Breadcrumb from "./Breadcrumb.mjs";
import Loading from "./Loading.mjs";
import { API_ERROR_MESSAGE } from "../contants.mjs";
import { documentCache } from "../cache.mjs";

export default class App extends Component {
  constructor(...args) {
    super(...args);

    const $main = this.target;
    const $breadcrumb = $main.querySelector(".Breadcrumb");
    const $nodes = $main.querySelector(".Nodes");

    this.breadcrumb = new Breadcrumb($breadcrumb, {
      path: [],
      openBreadcrumb: this.#openBreadcrumb.bind(this),
    });

    this.nodes = new Nodes($nodes, {
      documents: [],
      openNode: this.#openNode.bind(this),
      goBack: this.#goBack.bind(this),
    });

    this.imageViewer = new ImageViewer(document.body, {
      visible: false,
      filepath: null,
      setImageVisible: this.#setImageVisible.bind(this),
    });

    this.loading = new Loading(document.body, {
      isLoading: this.isLoading,
    });

    this.#setInitialData();
  }

  #setInitialData() {
    const path = localStorage.get("path");
    const documents = localStorage.get("documents");

    if (!documents) {
      this.#fetchDocuments("/");
      this.#setPath([]);
      return;
    }

    this.#setPath(path);
    this.#setDocuments(documents);
    this.#setDocumentCache("/", documents);
  }

  #fetchDocuments(id) {
    (async () => {
      this.#toggleLoading();

      const documentCacheData = documentCache[id];

      if (documentCacheData) {
        this.#setDocuments(documentCacheData);
        this.#toggleLoading();
        return;
      }

      const response = await api.fetchDocuments(id);

      if (response.isError) {
        alert(API_ERROR_MESSAGE);
        this.#toggleLoading();
        return;
      }

      this.#setDocuments(response.data);
      this.#setDocumentCache(id, response.data);
      this.#toggleLoading();
    })();
  }

  #setPath(newPath) {
    this.breadcrumb.setState({
      ...this.breadcrumb.state,
      path: newPath,
    });

    localStorage.set("path", newPath);
  }

  #toggleLoading() {
    this.loading.setState({
      ...this.loading.state,
      isLoading: !this.loading.state.isLoading,
    });
  }

  #setDocuments(data) {
    this.nodes.setState({ ...this.nodes.state, documents: data });
    localStorage.set("documents", data);
  }

  #setDocumentCache(key, value) {
    documentCache[key] = value;
  }

  #openNode({ target }) {
    const $node = target.closest(".Node");

    if (!$node) return;

    const { id, type, filepath, name } = $node.dataset;
    const isCacheAvailable = documentCache.hasOwnProperty(id);

    switch (type) {
      case "FILE":
        this.#setImageVisible(true, filepath);
        break;
      case "DIRECTORY":
        isCacheAvailable
          ? this.#setDocuments(documentCache[id])
          : this.#fetchDocuments(id);
        this.#setPath([...this.breadcrumb.state.path, [id, name]]);
        break;
    }
  }

  #setImageVisible(bool, filepath = null) {
    this.imageViewer.setState({
      ...this.imageViewer.state,
      visible: bool,
      filepath,
    });
  }

  #openBreadcrumb({ target }) {
    const $path = target.closest(".Path");

    if (!$path) return;

    const pathId = $path.dataset.id;

    const indexOfTargetPath = this.breadcrumb.state.path.findIndex(
      ([id, _]) => id === pathId
    );
    const newPath = this.breadcrumb.state.path.slice(0, indexOfTargetPath + 1);

    this.#setPath(newPath);
    this.#fetchDocuments(pathId);
  }

  #goBack() {
    const newPath = this.breadcrumb.state.path.slice(0, -1);
    this.#setPath(newPath);

    if (newPath.length === 0) {
      const rootDocumentsCache = documentCache["/"];
      rootDocumentsCache
        ? this.#setDocuments(rootDocumentsCache)
        : this.#fetchDocuments("/");
      return;
    }

    const parentId = newPath[newPath.length - 1][0];

    this.#isCacheAvailable(parentId)
      ? this.#setDocuments(documentCache[parentId])
      : this.#fetchDocuments(parentId);
  }

  #isCacheAvailable(id) {
    return documentCache.hasOwnProperty(id);
  }

  render() {
    return `
      <nav class="Breadcrumb"></nav>
      <div class="Nodes"></div>
    `;
  }
}
