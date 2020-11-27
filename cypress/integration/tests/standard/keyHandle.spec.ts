
import { visit } from '../../common/visit';
import { constants } from '../../common/constants';
import { Utilities } from '../../common/utils';
import { config } from '../../../../src/test/testEnvConfig';

const utils = new Utilities(config);

context('Keyboard', () => {
    beforeEach(() => {
        visit();
    });

    it('End & home should navigate to last and first cell', () => { // ✅
        utils.selectCell(utils.getCellXCenter() + config.cellWidth, utils.getCellYCenter() + config.cellHeight);

        utils.keyDown(constants.keyCodes.Home, { force: true });

        utils.assertElementLeftIsEqual(utils.getCellFocus(), 0);
        utils.assertScrolledToLeft();

        utils.keyDown(constants.keyCodes.End, { force: true });

        utils.assertElementLeftIsEqual(utils.getCellFocus(), config.cellWidth * (config.columns - 1) - config.lineWidth);
        utils.assertScrolledToRight();

        utils.keyDown(constants.keyCodes.Home, { force: true });

        utils.assertElementLeftIsEqual(utils.getCellFocus(), 0);
        utils.assertScrolledToLeft();
    });

    it('PageUp and PageDown should navigate to first and last visible row', () => { // ✅
        utils.selectCell(utils.getCellXCenter() + config.cellWidth, utils.getCellYCenter() + config.cellHeight);
        utils.keyDown(constants.keyCodes.PageUp, { force: true });

        utils.assertElementTopIsEqual(utils.getCellFocus(), 0);

        const keyDownCount = Math.ceil(config.rows / (config.rgViewportHeight / config.cellHeight));

        for (let i = 0; i < keyDownCount; i++) {
            utils.keyDown(constants.keyCodes.PageDown, { force: true, log: false }, 500, false);
            utils.assertIsElementInScrollable(utils.getCellFocus());
        };

        utils.assertElementTopIsEqual(utils.getCellFocus(), config.cellHeight * (config.rows - 1) - config.lineWidth);

        for (let i = 0; i < keyDownCount; i++) {
            utils.keyDown(constants.keyCodes.PageUp, { force: true, log: false }, 500, false);
            utils.assertIsElementInScrollable(utils.getCellFocus());
        };

        utils.assertElementTopIsEqual(utils.getCellFocus(), 0);
    });

    it('Arrows should navigate up/down/left/right', () => {  // ✅
        const keyDownCount = 4;
        const initFocusTop = config.cellHeight * 5;
        const initFocusLeft = config.cellWidth * 3;

        utils.selectCell(initFocusLeft + utils.getCellXCenter(), initFocusTop + utils.getCellYCenter());
        for (let i = 0; i < keyDownCount; i++) {
            utils.getCellFocus().then($focus => {
                expect(utils.round($focus.position().top)).to.be.equal(initFocusTop - 1 - (i * config.cellHeight));
            });
            cy.wait(200);
            utils.keyDown(constants.keyCodes.ArrowUp, { force: true });
        };

        utils.selectCell(initFocusLeft + utils.getCellXCenter(), initFocusTop + utils.getCellYCenter());
        for (let i = 0; i < keyDownCount; i++) {
            utils.getCellFocus().then($focus => {
                expect(utils.round($focus.position().top)).to.be.equal(initFocusTop - 1 + (i * config.cellHeight));
            });
            cy.wait(200);
            utils.keyDown(constants.keyCodes.ArrowDown, { force: true });
        };

        utils.selectCell(initFocusLeft + utils.getCellXCenter(), initFocusTop + utils.getCellYCenter());
        for (let i = 0; i < keyDownCount; i++) {
            utils.getCellFocus().then($focus => {
                expect(utils.round($focus.position().left)).to.be.equal(initFocusLeft - 1 + (i * config.cellWidth));
            });
            cy.wait(200);
            utils.keyDown(constants.keyCodes.ArrowRight, { force: true });
        };

        utils.selectCell(initFocusLeft + utils.getCellXCenter(), initFocusTop + utils.getCellYCenter());
        for (let i = 0; i < keyDownCount - 1; i++) {
            utils.getCellFocus().then($focus => {
                expect(utils.round($focus.position().left)).to.be.equal(initFocusLeft - 1 - (i * config.cellWidth));
            });
            cy.wait(200);
            utils.keyDown(constants.keyCodes.ArrowLeft, { force: true });
        };
    });

    it('TAB navigate to next cell, Shift + TAB navigate to previous cell', () => { // ✅
        const keyDownCount = 3;
        const initFocusTop = config.cellHeight * 6;
        const initFocusLeft = config.cellWidth * 3;

        utils.selectCell(initFocusLeft + utils.getCellXCenter(), initFocusTop + utils.getCellYCenter());
        for (let i = 0; i < keyDownCount; i++) {
            utils.getCellFocus().then($focus => {
                expect(utils.round($focus.position().left)).to.be.equal(initFocusLeft - 1 + (i * config.cellWidth));
            });
            cy.wait(200);
            utils.keyDown(constants.keyCodes.Tab, { force: true });
        };

        utils.selectCell(initFocusLeft + utils.getCellXCenter(), initFocusTop + utils.getCellYCenter());
        for (let i = 0; i < keyDownCount; i++) {
            utils.getCellFocus().then($focus => {
                expect(utils.round($focus.position().left)).to.be.equal(initFocusLeft - 1 - (i * config.cellWidth));
            });
            cy.wait(200);
            utils.keyDown(constants.keyCodes.Tab, { shiftKey: true, force: true });
        };
    });

    it('Enter key pressed should activate cell edit mode', () => { // ✅
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        cy.wait(utils.wait());
        utils.getCellEditor().should('be.visible').and('have.length', 1);
    });

    it.skip('Escape key pressed should exit from edit mode without changes', () => {  // 🔴
        // TODO FIX THIS FEATURE

        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        cy.wait(utils.wait());
        utils.getCellEditor().should('be.visible').and('have.length', 1);

        const randomText = utils.randomText();
        cy.focused().type(randomText, { force: true });

        cy.wait(5000);
        utils.getCellEditor().should('be.visible').and('have.length', 1);

        utils.keyDown(constants.keyCodes.Esc, { force: true });
        cy.wait(utils.wait());

        utils.getReactGrid().should('not.contain.text', randomText);
    });

    it('Delete key pressed should delete data from the cell', () => { // ✅
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());

        const randomText = utils.randomText();
        cy.focused().type(randomText, { force: true });
        cy.wait(utils.wait());
        utils.keyDown(constants.keyCodes.Enter, { force: true });

        cy.wait(utils.wait());
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        utils.keyDown(constants.keyCodes.Delete, { force: true });

        cy.wait(utils.wait());
        utils.getReactGrid().should('not.contain.text', randomText);
    });

    it('Backspace key pressed should delete data from the cell', () => { // ✅
        utils.selectCell(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        utils.keyDown(constants.keyCodes.Backspace, { force: true });
        cy.wait(utils.wait());
        cy.focused().type('{leftarrow}', { force: true });
        cy.wait(utils.wait());
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        cy.wait(utils.wait());
        utils.getCellEditor().should('have.text', '');
    });

    it('Tab key pressed should exit from cell edit mode and move to next column ', () => { // ✅
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());

        const randomText = utils.randomText();
        cy.focused().type(randomText, { force: true });
        utils.keyDown(constants.keyCodes.Tab, { force: true });

        cy.wait(utils.wait());
        utils.getCellEditor().should('not.exist');
        utils.assertElementLeftIsEqual(utils.getCellFocus(), config.cellWidth * 2 - config.lineWidth);
        cy.wait(utils.wait());
        utils.getReactGrid().should('contain.text', randomText);
    });

    it('Shift + Tab key pressed should exit from cell edit mode and move to previous column ', () => { // ✅
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        const randomText = utils.randomText();
        cy.focused().type(randomText, { force: true });
        utils.keyDown(constants.keyCodes.Tab, { shiftKey: true, force: true });
        cy.wait(utils.wait());

        utils.getCellEditor().should('not.exist');
        cy.wait(utils.wait());
        utils.assertElementLeftIsEqual(utils.getCellFocus(), 0);
        cy.wait(utils.wait());
        utils.getReactGrid().should('contain.text', randomText);
    });

    it('Enter key pressed should exit from cell edit mode and move to next row', () => { // ✅
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        const randomText = utils.randomText();
        cy.focused().type(randomText, { force: true });

        utils.keyDown(constants.keyCodes.Enter, { force: true });
        cy.wait(utils.wait());
        utils.getCellEditor().should('not.exist');
        cy.wait(utils.wait());
        utils.assertElementTopIsEqual(utils.getCellFocus(), config.cellHeight * 5 - config.lineWidth);
        cy.wait(utils.wait());
        utils.getReactGrid().should('contain.text', randomText);
    });

    it('Shift + Enter key pressed should exit from cell edit mode and move to previous row', () => { // ✅
        utils.selectCellInEditMode(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 4 + utils.getCellYCenter());
        const randomText = utils.randomText();
        cy.focused().type(randomText, { force: true });

        utils.keyDown(constants.keyCodes.Enter, { shiftKey: true, force: true });
        cy.wait(utils.wait());
        utils.getCellEditor().should('not.exist');
        cy.wait(utils.wait());
        utils.assertElementTopIsEqual(utils.getCellFocus(), config.cellHeight * 3 - config.lineWidth);
        cy.wait(utils.wait());
        utils.getReactGrid().should('contain.text', randomText);
    });

});
