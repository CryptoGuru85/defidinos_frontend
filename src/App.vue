<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
  @import "~bootstrap/scss/bootstrap-grid.scss";
  @import "./assets/scss/main.scss";

  .header-fixed {
    position: fixed;
    width: 100%;
    z-index: 999;
  }

  .index, .roadmap {
    padding-top:120px!important
  }

  body {
    background: #131701;
    background: linear-gradient(180deg, #151806 1%, #131701 100%) fixed;
    font-family: $font;
  }

  .highlight {
    cursor:pointer!important
  }

  .clearfix {
    clear:both;
  }

  .market-filter {
    display:flex
  }

  .dropdown {
    width:100%!important
  }

  /* width */
  ::-webkit-scrollbar {
    width: 15px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: $white;
    border-left: 3px solid #000;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #ffa035;
    border-left: 3px solid #000;
  }
</style>