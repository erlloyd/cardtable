import { Vector2d } from "konva/types/types";
import * as React from "react";
import { Component } from "react";
import "./TopLayer.scss";

interface IProps {
  position: Vector2d;
  completed: () => void;
}

class TopLayer extends Component<IProps> {
  render() {
    const containerStyle: React.CSSProperties = {
      top: `${this.props.position.y + 8}px`,
      left: `${this.props.position.x + 8}px`,
    };
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
          onClick={this.props.completed}
        >
          {this.props.children}
        </div>
      </div>
    );
  }

  private preventDefault = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    event.preventDefault();
  };
}

export default TopLayer;
