import { visit } from "../../common/visit";
import { Utilities } from "../../common/utils";
import { config } from "../../../../src/test/testEnvConfig";

const utils = new Utilities(config);

context("Resize", () => {
  beforeEach(() => {
    visit();
  });

  it("should increase and reduce column width on scrolled view with content in horizontal axis", () => {
    // ✅
    const RESIZE_WIDTH = 100;
    const SCROLL = 200;

    utils.scrollTo(SCROLL, 0);
    utils.resizeColumn(SCROLL + (SCROLL % config.cellWidth), 1, RESIZE_WIDTH, {
      beforePointerUp: () => {
        utils.resizeHint().should("be.visible");
        // 🟠 TODO - hint should contain exact value
        // utils.resizeHint().and('contain.text', `Width: ${config.cellWidth + RESIZE_WIDTH}px`)
      },
    });

    utils.assertElementWidthIsEqual(
      utils.getCell(2, 0),
      config.cellWidth + RESIZE_WIDTH
    );

    utils.resizeColumn(
      SCROLL + RESIZE_WIDTH + (SCROLL % config.cellWidth),
      1,
      -RESIZE_WIDTH,
      {
        beforePointerUp: () => {
          utils.resizeHint().should("be.visible");
          // 🟠 TODO - hint should contain exact value
          // utils.resizeHint().and('contain.text', `Width: ${config.cellWidth}px`)
        },
      }
    );

    utils.assertElementWidthIsEqual(utils.getCell(2, 0), config.cellWidth);
  });

  it("column should shrink to min width", () => {
    // ✅
    const RESIZE_WIDTH = -config.cellWidth;

    utils.resizeColumn(config.cellWidth, utils.getCellYCenter(), RESIZE_WIDTH, {
      beforePointerUp: () => {
        utils.resizeHint().should("be.visible");
        utils
          .resizeHint()
          .and("contain.text", `Width: ${config.minCellWidth}px`);
      },
    });

    utils.assertElementWidthIsEqual(utils.getCell(0, 0), config.minCellWidth);
  });

  it("column should shrink to its min width in last column", () => {
    // 🔴 fix on macbook pro
    const RESIZE_WIDTH = -config.cellWidth;

    utils.scrollToRight();
    cy.wait(200);
    utils.selectCell(
      config.rgViewportWidth - utils.getCellXCenter(),
      config.cellHeight * 5 + 10
    );
    utils.resizeColumn(
      config.rgViewportWidth - 17,
      utils.getCellYCenter(),
      RESIZE_WIDTH,
      {
        // 17 px - scroll width
        beforePointerUp: () => {
          utils.resizeHint().should("be.visible");
          utils
            .resizeHint()
            .and("contain.text", `Width: ${config.minCellWidth}px`);
        },
      }
    );

    utils.assertElementWidthIsEqual(
      utils.getCell(config.columns - 1, 0),
      config.minCellWidth
    );
  });

  it("column should extend last column", () => {
    // 🔴 fix on macbook pro
    const RESIZE_WIDTH = config.cellWidth;

    utils.scrollToRight();
    cy.wait(200);
    utils.selectCell(
      config.rgViewportWidth - utils.getCellXCenter(),
      config.cellHeight * 5 + 10
    );
    utils.resizeColumn(
      config.rgViewportWidth - 17,
      utils.getCellYCenter(),
      RESIZE_WIDTH,
      {
        // 17 px - scroll width
        beforePointerUp: () => {
          // 🟠 TODO - hint should contain exact value
          // utils.resizeHint().and('contain.text', `Width: ${config.cellWidth + RESIZE_WIDTH}px`)
        },
      }
    );

    utils.assertElementWidthIsEqual(
      utils.getCell(config.columns - 1, 0),
      config.cellWidth + RESIZE_WIDTH
    );
  });
});
