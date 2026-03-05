const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Checking balance for:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceInCTC = hre.ethers.formatEther(balance);

    console.log("Balance:", balanceInCTC, "CTC");

    if (parseFloat(balanceInCTC) < 1) {
        console.log("\n⚠️  WARNING: Low balance!");
        console.log("You need at least 10 CTC to deploy contracts.");
        console.log("Get testnet CTC from: https://faucet.creditcoin.org/");
    } else {
        console.log("\n✅ Balance sufficient for deployment!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
