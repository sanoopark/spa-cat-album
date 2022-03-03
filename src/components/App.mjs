import Component from "../core/Component.mjs";
import Nodes from "./Nodes.mjs";
import ImageViewer from "./ImageViewer.mjs";
import { api } from "../api.mjs";
import { localStorage } from "../storage.mjs";
import Breadcrumb from "./Breadcrumb.mjs";
import Loading from "./Loading.mjs";
import { API_ERROR_MESSAGE } from "../contants.mjs";
import { cache } from "../cache.mjs";

export default class App extends Component {
  isLoading = false;

  constructor(...args) {
    super(...args);

    const $main = this.target;
    const $breadcrumb = $main.querySelector(".Breadcrumb");
    const $nodes = $main.querySelector(".Nodes");

    this.breadcrumb = new Breadcrumb($breadcrumb, {
      path: [],
      openBreadcrumb: this.openBreadcrumb.bind(this),
    });

    this.nodes = new Nodes($nodes, {
      documents: [],
      openNode: this.openNode.bind(this),
      goBack: this.goBack.bind(this),
    });

    this.imageViewer = new ImageViewer(document.body, {
      visible: false,
      filepath: null,
      closeModal: this.closeModal.bind(this),
    });

    this.loading = new Loading(document.body, {
      isLoading: this.isLoading,
    });

    this.mounted();
  }

  mounted() {
    const path = localStorage.get("path");
    const documents = localStorage.get("documents");

    if (path) {
      this.breadcrumb.setState({
        ...this.breadcrumb.state,
        path,
      });
    }

    if (documents) {
      this.nodes.setState({ ...this.nodes.state, documents });
      return;
    }
    this.fetchDocuments("/");
  }

  render() {
    return `
      <nav class="Breadcrumb"></nav>
      <div class="Nodes"></div>
    `;
  }

  openNode({ target }) {
    if (!target.closest(".Node")) return;

    const { id, type, filepath, name } = target.closest(".Node").dataset;

    if (type === "FILE") {
      this.imageViewer.setState({
        ...this.imageViewer.state,
        visible: true,
        filepath,
      });
      return;
    }

    if (cache.hasOwnProperty(id)) {
      this.nodes.setState({ ...this.nodes.state, documents: cache[id] });
      localStorage.set("documents", cache[id]);
    } else {
      this.fetchDocuments(id);
    }

    const path = [...this.breadcrumb.state.path, [id, name]];

    this.breadcrumb.setState({
      ...this.breadcrumb.state,
      path,
    });

    localStorage.set("path", path);
  }

  fetchDocuments(id) {
    (async () => {
      this.loading.setState({ ...this.loading.state, isLoading: true });
      const documentsCache = cache[id];

      if (documentsCache) {
        this.nodes.setState({ ...this.nodes.state, documents: documentsCache });
        localStorage.set("documents", documentsCache);
        this.loading.setState({ ...this.loading.state, isLoading: false });
        return;
      }

      const response = await api.fetchDocuments(id);

      if (response.isError) {
        alert(API_ERROR_MESSAGE);
        this.loading.setState({ ...this.loading.state, isLoading: false });
        return;
      }

      this.nodes.setState({ ...this.nodes.state, documents: response.data });
      localStorage.set("documents", response.data);
      cache[id] = response.data;
      this.loading.setState({ ...this.loading.state, isLoading: false });
    })();
  }

  closeModal() {
    this.imageViewer.setState({
      ...this.imageViewer.state,
      visible: false,
    });
  }

  openBreadcrumb({ target }) {
    if (!target.closest(".Path")) return;

    const { id: pathId } = target.closest(".Path").dataset;

    const clickedPathIndex = this.breadcrumb.state.path.findIndex(
      ([id, _]) => id === pathId
    );

    const path = this.breadcrumb.state.path.slice(0, clickedPathIndex + 1);

    this.breadcrumb.setState({
      ...this.breadcrumb.state,
      path,
    });

    localStorage.set("path", path);
    this.fetchDocuments(pathId);
  }

  goBack() {
    const path = this.breadcrumb.state.path.slice(0, -1);

    this.breadcrumb.setState({
      ...this.breadcrumb.state,
      path,
    });

    localStorage.set("path", path);

    if (path.length) {
      const parentId = path[path.length - 1][0];

      if (!cache.hasOwnProperty(parentId)) {
        this.fetchDocuments(parentId);
        return;
      }

      this.nodes.setState({ ...this.nodes.state, documents: cache[parentId] });
      localStorage.set("documents", cache[parentId]);

      return;
    }

    const rootDocumentsCache = cache["/"];

    if (!rootDocumentsCache) {
      this.fetchDocuments("/");
      return;
    }

    this.nodes.setState({
      ...this.nodes.state,
      documents: rootDocumentsCache,
    });

    localStorage.set("documents", rootDocumentsCache);
  }
}
