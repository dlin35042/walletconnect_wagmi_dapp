import { useEffect, useState } from "react";
import {
useAccount,
useBalance,
useDisconnect,
useSendTransaction,
//useWalletClient,
useWriteContract,
} from "wagmi";
import { useWeb3Modal, useWeb3ModalEvents } from "@web3modal/wagmi/react";
import { parseEther, parseUnits } from "viem";

import abi from "./abi/erc20.json";

function App() {
const { chain, address, isDisconnected } = useAccount();
const { open, close } = useWeb3Modal();
const { disconnect } = useDisconnect();
//const { data: walletClient } = useWalletClient();
const events = useWeb3ModalEvents();

const { data: transactionData, sendTransaction } = useSendTransaction();
const { writeContractAsync } = useWriteContract();

var [selectedToken, setSelectedToken] = useState();
//const [amount, setAmount] = useState();
//const selectedToken = window._token;
//const [to, setTo] = useState("");
const to = window._to;
//selectedToken = window._token;

const [transactionId, setTransactionId] = useState();

useEffect(() => {
   if (events) {
      console.log('event', events.data.event);
      if (events.data.event==="SWITCH_NETWORK") {
         close();
      }
   }
   if (isDisconnected) {
      window.walletDisconnected();
   }
}, [events, isDisconnected, close]);
useEffect(() => {
   if (transactionData) {
      setTransactionId(transactionData);
      window.transactionSent(transactionData, address);
   }
}, [transactionData, address]);

useEffect(() => {
   setTransactionId("");
}, [selectedToken]);

useEffect(() => {
   if (chain) {
      //console.log("walletClient", walletClient);
      console.log("chain set", chain.name);
      console.log('amount', window._price);
      window.walletConnected();
      window.walletChainSet(chain.name);
   }
}, [chain]);

const getTokenContractAddress = (token) => {
   if (!chain) return "";
   switch (token) {
   case "USDT":
      switch (chain.id) {
         case 1: // Ethereum
            return "0xdAC17F958D2ee523a2206206994597C13D831ec7";
         case 8453: // Base.org
            return "0x4528BE9055935C213020085656AD3c1E99BF1f32";
         case 137: // Polygon
            return "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
         case 56: // bsc
            return "0x55d398326f99059ff775485246999027b3197955";
         case 42161: // arb
            return "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
         default:
            return "";
      }
   case "USDC":
      switch (chain.id) {
         case 1: // Ethereum
            return "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
         case 8453: // Base.org
            return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
         case 137: // Polygon
            return "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
         case 56: // bsc
            return "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
         case 42161: // arb
            return "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
         default:
            return "";
      }
   default:
      return "";
   }
};

const { data: balance } = useBalance({
   address: address,
   token: getTokenContractAddress(selectedToken),
});

const handleSendTransaction = async () => {
   try {
   if (selectedToken == chain.nativeCurrency.symbol) {
      console.log('a', parseEther(window._price, "wei"));
      console.log('b', parseEther(balance.formatted, "wei"));
      if (parseUnits(window._price, 18) > parseEther(balance.formatted, "wei")) {
         window.lowBalance(selectedToken, chain.name);
         return;
      }
      console.log("sendTransaction");
      sendTransaction({
         to: to,
         value: parseEther(window._price, "wei"),
      });
   } else {
      if (parseUnits(window._price, 6) > parseUnits(balance.formatted, 6)) {
         window.lowBalance(selectedToken, chain.name);
         return;
      }
      console.log("writeContract");
      const amountInWei = parseUnits(window._price, 6);
      const hash = await writeContractAsync({
         abi: abi,
         address: getTokenContractAddress(selectedToken),
         functionName: "transfer",
         args: [to, amountInWei],
      });

      if (hash) {
         setTransactionId(hash);
         console.log('txid', hash);
         window.transactionSent(hash, address, chain.name);
      }
   }
   } catch (error) {
      console.error(error);
   }
};

return (
   <>
   <div
      style={{
         display: "flex",
         justifyContent: "center",
         marginBottom: "10px",
      }}
   >
      {chain ? (
         <button type="button" className="btn btn-warning me-3" onClick={() => open("Networks")} data-address={address}>
         <img src="/gfx/checkout/wc.png" height={30}></img> Connected to {chain.name}
      </button>
      ) : (
      <button type="button" className="btn btn-warning me-3" onClick={() => open()} data-address={address}>
         <img src="/gfx/checkout/wc.png" height={30}></img> Connect Wallet
      </button>
      )}
      
      {chain && <button onClick={() => disconnect()} className="btn btn-outline-danger">Disconnect</button>}
   </div>
   {chain && (
      <>
         <div>
         <button
            id="_ETH"
            style={{
               display: "none",
            }}
            onClick={() => setSelectedToken(chain.nativeCurrency.symbol)}
         >
         </button>
         <button
            id="_USDT"
            style={{
               display: "none",
            }}
            onClick={() => setSelectedToken("USDT")}
         >
         </button>
         <button
            id="_USDC"
            style={{
               display: "none",
            }}
            onClick={() => setSelectedToken("USDC")}
         >
         </button>
         <input id="_token" type="text" style={{
               display: "none",
            }} value={selectedToken} onChange={e => setSelectedToken(e.target.value)}></input>
         </div>

         {selectedToken && (
         <div style={{ width: "100%" }}>
            <div>
               <div style={{ textAlign: "right" }}>
               <span>
                  <small>
                     Available: &nbsp;
                     {balance && `${balance.formatted} ${balance.symbol}`}
                  </small>
               </span>
               </div>

            </div>
            <button className="btn btn-primary w-100" onClick={handleSendTransaction}>Pay {window._price} {selectedToken}</button>
            {transactionId && (
               <p>
               <small>Transaction ID: {transactionId}</small>
               </p>
            )}
         </div>
         )}
      </>
   )}
   </>
);
}

export default App;
