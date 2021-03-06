import React, { Component } from 'react';
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json'
import Navbar from './Navbar';
import './App.css';
import CheckMain from './CheckMain.js';

class CheckDashboard extends Component {

  //inbuilt function will load the specified data when website will load
  async componentWillMount() {
    await this.loadWeb3()
    // console.log(window.web3)
    await this.loadBlockchainData()
  }

  // this function is to create connection with blockchain using web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  //this func we r writing bcause to load nessesary data at time loading at first
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    // console.log(accounts)
    this.setState({account: accounts[0]}) 

    
    //console.log(Marketplace.abi, Marketplace.networks[5777].address)
    // const abi = Marketplace.abi
    // const address = Marketplace.networks[5777].address
    // const marketplace = web3.eth.Contract(abi, address)
    const networkId = await web3.eth.net.getId() //here we r just fetching network id dynamically. we'll use this id to fetch address of contract 
    const networkData =  Marketplace.networks[networkId] //from network id here 5777
    
    if(networkData) {
      const marketplace =  web3.eth.Contract(Marketplace.abi, networkData.address) // here we are actually instanciating contract by passing 2 parameters to it i.e abi and contract address 
      this.setState({ marketplace })
      // const productCount = await marketplace.methods.productCount().call()
      // this.setState({productCount})

      const  DDtransactionCount = await marketplace.methods.DDtransactionCount().call()
      this.setState({DDtransactionCount})

  
     
      for(var j=1; j<=DDtransactionCount; j++){

        const DDTransactions = await marketplace.methods.DDTransactions(j).call()
        this.setState({
          DDTransactions: [...this.state.DDTransactions, DDTransactions]
        })

      }

     
      this.setState({ loading: false})
      // console.log(this.state.products)
      console.log(this.state.DDTransactions)
     
    }
    else {
      window.alert('Marketplace contract not deployed to detected network.')
    }

  }

  //its a construct like other programming lang. and we are passing props bcoz 
  //using props we can read out state of one component into another one here
  //we set state into app.js component and we are using it into Navbar.js component that's so.
  
  constructor(props){
    super(props)
    this.state = {
      account: '', 
      
      DDtransactionCount: 0,
      DDTransactions: [],
      loading: true
    }
    
    
    this.createDDTransaction = this.createDDTransaction.bind(this)
    this.transferDDAmount = this.transferDDAmount.bind(this)
    this.returnBalance = this.returnBalance.bind(this)
  }

  

  createDDTransaction(receiver, name, amount){
    this.setState({ loading: true })
    this.state.marketplace.methods.createDDTransaction(receiver,name, amount).send({ from: this.state.account }).once('receipt', (receipt)=>{
      this.setState({ loading: false })
     })
   
  }

  transferDDAmount(id, amount){
    this.setState({ loading: true })
    this.state.marketplace.methods.transferDDAmount(id).send({ from: this.state.account, value: amount }).once('receipt', (receipt)=>{
        
      this.setState({ loading: false })
     
    })
    

  }

 async returnBalance(){

    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    // console.log(accounts)
    this.setState({account: accounts[0]}) 

    // this.setState({ loading: true })
    var addr = this.state.account
    var balance = await web3.eth.getBalance(addr.toString());

    // var bal = await this.state.marketplace.methods.returnBalance().send({ from: this.state.account}).once('receipt', (receipt)=>{
        
    //   this.setState({ loading: false })
     
    // })

    var bal = web3.utils.fromWei(balance, "ether")

   

    // console.log( bal + "ETH")

    window.confirm("Account Balance: "+bal+" ETH")

 
    
    // console.log(balance)

  }


  render() {
    return (
      <div>
        {/* here in Navbar component we r passing seted state of account i.e account address an we'll cathch in Navbae code using props and display */}
        <Navbar account={this.state.account}  returnBalance = {this.returnBalance}/> 

        <div className="container-fluid ">
          <div className="row">
        
            <main role="main" className="col-lg-12 d-flex">
             
              {/* if all data is loaded then we'll show contents other wise hide using loading using turnary operatopr in js */}
              { this.state.loading
                  ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                  : <CheckMain
                    //  products = {this.state.products}
                    DDTransactions = {this.state.DDTransactions}
                   
                    //  createProduct = {this.createProduct}
                    //  purchaseProduct = {this.purchaseProduct}
                    createDDTransaction = {this.createDDTransaction} 
                    transferDDAmount = {this.transferDDAmount}
                     returnBalance = {this.returnBalance}/>
                 }
             
            </main>
           
          </div>
        </div>
      </div>
    );
  }
}

export default CheckDashboard;


