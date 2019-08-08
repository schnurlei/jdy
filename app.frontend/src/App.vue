<template>
    <v-app id="inspire">
        <v-navigation-drawer  app>
            <v-list rounded>
                <v-subheader>ENTITIES</v-subheader>
                <v-list-item-group color="primary">
                    <v-list-item v-for="(item, i) in menuitems" :key="i" :href="item.href">
                        <v-list-item-icon>
                            <v-icon v-html="item.icon"></v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title  v-text="item.title"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar
                app
                color="indigo"
                dark
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title>Application</v-toolbar-title>
        </v-app-bar>

        <v-content>
            <router-view></router-view>
        </v-content>
        <v-footer
                color="indigo"
                app
        >
            <span class="white--text">&copy; 2019</span>
        </v-footer>
    </v-app>
</template>

<script lang="ts">

import HelloWorld from '@/components/HelloWorld.vue';
import {JsonHttpObjectReader} from "@/js/jdy/jdy-http";
import Component from 'vue-class-component';
import {Vue} from 'vue-property-decorator';
import {JdyRepository} from "@/js/jdy/jdy-base";

@Component( {
    name: 'App',
    components: {
        HelloWorld
    }
})
export default class App extends Vue {

    menuitems = [
        { title: 'Home', icon: 'dashboard', href: '#/' }
        ];
    right = true;
    title = 'Jdy';
    about = '-fetch-';

    mounted () {
        this.fetchMeta();
    }

    fetchMeta () {

        let metaReader = new JsonHttpObjectReader('/', 'meta',  process.env.VUE_APP_READ_LOCAL);
        metaReader.loadMetadataFromDb(
            metaRepo => {

                let repo: JdyRepository = metaRepo;
                Object.values(repo.getClasses()).forEach( value =>{
                    this.menuitems.push( {
                        title: value.getInternalName(),
                        icon: 'dashboard',
                        href: '#/jdy/' + value.getInternalName()
                    })
                });
            },
            error => { this.about = error; return null; });

    }
};
</script>
