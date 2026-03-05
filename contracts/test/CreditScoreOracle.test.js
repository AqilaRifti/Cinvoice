const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CreditScoreOracle", function () {
    // Fixture to deploy the contract
    async function deployCreditScoreOracleFixture() {
        const [owner, financingPool, governance, smb1, smb2, other] = await ethers.getSigners();

        const CreditScoreOracle = await ethers.getContractFactory("CreditScoreOracle");
        const oracle = await CreditScoreOracle.deploy();

        // Set financing pool and governance addresses
        await oracle.setFinancingPool(financingPool.address);
        await oracle.setGovernance(governance.address);

        return { oracle, owner, financingPool, governance, smb1, smb2, other };
    }

    describe("Deployment", function () {
        it("Should deploy with correct constants", async function () {
            const { oracle } = await loadFixture(deployCreditScoreOracleFixture);

            expect(await oracle.INITIAL_SCORE()).to.equal(500);
            expect(await oracle.MIN_SCORE()).to.equal(300);
            expect(await oracle.MAX_SCORE()).to.equal(850);
            expect(await oracle.REPAYMENT_BONUS()).to.equal(50);
            expect(await oracle.DEFAULT_PENALTY()).to.equal(100);
        });

        it("Should set financing pool and governance addresses", async function () {
            const { oracle, financingPool, governance } = await loadFixture(deployCreditScoreOracleFixture);

            expect(await oracle.financingPool()).to.equal(financingPool.address);
            expect(await oracle.governance()).to.equal(governance.address);
        });

        it("Should not allow setting financing pool twice", async function () {
            const { oracle, other } = await loadFixture(deployCreditScoreOracleFixture);

            await expect(oracle.setFinancingPool(other.address))
                .to.be.revertedWithCustomError(oracle, "Unauthorized");
        });
    });

    describe("Credit Score Initialization", function () {
        it("Should initialize credit score to 500 for new SMB", async function () {
            const { oracle, smb1 } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(500);
        });

        it("Should emit CreditScoreInitialized event", async function () {
            const { oracle, smb1 } = await loadFixture(deployCreditScoreOracleFixture);

            await expect(oracle.initializeCreditScore(smb1.address))
                .to.emit(oracle, "CreditScoreInitialized")
                .withArgs(smb1.address, 500);
        });

        it("Should not re-initialize if already initialized", async function () {
            const { oracle, smb1 } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            await oracle.initializeCreditScore(smb1.address); // Second call should not change anything

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(500);
        });

        it("Should return INITIAL_SCORE for uninitialized SMB", async function () {
            const { oracle, smb1 } = await loadFixture(deployCreditScoreOracleFixture);

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(500);
        });

        it("Should revert if address is zero", async function () {
            const { oracle } = await loadFixture(deployCreditScoreOracleFixture);

            await expect(oracle.initializeCreditScore(ethers.ZeroAddress))
                .to.be.revertedWithCustomError(oracle, "InvalidAddress");
        });
    });

    describe("Credit Score Retrieval", function () {
        it("Should get credit profile with all fields", async function () {
            const { oracle, smb1 } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            const profile = await oracle.getCreditProfile(smb1.address);

            expect(profile.score).to.equal(500);
            expect(profile.totalInvoices).to.equal(0);
            expect(profile.successfulRepayments).to.equal(0);
            expect(profile.defaults).to.equal(0);
            expect(profile.lastUpdated).to.be.gt(0);
        });
    });

    describe("Discount Rate Calculation", function () {
        it("Should calculate correct discount rate for score 850 (0% discount)", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            // Update score to 850
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 350);

            const discountRate = await oracle.getDiscountRate(smb1.address);
            expect(discountRate).to.equal(0); // 0% discount
        });

        it("Should calculate correct discount rate for score 500 (~63.6% discount)", async function () {
            const { oracle, smb1 } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            const discountRate = await oracle.getDiscountRate(smb1.address);
            // (850 - 500) * 1000 / (850 - 300) = 350 * 1000 / 550 = 636.36... ≈ 636
            expect(discountRate).to.be.closeTo(636, 1);
        });

        it("Should calculate correct discount rate for score 300 (100% discount)", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            // Update score to 300
            await oracle.connect(financingPool).updateCreditScore(smb1.address, -200);

            const discountRate = await oracle.getDiscountRate(smb1.address);
            expect(discountRate).to.equal(1000); // 100% discount
        });

        it("Should return discount rate for uninitialized SMB based on INITIAL_SCORE", async function () {
            const { oracle, smb1 } = await loadFixture(deployCreditScoreOracleFixture);

            const discountRate = await oracle.getDiscountRate(smb1.address);
            expect(discountRate).to.be.closeTo(636, 1);
        });
    });

    describe("Credit Score Updates", function () {
        it("Should only allow financing pool to update scores", async function () {
            const { oracle, smb1, other } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            await expect(oracle.connect(other).updateCreditScore(smb1.address, 50))
                .to.be.revertedWithCustomError(oracle, "Unauthorized");
        });

        it("Should increase score on positive change", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(550);
        });

        it("Should decrease score on negative change", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, -100);

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(400);
        });

        it("Should cap score at MIN_SCORE (300)", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, -300); // Try to go below 300

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(300);
        });

        it("Should cap score at MAX_SCORE (850)", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 500); // Try to go above 850

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(850);
        });

        it("Should emit CreditScoreUpdated event", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            await expect(oracle.connect(financingPool).updateCreditScore(smb1.address, 50))
                .to.emit(oracle, "CreditScoreUpdated")
                .withArgs(smb1.address, 500, 550, 50);
        });

        it("Should increment successfulRepayments counter on positive change", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);

            const profile = await oracle.getCreditProfile(smb1.address);
            expect(profile.successfulRepayments).to.equal(1);
        });

        it("Should increment defaults counter on negative change", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, -100);

            const profile = await oracle.getCreditProfile(smb1.address);
            expect(profile.defaults).to.equal(1);
        });

        it("Should update lastUpdated timestamp", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);
            const profileBefore = await oracle.getCreditProfile(smb1.address);

            // Wait a bit and update
            await ethers.provider.send("evm_increaseTime", [10]);
            await ethers.provider.send("evm_mine");

            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);
            const profileAfter = await oracle.getCreditProfile(smb1.address);

            expect(profileAfter.lastUpdated).to.be.gt(profileBefore.lastUpdated);
        });

        it("Should auto-initialize if not initialized before update", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            // Update without initializing first
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(550); // 500 + 50
        });
    });

    describe("Total Invoices Counter", function () {
        it("Should only allow financing pool to increment total invoices", async function () {
            const { oracle, smb1, other } = await loadFixture(deployCreditScoreOracleFixture);

            await expect(oracle.connect(other).incrementTotalInvoices(smb1.address))
                .to.be.revertedWithCustomError(oracle, "Unauthorized");
        });

        it("Should increment total invoices counter", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.connect(financingPool).incrementTotalInvoices(smb1.address);
            await oracle.connect(financingPool).incrementTotalInvoices(smb1.address);

            const profile = await oracle.getCreditProfile(smb1.address);
            expect(profile.totalInvoices).to.equal(2);
        });

        it("Should auto-initialize on first increment", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.connect(financingPool).incrementTotalInvoices(smb1.address);

            const profile = await oracle.getCreditProfile(smb1.address);
            expect(profile.score).to.equal(500);
            expect(profile.totalInvoices).to.equal(1);
        });
    });

    describe("Access Control", function () {
        it("Should enforce financing pool authorization", async function () {
            const { oracle, smb1, other } = await loadFixture(deployCreditScoreOracleFixture);

            await expect(oracle.connect(other).updateCreditScore(smb1.address, 50))
                .to.be.revertedWithCustomError(oracle, "Unauthorized");

            await expect(oracle.connect(other).incrementTotalInvoices(smb1.address))
                .to.be.revertedWithCustomError(oracle, "Unauthorized");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple updates correctly", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            // Multiple repayments
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(650); // 500 + 150

            const profile = await oracle.getCreditProfile(smb1.address);
            expect(profile.successfulRepayments).to.equal(3);
        });

        it("Should handle mixed positive and negative changes", async function () {
            const { oracle, smb1, financingPool } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb1.address);

            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);  // 550
            await oracle.connect(financingPool).updateCreditScore(smb1.address, -100); // 450
            await oracle.connect(financingPool).updateCreditScore(smb1.address, 50);  // 500

            const score = await oracle.getCreditScore(smb1.address);
            expect(score).to.equal(500);

            const profile = await oracle.getCreditProfile(smb1.address);
            expect(profile.successfulRepayments).to.equal(2);
            expect(profile.defaults).to.equal(1);
        });
    });
});
