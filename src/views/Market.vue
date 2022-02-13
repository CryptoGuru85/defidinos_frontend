<template>
  <div>
    <WalletModal v-show="isModalOpen" />
    <navbar />
    <section>
        <div class="index dinos market-section">
            <div class="container">
                <div class="index-header market-header">
                    <h3>Dino Market</h3>
                </div>
                <div class="col-md-12">
                  <div class="market-bg">
                  <div class="market-filters">
                      <div class="market-filter">
                          <vue-dropdown @setSelectedOption="setNewSelectedOption($event,'sortBy','sort')" :config="sortBy" :type="'sort'"></vue-dropdown>
                      </div>
                      <div class="market-filter">
                          <vue-dropdown @setSelectedOption="setNewSelectedOption($event,'Body','trait')" :config="Body" :type="'body'" :data="FilterBody"></vue-dropdown>
                      </div>
                      <div class="market-filter">
                          <vue-dropdown @setSelectedOption="setNewSelectedOption($event,'Head','trait')" :config="Head" :type="'head'" :data="FilterHead"></vue-dropdown>
                      </div>
                      <div class="market-filter">
                          <vue-dropdown @setSelectedOption="setNewSelectedOption($event,'Eyes','trait')" :config="Eyes" :type="'eyes'" :data="FilterEyes"></vue-dropdown>
                      </div>
                  </div>
                  <div class="market-filters">
                      <div class="market-filter">
                          <vue-dropdown @setSelectedOption="setNewSelectedOption($event,'Color','trait')" :config="Color" :type="'color'" :data="FilterColor"></vue-dropdown>
                      </div>
                      <div class="market-filter">
                          <vue-dropdown @setSelectedOption="setNewSelectedOption($event,'Mouth','trait')" :config="Mouth" :type="'mouth'" :data="FilterMouth"></vue-dropdown>
                      </div>
                  </div>
                   <div class="market-text ">
                    <img src="../assets/image/avax.svg" class="avax-logo-top" alt="">
                    VOLUME: <span>{{marketVolume}}</span> AVAX
                  </div>
                  <div class="market-text first-child">
                    <img src="../assets/image/avax.svg" class="avax-logo-top" alt="">
                    FLOOR: <span>{{floorPrice}}</span> AVAX
                  </div>
                  <div class="clearfix"></div>
                </div>
                </div>
                <dino-card :market="true" />
            </div>
        </div>
    </section>

    <!-- Dino Modal -->
    <dino-modal :market="true" />
  </div>
</template>

<script>
import VueDropdown from '../components/dropdown.vue'
import { mapState, mapActions } from 'vuex'
import Navbar from '../components/Navbar.vue'
import DinoModal from './DinoModal.vue'
import DinoCard from '../components/DinoCard.vue'
import WalletModal from '../components/WalletModal/index.vue'
import { connectors } from '../connectors'

export default {
  computed: mapState([
    'isModalOpen',
    'account',
    'wrongChainId',
    'totalSupply',
    'minting',
    'FilterBody',
    'FilterHead',
    'FilterEyes',
    'FilterColor',
    'FilterMouth',
    'floorPrice',
    'marketVolume'
  ]),
  components: { Navbar, DinoCard, DinoModal, WalletModal, VueDropdown },
  methods: {
    ...mapActions(['connectWallet', 'connectNetwork']),
    setNewSelectedOption (selectedOption, element, type) {
      this[element].placeholder = selectedOption.value
      if (type == 'sort') {
        this.$store.commit('SET_SORT', selectedOption.value)
      } else {
        this.filters[element] = selectedOption.value
        this.$store.commit('SET_FILTERS', this.filters)
      }
    },
  },
  mounted () {
    this.$store.commit('CLEAR_FILTER', '')
    this.connectNetwork()
    this.connectWallet({ connector: connectors[0], first: 1 })
  },
  data: function () {
    return {
      filters: {
        Body: null,
        Head: null,
        Eyes: null,
        Color: null,
        Mouth: null,
      },
      sortBy: {
        options: [
          {
            value: 'PRICE (LOW TO HIGH)'
          },
          {
            value: 'PRICE (HIGH TO LOW)'
          },
          {
            value: 'ID (LOW TO HIGH)'
          },
          {
            value: 'ID (HIGH TO LOW)'
          }
        ],
        prefix: 'Sort By',
        backgroundColor: '#fff'
      },
      Body: {
        options: [],
        prefix: 'Body',
        backgroundColor: '#fff'
      },
      Head: {
        options: [
        ],
        prefix: 'Head',
        backgroundColor: '#fff'
      },
      Eyes: {
        options: [
        ],
        prefix: 'Eyes',
        backgroundColor: '#fff'
      },
      Color: {
        options: [
        ],
        prefix: 'Color',
        backgroundColor: '#fff'
      },
      Mouth: {
        options: [
        ],
        prefix: 'Mouth',
        backgroundColor: '#fff'
      }
    }
  }
}
</script>

<style>
.card-content .tag-list-item {
  padding:7px 5px
}

.market-header {
  margin-bottom:30px
}

.no-data {
  color:#fff;
  text-align: center;
  font-size: 30px;
  line-height: 60px;
}

html {
  min-height: 100% !important;
    height: 100%;
}

.avax-logo-top {
  height:25px!important;
  width:25px!important;
  vertical-align: middle!important;
}

.market-text {
  float:right;
  text-align:right;
  line-height:75px;
  font-family: "Dinosaur"!important;
  font-size:18px!important;
  padding-right:20px
}

.first-child {
  padding-right:50px!important
}

.market-filter {
  width:240px;
  float:left
}

.market-filters {
  display:block
}

.market-bg {
  background:#fff!important;
  padding:10px;
  border-radius: 20px;
  margin-bottom:32px;
}

.dropdown {
  border:5px solid #000!important;
  margin:10px!important;
  color:#FFA035!important;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 25px;
  border-radius: 5px!important;
}

.dropdown .text {
  font-family: "Dinosaur"!important;
  font-size:18px!important
}

.expand {
    position: absolute;
    z-index: 998;
    background: #fff;
    top: 50px;
    border: 6px solid #000!important;
    border-radius: 5px;
    display:none;
    height:auto!important;
    max-height: 240px;
    overflow-y: scroll;
}

.option {
   font-family: "Dinosaur"!important;
   font-size:18px!important;
   padding:7px 15px!important;
   font-weight: inherit!important;
}

.expanded .text {
  color:#000!important
}

.expanded .expand {
  display:inline-block!important;
}

.market-section .card {
    max-width: none;
    margin: 0;
}

</style>
