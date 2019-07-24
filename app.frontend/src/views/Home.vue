<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png"/>
        <div>About: {{aboutMessage}}</div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { JsonHttpObjectReader } from '@/js/jdy/jdy-http';

@Component({
    components: {
    },
    })
export default class Home extends Vue {

    aboutMessage: string = '-not initialized';

    mounted () {
        this.fetchAbout();
    }

    fetchAbout () {
        fetch(new Request('api/about'))
            .then(response => response.text())
            .then(data => { this.aboutMessage = data; return null; })
            .catch(error => {
                console.log(error);
                this.aboutMessage = '-error-';
            });
    }

}
</script>
