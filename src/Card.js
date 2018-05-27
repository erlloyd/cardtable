// This is better mainly because it uses no external dependencies.
import React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { DraggableCore } from 'react-draggable';

const SLOPPY_THRESHOLD = 10; // pixels

const CardDiv = styled.div`
border: solid 1px black;
position: absolute;
background: ${ props => props.exhausted ? 'blue' : 'red'};
width: 100px;
height: 200px;
${props => props.rotating ? 'transition: transform 0.2s linear' : ''}
transform: translate(${props => props.dx}px, ${props => props.dy}px) rotate(${ props => props.exhausted ? '90deg' : '0deg'});
`;

export class Card extends Component {
  wasDragged = false;

  dragStartPos = {
    x: 0,
    y: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      dx: props.initialOffsetX || 0,
      dy: props.initialOffsetY || 0
    };
  }

  handleStart = (event, draggableData) => {
    this.wasDragged = false;
    this.dragStartPos = {
      x: draggableData.x,
      y: draggableData.y,
    }
  }

  handleDrag = (event, draggableData) => {
    console.log(draggableData);
    console.log(`${draggableData.deltaX}, ${draggableData.deltaY}`);
    if (
      draggableData.x - this.dragStartPos.x > SLOPPY_THRESHOLD ||
      draggableData.y - this.dragStartPos.y > SLOPPY_THRESHOLD ||
      this.dragStartPos.x - draggableData.x > SLOPPY_THRESHOLD ||
      this.dragStartPos.y - draggableData.y > SLOPPY_THRESHOLD
    ) {
      console.log('we dragged, yall');
      this.wasDragged = true;
    }

    this.setState({
      dx: this.state.dx + draggableData.deltaX,
      dy: this.state.dy + draggableData.deltaY,
    })
  }

  handleClick = () => {
    console.log('handleClick');
    if (!this.wasDragged) {
      this.props.onClick(this.props.id);
      setTimeout(() => {
        this.props.onClickCompleted(this.props.id);
      }, 200);
    }
  }

  render() {
    console.log('exhausted? ' + this.props.exhausted);
    console.log('rotating? ' + this.props.rotating);
    return (
    <DraggableCore 
      onStart={this.handleStart}
      onDrag={this.handleDrag}>
      <CardDiv
        dx={this.state.dx}
        dy={this.state.dy}
        exhausted={this.props.exhausted}
        rotating={this.props.rotating}
        onClick={this.handleClick}>
        Hi There
      </CardDiv>
    </DraggableCore>
    );
  }
};
