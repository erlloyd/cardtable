import { Vector2d } from "konva/lib/types";
import * as React from "react";
import { Component } from "react";
import "./TopLayer.scss";

interface IProps {
  trasparentBackground?: boolean;
  offsetContent?: boolean;
  position: Vector2d;
  completed: () => void;
  children?: React.ReactNode;
}

class TopLayer extends Component<IProps> {
  render() {
    const offset = this.props.offsetContent ? 8 : 0;
    const containerStyle: React.CSSProperties = {
      top: `${this.props.position.y + offset}px`,
      left: `${this.props.position.x + offset}px`,
    };

    if (!this.props.trasparentBackground) {
      containerStyle.backgroundColor = "white";
    }

    return (
      <div
        id="top-layer"
        onClick={this.props.completed}
        onContextMenu={this.preventDefault}
      >
        <div
          className="top-layer-content-wrapper"
          style={containerStyle}
          onContextMenu={this.preventDefault}
          onClick={this.handleClick}
          onKeyDown={this.preventDefault}
          onKeyUp={this.preventDefault}
        >
          {this.props.children}
        </div>
      </div>
    );
  }

  private handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    this.props.completed();
  };

  private preventDefault = (event: any) => {
    event.preventDefault();
  };
}

export default TopLayer;
