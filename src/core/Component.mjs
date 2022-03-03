export default class Component {
  constructor(target, props) {
    this.target = target;
    this.state = props;
    this.template();
    this.setEvent();
  }

  template() {
    this.target.innerHTML = this.render();
  }

  render() {
    return "";
  }

  setEvent() {}

  setState(newState) {
    this.state = newState;
    this.template();
    this.setEvent();
  }
}
