import { Vector2d } from "konva/types/types";
import * as React from "react";
import { Component } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import NestedMenuItem from "material-ui-nested-menu-item";

export interface ContextMenuItem {
  label: string;
  action?: () => void;
  children?: ContextMenuItem[];
}

interface IProps {
  position: Vector2d;
  items: ContextMenuItem[];
  contextItemClicked?: (item: ContextMenuItem) => void;
  hideContextMenu: () => void;
}

interface IState {
  menuOpen: boolean;
}

class ContextMenu extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      menuOpen: true,
    };
  }

  render() {
    return (
      <div
        id="context-menu-layer"
        onContextMenu={this.preventDefault}
        onClick={this.props.hideContextMenu}
      >
        <Menu
          keepMounted
          open={this.state.menuOpen}
          onClose={this.handleMenuClosed}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: this.props.position.y + 8,
            left: this.props.position.x + 8,
          }}
        >
          {this.props.items.map((i, index) => this.renderMenuItem(i, index))}
        </Menu>
      </div>
    );
  }

  private renderMenuItem = (i: ContextMenuItem, index: number) => {
    return !!i.children ? (
      <NestedMenuItem
        key={`contextMenu-item-${index}`}
        parentMenuOpen={this.state.menuOpen}
        label={i.label}
      >
        {i.children.map((nestedI, nestedIndex) => {
          return this.renderMenuItem(nestedI, index * 1000 + nestedIndex);
        })}
      </NestedMenuItem>
    ) : (
      <MenuItem
        key={`contextMenu-item-${index}`}
        onClick={this.handleContextItemClicked(i)}
      >
        {i.label}
      </MenuItem>
    );
  };

  private handleMenuClosed = () => {
    this.setState({
      menuOpen: false,
    });
    this.props.hideContextMenu();
  };
  private preventDefault = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    event.preventDefault();
  };

  private handleContextItemClicked = (item: ContextMenuItem) => () => {
    if (!!item.action) {
      item.action();
    }
    if (!!this.props.contextItemClicked) {
      this.props.contextItemClicked(this.props.items[0]);
    }
    if (!!item.action) {
      this.props.hideContextMenu();
    }
  };
}

export default ContextMenu;
