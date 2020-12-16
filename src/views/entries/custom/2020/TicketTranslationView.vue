<template lang="pug">
    BaseMessageTemplate(
        :title="title"
        :id="id"
        :year="year"
        :entry="entry"
        :messageHandler="messageHandler"
        :additionalReset="reset"
    )
        .ticket(v-if="showTicket")
            .title Train Ticket
            .ticket-field(v-for="ticket in ticketData" :key="ticket.id" )
                label.label {{ticket.label}}
                label.value(:class="{'highlighted': ticket.label.startsWith('departure')}") {{ticket.value}}
                
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
    Entry, MessageSender,
} from "../../../../entries/entry";
import BaseMessageTemplate from "../BaseMessageTemplate.vue";
import {isTicketTranslationMessage} from "../../../../entries/single-entries/2020/ticket-translation/communication";

interface TicketData {
    id: number;
    value: number;
    label: string;
}
@Component({
    components: {
        BaseMessageTemplate
    }
})
export default class TicketTranslationView extends Vue {

@Prop({required: false, default: undefined}) public messageHandlerSetter?: (sender: MessageSender) => void;
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    @Prop() public year!: number;

    private showTicket = false;
    private ticketData: TicketData[] = [];


    private reset() {
        this.showTicket = false;
        this.ticketData.length = 0;
    }
    private async messageHandler(message: any): Promise<void> {
        if (!isTicketTranslationMessage(message)) {
            throw new Error("Invalid message");
        }
        this.showTicket = true;
        switch (message.type) {
            case "setup":
                this.ticketData = message.ticket.map((n, i) => {
                    return {
                        id: i,
                        value: n,
                        label: ""
                    };
                });
                break;
            case "label":
                this.ticketData[message.index].label = message.label;
                break;
        }
    }

}
</script>


<style lang="scss">
.ticket {
    max-width: 100%;
    width: 40em;
    border: 1px solid white;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    box-shadow: 4px 9px 3px 1px #607D8B;
    margin-top: 1em;
    background-color: lightgoldenrodyellow;
    color: black;
    padding: 1em;
    font-family: Courier;
    .title {
        font-weight: bold;
        font-size: 120%;
        flex-basis: 100%;
        margin-bottom: 1em;
    }
    .ticket-field {
        flex-grow: 1;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0.2em 1em;
        // margin: 0.2em 1em;
        border: 1px solid black;
        margin-top: -0.75px;
        margin-left: -0.75px;
        // .label {
        //     max-width: 9em;
        // }
        .value {
            &.highlighted {
                border: 1px dashed black;
            }
            text-align: center;
            // display: flex;
            // flex-direction: row;
            // align-items: flex-end;
            // justify-content: flex-end;
            font-weight: bold;
        }
    }
}
</style> 
