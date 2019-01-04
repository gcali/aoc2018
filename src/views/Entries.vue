<template lang="pug">
    .wrapper
        .header Entries
            hr

        .entries
            ul
                li
                    router-link(:to="{name: 'frequency'}") Frequency
</template>