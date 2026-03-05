const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔧 Configuring deployed contracts on Creditcoin testnet...\n");

    const [signer] = await hre.ethers.getSigners();
    console.log("Configuring with account:", signer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "CTC\n");

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

    console.log("📋 Contract Addresses:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("CreditScoreOracle:   ", deployment.contracts.CreditScoreOracle);
    console.log("PlatformGovernance:  ", deployment.contracts.PlatformGovernance);
    console.log("InvoiceNFT:          ", deployment.contracts.InvoiceNFT);
    console.log("FinancingPool:       ", deployment.contracts.FinancingPool);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Check current configuration
    console.log("🔍 Checking current configuration...\n");

    const invoiceNFT_financingPool = await invoiceNFT.financingPool();
    const invoiceNFT_governance = await invoiceNFT.governance();
    const invoiceNFT_creditOracle = await invoiceNFT.creditOracle();

    const financingPool_invoiceNFT = await financingPool.invoiceNFT();
    const financingPool_creditOracle = await financingPool.creditOracle();
    const financingPool_governance = await financingPool.governance();

    console.log("InvoiceNFT configuration:");
    console.log("  financingPool:", invoiceNFT_financingPool);
    console.log("  governance:", invoiceNFT_governance);
    console.log("  creditOracle:", invoiceNFT_creditOracle);
    console.log();

    console.log("FinancingPool configuration:");
    console.log("  invoiceNFT:", financingPool_invoiceNFT);
    console.log("  creditOracle:", financingPool_creditOracle);
    console.log("  governance:", financingPool_governance);
    console.log();

    // Configure contracts
    console.log("⚙️  Configuring contracts...\n");

    let txCount = 0;

    // 1. Configure InvoiceNFT
    if (invoiceNFT_financingPool !== deployment.contracts.FinancingPool) {
        console.log("Setting FinancingPool address in InvoiceNFT...");
        const tx = await invoiceNFT.setFinancingPool(deployment.contracts.FinancingPool);
        await tx.wait();
        console.log("  ✓ Transaction:", tx.hash);
        txCount++;
    } else {
        console.log("  ✓ FinancingPool already set in InvoiceNFT");
    }

    if (invoiceNFT_governance !== deployment.contracts.PlatformGovernance) {
        console.log("Setting Governance address in InvoiceNFT...");
        const tx = await invoiceNFT.setGovernance(deployment.contracts.PlatformGovernance);
        await tx.wait();
        console.log("  ✓ Transaction:", tx.hash);
        txCount++;
    } else {
        console.log("  ✓ Governance already set in InvoiceNFT");
    }

    if (invoiceNFT_creditOracle !== deployment.contracts.CreditScoreOracle) {
        console.log("Setting CreditOracle address in InvoiceNFT...");
        const tx = await invoiceNFT.setCreditOracle(deployment.contracts.CreditScoreOracle);
        await tx.wait();
        console.log("  ✓ Transaction:", tx.hash);
        txCount++;
    } else {
        console.log("  ✓ CreditOracle already set in InvoiceNFT");
    }

    console.log();

    // 2. Configure FinancingPool
    if (financingPool_invoiceNFT !== deployment.contracts.InvoiceNFT) {
        console.log("Setting InvoiceNFT address in FinancingPool...");
        const tx = await financingPool.setInvoiceNFT(deployment.contracts.InvoiceNFT);
        await tx.wait();
        console.log("  ✓ Transaction:", tx.hash);
        txCount++;
    } else {
        console.log("  ✓ InvoiceNFT already set in FinancingPool");
    }

    if (financingPool_creditOracle !== deployment.contracts.CreditScoreOracle) {
        console.log("Setting CreditOracle address in FinancingPool...");
        const tx = await financingPool.setCreditOracle(deployment.contracts.CreditScoreOracle);
        await tx.wait();
        console.log("  ✓ Transaction:", tx.hash);
        txCount++;
    } else {
        console.log("  ✓ CreditOracle already set in FinancingPool");
    }

    if (financingPool_governance !== deployment.contracts.PlatformGovernance) {
        console.log("Setting Governance address in FinancingPool...");
        const tx = await financingPool.setGovernance(deployment.contracts.PlatformGovernance);
        await tx.wait();
        console.log("  ✓ Transaction:", tx.hash);
        txCount++;
    } else {
        console.log("  ✓ Governance already set in FinancingPool");
    }

    console.log();
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Configuration complete! ${txCount} transactions sent.`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();
    console.log("🎉 All contracts are now properly configured!");
    console.log();
    console.log("Next steps:");
    console.log("1. Test the configuration: pnpm test:deployment");
    console.log("2. Try minting and investing in invoices on the frontend");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
