import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import JdyHolder from './components/JdyHolder.vue';
import { JsonHttpObjectReader } from '@/js/jdy/jdy-http';

Vue.use(Router);

let metaRepo = null;

const metaRepoPromise: Promise<any> = fetchMetaPromise();

function convertRouteToClassInfo (route) {

    if (metaRepo != null) {
        // @ts-ignore
        const classInfo = metaRepo.getClassInfo(route.params.classinfo);
        return {
            classinfo: classInfo
        };
    }
    return null;
}

function fetchMetaPromise (): Promise<any> {

    var dfrd: Promise<any> = new Promise((resolve, reject) => {

        let metaReader = new JsonHttpObjectReader('/', 'meta', process.env.VUE_APP_READ_LOCAL);
        metaReader.loadMetadataFromDb(metaData => { resolve(metaData); },
            error => { reject(error) });
    });

    return dfrd;
}

const jdyRouter = new Router({
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

jdyRouter.beforeEach((to, from, next) => {

    metaRepoPromise.then(aMetaRepo => { metaRepo = aMetaRepo; });
    next();
});

export default jdyRouter;
