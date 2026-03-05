const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Integration Tests - Complete User Flows", function () {
    async function deployPlatformFixture() {
        const [deployer, admin1, admin2, admin3, smb, investor, other] = await ethers.getSigners();

        // Deploy all contracts
        const CreditScoreOracle = await ethers.getContractFactory("CreditScoreOracle");
        const oracle = await CreditScoreOracle.deploy();

        const PlatformGovernance = await ethers.getContractFactory("PlatformGovernance");
        const governance = await PlatformGovernance.deploy(admin1.address, admin2.address, admin3.address);

        const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
        const invoiceNFT = await InvoiceNFT.deploy();

        const FinancingPool = await ethers.getContractFactory("FinancingPool");
        const financingPool = await FinancingPool.deploy(
            await invoiceNFT.getAddress(),
            await oracle.getAddress(),
            await governance.getAddress()
        );

        // Set contract references
        await oracle.setFinancingPool(await financingPool.getAddress());
        await oracle.setGovernance(await governance.getAddress());
        await invoiceNFT.setFinancingPool(await financingPool.getAddress());
        await invoiceNFT.setGovernance(await governance.getAddress());
        await invoiceNFT.setCreditOracle(await oracle.getAddress());

        return { oracle, governance, invoiceNFT, financingPool, deployer, admin1, admin2, admin3, smb, investor, other };
    }

    describe("Complete SMB Flow: Mint → Fund → Repay", function () {
        it("Should complete full successful repayment flow", async function () {
            const { oracle, invoiceNFT, financingPool, smb, investor } = await loadFixture(deployPlatformFixture);

            // 1. SMB mints invoice
            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30; // 30 days
            const metadataURI = "ipfs://QmTest123";

            await invoiceNFT.connect(smb).mintInvoice(metadataURI, faceValue, repaymentDate);

            // Verify invoice created
            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.state).to.equal(0); // Pending
            expect(invoice.smb).to.equal(smb.address);

            // Verify SMB credit score
            const initialScore = await oracle.getCreditScore(smb.address);
            expect(initialScore).to.equal(500);

            // 2. Investor purchases invoice
            // SMB must approve FinancingPool to transfer NFT
            await invoiceNFT.connect(smb).approve(await financingPool.getAddress(), 0);

            const purchasePrice = await financingPool.calculatePurchasePrice(0);
            const smbBalanceBefore = await ethers.provider.getBalance(smb.address);

            await financingPool.connect(investor).purchaseInvoice(0, { value: purchasePrice });

            // Verify NFT transferred
            expect(await invoiceNFT.ownerOf(0)).to.equal(investor.address);

            // Verify state updated
            const invoiceAfterPurchase = await invoiceNFT.getInvoiceDetails(0);
            expect(invoiceAfterPurchase.state).to.equal(1); // Funded

            // Verify SMB received payment
            const smbBalanceAfter = await ethers.provider.getBalance(smb.address);
            expect(smbBalanceAfter - smbBalanceBefore).to.equal(purchasePrice);

            // 3. SMB repays invoice
            const investorBalanceBefore = await ethers.provider.getBalance(investor.address);
            const governanceBalanceBefore = await ethers.provider.getBalance(await financingPool.governance());

            await financingPool.connect(smb).repayInvoice(0, { value: faceValue });

            // Verify state updated
            const invoiceAfterRepayment = await invoiceNFT.getInvoiceDetails(0);
            expect(invoiceAfterRepayment.state).to.equal(2); // Repaid

            // Verify credit score increased
            const finalScore = await oracle.getCreditScore(smb.address);
            expect(finalScore).to.equal(550); // 500 + 50

            // Verify investor received payment (face value - 2% fee)
            const platformFee = (faceValue * 200n) / 10000n;
            const investorAmount = faceValue - platformFee;
            const investorBalanceAfter = await ethers.provider.getBalance(investor.address);
            expect(investorBalanceAfter - investorBalanceBefore).to.equal(investorAmount);

            // Verify governance received fee
            const governanceBalanceAfter = await ethers.provider.getBalance(await financingPool.governance());
            expect(governanceBalanceAfter - governanceBalanceBefore).to.equal(platformFee);
        });
    });

    describe("Complete Default Flow: Mint → Fund → Default", function () {
        it("Should handle default scenario correctly", async function () {
            const { oracle, invoiceNFT, financingPool, smb, investor } = await loadFixture(deployPlatformFixture);

            // 1. SMB mints invoice with short repayment period
            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 60; // 1 minute
            const metadataURI = "ipfs://QmTest123";

            await invoiceNFT.connect(smb).mintInvoice(metadataURI, faceValue, repaymentDate);

            // 2. Investor purchases invoice
            const purchasePrice = await financingPool.calculatePurchasePrice(0);
            await invoiceNFT.connect(smb).approve(await financingPool.getAddress(), 0);
            await financingPool.connect(investor).purchaseInvoice(0, { value: purchasePrice });

            // Verify initial credit score
            const initialScore = await oracle.getCreditScore(smb.address);
            expect(initialScore).to.equal(500);

            // 3. Time passes beyond repayment date
            await time.increase(61);

            // 4. Mark as defaulted
            await financingPool.markAsDefaulted(0);

            // Verify state updated
            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.state).to.equal(3); // Defaulted

            // Verify credit score decreased
            const finalScore = await oracle.getCreditScore(smb.address);
            expect(finalScore).to.equal(400); // 500 - 100
        });
    });

    describe("Multiple Invoices Flow", function () {
        it("Should handle multiple invoices from same SMB", async function () {
            const { oracle, invoiceNFT, financingPool, smb, investor } = await loadFixture(deployPlatformFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;

            // Mint 3 invoices
            await invoiceNFT.connect(smb).mintInvoice("ipfs://1", faceValue, repaymentDate);
            await invoiceNFT.connect(smb).mintInvoice("ipfs://2", faceValue, repaymentDate);
            await invoiceNFT.connect(smb).mintInvoice("ipfs://3", faceValue, repaymentDate);

            expect(await invoiceNFT.nextTokenId()).to.equal(3);

            // Purchase all 3
            for (let i = 0; i < 3; i++) {
                await invoiceNFT.connect(smb).approve(await financingPool.getAddress(), i);
                const purchasePrice = await financingPool.calculatePurchasePrice(i);
                await financingPool.connect(investor).purchaseInvoice(i, { value: purchasePrice });
            }

            // Verify all owned by investor
            expect(await invoiceNFT.ownerOf(0)).to.equal(investor.address);
            expect(await invoiceNFT.ownerOf(1)).to.equal(investor.address);
            expect(await invoiceNFT.ownerOf(2)).to.equal(investor.address);

            // Repay all 3
            for (let i = 0; i < 3; i++) {
                await financingPool.connect(smb).repayInvoice(i, { value: faceValue });
            }

            // Verify credit score increased by 150 (3 * 50)
            const finalScore = await oracle.getCreditScore(smb.address);
            expect(finalScore).to.equal(650); // 500 + 150
        });
    });

    describe("Governance Flow", function () {
        it("Should handle multi-sig governance actions", async function () {
            const { governance, financingPool, admin1, admin2, admin3, smb } = await loadFixture(deployPlatformFixture);

            // 1. Admin1 proposes fee adjustment
            const proposalId = await governance.connect(admin1).proposeAction.staticCall(
                2, // FeeAdjustment
                await financingPool.getAddress(),
                "0x",
                300 // 3%
            );

            await governance.connect(admin1).proposeAction(
                2,
                await financingPool.getAddress(),
                "0x",
                300
            );

            // Verify proposal created
            const proposal = await governance.getProposal(proposalId);
            expect(proposal.executed).to.be.false;
            expect(proposal.approvers.length).to.equal(0);

            // 2. Admin2 approves (should execute with 2 approvals)
            await governance.connect(admin2).approveProposal(proposalId);

            // Verify proposal executed
            const proposalAfter = await governance.getProposal(proposalId);
            expect(proposalAfter.approvers.length).to.equal(1);

            // 3. Admin3 approves (reaches 2/3 threshold)
            await governance.connect(admin3).approveProposal(proposalId);

            const proposalFinal = await governance.getProposal(proposalId);
            expect(proposalFinal.executed).to.be.true;
            expect(proposalFinal.approvers.length).to.equal(2);
        });

        it("Should handle emergency pause by single admin", async function () {
            const { governance, admin1 } = await loadFixture(deployPlatformFixture);

            // Single admin can pause
            await governance.connect(admin1).pause();
            expect(await governance.paused()).to.be.true;
        });

        it("Should handle blacklist operations", async function () {
            const { governance, invoiceNFT, admin1, smb } = await loadFixture(deployPlatformFixture);

            // Add to blacklist
            await governance.connect(admin1).addToBlacklist(smb.address);
            expect(await governance.blacklist(smb.address)).to.be.true;

            // Try to mint - should fail
            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;

            await expect(
                invoiceNFT.connect(smb).mintInvoice("ipfs://1", faceValue, repaymentDate)
            ).to.be.revertedWithCustomError(invoiceNFT, "Unauthorized");

            // Remove from blacklist
            await governance.connect(admin1).removeFromBlacklist(smb.address);
            expect(await governance.blacklist(smb.address)).to.be.false;

            // Should be able to mint now
            await invoiceNFT.connect(smb).mintInvoice("ipfs://1", faceValue, repaymentDate);
            expect(await invoiceNFT.nextTokenId()).to.equal(1);
        });
    });

    describe("ROI Calculations", function () {
        it("Should provide correct ROI for investors", async function () {
            const { oracle, invoiceNFT, financingPool, smb, investor } = await loadFixture(deployPlatformFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;

            await invoiceNFT.connect(smb).mintInvoice("ipfs://1", faceValue, repaymentDate);

            // Get purchase price (with discount)
            const purchasePrice = await financingPool.calculatePurchasePrice(0);

            // Purchase
            await invoiceNFT.connect(smb).approve(await financingPool.getAddress(), 0);
            await financingPool.connect(investor).purchaseInvoice(0, { value: purchasePrice });

            // Repay
            await financingPool.connect(smb).repayInvoice(0, { value: faceValue });

            // Calculate ROI
            const platformFee = (faceValue * 200n) / 10000n;
            const investorReceived = faceValue - platformFee;
            const profit = investorReceived - purchasePrice;
            const roi = (Number(profit) / Number(purchasePrice)) * 100;

            // With 500 credit score, discount rate is ~63.6%
            // Purchase price ≈ 363.6 CTC
            // Investor receives 980 CTC (1000 - 2% fee)
            // ROI ≈ 169%
            expect(roi).to.be.greaterThan(150);
            expect(roi).to.be.lessThan(200);
        });
    });
});

// Helper function to approve and purchase
async function approveAndPurchase(invoiceNFT, financingPool, smb, investor, tokenId) {
    await invoiceNFT.connect(smb).approve(await financingPool.getAddress(), tokenId);
    const purchasePrice = await financingPool.calculatePurchasePrice(tokenId);
    await financingPool.connect(investor).purchaseInvoice(tokenId, { value: purchasePrice });
    return purchasePrice;
}
