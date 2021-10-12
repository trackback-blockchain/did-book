import React, { useState, useEffect } from 'react';
import { useSubstrate } from './substrate-lib';
import { Form, Input, Grid, Message, Button, button } from 'semantic-ui-react';
import str2ab from 'string-to-arraybuffer';
import ab2str from 'arraybuffer-to-string';
import { Keyring } from '@polkadot/api';

function Main (props) {
    const [didURI, setDIDURI] = useState('');
    const [owner, setOwner] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [didDocument, setDIDDocument] = useState('');

    const { api } = useSubstrate();
    const { accountPair } = props;

    const convert = (from, to) => str => Buffer.from(str, from).toString(to);
    const hexToUtf8 = convert('hex', 'utf8');
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromUri('//Alice', { name: 'Alice default' });

    const utils = {
        paramConversion: {
            num: [
                'Compact<Balance>',
                'BalanceOf',
                'u8', 'u16', 'u32', 'u64', 'u128',
                'i8', 'i16', 'i32', 'i64', 'i128'
            ]
        }
    };
    
    const isNumType = type => utils.paramConversion.num.some(el => type.indexOf(el) >= 0);
    

    const onRevokeDID = () => {
        console.log(didURI);

        if(didURI) {
            let bDIDURI = Array.from(new Uint8Array(str2ab(didURI)))

            const palletRpc = "didModule";
            const callable = "revokeDid";

            const inputParams = [bDIDURI];
            const paramFields = [true];

            const paramVal = inputParams.map(inputParam => {
                if (typeof inputParam === 'object' && inputParam !== null && typeof inputParam.value === 'string') {
                    return inputParam.value.trim();
                } else if (typeof inputParam === 'string') {
                    return inputParam.trim();
                }
                return inputParam;
            });

            const params = paramFields.map((field, ind) => ({ ...field, value: paramVal[ind] || null }));

            let transformed = params.reduce((memo, { type = 'string', value }) => {
                    if (value == null || value === '') return (opts.emptyAsNull ? [...memo, null] : memo);
        
                    let converted = value;
        
                    if (type.indexOf('Vec<') >= 0) {
                        converted = converted.split(',').map(e => e.trim());
                        converted = converted.map(single => isNumType(type)
                            ? (single.indexOf('.') >= 0 ? Number.parseFloat(single) : Number.parseInt(single))
                            : single
                        );
                        return [...memo, converted];
                    }
        
                    // Deal with a single value
                    if (isNumType(type)) {
                        converted = converted.indexOf('.') >= 0 ? Number.parseFloat(converted) : Number.parseInt(converted);
                    }
                    return [...memo, converted];
                }, []);
            

            const txExecute =  api.tx[palletRpc][callable](...transformed);
            txExecute.signAndSend(account, (result)=> {

                console.log(`Current status is ${result.status}`);
        
                if (result.status.isInBlock) {
                  console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
                } else if (result.status.isFinalized) {
                  console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
                }
              }
              )
        }
      }

    const onSearchDID = () => {
        console.log(didURI);

        api.query.didModule.dIDDocument(didURI, (result) =>{
            console.log(didURI)
            console.log(result);
            if (!result.isEmpty){
                let res = JSON.parse(result);
                console.log("Result :-\n" + result)
                let owner = res["sender_account_id"].toString();
                let block_number = res["block_number"];


                let didResolutionMetadata = hexToUtf8(res.did_resolution_metadata.substr(2).toString());
                let didMedatadata = hexToUtf8(res.did_document_metadata.substr(2).toString());
                let blockNumber = res.block_number;
                let blockTimeStamp = res.block_time_stamp;
                let updatedTimeStamp = res.updated_timestamp;
                let didRef = hexToUtf8(res.did_ref.substr(2).toString());
                let senderAccountId = hexToUtf8(res.sender_account_id.substr(2).toString());


                let publicKeys = res.public_keys.map(function(e){
                    return "\n" + hexToUtf8(e.substr(2).toString())
                });

                document.getElementById("didResMetadata").innerHTML = "DID Resolution Metadata :-" + JSON.stringify(JSON.parse(didResolutionMetadata), undefined, 4);
                document.getElementById("didMetaData").innerHTML = "DID Document Metadata :-" + JSON.stringify(JSON.parse(didMedatadata), undefined, 4);
                document.getElementById("publicKeys").innerHTML = "Public Keys :-" + publicKeys;
                document.getElementById("senderAccount").innerHTML = "Sender Account :-" + senderAccountId;
                document.getElementById("didRef").innerHTML = "DID CID :-" + didRef;
                document.getElementById("blockNumber").innerHTML = "Block Number :-" + blockNumber;
                document.getElementById("blockTimeStamp").innerHTML = "Block Timestamp :-" + blockTimeStamp;
                document.getElementById("updatedTimeStamp").innerHTML = "Updated timestamp :-" + updatedTimeStamp;

                console.log("Owner Hex :" + owner)
                console.log(hexToUtf8(owner.substr(2).toString()))
                console.log(block_number)
            } else {
              console.log(result);
              document.getElementById("didResMetadata").innerHTML = "Unable to fetch the DID Resolution Metadata";
            }
          }
        );
      }

    return (
        <div style={{
            background:'#fafffa',
            marginLeft:'15px'
        }}>
            <div style={{
                marginBottom: '20px',

            }}><h2>DID Revocation</h2></div>
           
            <div class="ui input success" style={{
                width: '600px',

            }}>
                <input type="text" placeholder="Input DID URI" onChange={event => setDIDURI(event.target.value)} 
                style={{
                    fontSize: '20px',
                    color:'green'
            
                }}/>
            
            </div>
            

            <div>
                <button class="ui primary button" onClick={onSearchDID} style={{
                    marginTop:"20px",
                    
                }}>Search</button>
                <button class="ui primary button" onClick={onRevokeDID} style={{
                    marginTop:"20px",
                }}>Revoke</button>
            </div>
             
            <div style={{
                marginTop:"20px",
                background:"#ffffe2",
                border:"1px solid green"
            }}>
                <pre id="didDoc" style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#acffe2",
                }}></pre>
                <pre id="didResMetadata"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#0aa0FF",
                }}></pre>
                <pre id="didMetaData"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#ccffe2",
                }}></pre>

                <pre id="blockNumber"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#ccffe2",
                }}></pre>
                <pre id="blockTimeStamp"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#ccffe2",
                }}></pre>
                <pre id="updatedTimeStamp"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#ccffe2",
                }}></pre>
                <pre id="senderAccount"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#ccffe2",
                }}></pre>
                <pre id="didRef"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#ccffe2",
                }}></pre>
                <pre id="publicKeys"style={{
                    marginTop:"30px",
                    marginBottom: "30px",
                    background:"#ccffe2",
                }}></pre>
            </div>            
        </div>
    );
}

export default function Revoke (props) {
    const { api } = useSubstrate();
    return (api.query.didModule && api.query.didModule.dIDDocument
      ? <Main {...props} /> : null);
  }