const hre = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("Approving FinancingPool to transfer invoices...\n");

    const INVOICE_NFT_ADDRESS = "0xa0e680d9197e43d81400B2a8197a01d6A20ccB82";
    const FINANCING_POOL_ADDRESS = "0x873aE215eD5850cD766491983544978c0D06073A";

    console.log("InvoiceNFT:", INVOICE_NFT_ADDRESS);
    console.log("FinancingPool:", FINANCING_POOL_ADDRESS);

    // Get the deployer (SMB) account
    const [deployer] = await hre.ethers.getSigners();
    console.log("SMB Account:", deployer.address);

    // Get InvoiceNFT contract
    const InvoiceNFT = await hre.ethers.getContractAt("InvoiceNFT", INVOICE_NFT_ADDRESS);

    // Check current approval status
    const isApproved = await InvoiceNFT.isApprovedForAll(deployer.address, FINANCING_POOL_ADDRESS);
    console.log("Currently approved:", isApproved);

    if (!isApproved) {
        console.log("\nApproving FinancingPool to manage all invoices...");
        const tx = await InvoiceNFT.setApprovalForAll(FINANCING_POOL_ADDRESS, true);
        console.log("Transaction hash:", tx.hash);

        await tx.wait();
        console.log("✅ Approval successful!");
    } else {
        console.log("✅ Already approved!");
    }

    // Verify approval
    const finalApproval = await InvoiceNFT.isApprovedForAll(deployer.address, FINANCING_POOL_ADDRESS);
    console.log("\nFinal approval status:", finalApproval);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
