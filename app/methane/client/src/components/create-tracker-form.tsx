import { FC, useEffect, useState, useCallback, ChangeEvent } from "react";
import { Form } from "react-bootstrap";
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';

import { BsPlus } from 'react-icons/bs';

//import Datetime from "react-datetime";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";

import { Operator } from "./static-data";
import { track } from "@blockchain-carbon-accounting/react-app/src/services/contract-functions"
import { Wallet } from "@blockchain-carbon-accounting/react-app/src/components/static-data";
import SubmissionModal from "@blockchain-carbon-accounting/react-app/src/components/submission-modal";
import FormGroupJSON, { KeyValuePair } from "@blockchain-carbon-accounting/react-app/src/components/form-group-json";


export type CreateTrackerFormSeeds = { 
  from_date?: Date,
  thru_date?: Date,
  description?: string,
}

type CreateTrackerProps = {
  provider?: Web3Provider | JsonRpcProvider
  signedInWallet?: Wallet
  operator?: Operator 
  signedInAddress?: string
  trackee:string
  formSeeds?:CreateTrackerFormSeeds
  onSubmitHandle?:(result:string)=>void
}

const CreateTrackerForm: FC<CreateTrackerProps> = (
  {provider,operator,signedInWallet,signedInAddress,trackee,formSeeds,onSubmitHandle}
) => {
  //const [fromDate, setFromDate] = useState<Date|null>(formSeeds?.from_date!);
  //const [thruDate, setThruDate] = useState<Date|null>(formSeeds?.thru_date!);
  const [metajson, setMetajson] = useState("");
  const [metadata, setMetadata] = useState<KeyValuePair[]>([]);

  const [manifestjson, setManifestjson] = useState("");
  const [manifest, setManifest] = useState<KeyValuePair[]>(localStorage.getItem('manifest') ? [{key:'source',value:localStorage.getItem('manifest')} as KeyValuePair]:[]);

  const [description, setDescription] = useState(formSeeds?.description!);
  const onDescriptionChange = useCallback((event: ChangeEvent<HTMLInputElement>) => { setDescription(event.target.value); }, []);
  const [result, setResult] = useState("");
  const [submissionModalShow, setSubmissionModalShow] = useState(false);

  const castMetadata = (pairlist: KeyValuePair[]) => {
    const metaObj: any = {};
    pairlist.forEach((elem) => {
      metaObj[elem.key] = elem.value;
    });
    if(operator) metaObj["operator_uuid"] = operator?.uuid;

    return JSON.stringify(metaObj);
  }

  // handle metadata field list
  const removeField = (idx: number) => {
    let array = [...metadata];
    array.splice(idx, 1);
    setMetadata(array);
    setMetajson(castMetadata(metadata));
  }

  const addField = () => {
    metadata.push({key: "", value: ""});
    setMetadata([...metadata]);
    setMetajson(castMetadata(metadata));
  }

  const castManifest = (pairlist: KeyValuePair[]) => {
    const manifestObj: any = {};
    pairlist.forEach((elem) => {
      manifestObj[elem.key] = elem.value;
    });

    return JSON.stringify(manifestObj);
  }

  const addFieldManifest = () => {
    manifest.push({key: "", value: ""});
    setManifest([...manifest]);
    setManifestjson(castManifest(manifest));
  }

  const removeFieldManifest = (idx: number) => {
    let array = [...manifest];
    array.splice(idx, 1);
    setManifest(array);
    setManifestjson(castManifest(manifest));
  }


  useEffect(()=>{
  }, [])

  function handleSubmit() {
    submit();
    if(!onSubmitHandle){setSubmissionModalShow(true);}
  }
  async function submit() { 
    if (!provider) return;
    let result = await track(provider,trackee,'','',metajson,manifestjson)
    setResult(result.toString());
    if(onSubmitHandle!){onSubmitHandle(result)}
  } 
  return (provider! && 
    <>  

      <SubmissionModal
        show={submissionModalShow}
        title="Request certificate"
        body={result}
        onHide={() => {setSubmissionModalShow(false); setResult("")} }
      />
      <h3>Create new certificate request for {operator?.name}</h3>
      {/*<Row>
        <Form.Group as={Col} className="mb-3" controlId="fromDateInput">
          <Form.Label>From date</Form.Label>
          <Datetime value={fromDate} onChange={(moment)=>{setFromDate((typeof moment !== 'string') ? moment.toDate() : null)}}/>
        </Form.Group>
        <Form.Group as={Col} className="mb-3" controlId="thruDateInput">
          <Form.Label>Through date</Form.Label>
          <Datetime value={thruDate} onChange={(moment)=>{setThruDate((typeof moment !== 'string') ? moment.toDate() : null)}}/>
        </Form.Group>
      </Row>*/}
      <Form.Group className="mb-3" controlId="metadataInput">
        <Form.Label>Metadata</Form.Label>
        <Row>
          <Col md={10}>
            <Row className="mb-3">
              <Form.Label column md={3}>Description</Form.Label>
              <Col md={9}>
                <Form.Control as="textarea" placeholder="" value={description}/>
              </Col>
            </Row>
          </Col>
          <Col md={2}>
            <Row className="mb-3 g-0 gx-2">
              <Col className="col-md-auto col-6">
                <Button className="w-100" variant="outline-dark" onClick={addField}><BsPlus /></Button>
              </Col>
              <div className="col"></div>
            </Row>
          </Col>
        </Row>
        {FormGroupJSON({keyValuePair: metadata, handles: {setKeyValuePair:setMetadata, addField: addField, removeField: removeField}})}
      </Form.Group>
      <Form.Group>
        <Form.Group>
          <Form.Label>Manifest</Form.Label>
          <Button className="label-button" variant="outline-dark" onClick={addFieldManifest}><BsPlus /></Button>
        </Form.Group>
        {FormGroupJSON({keyValuePair: manifest!, handles: {setKeyValuePair:setManifest, addField: addFieldManifest, removeField: removeFieldManifest}})}
      </Form.Group>
      {/*<Form.Group className="mb-3" controlId="descriptionInput">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" placeholder="" value={description} onChange={onDescriptionChange} />
      </Form.Group>*/}
      <Button
        variant="primary"
        size="lg"
        className="w-100"
        onClick={handleSubmit}
      >
        Submit Request
      </Button>
    </>
  )
}

export default CreateTrackerForm;