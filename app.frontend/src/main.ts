import '@babel/polyfill';
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import vuetify from './plugins/vuetify';
import VeeValidate from 'vee-validate';
import App from './App.vue';
import JdyHolder from './components/JdyHolder.vue';
import JdyTable from './components/JdyTable.vue';
import JdyPanel from './components/JdyPanel.vue';
import JdyPrimitiveComponentHolder from './components/JdyPrimitiveComponentHolder.vue';
import JdyStringField from './components/JdyStringField.vue';
import JdyLongField from './components/JdyLongField.vue';
import JdyDecimalField from './components/JdyDecimalField.vue';
import JdyTimestampField from './components/JdyTimestampField.vue';
import JdyBooleanField from './components/JdyBooleanField.vue';
import JdyTextField from './components/JdyTextField.vue';
import JdyNumericTextField from './components/JdyNumericTextField.vue';

import router from './router';
import './registerServiceWorker';
import JdyDetailTableHolder from '@/components/JdyDetailTableHolder.vue';

Vue.config.productionTip = false;
Vue.component('jdy-holder', JdyHolder);
Vue.component('jdy-detail-table', JdyDetailTableHolder);
Vue.component('jdy-table', JdyTable);
Vue.component('jdy-panel', JdyPanel);
Vue.component('jdy-primitive', JdyPrimitiveComponentHolder);
Vue.component('jdy-string', JdyStringField);
Vue.component('jdy-long', JdyLongField);
Vue.component('jdy-decimal', JdyDecimalField);
Vue.component('jdy-timestamp', JdyTimestampField);
Vue.component('jdy-boolean', JdyBooleanField);
Vue.component('jdy-text', JdyTextField);

Vue.component('jdy-numeric', JdyNumericTextField);
Vue.use(VeeValidate);
Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: 'mdi'
    }
});

Vue.config.productionTip = false;

new Vue({
    router,
    // @ts-ignore
    vuetify,
    render: h => h(App)
}).$mount('#app');
