import { Vector2d } from "konva/types/types";
import * as React from "react";
import { Component } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

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
    return (
      <div
        id="context-menu-layer"
        onContextMenu={this.preventDefault}
        onClick={this.props.hideContextMenu}
      >
        <Menu
          keepMounted
          open={true}
          onClose={this.props.hideContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: this.props.position.y + 8,
            left: this.props.position.x + 8,
          }}
        >
          {this.props.items.map((i, index) => (
            <MenuItem onClick={this.handleContextItemClicked(i)}>
              {i.label}
            </MenuItem>
          ))}
        </Menu>
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
