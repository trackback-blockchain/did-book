import React, { useState, useEffect } from 'react';
import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
import { Form, Input, Grid, Message, Button, button } from 'semantic-ui-react';

function Main (props) {
    const [didURI, setDIDURI] = useState('');
    const [owner, setOwner] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [didDocument, setDIDDocument] = useState('');

    const { api } = useSubstrate();
    const { accountPair } = props;

    const convert = (from, to) => str => Buffer.from(str, from).toString(to);
    const hexToUtf8 = convert('hex', 'utf8');
    const { keyring } = useSubstrate();
    // const keyring = new Keyring({ type: 'sr25519' });
    // const account = keyring.addFromUri('//Alice');

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

    // const submit = async () => {
    //     const fromAcct = await getFromAcct();
    //     const transformed = transformParams(paramFields, inputParams);
    //     // transformed can be empty parameters
    
    //     const txExecute = transformed ? api.tx[palletRpc][callable](...transformed): api.tx[palletRpc][callable]();
    
    //     const unsub = await txExecute.signAndSend(fromAcct, txResHandler)
    //       .catch(txErrHandler);
    //     setUnsub(() => unsub);
    //   };
    

    const onRevokeDID = () => {
        console.log(didURI);

        // *************************************************************************************************

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

        // let transformed = params.reduce((memo, { type = 'string', value }) => {
        //         if (value == null || value === '') return (opts.emptyAsNull ? [...memo, null] : memo);
    
        //         let converted = value;
    
        //         if (type.indexOf('Vec<') >= 0) {
        //             converted = converted.split(',').map(e => e.trim());
        //             converted = converted.map(single => isNumType(type)
        //                 ? (single.indexOf('.') >= 0 ? Number.parseFloat(single) : Number.parseInt(single))
        //                 : single
        //             );
        //             return [...memo, converted];
        //         }
    
        //         // Deal with a single value
        //         if (isNumType(type)) {
        //             converted = converted.indexOf('.') >= 0 ? Number.parseFloat(converted) : Number.parseInt(converted);
        //         }
        //         return [...memo, converted];
        //     }, []);
        // }
        // const txExecute = api.tx[palletRpc][callable](...transformed);

        // async () => {
        //     const fromAcct = await getFromAcct();
        //     const transformed = transformParams(paramFields, inputParams);
        //     // transformed can be empty parameters
        
        //     const txExecute = transformed ? api.tx[palletRpc][callable](...transformed): api.tx[palletRpc][callable]();
        
        //     const unsub = await txExecute.signAndSend(fromAcct, txResHandler)
        //       .catch(txErrHandler);
        //     setUnsub(() => unsub);
        //   }
    
        // *************************************************************************************************
      }

    const onSearchDID = () => {
        console.log(didURI);

        api.query.didModule.dIDDocument(didURI, (result) =>{
      
            if (!result.isEmpty){
              let res = JSON.parse(result);
              console.log("Result :-\n" + result)
              let owner = res["sender_account_id"].toString();
              let block_number = res["block_number"];
 
                let doc = hexToUtf8(res["did_document"].substr(2).toString())
                console.log(owner)
                console.log(block_number)
                console.log(doc)
                document.getElementById("didDoc").innerHTML = JSON.stringify(JSON.parse(doc), undefined, 4);
            } else {
              console.log(result);
              document.getElementById("didDoc").innerHTML = "Unable to fetch the DID";
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

            </div>
            <div style={{
                marginTop:"20px",
                background:"#ffffe2",
                border:"1px solid green"
            }}>
                <pre id="didDoc">

                </pre>
            </div>
            <div>
                <button class="ui primary button" onClick={onRevokeDID} style={{
                    marginTop:"20px",
                }}>Revoke</button>
            </div>

        </div>
    );
}

export default function Revoke (props) {
    const { api } = useSubstrate();
    return (api.query.didModule && api.query.didModule.dIDDocument
      ? <Main {...props} /> : null);
  }