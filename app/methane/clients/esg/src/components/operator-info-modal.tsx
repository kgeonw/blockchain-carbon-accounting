import { FC } from "react";
import Modal from "react-bootstrap/Modal";
import type { Operator } from '@blockchain-carbon-accounting/data-postgres/src/models/oilAndGasAsset';

type OperatorInfoModalProps = {
  show:boolean
  operator:Operator
  onHide:()=>void 
}
const OperatorInfoModal:FC<OperatorInfoModalProps> = (props) => {
  return (
    <Modal {...props} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Operator Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      </Modal.Body>
    </Modal>
  )
}
export default OperatorInfoModal;