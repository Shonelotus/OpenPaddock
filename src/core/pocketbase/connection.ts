import PocketBase from "pocketbase";

//indirizzo di localhost
//Per andare su pockethost: http://raspberrypi:8091/_/
const pb = new PocketBase("http://raspberrypi:8091");

// Sincronizza lo stato di PocketBase con i cookie per il middleware
if (typeof document !== "undefined") {
    pb.authStore.onChange(() => {
        document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    });
}

export default pb;
