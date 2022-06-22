import React from 'react';
import './App.css';
import { ethers } from 'ethers'
import { useState } from 'react'
import contractAbi from './abi';
import evotAbi from './evotAbi';


function App() {
  const contractAddress = '0xD470D600A255DBa6aCc6F2259B044aCD5a51E947';
  const EVOAIcontractAddress = '0xF2a72e8cB7211d8401c410ABeeb3C79A4f5F833D';
  // const [connected, setconnected] = useState(0);
  const [walletAddress, setwalletAddress] = useState(0);
  // const [contract, setContract] = useState(0)
  const [amount, setAmount] = useState(0)
  const [approved, setApproved] = useState(false)
  const [showPanel, togglePanel] = useState(false);

  const connectWallet = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    var provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    signer.getAddress()
    .then(res=> setwalletAddress(res));
   }

   const onChange =  async (e) => {
      await setAmount(e.target.value);
  }

  const approveTransaction = async () => {
    if(amount < 40) {
      alert("Minimum transaction Amount is 40");
      return false;
    }
    if (walletAddress) {
      try {
        togglePanel(true)
        const zeros = '000000000000000000'
        const transactionAmount = amount + zeros;
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const evotInstance = new ethers.Contract(EVOAIcontractAddress, evotAbi, signer);
        await evotInstance.approve(contractAddress, transactionAmount.toString()).then((tx) => {
            return tx.wait().then((receipt) => {
              setApproved(true);
              alert('Your transaction is Approved, now you can Swap the token')
                // This is entered if the transaction receipt indicates success
              togglePanel(false)
              return receipt;
            }).catch ((error) => {
                togglePanel(false)
                // This is entered if the status of the receipt is failure
                alert('Err approving: '+ error)
                console.log("Error", error);
                return false;
            });
        });
      }catch(err){
        togglePanel(false)
        alert(err)
      }
    }else{
      alert("please connect your wallet first")
    }
  }

  const swapTransaction = async () => {

    if (walletAddress && approved) {
      if(amount < 40) {
        alert("Minimum transaction Amount is 40");
        return false;
      }
      if(walletAddress ===''){
        alert('Please Connect Your Wallet');
        return false;
      }

      if(!approved) {
        alert('Please First Approve Your transaction')
        return false;
      }
      
      try {
        togglePanel(true)
        const zeros = '000000000000000000'
        const transactionAmount = amount + zeros;
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer)
        const overrides = {
          gasLimit: 3000000 //optional
        }
        await contractInstance.swap(transactionAmount.toString(), overrides).then((tx) => {
            return tx.wait().then((receipt) => {
              setApproved(true);
              togglePanel(false)
                alert('You Have successfully Swap The token With EVOT')
                // This is entered if the transaction receipt indicates success
              return receipt;
            }).catch ((error) => {
              togglePanel(false)
              alert("ERROR IN SWAPPING: "+ error)
            });
        });
      }catch(err){
        togglePanel(false)
        alert(err)
      }
    }else{
      if(!walletAddress){
        alert('Please Connect Your Wallet');
      }else{
        if(!approved) {
          alert('Please First Approve Your transaction')
        }
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>PROCESS REIMBURSEMENT</p>
      </header>
      <div className="heading">
        <p>STEP 1: Connect Your Web3 Wallet</p>
      </div>
      <div className="button">
        { walletAddress ?
          (<button className="addressBtn">Connected {walletAddress}</button>) :
          (<button className="myButton" onClick={connectWallet} >Connect Wallet</button>)
        }
      </div>
      <div className="heading">
        <p>STEP 2: Approve EVOT smart contract transfer</p>
      </div>
      <div className="button">
        <input type="text" className="myinput" placeholder="Enter EVOT amount" onChange={onChange} />
        <button className="myButton" onClick={approveTransaction}>Approve</button>
      </div>
      <div className="heading">
        <p>STEP 3: Swap EVOT for USDC</p>
      </div>
      <div className="button">
        <button className="myButton swap" onClick={swapTransaction}>Swap</button>
      </div>
      {showPanel && (
      <div className="middle-container">
        <img  src="https://media.giphy.com/media/2A6xoqXc9qML9gzBUE/giphy.gif" alt="LOADING..." />
      </div>
      )}
    </div>
  );
}




export default App;
