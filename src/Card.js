// This is better mainly because it uses no external dependencies.
import React from 'react';
import { PureComponent } from 'react';
import styled from 'styled-components';
import { DraggableCore } from 'react-draggable';
import { createSelectable } from 'react-selectable';

const SelectableDraggableCore = createSelectable(DraggableCore);

const CardDiv = styled.div`
opacity: ${ props => props.ghost ? '0.5' : '1'}
border: ${ props => props.selected ? 'solid 3px green' : 'solid 1px black'};
position: absolute;
background: ${ props => props.exhausted ? 'blue' : 'red'};
width: 150px;
height: 200px;
${props => props.rotating ? 'transition: transform 0.2s linear;' : ''}
transform: translate(${props => props.dx}px, ${props => props.dy}px) rotate(${ props => props.exhausted ? '90deg' : '0deg'});
z-index: ${props => props.dragging ? '1000' : '0'};
`;

export class Card extends PureComponent {

  handleStart = (event, draggableData) => {
    this.props.handleStart(this.props.id, draggableData);
    event.stopPropagation();
  }

  handleDrag = (event, draggableData) => {
    this.props.handleDrag(this.props.id, draggableData);
  }

  handleStop = (event, draggableData) => {
    this.props.handleStop(this.props.id);
    event.stopPropagation();
  }

  handleDblClick = () => {
    if (!this.props.wasDragged) {
      this.props.onClick(this.props.id);
      setTimeout(() => {
        this.props.onClickCompleted(this.props.id);
      }, 200);
    }
  }

  handleClick = (event) => {
    event.stopPropagation();
  }

  render() {

    const ghostCard = this.props.dragging ? 
      <CardDiv
        dragging={false}
        ghost={true}
        dx={this.props.objectStartPosition.x}
        dy={this.props.objectStartPosition.y}
        exhausted={this.props.exhausted}
        rotating={this.props.rotating}
        onDoubleClick={()=> {}}>
      </CardDiv>
      :
      null;

    return (
      <div>
        <SelectableDraggableCore
          selectableKey={this.props.selectableKey}
          onStart={this.handleStart}
          onStop={this.handleStop}
          onDrag={this.handleDrag}>
          <CardDiv
            selected={this.props.selected}
            draggable={!this.props.dragging}
            dragging={this.props.dragging}
            dx={this.props.x}
            dy={this.props.y}
            exhausted={this.props.exhausted}
            rotating={this.props.rotating}
            onDoubleClick={this.handleDblClick}
            onClick={this.handleClick}>
            Hi There
          </CardDiv>
        </SelectableDraggableCore>
        {ghostCard}
      </div>
    );
  }
};
