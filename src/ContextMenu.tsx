import { Vector2d } from "konva/types/types";
import * as React from "react";
import { Component } from "react";

export interface ContextMenuItem {
  label: string;
  action: () => void;
}

interface IProps {
  position: Vector2d;
  items: ContextMenuItem[];
  contextItemClicked?: (item: ContextMenuItem) => void;
  hideContextMenu: () => void;
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
        onContextMenu={this.preventDefault}
        onClick={this.props.hideContextMenu}
      >
        <div
          className="context-menu"
          style={menuStyle}
          onContextMenu={this.preventDefault}
          onClick={this.props.hideContextMenu}
        >
          {this.props.items.map((i, index) => (
            <div key={`context-menu-item-${index}`}>
              <button
                className="context-menu-item"
                onContextMenu={this.preventDefault}
                onClick={this.handleContextItemClicked(i)}
              >
                {i.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  private preventDefault = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    event.preventDefault();
  };

  private handleContextItemClicked = (item: ContextMenuItem) => () => {
    item.action();
    if (!!this.props.contextItemClicked) {
      this.props.contextItemClicked(this.props.items[0]);
    }
    this.props.hideContextMenu();
  };
}

export default ContextMenu;
