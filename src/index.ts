import { main } from "./main";

export class Relayer {
    constructor() {
        console.log("Constructing");
    }

    /**
     * Starts the relayer
     */
    public start() {
        main();
    }
}
