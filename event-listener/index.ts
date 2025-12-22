
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { idl } from "./idl";
import { Program } from "@coral-xyz/anchor";
import Redis from "ioredis";


const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const program = new Program(idl as any , {connection});
const redis = new Redis();
redis.duplicate();

async function ensureConsumerGroup() {
    try {
        await redis.xgroup("CREATE", "stream", "consumer_group", "$", "MKSTREAM");

    } catch (error) {
        if(error.messages.includes("BUSYGROUP")) {
            console.log("Group already Exists")
        }else {
            console.log("Error creating group", error)
        }
    }
}

function formateEvent(action: string, data: any) {
    return {
        "type": action,
        "data": data
    } 
    
}


async function startEventListener() {
    console.log(`Starting event listener...`);
    ensureConsumerGroup();

    await program.addEventListener("BetPlaced", (event) => {
        console.log("Bet Placed Event:", event);
        const payload = formateEvent("BetPlaced", event);
        redis.xadd("stream", "*", "event", JSON.stringify(payload));
    });

    await program.addEventListener("BetSettled", (event) => {
        console.log("Bet Settled Event:", event);
        const payload = formateEvent("BetSettled", event);
        redis.xadd("stream", "*", "event", JSON.stringify(payload));
    });

    await program.addEventListener("BetCancelled", (event) => {
        console.log("Bet Cancelled Event:", event);
        const payload = formateEvent("BetCancelled", event);
        redis.xadd("stream", "*", "event", JSON.stringify(payload));
    });

    console.log(`Event listener started.`);


}


async function runWithConnect() {
    while(true) {
        try {
            await startEventListener();
        } catch (error) {
            console.log("Error starting event listener:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}


runWithConnect();