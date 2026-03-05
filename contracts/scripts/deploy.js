const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv/config");

async function main() {
    console.log("🚀 Deploying Creditcoin Invoice Financing Platform...\n");

    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "CTC\n");

    // Get admin addresses from environment variables
    const admin1Address = process.env.ADMIN1_ADDRESS;
    const admin2Address = process.env.ADMIN2_ADDRESS;
    const admin3Address = process.env.ADMIN3_ADDRESS || deployer.address; // Fallback to deployer if not set

    console.log("Admin addresses:");
    console.log("  Admin 1:", admin1Address);
    console.log("  Admin 2:", admin2Address);
    console.log("  Admin 3:", admin3Address);
    console.log();

    // 1. Deploy CreditScoreOracle
    console.log("📊 Deploying CreditScoreOracle...");
    const CreditScoreOracle = await hre.ethers.getContractFactory("CreditScoreOracle");
    const creditOracle = await CreditScoreOracle.deploy();
    await creditOracle.waitForDeployment();
    const creditOracleAddress = await creditOracle.getAddress();
    console.log("✅ CreditScoreOracle deployed to:", creditOracleAddress);
    console.log();

    // 2. Deploy PlatformGovernance
    console.log("🏛️  Deploying PlatformGovernance...");
    const PlatformGovernance = await hre.ethers.getContractFactory("PlatformGovernance");
    const governance = await PlatformGovernance.deploy(
        admin1Address,
        admin2Address,
        admin3Address
    );
    await governance.waitForDeployment();
    const governanceAddress = await governance.getAddress();
    console.log("✅ PlatformGovernance deployed to:", governanceAddress);
    console.log();

    // 3. Deploy InvoiceNFT
    console.log("🎫 Deploying InvoiceNFT...");
    const InvoiceNFT = await hre.ethers.getContractFactory("InvoiceNFT");
    const invoiceNFT = await InvoiceNFT.deploy();
    await invoiceNFT.waitForDeployment();
    const invoiceNFTAddress = await invoiceNFT.getAddress();
    console.log("✅ InvoiceNFT deployed to:", invoiceNFTAddress);
    console.log();

    // 4. Deploy FinancingPool
    console.log("💰 Deploying FinancingPool...");
    const FinancingPool = await hre.ethers.getContractFactory("FinancingPool");
    const financingPool = await FinancingPool.deploy(
        invoiceNFTAddress,
        creditOracleAddress,
        governanceAddress
    );
    await financingPool.waitForDeployment();
    const financingPoolAddress = await financingPool.getAddress();
    console.log("✅ FinancingPool deployed to:", financingPoolAddress);
    console.log();

    // 5. Set contract references
    console.log("🔗 Setting contract references...");

    await creditOracle.setFinancingPool(financingPoolAddress);
    console.log("  ✓ CreditOracle.financingPool set");

    await creditOracle.setGovernance(governanceAddress);
    console.log("  ✓ CreditOracle.governance set");

    await invoiceNFT.setFinancingPool(financingPoolAddress);
    console.log("  ✓ InvoiceNFT.financingPool set");

    await invoiceNFT.setGovernance(governanceAddress);
    console.log("  ✓ InvoiceNFT.governance set");

    await invoiceNFT.setCreditOracle(creditOracleAddress);
    console.log("  ✓ InvoiceNFT.creditOracle set");

    console.log();

    // 6. Save deployment addresses
    const deploymentData = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            CreditScoreOracle: creditOracleAddress,
            PlatformGovernance: governanceAddress,
            InvoiceNFT: invoiceNFTAddress,
            FinancingPool: financingPoolAddress
        },
        admins: {
            admin1: admin1Address,
            admin2: admin2Address,
            admin3: admin3Address
        }
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

    console.log("📝 Deployment data saved to:", deploymentFile);
    console.log();

    console.log("✨ Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("CreditScoreOracle:    ", creditOracleAddress);
    console.log("PlatformGovernance:   ", governanceAddress);
    console.log("InvoiceNFT:           ", invoiceNFTAddress);
    console.log("FinancingPool:        ", financingPoolAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    console.log("🎉 Deployment complete!");
    console.log();
    console.log("Next steps:");
    console.log("1. Update frontend/.env with contract addresses");
    console.log("2. Verify contracts on block explorer (if available)");
    console.log("3. Test basic functionality on testnet");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
