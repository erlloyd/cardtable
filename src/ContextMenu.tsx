import { Vector2d } from "konva/types/types";
import * as React from "react";
import { Component } from "react";

export type ContextMenuItem = string;

interface IProps {
  position: Vector2d;
  items: ContextMenuItem[];
  contextItemClicked?: (item: ContextMenuItem) => void;
}

class ContextMenu extends Component<IProps> {
  render() {
    const menuStyle: React.CSSProperties = {
      top: `${this.props.position.y + 8}px`,
      left: `${this.props.position.x + 8}px`,
    };

    return (
      <div
        id="context-menu-layer"
        onClick={this.handleContextItemClicked}
        onContextMenu={this.preventDefault}
      >
        <div
          className="context-menu"
          style={menuStyle}
          onContextMenu={this.preventDefault}
        >
          {this.props.items.map((i, index) => (
            <div
              key={`context-menu-item-${index}`}
              className="context-menu-item"
            >
              {i}
            </div>
          ))}
        </div>
      </div>
    );
  }

  private preventDefault = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
  };

  private handleContextItemClicked = () => {
    if (!!this.props.contextItemClicked) {
      this.props.contextItemClicked("dummy");
    }
  };
}

export default ContextMenu;
