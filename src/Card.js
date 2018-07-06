// This is better mainly because it uses no external dependencies.
import React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { DraggableCore } from 'react-draggable';

const SLOPPY_THRESHOLD = 3; // pixels

const CardDiv = styled.div`
opacity: ${ props => props.ghost ? '0.5' : '1'}
border: solid 1px black;
position: absolute;
background: ${ props => props.exhausted ? 'blue' : 'red'};
width: 150px;
height: 200px;
${props => props.rotating ? 'transition: transform 0.2s linear;' : ''}
transform: translate(${props => props.dx}px, ${props => props.dy}px) rotate(${ props => props.exhausted ? '90deg' : '0deg'});
z-index: ${props => props.dragging ? '1000' : '0'};
`;

export class Card extends Component {
  wasDragged = false;
  dragStartPos = {
    x: 0,
    y: 0,
  };

  objectStartPosition = {
    x: 0,
    y: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      dx: props.initialOffsetX || 0,
      dy: props.initialOffsetY || 0,
      activelyDragging: false,
    };
  }

  handleStart = (event, draggableData) => {
    this.wasDragged = false;
    this.dragStartPos = {
      x: draggableData.x,
      y: draggableData.y,
    }

    this.objectStartPosition = {
      x: this.state.dx,
      y: this.state.dy,
    }

    this.setState({
      activelyDragging: false,
    });
  }

  handleDrag = (event, draggableData) => {
    let dragging = this.state.activelyDragging;
    if (
      draggableData.x - this.dragStartPos.x > SLOPPY_THRESHOLD ||
      draggableData.y - this.dragStartPos.y > SLOPPY_THRESHOLD ||
      this.dragStartPos.x - draggableData.x > SLOPPY_THRESHOLD ||
      this.dragStartPos.y - draggableData.y > SLOPPY_THRESHOLD
    ) {
      this.wasDragged = true;
      dragging = true;
    }

    this.setState({
      dx: this.state.dx + draggableData.deltaX,
      dy: this.state.dy + draggableData.deltaY,
      activelyDragging: dragging,
    })
  }

  handleStop = () => {
   this.setState({
     activelyDragging: false,
     dx: this.wasDragged ? this.state.dx : this.objectStartPosition.x,
     dy: this.wasDragged ? this.state.dy : this.objectStartPosition.y,
   });
  }

  handleClick = () => {
    if (!this.wasDragged) {
      this.props.onClick(this.props.id);
      setTimeout(() => {
        this.props.onClickCompleted(this.props.id);
      }, 200);
    }
  }

  render() {

    const ghostCard = this.state.activelyDragging ? 
      <CardDiv
        dragging={false}
        ghost={true}
        dx={this.objectStartPosition.x}
        dy={this.objectStartPosition.y}
        exhausted={this.props.exhausted}
        rotating={this.props.rotating}
        onDoubleClick={()=> {}}>
      </CardDiv>
      :
      null;

    return (
      <div>
        <DraggableCore 
          onStart={this.handleStart}
          onStop={this.handleStop}
          onDrag={this.handleDrag}>
          <CardDiv
            dragging={this.state.activelyDragging}
            dx={this.state.dx}
            dy={this.state.dy}
            exhausted={this.props.exhausted}
            rotating={this.props.rotating}
            onDoubleClick={this.handleClick}>
            Hi There
          </CardDiv>
        </DraggableCore>
        {ghostCard}
      </div>
    );
  }
};
