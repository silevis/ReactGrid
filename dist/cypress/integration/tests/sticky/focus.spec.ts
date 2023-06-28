import { visitSticky } from '../../common/visit';
import { Utilities } from '../../common/utils';
import { config } from '../../../../src/test/testEnvConfig';

const utils = new Utilities(config);

context('Focus on sticky', () => {

    beforeEach(() => {
        visitSticky();
    });

    it('Focus can be placed on all panes', () => { // ✅
        utils.selectCell((config.cellWidth * 2) - 10, (config.cellHeight * 2) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 4) - 10, (config.cellHeight * 2) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 6) - 10, (config.cellHeight * 2) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 2) - 10, (config.cellHeight * 8) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 4) - 10, (config.cellHeight * 8) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 6) - 10, (config.cellHeight * 8) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 2) - 10, (config.cellHeight * 22) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 4) - 10, (config.cellHeight * 22) - 10);
        utils.getCellFocus().should('be.visible');
        utils.selectCell((config.cellWidth * 6) - 10, (config.cellHeight * 22) - 10);
        utils.getCellFocus().should('be.visible');
    });

});
