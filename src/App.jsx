import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useSendTransaction,
  useWriteContract,
} from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { parseEther, parseUnits } from "viem";

import "./App.css";
import abi from "./abi/erc20.json";

function App() {
  const { chain, address } = useAccount();
  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { data: transactionData, sendTransaction } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [selectedToken, setSelectedToken] = useState();
  const [amount, setAmount] = useState();
  const [to, setTo] = useState("");

  const [transactionId, setTransactionId] = useState();

  useEffect(() => {
    if (transactionData) {
      setTransactionId(transactionData);
    }
  }, [transactionData]);

  useEffect(() => {
    setTransactionId("");
  }, [selectedToken]);

  useEffect(() => {
    if (chain) {
      console.log("chain", chain);
    }
  }, [chain]);

  const getTokenContractAddress = (token) => {
    switch (token) {
      case "USDT":
        switch (chain.id) {
          case 1: // Ethereum
            return "0xdAC17F958D2ee523a2206206994597C13D831ec7";
          case 8453: // Base.org
            return "0x4988a896b1227218e4A688aBC12497540e5dD89e";
          case 137: // Polygon
            return "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
          case 11155111: // Sepolia
            return "0x6d922ef02a0f308928a1aef4a8bbde73e1f51042";
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
          case 11155111: // Sepolia
            return "0x6d922ef02a0f308928a1aef4a8bbde73e1f51042";
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
    chainId: chain?.id,
  });

  const handleSendTransaction = async () => {
    if (amount > balance.formatted) {
      alert("Insufficient balance");
      return;
    }

    try {
      if (selectedToken == chain.nativeCurrency.symbol) {
        console.log("sendTransaction");
        sendTransaction({
          to: to,
          value: parseEther(amount, "wei"),
        });
      } else {
        console.log("writeContract");
        const amountInWei = parseUnits(amount, 6);

        const hash = await writeContractAsync({
          abi: abi,
          address: getTokenContractAddress(selectedToken),
          functionName: "transfer",
          args: [to, amountInWei],
        });

        if (hash) {
          setTransactionId(hash);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1>Wallet Connect</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "10px",
        }}
      >
        {chain && (
          <button onClick={() => open("Networks")}>{chain.name}</button>
        )}
        <button onClick={() => open()}>{address ? address : "Connect"}</button>
        {chain && <button onClick={() => disconnect()}>Disconnect</button>}
      </div>
      {chain && (
        <div style={{ marginBottom: "10px" }}>
          <button
            style={{
              border:
                selectedToken == chain.nativeCurrency.symbol
                  ? "1px solid blue"
                  : "",
              outline: "none",
              margin: "0 10px",
            }}
            onClick={() => setSelectedToken(chain.nativeCurrency.symbol)}
          >
            {chain.nativeCurrency.symbol}
          </button>
          <button
            style={{
              border: selectedToken == "USDT" ? "1px solid blue" : "",
              outline: "none",
              margin: "0 10px",
            }}
            onClick={() => setSelectedToken("USDT")}
          >
            USDT
          </button>
          <button
            style={{
              border: selectedToken == "USDC" ? "1px solid blue" : "",
              outline: "none",
              margin: "0 10px",
            }}
            onClick={() => setSelectedToken("USDC")}
          >
            USDC
          </button>
        </div>
      )}
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
            <input
              type="number"
              placeholder="Amount"
              style={{
                margin: "10px 0",
                width: "-webkit-fill-available",
                padding: "10px",
              }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="To"
              style={{
                margin: "10px 0",
                width: "-webkit-fill-available",
                padding: "10px",
              }}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button onClick={handleSendTransaction}>Send</button>
          {transactionId && (
            <p>
              <small>Transaction ID: {transactionId}</small>
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default App;
