import PocketBase from "pocketbase";

//indirizzo di localhost
//Per andare su pockethost: http://raspberrypi:8091/_/
const pb = new PocketBase("http://raspberrypi:8091");

export async function getFullListDrivers() {
    const result = await pb.collection("drivers").getFullList();
    return result;
}

export async function getDriversByTeam(teamId: string) {
    const result = await pb.collection("drivers").getFullList({
        filter: `teamId = "${teamId}"`
    });
    return result;
}

export default pb;
