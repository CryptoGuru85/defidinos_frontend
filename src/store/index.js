import Vue from 'vue'
import Vuex from 'vuex'
import { ethers } from 'ethers'
import axios from 'axios'
import abi from '../constants/abi.json'
Vue.use(Vuex)
/*
const ChainParams = {
  chainId: '0xa869',
  chainName: 'Avalanche FUJI C-Chain',
  nativeCurrency: {
    name: ' AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://cchain.explorer.avax-test.network']
}
*/

const ChainParams = {
  chainId: '0xa86a',
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: ' AVAX',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://cchain.explorer.avax.network']
}

const contractAddress = '0xA36D4b75AB5c4D655ec7ed099701De094b137A66'
const StorageId = 'transactions'

function shouldCheck (lastBlockNumber, tx) {
  if (!tx.hash || tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

const getRecentTransactions = () => {
  const trx = localStorage.getItem(StorageId)
  if (trx) return JSON.parse(localStorage.getItem(StorageId))
  return {}
}
export default new Vuex.Store({
  state: {
    URI: 'https://defidinos-nft.vercel.app/metadata/',
    FullMeta: 'https://nft.defidinos.com/metadata.json',
    moodal: 0,
    library: null,
    account: null,
    provider: null,
    signer: null,
    chainId: null,
    wrongChainId: null,
    isModalOpen: false,
    totalSupply: 0,
    minting: false,
    transactions: {},
    blockNumber: null,
    headerFix: true,
    myDinos: [],
    marketPlaceItems: [],
    myDinosQuery: 0,
    currentModal: null,
    sendingNFT: false,
    allNFT: [],
    FilterBody: [],
    FilterHead: [],
    FilterEyes: [],
    FilterColor: [],
    FilterMouth: [],
    floorPrice: 0,
    marketVolume: 0
  },
  mutations: {
    SET_MODAL (state, modal) {
      state.moodal = modal
    },
    CLEAR_FILTER (state) {
      const filterItems = state.marketPlaceItems.map(nft => {
        nft.show = 1
        return nft
      })
      state.marketPlaceItems = filterItems
    },
    SET_SORT (state, sort) {
      if (sort === 'PRICE (LOW TO HIGH)') {
        state.marketPlaceItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      }
      if (sort === 'PRICE (HIGH TO LOW)') {
        state.marketPlaceItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      }
      if (sort === 'ID (LOW TO HIGH)') {
        state.marketPlaceItems.sort((a, b) => parseFloat(a.nftId) - parseFloat(b.nftId))
      }
      if (sort === 'ID (HIGH TO LOW)') {
        state.marketPlaceItems.sort((a, b) => parseFloat(b.nftId) - parseFloat(a.nftId))
      }
    },
    SET_FILTERS (state, data) {
      const filterItems = state.marketPlaceItems.map(nft => {
        nft.show = 1

        Object.keys(data).forEach(filterName => {
          let filterValue = data[filterName]
          if (filterValue !== null) {
            console.log(nft.attributes)
            if (nft.attributes.find(({ task }) => (task.trait_type == filterName && task.value === filterValue)) == undefined) {
              console.log('Couldnt find: ' + filterName + ' - '  + filterValue)
              nft.show = 0
              return nft
            }
          }
        });

        return nft
      })
      state.marketPlaceItems = filterItems
    },
    SET_CURRENT_MODAL (state, data) {
      state.currentModal = state.myDinos[data]
    },
    SET_CURRENT_MODAL2 (state, data) {
      state.currentModal = state.marketPlaceItems[data]
    },
    setMinting (state, payload) {
      state.minting = payload
      if (payload === false) {
      }
    },
    setSendingNFT (state, payload) {
      state.sendingNFT = payload
    },
    openWalletModal (state) {
      state.isModalOpen = true
    },
    closeWalletModal (state) {
      state.isModalOpen = false
    },
    blockNumberCallback (state, { blockNumber, library }) {
      this.commit('updateTotalSupply', library)
      this.commit('checkAndFinalizeTransactions')
      if (typeof state.blockNumber !== 'number') {
        return (state.blockNumber = blockNumber)
      }
      state.blockNumber = Math.max(blockNumber, state.blockNumber)
    },
    updateTotalSupply (state, library) {
      const contract = new ethers.Contract(contractAddress, abi, library)
      contract.totalSupply().then((supply) => {
        state.totalSupply = supply.toString()
      })
    },
    getVolume (state) {
      const contract = new ethers.Contract(contractAddress, abi, state.signer)
      contract.getMarketVolume().then((data) => {
        state.marketVolume = ethers.utils.formatEther(data, 'ether')
      })
    },
    onlyUnique (value, index, self) {
      return self.indexOf(value) === index
    },
    getMarketPlaceItems (state) {
      state.FilterBody = []
      state.FilterHead = []
      state.FilterEyes = []
      state.FilterColor = []
      state.FilterMouth = []
      state.marketPlaceItems = []
      const allPrices = []
      const contract = new ethers.Contract(contractAddress, abi, state.signer)
      contract.getForSale().then(async (items) => {
        items.map(async (NFTMap) => {
          const nftDetail = NFTMap.toString().split(',')
          const NFT = nftDetail[0].toString()
          const price = nftDetail[1].toString()
          allPrices.push(price)
          const attributes = state.allNFT[NFT].attributes
          attributes.forEach((data) => {
            if (data.trait_type === 'Body' && state.FilterBody.find((find) => find.value === data.value) === undefined) {
              state.FilterBody.push({
                value: data.value
              })
            }
            if (data.trait_type === 'Head' && state.FilterHead.find((find) => find.value === data.value) === undefined) {
              state.FilterHead.push({
                value: data.value
              })
            }
            if (data.trait_type === 'Eyes' && state.FilterEyes.find((find) => find.value === data.value) === undefined) {
              state.FilterEyes.push({
                value: data.value
              })
            }
            if (data.trait_type === 'Color' && state.FilterColor.find((find) => find.value === data.value) === undefined) {
              state.FilterColor.push({
                value: data.value
              })
            }
            if (data.trait_type === 'Mouth' && state.FilterMouth.find((find) => find.value === data.value) === undefined) {
              state.FilterMouth.push({
                value: data.value
              })
            }
          })

          // attributes.splice(0, 1)
          const points = attributes.map(bill => parseInt(bill.points || 0)).reduce((acc, bill) => bill + acc)
          const data = {
            nftId: NFT,
            price: price,
            points: points,
            attributes: attributes.map((task) => { return { task, id: Date.now().toString(36) + Math.random().toString(36).substring(2) } }),
            image: state.allNFT[NFT].image,
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            name: state.allNFT[NFT].name
          }
          state.marketPlaceItems.push(data)
        })
        state.floorPrice = Math.min(...allPrices)
      })
    },
    async getAllNFT (state) {
      await axios(state.FullMeta)
        .then(data => {
          state.allNFT = data.data
          this.commit('getMarketPlaceItems')
          this.commit('getVolume')
          this.commit('getMyDinos')
        })
    },
    getMyDinos (state) {
      const contract = new ethers.Contract(contractAddress, abi, state.signer)
      if (state.myDinosQuery === 0) {
        state.myDinosQuery = 1
        contract.tokensOfOwner(state.account).then((supply) => {
          contract.getForSale().then((salesb) => {
            const sales = salesb.map((nftData) => (nftData[0].toString()))
            const myNFT = supply.toString().split(',')
            const myDinosItems = myNFT.map(nftId => {
              if (state.allNFT[nftId]) {
                const attributes = state.allNFT[nftId].attributes
                // attributes.splice(0, 1)
                const points = attributes.map(bill => parseFloat(bill.points || 0)).reduce((acc, bill) => bill + acc)
                const forSale = sales.toString().indexOf(nftId)
                const metaData = {
                  id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                  name: state.allNFT[nftId].name,
                  nftId: nftId,
                  image: state.allNFT[nftId].image,
                  points: points,
                  forSale: forSale,
                  attributes: attributes.map((task) => { return { task, id: Date.now().toString(36) + Math.random().toString(36).substring(2) } })
                }
                return metaData
              } else {
                return false
              }
            })
            if (myDinosItems[0] !== false) {
              state.myDinos = myDinosItems
            }
          })
        })
      }
    },
    AddTransaction (state, { hash, summery }) {
      const transactions = getRecentTransactions()
      transactions[hash] = {
        hash,
        summery
      }
      localStorage.setItem(StorageId, JSON.stringify(transactions))
      state.transactions = transactions
    },
    ClearTransactions (state) {
      localStorage.removeItem(StorageId)
      state.transactions = {}
    },
    checkedTransactions (state, { chainId, hash, blockNumber }) {
      const transactions = getRecentTransactions()
      const tx = transactions[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(
          blockNumber,
          tx.lastCheckedBlockNumber
        )
      }
      transactions[hash] = tx
      localStorage.setItem(StorageId, JSON.stringify(transactions))
      state.transactions = transactions
    },
    finalizeTransaction (state, { hash, receipt }) {
      const transactions = getRecentTransactions()
      const tx = transactions[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = new Date().getTime()
      transactions[hash] = tx
      localStorage.setItem(StorageId, JSON.stringify(transactions))
      state.transactions = transactions
    },
    checkAndFinalizeTransactions (state) {
      const { chainId, library, blockNumber, transactions } = state
      if (!chainId || !library || !blockNumber) return
      Object.keys(transactions)
        .filter((hash) => shouldCheck(blockNumber, transactions[hash]))
        .forEach((hash) => {
          library
            .getTransactionReceipt(hash)
            .then((receipt) => {
              if (receipt) {
                this.commit('finalizeTransaction', {
                  hash,
                  receipt: {
                    blockHash: receipt.blockHash,
                    blockNumber: receipt.blockNumber,
                    contractAddress: receipt.contractAddress,
                    from: receipt.from,
                    status: receipt.status,
                    to: receipt.to,
                    transactionHash: receipt.transactionHash,
                    transactionIndex: receipt.transactionIndex
                  }
                })
                Vue.$toast.open(transactions[hash]?.summery)
              } else {
                this.commit('checkedTransaction', {
                  chainId,
                  hash,
                  blockNumber
                })
              }
            })
            .catch((error) => {
              console.error(`failed to check transaction hash: ${hash}`, error)
            })
        })
    },
    getAllTransactions (state) {
      state.transactions = getRecentTransactions()
    }
  },
  actions: {
    async fetchAccountData ({ state }) {
      if (state.library) {
        state.signer = state.library.getSigner()
        state.chainId = await state.signer.getChainId()
        if (state.chainId !== 43114) {
          state.wrongChainId = true
          const lib = state.library
          const account = await state.signer.getAddress()
          await lib?.send('wallet_addEthereumChain', [ChainParams, account])
        } else {
          state.wrongChainId = false
        }
        if (!state.wrongChainId) {
          state.account = await state.signer.getAddress()
          this.commit('getAllNFT')
        }
      }
    },
    async handleChainChanged ({ state }) {
      if (state.provider) {
        state.library = new ethers.providers.Web3Provider(state.provider)
        this.dispatch('fetchAccountData')
      }
    },
    async handleDisconnect ({ state }) {
      state.library = null
      state.provider = null
      state.account = null
      state.signer = null
      state.chainId = null
      state.wrongChainId = null
      localStorage.setItem('disconnect', 1)
    },
    async handleAccountsChanged ({ state }, accounts) {
      if (state.provider) {
        if (accounts.length > 0) {
          state.library = new ethers.providers.Web3Provider(state.provider)
          this.dispatch('fetchAccountData')
        } else {
          this.dispatch('handleDisconnect')
        }
      }
    },
    async connectWallet ({ state }, { connector, first }) {
      if (localStorage.getItem('disconnect') === '1' && first === 1) { return false }
      localStorage.setItem('disconnect', '0')
      if (connector && connector.isInstalled() && !state.library) {
        const provider = await connector.connect()
        if (provider) {
          state.isModalOpen = false
          state.provider = provider
          state.library = new ethers.providers.Web3Provider(provider)
          this.dispatch('fetchAccountData')
          provider.on('chainChanged', () => this.dispatch('handleChainChanged'))
          provider.on('networkChanged', () =>
            this.dispatch('handleChainChanged')
          )
          provider.on('accountsChanged', (accounts) =>
            this.dispatch('handleAccountsChanged', accounts)
          )
          provider.on('disconnect', () => this.dispatch('handleDisconnect'))
        }
      }
    },
    async disconnectWallet ({ state }) {
      if (
        state.provider &&
        state.provider?.disconnect &&
        typeof state.provider?.disconnect === 'function'
      ) {
        state.provider.disconnect()
      }
      this.dispatch('handleDisconnect')
    },
    async connectNetwork ({ state, commit }) {
      commit('getAllTransactions')
      const library = new ethers.providers.JsonRpcProvider(
        'https://api.avax.network/ext/bc/C/rpc'
      )
      commit('updateTotalSupply', library)
      library
        .getBlockNumber()
        .then((blockNumber) =>
          commit('blockNumberCallback', { blockNumber, library })
        )
        .catch((error) =>
          console.error(
            `Failed to get block number for chainId: ${state.chainId}`,
            error
          )
        )
      library.on('block', (blockNumber) =>
        commit('blockNumberCallback', { blockNumber, library })
      )
    }
  },
  modules: {},
  getters: {
    useMintContract (state) {
      if (!state.signer) {
        return null
      }
      return new ethers.Contract(contractAddress, abi, state.signer)
    },
    getModal (state) {
      return state.moodal
    },
    getCurrentModal (state) {
      return state.currentModal
    },
    closeModal (state) {

    }
  }
})
