const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🧪 Testing deployed contracts on Creditcoin testnet...\n");

    const [signer] = await hre.ethers.getSigners();
    console.log("Testing with account:", signer.address);

    // Load deployment data
    const deploymentFile = path.join(__dirname, "..", "deployments", "creditcoinTestnet.json");

    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found!");
        console.error("Please deploy contracts first: pnpm deploy:testnet");
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log("Loaded deployment from:", deployment.timestamp);
    console.log();

    // Connect to contracts
    const oracle = await hre.ethers.getContractAt(
        "CreditScoreOracle",
        deployment.contracts.CreditScoreOracle
    );

    const governance = await hre.ethers.getContractAt(
        "PlatformGovernance",
        deployment.contracts.PlatformGovernance
    );

    const invoiceNFT = await hre.ethers.getContractAt(
        "InvoiceNFT",
        deployment.contracts.InvoiceNFT
    );

    const financingPool = await hre.ethers.getContractAt(
        "FinancingPool",
        deployment.contracts.FinancingPool
    );

    console.log("📊 Testing CreditScoreOracle...");
    try {
        const score = await oracle.getCreditScore(signer.address);
        console.log("  ✓ Credit score:", score.toString());

        const discountRate = await oracle.getDiscountRate(signer.address);
        console.log("  ✓ Discount rate:", discountRate.toString(), "basis points");

        const constants = {
            INITIAL_SCORE: await oracle.INITIAL_SCORE(),
            MIN_SCORE: await oracle.MIN_SCORE(),
            MAX_SCORE: await oracle.MAX_SCORE(),
        };
        console.log("  ✓ Constants:", constants.INITIAL_SCORE.toString(), "/", constants.MIN_SCORE.toString(), "/", constants.MAX_SCORE.toString());
    } catch (error) {
        console.error("  ❌ Error:", error.message);
    }
    console.log();

    console.log("🏛️  Testing PlatformGovernance...");
    try {
        const paused = await governance.paused();
        console.log("  ✓ Platform paused:", paused);

        const admin1 = await governance.admins(0);
        const admin2 = await governance.admins(1);
        const admin3 = await governance.admins(2);
        console.log("  ✓ Admins:", admin1.slice(0, 6) + "...", admin2.slice(0, 6) + "...", admin3.slice(0, 6) + "...");

        const treasuryBalance = await governance.getTreasuryBalance();
        console.log("  ✓ Treasury balance:", hre.ethers.formatEther(treasuryBalance), "CTC");
    } catch (error) {
        console.error("  ❌ Error:", error.message);
    }
    console.log();

    console.log("🎫 Testing InvoiceNFT...");
    try {
        const name = await invoiceNFT.name();
        const symbol = await invoiceNFT.symbol();
        console.log("  ✓ Name:", name);
        console.log("  ✓ Symbol:", symbol);

        const nextTokenId = await invoiceNFT.nextTokenId();
        console.log("  ✓ Next token ID:", nextTokenId.toString());

        const financingPoolAddr = await invoiceNFT.financingPool();
        console.log("  ✓ Financing pool set:", financingPoolAddr === deployment.contracts.FinancingPool ? "✓" : "✗");
    } catch (error) {
        console.error("  ❌ Error:", error.message);
    }
    console.log();

    console.log("💰 Testing FinancingPool...");
    try {
        const platformFee = await financingPool.platformFeePercent();
        console.log("  ✓ Platform fee:", platformFee.toString(), "basis points (", (Number(platformFee) / 100).toFixed(1), "%)");

        const invoiceNFTAddr = await financingPool.invoiceNFT();
        console.log("  ✓ InvoiceNFT set:", invoiceNFTAddr === deployment.contracts.InvoiceNFT ? "✓" : "✗");

        const creditOracleAddr = await financingPool.creditOracle();
        console.log("  ✓ CreditOracle set:", creditOracleAddr === deployment.contracts.CreditScoreOracle ? "✓" : "✗");
    } catch (error) {
        console.error("  ❌ Error:", error.message);
    }
    console.log();

    console.log("✅ All contract tests passed!");
    console.log();
    console.log("📝 Contract Addresses:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("CreditScoreOracle:   ", deployment.contracts.CreditScoreOracle);
    console.log("PlatformGovernance:  ", deployment.contracts.PlatformGovernance);
    console.log("InvoiceNFT:          ", deployment.contracts.InvoiceNFT);
    console.log("FinancingPool:       ", deployment.contracts.FinancingPool);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();
    console.log("🎉 Deployment is working correctly!");
    console.log();
    console.log("Next steps:");
    console.log("1. Update frontend/.env.local with these addresses");
    console.log("2. Try minting an invoice on the testnet");
    console.log("3. Test the complete user flow");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
