import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from './views/Home.vue';
import { testCreatePlantShopRepository } from './jdy-test';
import JdyHolder from './components/JdyHolder.vue';

Vue.use(VueRouter);

const plantRepository = testCreatePlantShopRepository();

function convertRouteToClassInfo (route) {

    const classInfo = plantRepository.getClassInfo(route.params.classinfo);
    return {
        classinfo: classInfo
    };

}

export default new VueRouter({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
        },
        {
            path: '/jdy/:classinfo', component: JdyHolder, props: convertRouteToClassInfo
        }
    ]
});
