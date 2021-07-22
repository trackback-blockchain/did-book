// React and Semantic UI elements.
import React, { useState, useEffect } from 'react';
import { Form, Input, Grid, Message } from 'semantic-ui-react';
// Pre-built Substrate front-end utilities for connecting to a node
// and making a transaction.
import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
// Polkadot-JS utilities for hashing data.
import { blake2AsHex } from '@polkadot/util-crypto';

// Our main Proof Of Existence Component which is exported.
export function Main (props) {
  // Establish an API to talk to our Substrate node.
  const { api } = useSubstrate();
  // Get the selected user from the `AccountSelector` component.
  const { accountPair } = props;
  // React hooks for all the state variables we track.
  // Learn more at: https://reactjs.org/docs/hooks-intro.html
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState('');
  const [owner, setOwner] = useState('');

  /********************************************************************************/
  const [didDocument, setDIDDocument] = useState('');
  const [didDocumentHex, setDIDDocumentHex] = useState('');
  const [didDocumentHash, setDIDDocumentHash] = useState('');
  const [humanDID, setHumanDID] = useState('');
  /*******************************************************************************/


  const [block, setBlock] = useState(0);
  console.log("State :- " + useState)

  // Our `FileReader()` which is accessible from our functions below.
  let fileReader;

  // Takes our file, and creates a digest using the Blake2 256 hash function.
  const bufferToDigest = () => {
    let res = fileReader.result;
    
    /*********************************************** */
    let didDocument = fileReader.result;
    let didDocumentHex= Array.from(
      new Uint8Array(didDocument))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    let didDocumentHash = blake2AsHex(didDocumentHex);

    setDIDDocument(didDocument);
    setDIDDocumentHex(didDocumentHex);
    setDIDDocumentHash(didDocumentHash);


    console.log("DID Document :- " + didDocument + "\n")
    console.log("DID Hex :- " + didDocumentHex  + "\n")
    console.log("DID Hash :- " + didDocumentHash + "\n")

    // Turns the file content to a hexadecimal representation.
    const content = Array.from(new Uint8Array(fileReader.result))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const hash = blake2AsHex(content, 256);

    //setDigest(res);
    setDigest(hash);
  };

  // Callback function for when a new file is selected.
  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = bufferToDigest;
    fileReader.readAsArrayBuffer(file);
  };

  // React hook to update the owner and block number information for a file.
  useEffect(() => {
    let unsubscribe;

    // Polkadot-JS API query to the `proofs` storage item in our pallet.
    // This is a subscription, so it will always get the latest value,
    // even if it changes.

    /************************************************************************* */
    api.query.didModule.dIDDocument(didDocumentHash, (result) =>{
      console.log("Doc hash :- " + didDocumentHash);
      console.log("***************************************************");
      let dd = result[1];

      var hex  = dd.toString();
      var str = '';
      for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
      }

      console.log(str)
      setHumanDID(str);
      console.log("result" + result)
      console.log("time stamp :- " + result[0]);
      console.log("did document :- " + result[1]);
      console.log("block number :- " + result[2]);
      console.log("account id :- " + result[3]);
      console.log("***************************************************");
      setOwner(result[3].toString());
      setBlock(result[2].toNumber());
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    /************************************************************************* */


    return () => unsubscribe && unsubscribe();
    // This tells the React hook to update whenever the file digest changes
    // (when a new file is chosen), or when the storage subscription says the
    // value of the storage item has updated.
  }, 
  [didDocument,  didDocumentHash, api.query.didModule]);
  // [digest, api.query.didModule]);

  // We can say a file digest is claimed if the stored block number is not 0.
  function isClaimed () {
    // return false;
    let c =  block !== 0;
    console.log("Type " + typeof block)
    

    console.log("Block :- " + block + " Claimed :- "  + c);
    return block !== 0;
  }

  // The actual UI elements which are returned from our component.
  return (
    <Grid.Column>
      <h1>DID Upload</h1>
      {/* Show warning or success message if the file is or is not claimed. */}
      <Form success={!!didDocumentHash && !isClaimed()} warning={isClaimed()}>
        <Form.Field>
          {/* File selector with a callback to `handleFileChosen`. */}
          <Input
            type='file'
            id='file'
            label='Your File'
            onChange={ e => handleFileChosen(e.target.files[0]) }
          />
          {/* Show this message if the file is available to be claimed */}
          {/* <Message success header='File Digest Unclaimed' content={digest} /> */}
          <Message success header='File Digest Unclaimed'  list={
              [
                `DID Document: ${didDocument}`,
                `DID Document hash: ${didDocumentHash}`,
                `Owner: ${owner}`, 
                `Block: ${block}`,
                `Human DID Doc: ${humanDID}`,
              ]
            } />
          {/* Show this message if the file is already claimed. */}
          <Message
            warning
            header='File Digest Claimed'
            list={
              [
                `DID Document: ${didDocument}`,
                `DID Document hash: ${didDocumentHash}`,
                `Owner: ${owner}`, 
                `Block: ${block}`,
                `Human DID Doc: ${humanDID}`,
              ]
            }
          />
        </Form.Field>
        {/* Buttons for interacting with the component. */}
        <Form.Field>
          {/* Button to create a claim. Only active if a file is selected,
          and not already claimed. Updates the `status`. */}
          <TxButton
            accountPair={accountPair}
            label={'Create DID'}
            setStatus={setStatus}
            type='SIGNED-TX'
            disabled={isClaimed() || !didDocumentHash}

            attrs={{
              palletRpc: 'didModule',
              callable: 'insertDidDocument',
              inputParams: [didDocument, didDocumentHash],
              paramFields: [true, true]
            }}
          />

    <TxButton
            accountPair={accountPair}
            label='Revoke Claim'
            setStatus={setStatus}
            type='SIGNED-TX'
            disabled={!isClaimed() || owner !== accountPair.address}
            attrs={{
              palletRpc: 'didModule',
              callable: 'revokeDid',
              inputParams: [didDocumentHash],
              paramFields: [true]
            }}
          />

        </Form.Field>
        {/* Status message about the transaction. */}
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function TemplateModule (props) {
  const { api } = useSubstrate();
  console.log(api.query)
  return (api.query.didModule && api.query.didModule.dIDDocument
    ? <Main {...props} /> : null);
}