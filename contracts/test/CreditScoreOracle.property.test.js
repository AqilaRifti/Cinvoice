const { expect } = require("chai");
const { ethers } = require("hardhat");
const fc = require("fast-check");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CreditScoreOracle - Property-Based Tests", function () {
    async function deployCreditScoreOracleFixture() {
        const [owner, financingPool, governance, smb] = await ethers.getSigners();

        const CreditScoreOracle = await ethers.getContractFactory("CreditScoreOracle");
        const oracle = await CreditScoreOracle.deploy();

        await oracle.setFinancingPool(financingPool.address);
        await oracle.setGovernance(governance.address);

        return { oracle, owner, financingPool, governance, smb };
    }

    describe("Property 3: Credit Score Bounds Invariant", function () {
        it("Should maintain credit score within [300, 850] regardless of updates", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb.address);

            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.integer({ min: -200, max: 200 }), { minLength: 1, maxLength: 20 }),
                    async (changes) => {
                        // Reset to initial state
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const resetChange = 500 - Number(currentScore);
                        if (resetChange !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, resetChange);
                        }

                        // Apply all changes
                        for (const change of changes) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, change);

                            const score = await oracle.getCreditScore(smb.address);

                            // Property: Score must always be within bounds
                            expect(Number(score)).to.be.at.least(300);
                            expect(Number(score)).to.be.at.most(850);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it("Should never exceed MAX_SCORE even with large positive changes", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb.address);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 351, max: 10000 }), // Need at least 351 to reach 850 from 500
                    async (largeChange) => {
                        // Reset to initial state
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const resetChange = 500 - Number(currentScore);
                        if (resetChange !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, resetChange);
                        }

                        await oracle.connect(financingPool).updateCreditScore(smb.address, largeChange);
                        const score = await oracle.getCreditScore(smb.address);

                        expect(Number(score)).to.equal(850);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it("Should never go below MIN_SCORE even with large negative changes", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb.address);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: -10000, max: -201 }), // Need at least -201 to reach 300 from 500
                    async (largeNegativeChange) => {
                        // Reset to initial state
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const resetChange = 500 - Number(currentScore);
                        if (resetChange !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, resetChange);
                        }

                        await oracle.connect(financingPool).updateCreditScore(smb.address, largeNegativeChange);
                        const score = await oracle.getCreditScore(smb.address);

                        expect(Number(score)).to.equal(300);
                    }
                ),
                { numRuns: 50 }
            );
        });
    });

    describe("Property 4: Credit Score Update Correctness", function () {
        it("Should correctly apply REPAYMENT_BONUS (+50) on successful repayment", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 300, max: 800 }), // Starting scores that won't hit ceiling
                    async (startingScore) => {
                        // Reset and set to starting score
                        await oracle.initializeCreditScore(smb.address);
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const change = startingScore - Number(currentScore);
                        if (change !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, change);
                        }

                        // Apply repayment bonus
                        await oracle.connect(financingPool).updateCreditScore(smb.address, 50);
                        const newScore = await oracle.getCreditScore(smb.address);

                        const expectedScore = Math.min(startingScore + 50, 850);
                        expect(Number(newScore)).to.equal(expectedScore);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it("Should correctly apply DEFAULT_PENALTY (-100) on default", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 400, max: 850 }), // Starting scores that won't hit floor
                    async (startingScore) => {
                        // Reset and set to starting score
                        await oracle.initializeCreditScore(smb.address);
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const change = startingScore - Number(currentScore);
                        if (change !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, change);
                        }

                        // Apply default penalty
                        await oracle.connect(financingPool).updateCreditScore(smb.address, -100);
                        const newScore = await oracle.getCreditScore(smb.address);

                        const expectedScore = Math.max(startingScore - 100, 300);
                        expect(Number(newScore)).to.equal(expectedScore);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it("Should correctly track successfulRepayments counter", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb.address);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 10 }),
                    async (numRepayments) => {
                        // Reset counters
                        const profile = await oracle.getCreditProfile(smb.address);
                        const currentRepayments = Number(profile.successfulRepayments);

                        // Apply repayments
                        for (let i = 0; i < numRepayments; i++) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, 50);
                        }

                        const newProfile = await oracle.getCreditProfile(smb.address);
                        expect(Number(newProfile.successfulRepayments)).to.equal(currentRepayments + numRepayments);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("Should correctly track defaults counter", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb.address);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 5 }),
                    async (numDefaults) => {
                        // Reset to high score to avoid hitting floor
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const resetChange = 800 - Number(currentScore);
                        if (resetChange !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, resetChange);
                        }

                        const profileBefore = await oracle.getCreditProfile(smb.address);
                        const currentDefaults = Number(profileBefore.defaults);

                        // Apply defaults
                        for (let i = 0; i < numDefaults; i++) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, -100);
                        }

                        const profileAfter = await oracle.getCreditProfile(smb.address);
                        expect(Number(profileAfter.defaults)).to.equal(currentDefaults + numDefaults);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe("Property 5: Initial Credit Score", function () {
        it("Should always initialize to INITIAL_SCORE (500)", async function () {
            const { oracle } = await loadFixture(deployCreditScoreOracleFixture);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 0, max: 100 }),
                    async (index) => {
                        // Generate deterministic address
                        const wallet = ethers.Wallet.createRandom();
                        const smbAddress = wallet.address;

                        await oracle.initializeCreditScore(smbAddress);
                        const score = await oracle.getCreditScore(smbAddress);

                        expect(Number(score)).to.equal(500);
                    }
                ),
                { numRuns: 30 }
            );
        });

        it("Should return INITIAL_SCORE for any uninitialized address", async function () {
            const { oracle } = await loadFixture(deployCreditScoreOracleFixture);

            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 0, max: 100 }),
                    async (index) => {
                        // Generate deterministic address
                        const wallet = ethers.Wallet.createRandom();
                        const smbAddress = wallet.address;

                        const score = await oracle.getCreditScore(smbAddress);
                        expect(Number(score)).to.equal(500);
                    }
                ),
                { numRuns: 30 }
            );
        });
    });

    describe("Discount Rate Properties", function () {
        it("Should always return discount rate in valid range [0, 1000]", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb.address);

            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.integer({ min: -200, max: 200 }), { minLength: 1, maxLength: 10 }),
                    async (changes) => {
                        // Reset
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const resetChange = 500 - Number(currentScore);
                        if (resetChange !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, resetChange);
                        }

                        // Apply changes
                        for (const change of changes) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, change);
                        }

                        const discountRate = await oracle.getDiscountRate(smb.address);

                        expect(Number(discountRate)).to.be.at.least(0);
                        expect(Number(discountRate)).to.be.at.most(1000);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it("Should have inverse relationship: higher score = lower discount", async function () {
            const { oracle, financingPool, smb } = await loadFixture(deployCreditScoreOracleFixture);

            await oracle.initializeCreditScore(smb.address);

            await fc.assert(
                fc.asyncProperty(
                    fc.tuple(
                        fc.integer({ min: 300, max: 750 }),
                        fc.integer({ min: 1, max: 100 })
                    ),
                    async ([startScore, increase]) => {
                        // Set to start score
                        const currentScore = await oracle.getCreditScore(smb.address);
                        const change = startScore - Number(currentScore);
                        if (change !== 0) {
                            await oracle.connect(financingPool).updateCreditScore(smb.address, change);
                        }

                        const discountBefore = await oracle.getDiscountRate(smb.address);

                        // Increase score
                        await oracle.connect(financingPool).updateCreditScore(smb.address, increase);

                        const discountAfter = await oracle.getDiscountRate(smb.address);

                        // Higher score should mean lower or equal discount
                        expect(Number(discountAfter)).to.be.at.most(Number(discountBefore));
                    }
                ),
                { numRuns: 50 }
            );
        });
    });
});
