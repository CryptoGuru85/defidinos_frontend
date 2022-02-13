<template>
  <header class="navbar header-fixed">
      <div class="container">
        <nav>
          <ul class="nav-items" :class="navbarStatus ? 'nav-item-show' : 'nav-item-hidden'">
            <li><router-link :class="isPath('/')?'menuActive':''" :to="{ name: 'home'}"> Claim </router-link></li>
            <li><router-link :class="isPath('/details')?'menuActive':''" :to="{ name: 'details'}"> Details </router-link></li>
            <li><router-link :class="isPath('/my-dinos')?'menuActive':''" :to="{ name: 'my-dinos'}"> My Dinos </router-link></li>
            <li><router-link :disabled="true" :class="{ disabled: true }" :to="{ name: 'market'}"> Market </router-link></li>
            <li><router-link :disabled="true" :class="{ disabled: true }" :to="{ name: 'dao'}"> DAO </router-link></li>
          </ul>
          <button class="nav-toggle dropicon" @click="navbarStatus = !navbarStatus">
            <font-awesome-icon class="bars" icon="bars" />
          </button>
          <div class="actions">
            <div class="connect-box disconnected" :class="account?'connected':'not'">
                <button @click="openWalletModal">
                  {{
                      wrongChainId
                      ? 'Wrong Network'
                      : account
                      ? shortenAddress(account)
                      : 'Connect Wallet'
                  }}
                </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
</template>

<script>

import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { shortenAddress } from '../utils'
import { ethers } from 'ethers'

export default {
  computed: mapState([
    'isModalOpen',
    'account',
    'wrongChainId',
    'totalSupply',
    'minting'
  ]),
  data () {
    return {
      dino: 1,
      headerFix: true,
      navbarStatus: false
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler (to, from) {
        document.title = to.meta.title || 'Defi Dinos'
      }
    }
  },
  methods: {
    isPath (par) {
      if (this.$router.history.current.path === par) {
        return true
      } else {
        return false
      }
    },
    isHome () {
      if (this.$router.history.current.path !== '/') {
        document.body.classList.add('body-pad')
      } else {
        document.body.classList.remove('body-pad')
      }
    },
    ...mapActions(['connectWallet', 'connectNetwork']),
    ...mapMutations(['openWalletModal', 'setMinting', 'AddTransaction']),
    ...mapGetters(['useMintContract']),
    shortenAddress,
    calculateGasMargin (value) {
      return value
        .mul(ethers.BigNumber.from(10000).add(ethers.BigNumber.from(1000)))
        .div(ethers.BigNumber.from(10000))
    },
    mint () {
      const contract = this.useMintContract()
      if (contract) {
        this.setMinting(true)
        contract.estimateGas
          .mintNFT(this.dino, {
            value: ethers.utils.parseEther((this.dino * 1).toString())
          })
          .then((estimatedGas) => {
            contract
              .mintNFT(this.dino, {
                value: ethers.utils.parseEther((this.dino * 1).toString()),
                gasLimit: this.calculateGasMargin(estimatedGas)
              })
              .then((res) => {
                if (res.hash) {
                  this.AddTransaction({
                    hash: res.hash,
                    summery: `Minted ${this.dino} Dinos`
                  })
                  this.dino = 1
                  this.setMinting(false)
                  this.$toast.open('Transaction Confirmed !!')
                }
              })
              .catch((error) => {
                this.setMinting(false)
                console.error(error)
              })
          })
          .catch((error) => {
            this.setMinting(false)
            this.$toast.error(error.message)
            console.error(error)
          })
      } else {
        this.$toast.error('Please Connect Your Wallet')
      }
    },
    increase () {
      if (this.dino < 20) {
        this.dino += 1
      }
    },
    decrease () {
      if (this.dino > 1) {
        this.dino -= 1
      }
    }
    // showNavItems () {
    //   this.navbarStatus = !this.navbarStatus
    // }
  }
}
</script>

<style scoped>
.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.disabled2 {
    pointer-events: none;
}

.menuActive {
  color:#fff!important;
}

.connect-box button {
  font-family: 'Helvetica';
}

.connected button::after {
  background-color:#46d794!important
}

.navbar {
  position: fixed;
}
.dropicon {
 width: 40px;
 height: 40px;
}
.bars {
 width: 30px;
 height: 30px;
}
.nav-item-show {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: block;
  background-color: #151806;
}
@media screen and (min-width: 576px) {
  .nav-item-show {
    padding-left: calc(50% - 270px + 12px);
  }
}
@media screen and (min-width: 768px) {
  .nav-item-show {
    padding-left: calc(50% - 360px + 12px);
  }
}
@media screen and (min-width: 992px) {
  .nav-item-show {
    padding-left: calc(50% - 480px + 12px);
  }
}
.nav-toggle {
  display: block;
}
.nav-item-hidden {
  display: none;
}
@media screen and (min-width: 1200px) {
  .nav-toggle {
    display: none;
  }
  .nav-item-hidden {
    display: flex;
  }
}
</style>
