const SjMarkdownManager = require('../SjMarkdownManager');
const path = require('path');
const TEST_SRC = path.resolve(__dirname, '../sample/sample-packages-source');
const TEST_DIST = path.resolve(__dirname, '../sample/sample-packages-document');

const TEST_PACKAGE1_SRC = path.resolve(TEST_SRC, './test-package1');


/**************************************************
 *
 * Document for one package
 *
 **************************************************/
/** Exports **/
try {
    module.exports = exports = new SjMarkdownManager()
        .setAlias('sample1')
        .setHome('test-package1/README')
        .setLibraryNameAndMarkdownPathsMap({
            'test-package1': [
                TEST_PACKAGE1_SRC + '/src/sjdoc/**/*.md'
            ],
        })
        .setLibraryNameAndPublicDirRawFilesMap({
            'test-package1': [
                TEST_PACKAGE1_SRC + '/src/js/test1.js'
            ],
        })
        .setDist(TEST_DIST + '/sample1')
        ;
} catch (e) {}