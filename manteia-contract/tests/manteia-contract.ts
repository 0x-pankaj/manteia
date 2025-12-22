import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { ManteiaContract } from "../target/types/manteia_contract";
import { expect } from "chai";

describe("manteia-contract with magicblock", () => {
  console.log("manteia-contract test with magicblock");

  // Provider for base layer
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Provider for ephemeral rollup (unused here, but kept for future)
  const providerEphemeralRollup = new anchor.AnchorProvider(
    new anchor.web3.Connection(
      process.env.EPHEMERAL_PROVIDER_ENDPOINT || "http://127.0.0.1:8899",
      {
        wsEndpoint: process.env.EPHEMERAL_WS_ENDPOINT || "ws://127.0.0.1:8900",
        commitment: "confirmed",
      }
    ),
    anchor.Wallet.local(),
    { commitment: "confirmed" }
  );

  // Program
  const program = anchor.workspace.ManteiaContract as Program<ManteiaContract>;
  const programEphemeralRollup = new Program(program.idl, providerEphemeralRollup);

  // Test vars
  const user = anchor.Wallet.local().payer;
  const [proxyPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("proxy"), user.publicKey.toBuffer()],
    program.programId,
  );

  // Game account PDA - centralized vault for all deposited SOL
  const [gameAccountPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault")],
    program.programId,
  );

  console.log("Base Layer Connection: ", provider.connection.rpcEndpoint);
  console.log("Ephemeral Rollup Connection: ", providerEphemeralRollup.connection.rpcEndpoint);
  console.log(`User Public Key: ${user.publicKey}`);
  console.log(`Proxy PDA: ${proxyPDA.toString()}`);
  console.log(`Game Account PDA: ${gameAccountPDA.toString()}`);
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Current SOL Public Key: ${anchor.Wallet.local().publicKey}`);

  before(async () => {
    const balance = await provider.connection.getBalance(anchor.Wallet.local().publicKey);
    console.log("Current SOL Balance: ", balance / anchor.web3.LAMPORTS_PER_SOL);

    if (balance / anchor.web3.LAMPORTS_PER_SOL < 1) {
      throw new Error("Insufficient SOL balance for tests");
    }
  });

  it("initializes game account (centralized vault)", async () => {
    try {
      const accountInfo = await provider.connection.getAccountInfo(gameAccountPDA);
      if (accountInfo) {
        console.log("Game account already exists");
        return; // Skip if exists
      }

      const tx = await program.methods
        .initializeGameAccount()
        .accounts({
          gameAccount: gameAccountPDA,
          authority: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize Game Account TX: ", tx);

      // Verify game account creation
      const gameAccount = await program.account.gameAccount.fetch(gameAccountPDA);
      expect(gameAccount.authority.toString()).to.equal(user.publicKey.toString());
      expect(gameAccount.totalDeposits.toNumber()).to.equal(0);

      console.log("Game account initialized successfully.");
    } catch (error) {
      console.error("Error initializing game account: ", error);
      throw error;
    }
  });

  it("creates proxy account on base layer", async () => {
    try {
      const accountInfo = await provider.connection.getAccountInfo(proxyPDA);
      if (accountInfo) {
        console.log("Proxy account already exists on base layer");
        return; // Skip if exists
      }

      const tx = await program.methods
        .createProxyAccount()
        .accounts({
          proxyAccount: proxyPDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Create Proxy Account TX: ", tx);

      // Verify account creation (custom units: init balance=100)
      const proxyAccount = await program.account.proxyAccount.fetch(proxyPDA);
      expect(proxyAccount.owner.toString()).to.equal(user.publicKey.toString());

      // FIX: Compare the numeric values, not the BN objects themselves
      expect(proxyAccount.balance.toNumber()).to.equal(100);
      expect(proxyAccount.activeBetCount).to.equal(0);
      expect(proxyAccount.totalBetsPlaced.toNumber()).to.equal(0);

      console.log("Proxy account created with 100 units balance.");
    } catch (error) {
      console.error("Error creating proxy account: ", error);
      throw error;
    }
  });

  it("places a bet without ephemeral rollup", async () => {
    try {
      // Fetch pre-bet state
      const preBetProxy = await program.account.proxyAccount.fetch(proxyPDA);
      const preBalance = preBetProxy.balance;
      console.log(`Pre-bet balance: ${preBalance.toString()} units`);

      // Bet params (in custom units)
      const betAmount = new BN(1); // 1 unit
      const targetPriceRangeStart = new BN(3000);
      const targetPriceRangeEnd = new BN(4000);
      const now = Math.floor(Date.now() / 1000);
      const predictionStartTime = new BN(now + 30); // 30s in future
      const predictionEndTime = predictionStartTime.add(new BN(60)); // +1 min window
      const payoutMultiplier = new BN(2);

      const tx = await program.methods
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
          user: user.publicKey,
        })
        .rpc();

      console.log("Place Bet TX: ", tx);

      // Verify post-bet state
      const proxyAccount = await program.account.proxyAccount.fetch(proxyPDA);

      // FIX: Use .toNumber() for numeric comparisons
      expect(proxyAccount.activeBetCount).to.equal(1);
      expect(proxyAccount.balance.toNumber()).to.equal(preBalance.toNumber() - betAmount.toNumber());
      expect(proxyAccount.totalBetsPlaced.toNumber()).to.equal(1);

      // Verify first bet
      const placedBet = proxyAccount.bets[0];
      expect(placedBet.amount.toNumber()).to.equal(betAmount.toNumber());
      expect(placedBet.targetPriceRangeStart.toNumber()).to.equal(targetPriceRangeStart.toNumber());
      expect(placedBet.targetPriceRangeEnd.toNumber()).to.equal(targetPriceRangeEnd.toNumber());
      expect(placedBet.predictionStartTime.toNumber()).to.equal(predictionStartTime.toNumber());
      expect(placedBet.predictionEndTime.toNumber()).to.equal(predictionEndTime.toNumber());
      expect(placedBet.payoutMultiplier.toNumber()).to.equal(payoutMultiplier.toNumber());
      expect(placedBet.active).to.be.true;
      expect(placedBet.resolved).to.be.false;
      expect(placedBet.won).to.be.false;

      console.log(`Bet placed successfully. New balance: ${proxyAccount.balance.toString()} units`);
    } catch (error) {
      console.error("Error placing bet without ephemeral rollup: ", error);
      throw error;
    }
  });

  it("delegates authority to ephemeral rollup", async () => {
    try {
      // Determine if we're on local validator
      const isLocal =
        provider.connection.rpcEndpoint.includes("localhost") ||
        provider.connection.rpcEndpoint.includes("127.0.0.1");

      // Local validator identity for ephemeral rollup
      const localValidatorPubkey = new anchor.web3.PublicKey(
        "mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev"
      );

      const remainingAccounts = isLocal
        ? [
          {
            pubkey: localValidatorPubkey,
            isSigner: false,
            isWritable: false,
          },
        ]
        : [];

      console.log("Delegating with validator:", isLocal ? localValidatorPubkey.toString() : "default");

      const tx = await program.methods
        .delegateProxyAccount()
        .accounts({
          payer: provider.wallet.publicKey,
          pda: proxyPDA,
        })
        .remainingAccounts(remainingAccounts)
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      console.log("Delegate TX: ", tx);
      console.log("Successfully delegated proxy account to ephemeral rollup");

      // Wait a bit for delegation to propagate
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error delegating authority to ephemeral rollup: ", error);
      throw error;
    }
  });

  it("verifies proxy account delegation", async () => { });

  it("places a bet with ephemeral rollup", async () => { });



});
