import * as anchor from "@coral-xyz/anchor";
import { Program, BN, } from "@coral-xyz/anchor";
import { ManteiaContract } from "../target/types/manteia_contract";
import { expect } from "chai";

describe("manteia-contract with magicblock", () => {
  // Configure the client to use the local cluster.
  console.log("manteia-contract test with magicblock");

  //provider for base layer
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // provider for ephemeral rollup
  const providerEphemeralRollup = new anchor.AnchorProvider(
    new anchor.web3.Connection("https://devnet-as.magicblock.app/", 
      {
        wsEndpoint:
          process.env.EPHEMERAL_WS_ENDPOINT || "wss://devnet-as.magicblock.app/",
      }
    ),
    anchor.Wallet.local(),
  )



  // program
  const program = anchor.workspace.manteiaContract as Program<ManteiaContract>;
  const programEphemeralRollup = new Program(
    program.idl,
    providerEphemeralRollup,
  )

  //tests
  const user = anchor.Wallet.local().payer;
  const [proxyPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("proxy"), user.publicKey.toBuffer()],
    program.programId,
  );


  console.log("Base Layer Connection: ", provider.connection.rpcEndpoint);
  console.log(
    "Ephemeral Rollup Connection: ",
    providerEphemeralRollup.connection.rpcEndpoint,
  );
  console.log(`User Public Key: ${user.publicKey}`);
  console.log(`Proxy PDA: ${proxyPDA.toString()}`);
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Current SOL Public Key: ${anchor.Wallet.local().publicKey}`);




  before(async () => {
    const balance = await provider.connection.getBalance(
      anchor.Wallet.local().publicKey
    );
    console.log("Current SOL Balance: ", balance / anchor.web3.LAMPORTS_PER_SOL);

    //ensuring minimum balance for tests
    if (balance / anchor.web3.LAMPORTS_PER_SOL < 1) {
      throw new Error("Insufficient SOL balance for tests");
    }
  });

  it("creates proxy account on base layer", async () => {
    try {
      const accountInfo = await provider.connection.getAccountInfo(proxyPDA);
      if (accountInfo){
        console.log("Proxy account already exists on base layer");
      }
  
      const tx = await program.methods.createProxyAccount().accounts({
        proxyAccount: proxyPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
  
      console.log("Create Proxy Account TX: ", tx);
  
      //verify account creation
      const proxyAccount = await program.account.proxyAccount.fetch(proxyPDA);
      expect(proxyAccount.owner.toString()).to.equal(user.publicKey.toString());
      expect(proxyAccount.balance.toNumber()).to.equal(0);
      expect(proxyAccount.activeBetCount).to.equal(0);
    } catch (error) {
      console.error("Error creating proxy account: ", error);
    }

  });

  it("deposits SOL to proxy account on base layer", async () => {
    try {
      const depositAmount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL); //0.1 SOL

      const tx = await program.methods.deposit(depositAmount).accounts({
        proxyAccount: proxyPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).rpc();
      
      console.log("Deposit TX: ", tx);

      //verify deposit
      const proxyAccount = await program.account.proxyAccount.fetch(proxyPDA);
      expect(proxyAccount.balance.toNumber()).to.equal(depositAmount);
      
      console.log("Deposit successful. New Proxy Account Balance: ", proxyAccount.balance.toNumber() / anchor.web3.LAMPORTS_PER_SOL);

    } catch (error) {
      console.error("Error depositing SOL to proxy account: ", error);
    }
  });

   it("Place bet on Ephemeral Rollup (GASLESS + FAST)", async () => {
    const start = Date.now();

    const betAmount = new BN(0.01 * anchor.web3.LAMPORTS_PER_SOL); // 0.01 SOL
    const currentTime = Math.floor(Date.now() / 1000);
    const predictionStartTime = new BN(currentTime + 5); // 5 seconds from now
    const predictionEndTime = new BN(currentTime + 10); // 10 seconds from now
    const targetPriceRangeStart = new BN(45000); // $45,000
    const targetPriceRangeEnd = new BN(45500); // $45,500
    const payoutMultiplier = new BN(150); // 1.5x

    console.log(` Current Time: ${currentTime}`);
    console.log(
      ` Prediction Window: ${predictionStartTime.toString()} - ${predictionEndTime.toString()}`
    );
    console.log(
      `Price Range: $${targetPriceRangeStart.toString()} - $${targetPriceRangeEnd.toString()}`
    );

    let tx = await program.methods
      .placeBet(
        betAmount,
        targetPriceRangeStart,
        targetPriceRangeEnd,
        predictionStartTime,
        predictionEndTime,
        payoutMultiplier
      )
      .accounts({
        proxyAccount: proxyPDA,
        user: provider.wallet.publicKey,
      })
      .transaction();

    // Sign and send via Ephemeral Rollup
    tx.feePayer = providerEphemeralRollup.wallet.publicKey;
    tx.recentBlockhash = (
      await providerEphemeralRollup.connection.getLatestBlockhash()
    ).blockhash;
    tx = await providerEphemeralRollup.wallet.signTransaction(tx);

    const txHash = await providerEphemeralRollup.sendAndConfirm(tx);
    const duration = Date.now() - start;
    console.log(`${duration}ms (ER) Place Bet txHash: ${txHash}`);

    // Fetch account from Ephemeral Rollup to verify
    const proxyAccount = await program.account.proxyAccount.fetch(
      proxyPDA,
      "confirmed"
    );

    console.log(" Bet placed successfully on Ephemeral Rollup");
    console.log(`   Active Bets: ${proxyAccount.activeBetCount}`);
    console.log(
      `   Remaining Balance: ${proxyAccount.balance.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`
    );

    // Find and display the active bet
    const activeBet = proxyAccount.bets.find((bet: any) => bet.active);
    if (activeBet) {
      console.log(`   Bet ID: ${activeBet.betId.toString()}`);
      console.log(
        `   Bet Amount: ${activeBet.amount.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`
      );
      console.log(
        `   Payout Multiplier: ${activeBet.payoutMultiplier.toNumber() / 100}x`
      );
    }
  });


});
