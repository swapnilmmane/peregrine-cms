var cmpAdminComponentsNav = (function () {
'use strict';

var template = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('nav',{attrs:{"data-per-path":_vm.model.path}},[_c('div',{staticClass:"nav-wrapper blue-grey darken-3"},[_c('div',{staticClass:"brand-logo"},[_c('admin-components-action',{attrs:{"model":{ 
            command: 'selectPath', 
            title: 'home', 
            target: '/content/admin' 
          }}}),_vm._v("» "+_vm._s(_vm.vueRoot.adminPage.title))],1),_c('ul',{staticClass:"right hide-on-med-and-down",attrs:{"id":"nav-mobile"}},[_c('li',[_vm._v(_vm._s(this.$root.$data.state.user))])])])])},staticRenderFns: [],
    props: ['model'],
    computed: {
        vueRoot: function() {
            return this.$root
        }
    }
};

return template;

}());