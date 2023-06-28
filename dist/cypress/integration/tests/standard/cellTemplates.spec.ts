import { config } from '../../../../src/test/testEnvConfig';
import { constants } from '../../common/constants';
import { Utilities } from '../../common/utils';
import { visit } from '../../common/visit';

const utils = new Utilities(config);

context('Cell templates', () => {

    beforeEach(() => {
        visit();
    });

    it('should open dropdown on single click', () => { // ✅
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        const x = config.cellWidth + utils.getCellXCenter();
        const y = config.cellHeight * 8 + utils.getCellYCenter();
        utils.click(x, y);

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);
    });

    it('should close dropdown on click anywhere', () => { // ✅
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        const x = config.cellWidth + utils.getCellXCenter();
        const y = config.cellHeight * 8 + utils.getCellYCenter();
        utils.click(x, y);

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);

        utils.click(x + config.cellWidth, y);

        utils.getDropdownMenu().should('not.exist');
    });

    it.skip('should be only one dropdown opened at time', () => { // ✅
        // 🟠  NEED FIX
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        const x = config.cellWidth + utils.getCellXCenter();
        const y = config.cellHeight * 8 + utils.getCellYCenter();
        utils.click(x, y);

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);

        utils.click(x, y - config.cellHeight);

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);
    });

    it('should open dropdown with space key', () => {  // ✅
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        const x = config.cellWidth + utils.getCellXCenter();
        const y = config.cellHeight * 8 + utils.getCellYCenter();
        utils.click(x, y);

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);
    });

    it.skip('browser focus should back to rg after option selected on dropdown cell', () => { // ✅
        // 🟠  NEED FIX
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        utils.selectCell(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 5);

        utils.keyDown(constants.keyCodes.Space, { force: true });

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);

        // utils.keyDown(constants.keyCodes.ArrowUp, { force: true }); // closes dropdown

        cy.focused().type('{uparrow}');
        cy.focused().type('{enter}');

        utils.assertIsReactGridFocused();
    });

    it('should navigate into opened dropdown and commit changes', () => { // ✅
        const cellIdx = 8;
        const cellIdy = 4;

        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        utils.selectCell(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 5);

        utils.getCell(cellIdx, cellIdy).should($cell => expect($cell.eq(0)).to.contain('Select...'));

        utils.keyDown(constants.keyCodes.Space, { force: true });
        cy.focused().type('{downarrow}');
        cy.focused().type('{enter}');

        utils.getReactGridContent().should($c => expect($c).to.contain('Vue')); // searching in a whole view 
    });

    it('should filter options on dropdown cell', () => { // ✅
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        utils.selectCell(config.cellWidth + utils.getCellXCenter(), config.cellHeight * 5);

        cy.focused().type('there is no option', { delay: 25 });
        utils.getDropdownMenu().should('contain.text', 'No options');
    });

    it.skip('should leave input filter on ESC key down on dropdown cell - back focus to rg', () => { // ✅
        // 🟠  NEED FIX
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        const x = config.cellWidth + utils.getCellXCenter();
        const y = config.cellHeight * 8 + utils.getCellYCenter();
        utils.click(x, y);

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);

        cy.focused().type('{esc}');

        utils.assertIsReactGridFocused();
    });

    it('should place cell focus on a opened dropdown cell', () => { // ✅
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        const x = config.cellWidth + utils.getCellXCenter();
        const y = config.cellHeight * 4 + utils.getCellYCenter();
        utils.click(x, y);

        utils.assertElementLeftIsEqual(utils.getCellFocus(), config.cellWidth * 8 - config.lineWidth)
        utils.assertElementTopIsEqual(utils.getCellFocus(), config.cellHeight * 4 - config.lineWidth)
    });

    it('should type into a focused dropdown cell', () => { // ✅
        const text = 'Rea';
        utils.getDropdownMenu().should('not.exist');

        utils.scrollTo(config.cellWidth * 7, 0);
        utils.selectCell(utils.getCellXCenter(), config.cellHeight * 5);
        utils.keyDown(constants.keyCodes.ArrowRight);
        cy.focused().type(text)

        utils.getDropdownMenu().should('be.visible').and('have.length', 1);
        cy.focused().then($e => expect($e.val(), 'Typed text').to.be.equal(text.toLowerCase()));
    });

});
