const SjMarkdownManager = require('../SjMarkdownManager');
const path = require('path');
const TEST_SRC = path.resolve(__dirname, '../sample/sample-packages-source');
const TEST_DIST = path.resolve(__dirname, '../sample/sample-packages-document');

const TEST_PACKAGE1_SRC = path.resolve(TEST_SRC, './test-package1');
const TEST_PACKAGE2_SRC = path.resolve(TEST_SRC, './test-package2');



/**************************************************
 *
 * Document for two packages
 *
 **************************************************/
/** Exports **/
try {
    module.exports = exports = new SjMarkdownManager()
        .setAlias('sample2')
        .setHome('test-package1/README')
        .setLibraryNameAndMarkdownPathsMap({
            'test-package1': [
                TEST_PACKAGE1_SRC + '/src/sjdoc/**/*.md'
            ],
            'test-package2': [
                TEST_PACKAGE2_SRC + '/src/sjdoc/**/*.md'
            ],
        })
        .setLibraryNameAndPublicDirRawFilesMap({
            'test-package1': [
                TEST_PACKAGE1_SRC + '/src/js/test1.js'
            ],
            'test-package2': [
                TEST_PACKAGE2_SRC + '/src/js/test2.js',
            ],
        })
        .setDist(TEST_DIST + '/sample2')
        ;
} catch (e) {}