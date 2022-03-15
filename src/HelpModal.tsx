interface IProps {
  open: boolean;
}

const HelpModal = (props: IProps) => {
  return props.open ? <div>MODAL</div> : null;
};

export default HelpModal;
