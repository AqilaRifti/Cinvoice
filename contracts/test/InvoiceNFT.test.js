const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("InvoiceNFT", function () {
    async function deployInvoiceNFTFixture() {
        const [owner, financingPool, governance, smb1, smb2, investor, other] = await ethers.getSigners();

        // Deploy CreditScoreOracle
        const CreditScoreOracle = await ethers.getContractFactory("CreditScoreOracle");
        const oracle = await CreditScoreOracle.deploy();
        await oracle.setFinancingPool(financingPool.address);
        await oracle.setGovernance(governance.address);

        // Deploy InvoiceNFT
        const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
        const invoiceNFT = await InvoiceNFT.deploy();
        await invoiceNFT.setFinancingPool(financingPool.address);
        await invoiceNFT.setGovernance(governance.address);
        await invoiceNFT.setCreditOracle(await oracle.getAddress());

        // Initialize credit scores
        await oracle.initializeCreditScore(smb1.address);
        await oracle.initializeCreditScore(smb2.address);

        return { invoiceNFT, oracle, owner, financingPool, governance, smb1, smb2, investor, other };
    }

    describe("Deployment", function () {
        it("Should deploy with correct name and symbol", async function () {
            const { invoiceNFT } = await loadFixture(deployInvoiceNFTFixture);

            expect(await invoiceNFT.name()).to.equal("Invoice NFT");
            expect(await invoiceNFT.symbol()).to.equal("INVOICE");
        });

        it("Should initialize nextTokenId to 0", async function () {
            const { invoiceNFT } = await loadFixture(deployInvoiceNFTFixture);

            expect(await invoiceNFT.nextTokenId()).to.equal(0);
        });

        it("Should set contract addresses correctly", async function () {
            const { invoiceNFT, oracle, financingPool, governance } = await loadFixture(deployInvoiceNFTFixture);

            expect(await invoiceNFT.financingPool()).to.equal(financingPool.address);
            expect(await invoiceNFT.governance()).to.equal(governance.address);
            expect(await invoiceNFT.creditOracle()).to.equal(await oracle.getAddress());
        });
    });

    describe("Minting Invoices", function () {
        it("Should mint invoice with valid inputs", async function () {
            const { invoiceNFT, smb1 } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30; // 30 days
            const metadataURI = "ipfs://QmTest123";

            await expect(invoiceNFT.connect(smb1).mintInvoice(metadataURI, faceValue, repaymentDate))
                .to.emit(invoiceNFT, "InvoiceMinted")
                .withArgs(0, smb1.address, faceValue, repaymentDate, 500);

            expect(await invoiceNFT.ownerOf(0)).to.equal(smb1.address);
            expect(await invoiceNFT.nextTokenId()).to.equal(1);
        });

        it("Should reject zero face value", async function () {
            const { invoiceNFT, smb1 } = await loadFixture(deployInvoiceNFTFixture);

            const repaymentDate = (await time.latest()) + 86400 * 30;
            const metadataURI = "ipfs://QmTest123";

            await expect(
                invoiceNFT.connect(smb1).mintInvoice(metadataURI, 0, repaymentDate)
            ).to.be.revertedWithCustomError(invoiceNFT, "InvalidFaceValue");
        });

        it("Should reject past repayment date", async function () {
            const { invoiceNFT, smb1 } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const pastDate = (await time.latest()) - 86400; // Yesterday
            const metadataURI = "ipfs://QmTest123";

            await expect(
                invoiceNFT.connect(smb1).mintInvoice(metadataURI, faceValue, pastDate)
            ).to.be.revertedWithCustomError(invoiceNFT, "InvalidRepaymentDate");
        });

        it("Should store invoice details correctly", async function () {
            const { invoiceNFT, smb1 } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            const metadataURI = "ipfs://QmTest123";

            await invoiceNFT.connect(smb1).mintInvoice(metadataURI, faceValue, repaymentDate);

            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.faceValue).to.equal(faceValue);
            expect(invoice.repaymentDate).to.equal(repaymentDate);
            expect(invoice.smb).to.equal(smb1.address);
            expect(invoice.state).to.equal(0); // Pending
            expect(invoice.metadataURI).to.equal(metadataURI);
            expect(invoice.creditScoreAtMinting).to.equal(500);
        });

        it("Should set token URI correctly", async function () {
            const { invoiceNFT, smb1 } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            const metadataURI = "ipfs://QmTest123";

            await invoiceNFT.connect(smb1).mintInvoice(metadataURI, faceValue, repaymentDate);

            expect(await invoiceNFT.tokenURI(0)).to.equal(metadataURI);
        });

        it("Should increment token ID for each mint", async function () {
            const { invoiceNFT, smb1, smb2 } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;

            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);
            await invoiceNFT.connect(smb2).mintInvoice("ipfs://2", faceValue, repaymentDate);
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://3", faceValue, repaymentDate);

            expect(await invoiceNFT.nextTokenId()).to.equal(3);
            expect(await invoiceNFT.ownerOf(0)).to.equal(smb1.address);
            expect(await invoiceNFT.ownerOf(1)).to.equal(smb2.address);
            expect(await invoiceNFT.ownerOf(2)).to.equal(smb1.address);
        });
    });

    describe("State Management", function () {
        it("Should only allow financing pool or governance to update state", async function () {
            const { invoiceNFT, smb1, other } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await expect(
                invoiceNFT.connect(other).updateState(0, 1) // Try to set to Funded
            ).to.be.revertedWithCustomError(invoiceNFT, "Unauthorized");
        });

        it("Should allow financing pool to update state", async function () {
            const { invoiceNFT, smb1, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await expect(invoiceNFT.connect(financingPool).updateState(0, 1))
                .to.emit(invoiceNFT, "InvoiceStateChanged")
                .withArgs(0, 0, 1); // Pending to Funded

            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.state).to.equal(1); // Funded
        });

        it("Should allow governance to update state", async function () {
            const { invoiceNFT, smb1, governance, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            // First move to Funded
            await invoiceNFT.connect(financingPool).updateState(0, 1);

            // Then governance can mark as Defaulted
            await expect(invoiceNFT.connect(governance).updateState(0, 3))
                .to.emit(invoiceNFT, "InvoiceStateChanged")
                .withArgs(0, 1, 3); // Funded to Defaulted
        });

        it("Should validate state transitions - Pending to Funded", async function () {
            const { invoiceNFT, smb1, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await invoiceNFT.connect(financingPool).updateState(0, 1); // Pending → Funded
            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.state).to.equal(1);
        });

        it("Should validate state transitions - Funded to Repaid", async function () {
            const { invoiceNFT, smb1, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await invoiceNFT.connect(financingPool).updateState(0, 1); // Pending → Funded
            await invoiceNFT.connect(financingPool).updateState(0, 2); // Funded → Repaid

            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.state).to.equal(2);
        });

        it("Should validate state transitions - Funded to Defaulted", async function () {
            const { invoiceNFT, smb1, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await invoiceNFT.connect(financingPool).updateState(0, 1); // Pending → Funded
            await invoiceNFT.connect(financingPool).updateState(0, 3); // Funded → Defaulted

            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.state).to.equal(3);
        });

        it("Should reject invalid state transition - Pending to Repaid", async function () {
            const { invoiceNFT, smb1, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await expect(
                invoiceNFT.connect(financingPool).updateState(0, 2) // Pending → Repaid (invalid)
            ).to.be.revertedWithCustomError(invoiceNFT, "InvalidStateTransition");
        });

        it("Should reject invalid state transition - Repaid to Funded", async function () {
            const { invoiceNFT, smb1, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await invoiceNFT.connect(financingPool).updateState(0, 1); // Pending → Funded
            await invoiceNFT.connect(financingPool).updateState(0, 2); // Funded → Repaid

            await expect(
                invoiceNFT.connect(financingPool).updateState(0, 1) // Repaid → Funded (invalid)
            ).to.be.revertedWithCustomError(invoiceNFT, "InvalidStateTransition");
        });
    });

    describe("Transfer Restrictions", function () {
        it("Should allow transfer when in Pending state", async function () {
            const { invoiceNFT, smb1, investor } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await invoiceNFT.connect(smb1).transferFrom(smb1.address, investor.address, 0);
            expect(await invoiceNFT.ownerOf(0)).to.equal(investor.address);
        });

        it("Should block transfer when in Funded state", async function () {
            const { invoiceNFT, smb1, investor, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            // Transfer to investor and update state to Funded
            await invoiceNFT.connect(smb1).transferFrom(smb1.address, investor.address, 0);
            await invoiceNFT.connect(financingPool).updateState(0, 1); // Set to Funded

            // Try to transfer - should fail
            await expect(
                invoiceNFT.connect(investor).transferFrom(investor.address, smb1.address, 0)
            ).to.be.revertedWithCustomError(invoiceNFT, "TransferRestricted");
        });

        it("Should allow transfer when in Repaid state", async function () {
            const { invoiceNFT, smb1, investor, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await invoiceNFT.connect(smb1).transferFrom(smb1.address, investor.address, 0);
            await invoiceNFT.connect(financingPool).updateState(0, 1); // Funded
            await invoiceNFT.connect(financingPool).updateState(0, 2); // Repaid

            // Should allow transfer now
            await invoiceNFT.connect(investor).transferFrom(investor.address, smb1.address, 0);
            expect(await invoiceNFT.ownerOf(0)).to.equal(smb1.address);
        });

        it("Should allow transfer when in Defaulted state", async function () {
            const { invoiceNFT, smb1, investor, financingPool } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            await invoiceNFT.connect(smb1).mintInvoice("ipfs://1", faceValue, repaymentDate);

            await invoiceNFT.connect(smb1).transferFrom(smb1.address, investor.address, 0);
            await invoiceNFT.connect(financingPool).updateState(0, 1); // Funded
            await invoiceNFT.connect(financingPool).updateState(0, 3); // Defaulted

            // Should allow transfer now
            await invoiceNFT.connect(investor).transferFrom(investor.address, smb1.address, 0);
            expect(await invoiceNFT.ownerOf(0)).to.equal(smb1.address);
        });
    });

    describe("View Functions", function () {
        it("Should return invoice details", async function () {
            const { invoiceNFT, smb1 } = await loadFixture(deployInvoiceNFTFixture);

            const faceValue = ethers.parseEther("1000");
            const repaymentDate = (await time.latest()) + 86400 * 30;
            const metadataURI = "ipfs://QmTest123";

            await invoiceNFT.connect(smb1).mintInvoice(metadataURI, faceValue, repaymentDate);

            const invoice = await invoiceNFT.getInvoiceDetails(0);
            expect(invoice.faceValue).to.equal(faceValue);
            expect(invoice.repaymentDate).to.equal(repaymentDate);
            expect(invoice.smb).to.equal(smb1.address);
            expect(invoice.state).to.equal(0);
            expect(invoice.metadataURI).to.equal(metadataURI);
        });

        it("Should revert for non-existent token", async function () {
            const { invoiceNFT } = await loadFixture(deployInvoiceNFTFixture);

            await expect(
                invoiceNFT.getInvoiceDetails(999)
            ).to.be.revertedWithCustomError(invoiceNFT, "InvoiceNotFound");
        });
    });
});
