import React, { useState, useEffect } from "react";
import { Form, Input, Grid, Message } from "semantic-ui-react";

import { useSubstrate } from "./substrate-lib";
import { TxButton } from "./substrate-lib/components";

import { blake2AsHex } from "@polkadot/util-crypto";

export function Main(props) {
  // Establish an API to talk to our Substrate node.
  const { api } = useSubstrate();
  // Get the selected user from the `AccountSelector` component.
  const { accountPair } = props;
  // React hooks for all the state variables we track.
  // Learn more at: https://reactjs.org/docs/hooks-intro.html
  const [status, setStatus] = useState("");
  const [digest, setDigest] = useState("");
  const [owner, setOwner] = useState("");

  const [didDocument, setDIDDocument] = useState("");
  const [didDocumentHex, setDIDDocumentHex] = useState("");
  const [didHash, setDIDDocumentHash] = useState("");

  const [block, setBlock] = useState(0);

  // Our `FileReader()` which is accessible from our functions below.
  let fileReader;

  // Takes our file, and creates a digest using the Blake2 256 hash function.
  const bufferToDigest = () => {
    let res = fileReader.result;

    let didDocument = fileReader.result;
    let didDocument = "";
    let didDocumentHex = Array.from(new Uint8Array(didDocument))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    let didHash = blake2AsHex(didDocumentHex);

    setDIDDocument(didDocument);
    setDIDDocumentHex(didDocumentHex);
    setDIDDocumentHash(
      "0x2a674c8ef2bc79f13faf22d4165ac99efc2cabe6e3194c0a58336fed7c56b1b3"
    );
    // setDIDDocumentHash(didHash);

    // Turns the file content to a hexadecimal representation.
    const content = Array.from(new Uint8Array(fileReader.result))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const hash = blake2AsHex(content, 256);

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

    api.query.didModule
      .dIDDocument(didHash, (result) => {
        if (!result.isEmpty) {
          let res = JSON.parse(result);
          console.log(result);
          let owner = res["sender_account_id"].toString();
          let block_number = res["block_number"];

          setOwner(owner);
          setBlock(block_number);
        } else {
          console.log(result);
          setBlock(0);
        }
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });
    return () => unsubscribe && unsubscribe();
  }, [didDocument, didHash, api.query.didModule]);

  // We can say a file digest is claimed if the stored block number is not 0.
  function isClaimed() {
    console.log(isClaimed);
    return block !== 0;
  }

  // The actual UI elements which are returned from our component.
  return (
    <Grid.Column>
      <h1>DID Upload</h1>
      {/* Show warning or success message if the file is or is not claimed. */}
      <Form success={!!didHash && !isClaimed()} warning={isClaimed()}>
        <Form.Field>
          {/* File selector with a callback to `handleFileChosen`. */}
          <Input
            type="file"
            id="file"
            label="Your File"
            onChange={(e) => handleFileChosen(e.target.files[0])}
          />
          {/* Show this message if the file is available to be claimed */}
          {/* <Message success header='File Digest Unclaimed' content={digest} /> */}
          <Message
            success
            header="File Digest Unclaimed"
            list={[
              `DID Document: ${didDocument}`,
              `DID Document hash: ${didHash}`,
              `Owner: ${owner}`,
              `Block: ${block}`,
            ]}
          />
          {/* Show this message if the file is already claimed. */}
          <Message
            warning
            header="File Digest Claimed"
            list={[
              `DID Document: ${didDocument}`,
              `DID Document hash: ${didHash}`,
              `Owner: ${owner}`,
              `Block: ${block}`,
            ]}
          />
        </Form.Field>
        {/* Buttons for interacting with the component. */}
        <Form.Field>
          {/* Button to create a claim. Only active if a file is selected,
          and not already claimed. Updates the `status`. */}
          <TxButton
            accountPair={accountPair}
            label={"Create DID"}
            setStatus={setStatus}
            type="SIGNED-TX"
            disabled={isClaimed() || !didHash}
            attrs={{
              palletRpc: "didModule",
              callable: "insertDidDocument",
              inputParams: [didDocument, didHash],
              paramFields: [true, true],
            }}
          />

          <TxButton
            accountPair={accountPair}
            label="Revoke Claim"
            setStatus={setStatus}
            type="SIGNED-TX"
            disabled={!isClaimed() || owner !== accountPair.address}
            attrs={{
              palletRpc: "didModule",
              callable: "revokeDid",
              inputParams: [didHash],
              paramFields: [true],
            }}
          />
        </Form.Field>
        {/* Status message about the transaction. */}
        <div style={{ overflowWrap: "break-word" }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function TemplateModule(props) {
  const { api } = useSubstrate();
  return api.query.didModule && api.query.didModule.dIDDocument ? (
    <Main {...props} />
  ) : null;
}
